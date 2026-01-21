<template>
  <div class="task-list">
    <div class="task-list-header">
      <h4>任务列表</h4>
      <div class="task-controls">
        <el-select v-model="statusFilter" placeholder="筛选任务状态" style="width: 120px" @change="filterChanged">
          <el-option label="全部状态" value="all" />
          <el-option label="待处理" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已逾期" value="overdue" />
        </el-select>
        <el-select v-model="assigneeFilter" placeholder="按执行人筛选" style="width: 120px" @change="assigneeChanged">
          <el-option label="全部人员" value="all" />
          <el-option v-for="user in assignees" :key="user.id" :value="user.id" :label="user.name" />
        </el-select>
        <el-button-group>
          <el-button :class="{ active: viewMode === 'list' }" @click="switchView('list')">
            <el-icon><List /></el-icon>
          </el-button>
          <el-button :class="{ active: viewMode === 'kanban' }" @click="switchView('kanban')">
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button :class="{ active: viewMode === 'gantt' }" @click="switchView('gantt')">
            <el-icon><Calendar /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div v-if="viewMode === 'list'" class="task-list-view">
      <div class="task-rows">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-item">
          <div class="task-row" :style="taskItemStyle(task)">
            <em v-if="task.p_name" class="priority-color" :style="{backgroundColor:task.p_color}"></em>
            <div class="row-name" :class="[task.status === '1' ? 'complete' : '']">
              <TaskMenu :ref="`taskMenu_${task.id}`" :task="task" @on-update="onTaskUpdate"/>
              <div class="item-title" @click="viewTask(task)">
                <span v-if="task.flow_item_name" :class="task.flow_item_status" @click.stop="openMenu($event, task)">{{ task.flow_item_name }}</span>
                <span v-if="task.sub_top === true">子任务</span>
                <span v-if="task.sub_my && task.sub_my.length > 0">+{{ task.sub_my.length }}</span>
                {{ task.name || task.content }}
              </div>
              <div class="item-icons" @click="viewTask(task)">
                <div v-if="task.desc" class="item-icon">
                  <i class="taskfont">&#xe71a;</i>
                </div>
                <div v-if="task.file_num > 0" class="item-icon">
                  <i class="taskfont">&#xe71c;</i>
                  <em>{{ task.file_num }}</em>
                </div>
                <div v-if="task.msg_num > 0" class="item-icon">
                  <i class="taskfont">&#xe71e;</i>
                  <em>{{ task.msg_num }}</em>
                </div>
                <div v-if="task.sub_num > 0" class="item-icon" @click.stop="getSublist(task)">
                  <i class="taskfont">&#xe71f;</i>
                  <em>{{ task.sub_complete }}/{{ task.sub_num }}</em>
                </div>
              </div>
            </div>
            <div class="row-user">
              <ul @click="viewTask(task)">
                <li v-for="(user, keyu) in ownerUser(task.attendeeList)" :key="keyu">
                  <el-avatar
                    v-if="keyu < 3"
                    :size="32"
                    :src="user.avatar"
                    :style="{ border: '2px solid ' + (task.color || '#e6e6e6') }">
                    {{ user.name ? user.name.substring(0, 1) : 'U' }}
                  </el-avatar>
                </li>
                <li v-if="ownerUser(task.attendeeList).length === 0" class="no-owner">
                  <el-button type="primary" size="small" @click.stop="viewTask(task, true)">领取任务</el-button>
                </li>
              </ul>
            </div>
            <div class="row-assigner">
              <div class="assigner-name">{{ task.creatorName || task.create_user || '' }}</div>
            </div>
            <div class="row-time">
              <el-tooltip
                v-if="task.status !== '1' && task.deadLine"
                :class="['task-time', isToday(task.deadLine) ? 'today' : '', isOverdue(task.deadLine) ? 'overdue' : '']"
                :disabled="false"
                :open-delay="600"
                :content="task.deadLine">
                <div @click="viewTask(task)">{{ expiresFormat(task.deadLine) }}</div>
              </el-tooltip>
              <div v-else-if="showCompleteAt && task.status === '1'" :title="task.finishTime || task.complete_at">{{ completeAtFormat(task.finishTime || task.complete_at) }}</div>
            </div>
            <div class="row-source">
              <div class="source-text"></div>
            </div>
            <div class="row-operation">
              <TableAction
                :menu="operationMenu"
                align="right"
                @action="handleOperationAction($event, task)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="viewMode === 'kanban'" class="task-kanban-view">
      <div class="kanban-columns">
        <div
          v-for="statusKey in statusList"
          :key="statusKey"
          class="kanban-column"
          :class="'status-' + statusKey"
        >
          <div class="kanban-column-header">
            <h5>{{ getStatusText(statusKey) }}</h5>
            <el-badge :value="columnTasks[statusKey].length" />
          </div>
          <div class="kanban-tasks">
            <div
              v-for="task in columnTasks[statusKey]"
              :key="task.id"
              class="kanban-task"
              @click="viewTask(task)"
            >
              <div class="task-card">
                <div class="task-card-priority" v-if="task.p_name" :style="{ backgroundColor: task.p_color }"></div>
                <div class="task-title">{{ task.name || task.content }}</div>
                <div class="task-info">
                  <div class="task-assignee">{{ getAttendeeNames(task.attendeeList) }}</div>
                  <div class="task-deadline" :class="{ 'overdue': isOverdue(task.deadLine) }">
                    {{ task.deadLine }}
                  </div>
                </div>
                <div v-if="taskUsers(task).length" class="task-users">
                  <ul>
                    <li
                      v-for="(user, idx) in taskUsers(task)"
                      :key="idx">
                      <el-avatar
                        :size="28"
                        :src="user.avatar"
                        :style="{ border: '2px solid ' + (task.color || '#e6e6e6') }">
                        {{ user.name ? user.name.substring(0, 1) : 'U' }}
                      </el-avatar>
                    </li>
                  </ul>
                </div>
                <div class="task-progress">
                  <div v-if="task.sub_num > 0" class="task-sub-num">
                    {{ task.sub_complete }}/{{ task.sub_num }}
                  </div>
                  <el-progress :percentage="task.percent || 0" :stroke-width="6" />
                  <el-tooltip
                    v-if="task.deadLine"
                    :class="['task-time', isToday(task.deadLine) ? 'today' : '', isOverdue(task.deadLine) ? 'overdue' : '']"
                    :disabled="false"
                    :open-delay="600"
                    :content="task.deadLine">
                    <div v-if="task.status !== '1'">
                      <i class="taskfont">&#xe71d;</i>{{ expiresFormat(task.deadLine) }}
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="task-gantt-view">
      <div ref="ganttChart" style="height: 500px;"></div>
    </div>

    <!-- Task Detail Dialog -->
    <TaskDetailDialog
      v-model="showTaskDetail"
      :task-id="selectedTaskId"
      @task-updated="handleTaskUpdated"
      @task-deleted="handleTaskDeleted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useTaskStore } from '@/stores/task'
import { List, Grid, Calendar, MoreFilled, Star, Edit, Delete, Bell, Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { isOverdue, isToday, expiresFormat, completeAtFormat } from '@/utils/date'
import TaskMenu from './TaskMenu.vue'
import TableAction from '@/components/common/TableAction.vue'
import TaskDetailDialog from './task-detail/TaskDetailDialog.vue'

const props = defineProps({
  viewMode: {
    type: String,
    default: 'list'
  },
  statusFilter: {
    type: String,
    default: 'all'
  },
  taskType: {
    type: String,
    default: 'my'
  },
  teamId: {
    type: Number,
    default: null
  },
  mode: {
    type: String,
    default: 'executed'
  },
  showCompleteAt: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view-mode-changed', 'filter-changed', 'assignee-filter-changed'])

const taskStore = useTaskStore()

const tasks = ref([])
const assignees = ref([])
const assigneeFilter = ref('all')
const statusFilter = ref(props.statusFilter)
const viewMode = ref(props.viewMode)
const kanbanColumns = ref({
  pending: [],
  in_progress: [],
  completed: [],
  overdue: []
})
const taskRefs = ref({})

const ganttChart = ref(null)
const ganttChartInstance = ref(null)

// Task detail dialog state
const showTaskDetail = ref(false)
const selectedTaskId = ref(null)

const statusList = ['pending', 'in_progress', 'completed', 'overdue']

const operationMenu = [
  { icon: '&#xe6ec;', title: '标记重点', action: 'mark-important' },
  { icon: 'Edit', title: '编辑', action: 'edit-task' },
  { icon: 'Delete', title: '删除', action: 'delete-task' },
  { icon: 'Bell', title: '提醒', action: 'set-reminder' }
]

const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(task => {
      if (statusFilter.value === 'completed') {
        return task.status === '1'
      } else if (statusFilter.value === 'pending') {
        return task.status === '0' && !isOverdue(task.deadLine || task.end_at)
      } else if (statusFilter.value === 'overdue') {
        return task.status === '0' && isOverdue(task.deadLine || task.end_at)
      }
      return true
    })
  }

  if (assigneeFilter.value !== 'all') {
    filtered = filtered.filter(task => {
      const attendees = task.attendeeList || task.task_user || []
      return attendees.some(a => a.umId === assigneeFilter.value || a.userid === assigneeFilter.value)
    })
  }

  return filtered
})

const columnTasks = computed(() => kanbanColumns.value)

onMounted(() => {
  fetchTasks()
  fetchAssignees()
  if (viewMode.value === 'gantt') {
    setTimeout(() => initGanttChart(), 100)
  }
})

onBeforeUnmount(() => {
  if (ganttChartInstance.value) {
    ganttChartInstance.value.dispose()
  }
})

watch(() => props.statusFilter, (newVal) => {
  statusFilter.value = newVal
})

watch(() => props.viewMode, (newVal) => {
  viewMode.value = newVal
  if (newVal === 'gantt') {
    nextTick(() => initGanttChart())
  }
})

watch(() => taskStore.taskList, () => {
  fetchTasks()
}, { deep: true })

async function fetchTasks() {
  const allTasks = taskStore.taskList || []
  let list = []

  if (props.taskType === 'my') {
    if (props.mode === 'assigned') {
      list = allTasks.filter(task => task.creatorUmId === 'LIUQINGHONG264' || task.create_user_id === 'LIUQINGHONG264')
    } else {
      list = allTasks.filter(task => (task.attendeeList && task.attendeeList.length > 0) || (task.task_user && task.task_user.length > 0))
    }
  } else if (props.taskType === 'team' && props.teamId) {
    list = allTasks.filter(task => task.sourceId && task.sourceId.includes(String(props.teamId)))
  } else {
    list = allTasks
  }

  tasks.value = list.map(task => {
    const status = getTaskStatus(task)
    return {
      ...task,
      name: task.name || task.content,
      title: task.content || task.name,
      attendeeList: task.attendeeList || task.task_user || [],
      creatorName: task.creatorName || task.create_user || '',
      creatorUmId: task.creatorUmId || task.create_user_id || '',
      deadLine: task.deadLine || task.end_at || '',
      status,
      source: task.source,
      raw: task
    }
  })

  buildKanbanColumns()
}

async function fetchAssignees() {
  const allTasks = taskStore.taskList || []
  const attendeeSet = new Set()

  allTasks.forEach(task => {
    const list = task.attendeeList || task.task_user || []
    list.forEach(attendee => {
      attendeeSet.add(JSON.stringify({
        id: attendee.umId || attendee.userid,
        name: attendee.name
      }))
    })
  })

  assignees.value = Array.from(attendeeSet).map(s => JSON.parse(s))
}

function buildKanbanColumns() {
  const columns = {
    pending: [],
    in_progress: [],
    completed: [],
    overdue: []
  }

  tasks.value.forEach(task => {
    if (columns[task.status]) {
      columns[task.status].push(task)
    }
  })

  kanbanColumns.value = columns
}

function getTaskStatus(task) {
  if (task.status === '1') {
    return 'completed'
  }
  if (isOverdue(task.deadLine || task.end_at)) {
    return 'overdue'
  }
  return 'pending'
}

function getStatusText(status) {
  const statusMap = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已逾期'
  }
  return statusMap[status] || status
}

function getStatusType(status) {
  const typeMap = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    overdue: 'danger'
  }
  return typeMap[status] || 'info'
}

function getAttendeeNames(attendeeList) {
  if (!attendeeList || attendeeList.length === 0) return '-'
  return attendeeList.map(a => a.name).join(', ')
}

function taskUsers(task) {
  const list = Array.isArray(task.attendeeList) ? task.attendeeList : []
  return list.filter(user => user && (user.status === 1 || user.owner === 1)).slice(0, 3)
}

function switchView(mode) {
  viewMode.value = mode
  emit('view-mode-changed', mode)
  if (mode === 'gantt') {
    nextTick(() => initGanttChart())
  }
}

function filterChanged(status) {
  statusFilter.value = status
  emit('filter-changed', status)
}

function assigneeChanged(assigneeId) {
  assigneeFilter.value = assigneeId
  emit('assignee-filter-changed', assigneeId)
}

function viewTask(task, receive) {
  console.log('View task:', task)
  // Open task detail dialog
  selectedTaskId.value = task.id
  showTaskDetail.value = true
}

function editTask(task) {
  console.log('Edit task:', task)
}

function onTaskUpdate(data) {
  console.log('Task updated:', data)
  fetchTasks()
}

function openMenu(event, task) {
  const el = taskRefs.value[`taskMenu_${task.id}`]
  if (el) {
    el.handleClick(event)
  }
}

function taskItemStyle(task) {
  const style = {}
  if (task.color) {
    style.backgroundColor = task.color
    style.borderBottomColor = task.color
  }
  return style
}

function ownerUser(list) {
  return list.filter(({ status, owner }) => status === 1 || owner === 1).sort((a, b) => {
    return a.id - b.id
  })
}

function handleOperationAction(action, task) {
  if (!task) {
    return
  }
  switch (action) {
    case 'mark-important':
      setImportant(task)
      break
    case 'edit-task':
      editTask(task)
      break
    case 'delete-task':
      removeTask(task)
      break
    case 'set-reminder':
      setReminder(task)
      break
  }
}

function setImportant(task) {
  console.log('Set important:', task)
}

function removeTask(task) {
  console.log('Remove task:', task)
}

function setReminder(task) {
  console.log('Set reminder:', task)
}

function getSublist(task) {
  console.log('Get sublist:', task)
}

function handleTaskUpdated(updatedTask) {
  console.log('Task updated in dialog:', updatedTask)
  // Refresh the task list to show updated data
  fetchTasks()
}

function handleTaskDeleted(taskId) {
  console.log('Task deleted in dialog:', taskId)
  // Refresh the task list to remove deleted task
  fetchTasks()
}

function initGanttChart() {
  if (!ganttChart.value || typeof echarts === 'undefined') {
    return
  }

  if (ganttChartInstance.value) {
    ganttChartInstance.value.dispose()
  }

  ganttChartInstance.value = echarts.init(ganttChart.value)

  const data = filteredTasks.value.map(task => {
    const raw = task.raw || {}
    const times = getTimeObj(raw)
    return {
      id: raw.id || task.id,
      name: task.name || task.title,
      value: [times.start, times.end],
      itemStyle: {
        color: getStatusColor(task.status)
      }
    }
  })

  const option = {
    title: {
      text: '甘特图视图',
      left: 'center'
    },
    tooltip: {
      formatter: function(params) {
        return params.name + ': ' + params.value[0] + ' - ' + params.value[1]
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time'
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name)
    },
    series: [
      {
        type: 'bar',
        data: data
      }
    ]
  }

  ganttChartInstance.value.setOption(option)
}

function getTimeObj(taskData) {
  if (!taskData) {
    const now = new Date()
    return {
      start: now.getTime(),
      end: now.getTime() + 86400000
    }
  }

  let start = taskData.startTime ? new Date(taskData.startTime).getTime() : new Date(taskData.createTime).getTime()
  let end = taskData.deadLine ? new Date(taskData.deadLine).getTime() : (taskData.end_at ? new Date(taskData.end_at).getTime() : start + 86400000)

  return {
    start,
    end: Math.max(end, start + 60000)
  }
}

function getStatusColor(status) {
  const colorMap = {
    pending: 'var(--el-color-warning)',
    in_progress: 'var(--el-color-primary)',
    completed: 'var(--el-color-success)',
    overdue: 'var(--el-color-danger)'
  }
  return colorMap[status] || 'var(--el-color-primary)'
}
</script>

<style scoped lang="scss">
.task-list {
  .task-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .task-controls {
      display: flex;
      gap: 12px;
    }
  }

  .task-list-view {
    .task-rows {
      .task-item {
        margin-bottom: 8px;
        border-radius: 4px;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: all 0.3s;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .task-row {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #fff;
          border-bottom: 1px solid #eaeaea;
          position: relative;

          .priority-color {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
          }

          .row-name {
            flex: 0 0 33.33%;
            display: flex;
            align-items: center;
            padding-right: 16px;

            &.complete {
              .item-title {
                color: #999;
                text-decoration: line-through;
              }
            }

            .sub-icon {
              color: #999;
              font-size: 16px;
              margin-right: 4px;
              cursor: pointer;
              transition: transform 0.3s;

              &.active {
                transform: rotate(90deg);
              }
            }

            .item-title {
              flex: 1;
              font-size: 14px;
              color: #333;
              cursor: pointer;
              margin-left: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;

              &:hover {
                color: $primary-color;
              }
            }

            .item-icons {
              display: flex;
              align-items: center;
              margin-left: 8px;

              .item-icon {
                display: flex;
                align-items: center;
                margin-right: 8px;
                color: #999;
                font-size: 14px;
                cursor: pointer;

                em {
                  font-style: normal;
                  font-size: 12px;
                  margin-left: 2px;
                }
              }
            }
          }

          .row-user {
            flex: 0 0 16.66%;
            display: flex;
            align-items: center;

            ul {
              display: flex;
              align-items: center;
              padding: 0;
              margin: 0;
              list-style: none;

              li {
                margin-right: -6px;

                &:first-child {
                  margin-right: 0;
                }
              }

              .no-owner {
                margin-right: 0;
              }
            }
          }

          .row-assigner {
            flex: 0 0 16.66%;
            padding-right: 16px;

            .assigner-name {
              font-size: 14px;
              color: #666;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .row-time {
            flex: 0 0 16.66%;

            .task-time {
              font-size: 12px;
              color: #777777;
              background-color: #EAEDF2;
              border: 1px solid #EAEDF2;
              padding: 0 3px;
              border-radius: 3px;
              display: inline-block;

              &.today,
              &.overdue {
                color: #ffffff;
              }

              &.today {
                font-weight: 500;
                background-color: $warning-color;
                border-color: $warning-color;
              }

              &.overdue {
                font-weight: 600;
                background-color: $danger-color;
                border-color: $danger-color;
              }

              .taskfont {
                margin-right: 3px;
                font-size: 12px;
              }
            }
          }

          .row-source {
            flex: 0 0 8.33%;
          }

          .row-operation {
            flex: 0 0 8.33%;
            display: flex;
            justify-content: flex-end;
          }
        }
      }
    }
  }

  .task-kanban-view {
    .kanban-columns {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 16px;

      .kanban-column {
        flex: 1;
        min-width: 280px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .kanban-column-header {
          padding: 12px 16px;
          background: #f8f8f8;
          border-bottom: 1px solid #eaeaea;
          border-radius: 8px 8px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;

          h5 {
            font-size: 14px;
            font-weight: 500;
            margin: 0;
          }
        }

        .kanban-tasks {
          padding: 16px;
          min-height: 100px;
        }

        .kanban-task {
          margin-bottom: 12px;
        }

        .task-card {
          position: relative;
          background: #fff;
          border: 1px solid #eaeaea;
          border-radius: 6px;
          padding: 12px 12px 10px 16px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }

          .task-card-priority {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: 3px;
            border-radius: 6px 0 0 6px;
          }

          .task-title {
            font-weight: 500;
            margin-bottom: 8px;
            color: #303133;
          }

          .task-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #666;

            .task-assignee {
              margin-bottom: 4px;
            }

            .task-deadline {
              &.overdue {
                color: $danger-color;
                font-weight: 600;
              }
            }
          }

          .task-users {
            display: flex;
            align-items: center;
            margin-top: 10px;

            ul {
              display: flex;
              align-items: center;
              padding: 0;
              margin: 0;
              list-style: none;

              li {
                list-style: none;
                margin-right: -6px;

                &:first-child {
                  margin-right: 0;
                }
              }
            }
          }

          .task-progress {
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            .task-sub-num {
              font-size: 12px;
              margin-right: 8px;
              color: #777777;
            }

            .task-time {
              flex-shrink: 0;
              color: #777777;
              background-color: #EAEDF2;
              border: 1px solid #EAEDF2;
              padding: 0 3px;
              margin-left: 18px;
              font-size: 12px;
              border-radius: 3px;
              display: flex;
              align-items: center;

              &.today,
              &.overdue {
                color: #ffffff;
              }

              &.today {
                font-weight: 500;
                background-color: #ff9900;
                border-color: #ff9900;
              }

              &.overdue {
                font-weight: 600;
                background-color: #ed4014;
                border-color: #ed4014;
              }

              .taskfont {
                margin-right: 3px;
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }

  .task-gantt-view {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

@media (max-width: 768px) {
  .task-list {
    .task-list-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .task-controls {
        width: 100%;
        flex-wrap: wrap;
      }
    }

    .task-list-view {
      .task-rows {
        .task-item {
          .task-row {
            flex-direction: column;
            align-items: flex-start;

            .row-name {
              flex: none;
              width: 100%;
              margin-bottom: 8px;
            }

            .row-user,
            .row-assigner,
            .row-time,
            .row-source,
            .row-operation {
              flex: none;
              width: 100%;
              margin-bottom: 8px;
            }
          }
        }
      }
    }

    .task-kanban-view {
      .kanban-columns {
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;

        .kanban-column {
          min-width: 100%;
          margin-bottom: 16px;
        }
      }
    }
  }
}
</style>