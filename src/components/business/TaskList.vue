<template>
  <div class="task-list">
    <div v-if="showHeader" class="task-list-header">
      <h4>任务列表</h4>
      <div class="task-controls">
        <el-select v-model="statusFilter" placeholder="筛选任务状态" style="width: 120px" @change="filterChanged">
          <el-option label="全部状态" value="all" />
          <el-option label="待处理" value="pending" />
          <el-option label="进行中" value="in_progress" />
          <el-option label="已完成" value="completed" />
          <el-option label="已逾期" value="overdue" />
          <el-option label="已取消" value="cancelled" />
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

    <div v-if="viewMode === 'list'" class="task-list-view project-table">
      <div class="project-table-head">
        <div class="task-row">
           <div class="el-col" style="flex: 1; padding-left: 32px;">任务名称</div>
           <div class="el-col" style="width: 120px; flex: none;">负责人</div>
           <div class="el-col" style="width: 120px; flex: none;">创建人</div>
           <div class="el-col" style="width: 120px; flex: none;">截止时间</div>
           <div class="el-col" style="width: 80px; flex: none;">来源</div>
           <div class="el-col" style="width: 80px; flex: none;">操作</div>
        </div>
      </div>
      <div class="project-table-body">
        <div
          v-for="task in filteredTasks"
          :key="task.uniqueKey || task.id"
          class="task-row"
          @click="viewTask(task)"
        >
            <em v-if="task.p_name" class="priority-color" :style="{backgroundColor:task.p_color}"></em>
            <div class="el-row">
                <div class="el-col row-name" :class="[getTaskStatus(task) === 'completed' ? 'complete' : '']" style="flex: 1;">
                   <div class="task-menu-wrapper" @click.stop>
                      <TaskMenu :task="task.raw || task" @on-update="onTaskUpdate"/>
                   </div>
                   <div class="item-title">
                      <el-icon v-if="(task.mark || (task.isTop === 1 ? '1' : '0')) === '1'" class="important-star"><StarFilled /></el-icon>
                      <span v-if="task.flow_item_name" :class="task.flow_item_status">{{ task.flow_item_name }}</span>
                      <span v-if="task.sub_top === true">子任务</span>
                      <span v-if="task.sub_my && task.sub_my.length > 0">+{{ task.sub_my.length }}</span>
                      {{ task.name || task.content }}
                   </div>
                   <div class="item-icons">
                      <div v-if="task.desc" class="item-icon"><i class="taskfont">&#xe71a;</i></div>
                      <div v-if="task.file_num > 0" class="item-icon"><i class="taskfont">&#xe71c;</i><em>{{ task.file_num }}</em></div>
                      <div v-if="task.msg_num > 0" class="item-icon"><i class="taskfont">&#xe71e;</i><em>{{ task.msg_num }}</em></div>
                      <div v-if="task.sub_num > 0" class="item-icon" @click.stop="getSublist(task)"><i class="taskfont">&#xe71f;</i><em>{{ task.sub_complete }}/{{ task.sub_num }}</em></div>
                   </div>
                </div>
                <div class="el-col row-user" style="width: 120px; flex: none;">
                   <div class="user-list">
                      <el-avatar v-for="(user, keyu) in ownerUser(task.attendeeList || task.task_user).slice(0,3)" :key="keyu" :size="24" :src="user.avatar" class="user-avatar" :style="{ border: '2px solid ' + (task.color || '#e6e6e6') }">
                         {{ user.name ? user.name.substring(0, 1) : 'U' }}
                      </el-avatar>
                      <el-button v-if="ownerUser(task.attendeeList || task.task_user).length === 0" type="primary" link size="small" @click.stop="viewTask(task, true)">领取</el-button>
                   </div>
                </div>
                <div class="el-col row-assigner" style="width: 120px; flex: none;">{{ task.creatorName || task.create_user || '-' }}</div>
                <div class="el-col row-time" style="width: 120px; flex: none;">
                   <div v-if="getTaskStatus(task) !== 'completed' && (task.deadLine || task.end_at)" :class="['task-time', isToday(task.deadLine || task.end_at) ? 'today' : '', isOverdue(task.deadLine || task.end_at) ? 'overdue' : '']">{{ expiresFormat(task.deadLine || task.end_at) }}</div>
                   <div v-else-if="showCompleteAt && getTaskStatus(task) === 'completed'" :title="task.finishTime || task.complete_at">{{ completeAtFormat(task.finishTime || task.complete_at) }}</div>
                </div>
                <div class="el-col row-source" style="width: 80px; flex: none;">{{ getSourceName(task.source) }}</div>
                <div class="el-col row-operation" style="width: 80px; flex: none;">
                   <div class="operation-icons">
                      <div class="op-icon" :class="{ active: (task.mark || (task.isTop === 1 ? '1' : '0')) === '1' }" @click.stop="handleOperationAction('mark-important', task)">
                         <el-icon v-if="(task.mark || (task.isTop === 1 ? '1' : '0')) === '1'"><StarFilled /></el-icon>
                         <el-icon v-else><Star /></el-icon>
                      </div>
                      <TableAction :menu="operationMenu" align="right" @action="handleOperationAction($event, task)" />
                   </div>
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
          :class="['kanban-column', 'status-' + statusKey, { 'drag-over': dragOverStatus === statusKey }]"
          @dragover.prevent
          @dragenter="handleDragEnter(statusKey)"
          @dragleave="handleDragLeave"
          @drop="handleDrop(statusKey)"
        >
          <div class="kanban-column-header">
            <h5>{{ getStatusText(statusKey) }}</h5>
            <el-badge :value="columnTasks[statusKey].length" />
          </div>
          <div class="kanban-tasks">
            <div
              v-for="task in columnTasks[statusKey]"
              :key="task.uniqueKey || task.id"
              class="kanban-task"
              @click="viewTask(task)"
              draggable="true"
              @dragstart="handleDragStart(task)"
            >
              <div class="task-card">
                <div class="task-card-priority" v-if="task.p_name" :style="{ backgroundColor: task.p_color }"></div>
                <div class="task-title">
                  <el-icon v-if="(task.mark || (task.isTop === 1 ? '1' : '0')) === '1'" class="important-star">
                    <StarFilled />
                  </el-icon>
                  {{ task.name || task.content }}
                </div>
                <div class="task-info">
                  <div class="task-assignee">{{ getAttendeeNames(task.attendeeList || task.task_user) }}</div>
                  <div class="task-deadline" :class="{ 'overdue': isOverdue(task.deadLine || task.end_at) }">
                    {{ task.deadLine || task.end_at }}
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
                    v-if="task.deadLine || task.end_at"
                    :class="['task-time', isToday(task.deadLine || task.end_at) ? 'today' : '', isOverdue(task.deadLine || task.end_at) ? 'overdue' : '']"
                    :disabled="false"
                    :open-delay="600"
                    :content="task.deadLine || task.end_at">
                    <div v-if="task.status !== '1'">
                      <i class="taskfont">&#xe71d;</i>{{ expiresFormat(task.deadLine || task.end_at) }}
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { List, Grid, Calendar, Star, StarFilled, Edit, Delete, Bell } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { isOverdue, isToday, expiresFormat, completeAtFormat } from '@/utils/date'
import TaskMenu from './TaskMenu.vue'
import TableAction from '@/components/common/TableAction.vue'
import TaskDetailDialog from './task-detail/TaskDetailDialog.vue'
import { todoApi } from '@/api'

const props = defineProps({
  viewMode: {
    type: String,
    default: 'list'
  },
  statusFilter: {
    type: String,
    default: 'all'
  },
  assigneeFilter: {
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
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showCompleted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view-mode-changed', 'filter-changed', 'assignee-filter-changed', 'task-deleted'])

const taskStore = useTaskStore()

const assigneeFilter = ref('all')
const statusFilter = ref(props.statusFilter)
const viewMode = ref(props.viewMode)
const kanbanColumns = ref({
  pending: [],
  in_progress: [],
  completed: [],
  overdue: []
})
const draggingTask = ref(null)
const dragOverStatus = ref(null)

const ganttChart = ref(null)
const ganttChartInstance = ref(null)

// Task detail dialog state
const showTaskDetail = ref(false)
const selectedTaskId = ref(null)

const statusList = ['pending', 'in_progress', 'completed', 'overdue']

const operationMenu = [
  { icon: Star, title: '标记重点', action: 'mark-important' },
  { icon: Edit, title: '编辑', action: 'edit-task' },
  { icon: Delete, title: '删除', action: 'delete-task' },
  { icon: Bell, title: '提醒', action: 'set-reminder' }
]

const filteredTasks = computed(() => {
  let filtered = tasks.value

  if (!props.showCompleted) {
    filtered = filtered.filter(task => task.status !== '1')
  }

  if (statusFilter.value !== 'all') {
    if (statusFilter.value === 'completed') {
      if (!props.showCompleted) {
        return []
      }
      filtered = filtered.filter(task => task.status === '1')
    } else if (statusFilter.value === 'in_progress') {
      filtered = filtered.filter(task => task.status === '2')
    } else if (statusFilter.value === 'pending') {
      filtered = filtered.filter(task => task.status === '0' && !isOverdue(task.deadLine || task.end_at))
    } else if (statusFilter.value === 'overdue') {
      filtered = filtered.filter(task => task.status === '0' && isOverdue(task.deadLine || task.end_at))
    } else if (statusFilter.value === 'cancelled') {
      filtered = filtered.filter(task => task.status === '-1')
    }
  }

  if (assigneeFilter.value !== 'all') {
    filtered = filtered.filter(task => {
      const attendees = task.attendeeList || task.task_user || []
      return attendees.some(a => a.umId === assigneeFilter.value || a.userid === assigneeFilter.value)
    })
  }

  return filtered
})

const columnTasks = computed(() => {
  if (viewMode.value !== 'kanban') return kanbanColumns.value

  const columns = {
    pending: [],
    in_progress: [],
    completed: [],
    overdue: []
  }

  filteredTasks.value.forEach(task => {
    if (columns[getTaskStatus(task)]) {
      columns[getTaskStatus(task)].push(task)
    }
  })

  return columns
})

onMounted(() => {
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

watch(() => props.assigneeFilter, (newVal) => {
  assigneeFilter.value = newVal
})

watch(() => props.viewMode, (newVal) => {
  viewMode.value = newVal
  if (newVal === 'gantt') {
    nextTick(() => initGanttChart())
  }
})

watch(() => props.showCompleted, () => {
  // Trigger rebuild when showCompleted changes
})

watch([statusFilter, assigneeFilter], () => {
  // No action needed, columnTasks computed property will handle updates
})

const tasks = computed(() => {
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

  return list.map((task, index) => {
    // Return the raw task object directly, avoiding deep cloning or property overwrites that cause reactivity issues
    // We attach temporary UI properties to a new object that inherits from the task, or just use the task as is if possible
    // To be safe and fix the recursion, we will use the raw task and compute derived values in the template or separate helper functions
    return {
       ...task,
       uniqueKey: (task.id || 'temp') + '_' + index // Ensure stable unique key
    }
  })
})

function fetchTasks() {
  // No-op, tasks is now a computed property
}

const assignees = computed(() => {
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

  return Array.from(attendeeSet).map(s => JSON.parse(s))
})

function buildKanbanColumns() {
  const columns = {
    pending: [],
    in_progress: [],
    completed: [],
    overdue: []
  }

  filteredTasks.value.forEach(task => {
    if (columns[getTaskStatus(task)]) {
      columns[getTaskStatus(task)].push(task)
    }
  })

  kanbanColumns.value = columns
}

function getTaskStatus(task) {
  const status = task.todoStatus !== undefined ? task.todoStatus : parseInt(task.status)
  // 0-待接收 1-待处理 2-已完成 3-进行中 4-已逾期 5-已取消
  if (status === 2) {
    return 'completed'
  }
  if (status === 3) {
    return 'in_progress'
  }
  if (status === 4 || isOverdue(task.deadLine || task.end_at)) {
    return 'overdue'
  }
  if (status === 5) {
    return 'cancelled'
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

function viewTask(task) {
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

function taskItemStyle(task) {
  const style = {}
  if (task.color) {
    style.backgroundColor = task.color
    style.borderBottomColor = task.color
  }
  return style
}

function ownerUser(list) {
  if (!list || !Array.isArray(list)) return []
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
  task.mark = task.mark === '1' ? '0' : '1'
  if (task.mark === '1') {
    ElMessage.success('已标记为重点')
  } else {
    ElMessage.success('已取消重点标记')
  }
}

function removeTask(task) {
  console.log('Remove task:', task)
  
  // 检查待办状态 - 只有已完成(status=2)的待办才能删除
  if (task.todoStatus !== 2 && task.status !== '2' && task.status !== 2) {
    ElMessage.warning('只有已完成的待办才能删除')
    return
  }
  
  // 确认删除
  ElMessageBox.confirm(
    '确定要删除这个待办吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const result = await todoApi.deleteTodo(task.id)
      if (result.code === '200') {
        ElMessage.success('任务删除成功')
        emit('task-deleted', task.id)
        // 刷新任务列表
        await taskStore.fetchTasks()
      } else {
        ElMessage.error(result.message || '删除失败')
      }
    } catch (error) {
      console.error('Delete task error:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
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

function getSourceName(source) {
  const sourceMap = {
    0: '系统',
    7: '任务',
    8: '项目',
    9: '会议'
  }
  return sourceMap[source] || '-'
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
        color: getStatusColor(getTaskStatus(task))
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

function handleDragStart(task) {
  draggingTask.value = task
}

function handleDragEnter(statusKey) {
  dragOverStatus.value = statusKey
}

function handleDragLeave() {
  dragOverStatus.value = null
}

async function handleDrop(statusKey) {
  if (!draggingTask.value) {
    dragOverStatus.value = null
    return
  }
  const targetStatus = statusKey
  if (draggingTask.value.status === targetStatus) {
    dragOverStatus.value = null
    return
  }

  const statusValue = mapStatusKeyToValue(targetStatus)
  const taskId = draggingTask.value.id

  draggingTask.value.status = targetStatus
  buildKanbanColumns()
  dragOverStatus.value = null
  draggingTask.value = null

  if (taskId) {
    try {
      await taskStore.updateTaskStatus({ taskId, status: statusValue })
    } catch (error) {
      fetchTasks()
    }
  }
}

function mapStatusKeyToValue(statusKey) {
  const map = {
    pending: '0',
    in_progress: '2',
    completed: '1',
    overdue: '0'
  }
  return map[statusKey] || '0'
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
              display: inline-flex;
              align-items: center;

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
        border: 1px solid transparent;

        &.drag-over {
          border-color: $primary-color;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.15);
        }

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
            display: inline-flex;
            align-items: center;
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

  .important-star {
    margin-right: 4px;
    color: #f7ba2a;
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
