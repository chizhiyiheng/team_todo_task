<template>
  <div class="task-list">
    <div v-if="showHeader" class="task-list-header">
      <h4>任务列表</h4>
      <div class="task-controls">
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
           <div class="el-col filter-col" style="width: 120px; flex: none;">
             负责人
             <el-popover placement="bottom" :width="200" trigger="click">
               <template #reference>
                 <el-button link size="small" class="filter-btn">
                   <el-icon><Filter /></el-icon>
                 </el-button>
               </template>
               <div class="filter-content">
                 <el-checkbox-group v-model="selectedAssignees" @change="handleAssigneeFilterChange">
                   <el-checkbox v-for="user in assigneeList" :key="user.id" :label="user.id">
                     {{ user.name }}
                   </el-checkbox>
                 </el-checkbox-group>
               </div>
             </el-popover>
           </div>
           <div class="el-col" style="width: 120px; flex: none;">创建人</div>
           <div class="el-col filter-col" style="width: 120px; flex: none;">
             状态
             <el-popover placement="bottom" :width="200" trigger="click">
               <template #reference>
                 <el-button link size="small" class="filter-btn">
                   <el-icon><Filter /></el-icon>
                 </el-button>
               </template>
               <div class="filter-content">
                 <el-checkbox-group v-model="selectedStatuses" @change="handleStatusFilterChange">
                   <el-checkbox :label="0">待接收</el-checkbox>
                   <el-checkbox :label="1">待处理</el-checkbox>
                   <el-checkbox :label="2">已完成</el-checkbox>
                   <el-checkbox :label="3">进行中</el-checkbox>
                   <el-checkbox :label="4">已逾期</el-checkbox>
                   <el-checkbox :label="5">已取消</el-checkbox>
                 </el-checkbox-group>
               </div>
             </el-popover>
           </div>
           <div class="el-col" style="width: 120px; flex: none;">截止时间</div>
           <div class="el-col" style="width: 80px; flex: none;">来源</div>
           <div class="el-col" style="width: 80px; flex: none;">操作</div>
        </div>
      </div>
      <div class="project-table-body">
        <div
          v-for="task in listTasks"
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
                      {{ task.name || task.title || task.content }}
                   </div>
                   <div class="item-icons">
                      <div v-if="task.desc || task.content" class="item-icon"><i class="taskfont">&#xe71a;</i></div>
                      <div v-if="task.file_num > 0" class="item-icon"><i class="taskfont">&#xe71c;</i><em>{{ task.file_num }}</em></div>
                      <div v-if="task.msg_num > 0" class="item-icon"><i class="taskfont">&#xe71e;</i><em>{{ task.msg_num }}</em></div>
                      <div v-if="task.sub_num > 0" class="item-icon" @click.stop="getSublist(task)"><i class="taskfont">&#xe71f;</i><em>{{ task.sub_complete }}/{{ task.sub_num }}</em></div>
                   </div>
                </div>
                <div class="el-col row-user" style="width: 120px; flex: none;">
                   <div class="user-list">
                      <el-avatar v-for="(user, keyu) in ownerUser(task.todoUsers || task.attendeeList || task.task_user).slice(0,3)" :key="keyu" :size="24" :src="user.avatar" class="user-avatar" :style="{ border: '2px solid ' + (task.color || '#e6e6e6') }">
                         {{ user.name ? user.name.substring(0, 1) : 'U' }}
                      </el-avatar>
                      <el-button v-if="ownerUser(task.todoUsers || task.attendeeList || task.task_user).length === 0" type="primary" link size="small" @click.stop="viewTask(task, true)">领取</el-button>
                   </div>
                </div>
                <div class="el-col row-assigner" style="width: 120px; flex: none;">{{ task.creatorName || task.create_user || task.name || '-' }}</div>
                <div class="el-col row-status" style="width: 120px; flex: none;">
                   <el-tag :type="getStatusTagType(task)" size="small">{{ getStatusText(getTaskStatus(task)) }}</el-tag>
                </div>
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
          v-for="statusKey in kanbanStatusList"
          :key="statusKey"
          :class="['kanban-column', 'status-' + statusKey]"
        >
          <div class="kanban-column-header">
            <h5>{{ getStatusText(statusKey) }}</h5>
            <el-badge :value="kanbanColumns[statusKey].total" />
          </div>
          <div 
            class="kanban-tasks-wrapper"
            @scroll="handleKanbanScroll($event, statusKey)"
          >
            <draggable
              :list="kanbanColumns[statusKey].list"
              :group="{ name: 'tasks', pull: true, put: true }"
              item-key="id"
              class="kanban-tasks"
              :animation="200"
              ghost-class="ghost-card"
              :move="onDragMove"
              @change="handleDragChange($event, statusKey)"
            >
              <template #item="{ element: task }">
                <div
                  class="kanban-task"
                  @click="viewTask(task)"
                >
                  <div class="task-card">
                    <div class="task-card-priority" v-if="task.p_name" :style="{ backgroundColor: task.p_color }"></div>
                    <div class="task-title">
                      <el-icon v-if="(task.mark || task.tag === 1 || (task.isTop === 1 ? '1' : '0')) === '1'" class="important-star">
                        <StarFilled />
                      </el-icon>
                      {{ task.title || task.name || task.content }}
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
                    <div class="task-footer">
                      <el-tag :type="getStatusTagType(task)" size="small">{{ getStatusText(getTaskStatusKey(task)) }}</el-tag>
                      <div v-if="task.deadLine || task.end_at" class="task-deadline">
                        <el-icon><Clock /></el-icon>
                        <span :class="{ 'overdue': isOverdue(task.deadLine || task.end_at) }">
                          {{ expiresFormat(task.deadLine || task.end_at) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
            <div v-if="kanbanColumns[statusKey].loading" class="kanban-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
              加载中...
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="task-gantt-view">
      <div ref="ganttChart" style="width: 100%; height: 600px;"></div>
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
import { List, Grid, Calendar, Star, StarFilled, Edit, Delete, Bell, Clock, Filter, Loading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { isOverdue, isToday, expiresFormat, completeAtFormat } from '@/utils/date'
import TaskMenu from './TaskMenu.vue'
import TableAction from '@/components/common/TableAction.vue'
import TaskDetailDialog from './task-detail/TaskDetailDialog.vue'
import { todoApi } from '@/api'
import draggable from 'vuedraggable'
import { useKanban } from '@/hooks/useKanban'
import { useListFilter } from '@/hooks/useListFilter'

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
  }
})

const emit = defineEmits(['view-mode-changed', 'filter-changed', 'assignee-filter-changed', 'task-deleted'])

const taskStore = useTaskStore()

const viewMode = ref(props.viewMode)

// 使用列表筛选hook
const {
  listTasks,
  selectedAssignees,
  selectedStatuses,
  assigneeList,
  fetchListTasks,
  fetchAssigneeList,
  handleAssigneeFilterChange,
  handleStatusFilterChange
} = useListFilter(props)

// 使用看板hook
const {
  kanbanStatusList,
  kanbanColumns,
  initKanbanData,
  handleKanbanScroll,
  handleDragChange
} = useKanban(props)

const ganttChart = ref(null)
const ganttChartInstance = ref(null)

// Task detail dialog state
const showTaskDetail = ref(false)
const selectedTaskId = ref(null)

const operationMenu = [
  { icon: Star, title: '标记重点', action: 'mark-important' },
  { icon: Edit, title: '编辑', action: 'edit-task' },
  { icon: Delete, title: '删除', action: 'delete-task' },
  { icon: Bell, title: '提醒', action: 'set-reminder' }
]

onMounted(() => {
  if (viewMode.value === 'list') {
    fetchListTasks()
    fetchAssigneeList()
  } else if (viewMode.value === 'kanban') {
    initKanbanData()
  } else if (viewMode.value === 'gantt') {
    setTimeout(() => initGanttChart(), 100)
  }
})

onBeforeUnmount(() => {
  if (ganttChartInstance.value) {
    ganttChartInstance.value.dispose()
  }
})

watch(() => props.viewMode, (newVal) => {
  viewMode.value = newVal
  if (newVal === 'list') {
    fetchListTasks()
    fetchAssigneeList()
  } else if (newVal === 'kanban') {
    initKanbanData()
  } else if (newVal === 'gantt') {
    nextTick(() => initGanttChart())
  }
})

function onDragMove(evt) {
  return true
}

function getTaskStatusKey(task) {
  const status = task.todoStatus !== undefined ? task.todoStatus : parseInt(task.status)
  if (status === 2) return 'completed'
  if (status === 3) return 'in_progress'
  if (status === 4) return 'overdue'
  if (status === 5) return 'cancelled'
  return 'pending'
}

function getStatusTagType(task) {
  const status = getTaskStatusKey(task)
  const typeMap = {
    pending: 'warning',
    in_progress: 'primary',
    completed: 'success',
    overdue: 'danger',
    cancelled: 'info'
  }
  return typeMap[status] || ''
}

function getTaskStatus(task) {
  const status = task.todoStatus !== undefined ? task.todoStatus : parseInt(task.status)
  // 根据API文档：0-待处理，1-已完成，2-进行中，3-已逾期，4-已取消
  if (status === 1) {
    return 'completed'
  }
  if (status === 2) {
    return 'in_progress'
  }
  if (status === 3 || isOverdue(task.deadLine || task.end_at)) {
    return 'overdue'
  }
  if (status === 4) {
    return 'cancelled'
  }
  // 0-待处理
  return 'pending'
}

function getStatusText(status) {
  const statusMap = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已逾期',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

function getAttendeeNames(attendeeList) {
  if (!attendeeList || attendeeList.length === 0) return '-'
  return attendeeList.map(a => a.name).join(', ')
}

function taskUsers(task) {
  const list = Array.isArray(task.todoUsers) ? task.todoUsers : 
               (Array.isArray(task.attendeeList) ? task.attendeeList : [])
  return list.filter(user => user && (user.status === 1 || user.owner === 1)).slice(0, 3)
}

function switchView(mode) {
  viewMode.value = mode
  emit('view-mode-changed', mode)
  if (mode === 'list') {
    fetchListTasks()
    fetchAssigneeList()
  } else if (mode === 'kanban') {
    initKanbanData()
  } else if (mode === 'gantt') {
    nextTick(() => initGanttChart())
  }
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
  
  // 检查待办状态 - 只有已完成(status=1)的待办才能删除
  const status = task.todoStatus !== undefined ? task.todoStatus : parseInt(task.status)
  if (status !== 1) {
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
        await taskStore.fetchTaskList({ page: 1, pageSize: 10000 })
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
  if (!ganttChart.value) {
    console.warn('Gantt chart element not found')
    return
  }
  
  if (typeof echarts === 'undefined') {
    console.error('ECharts is not loaded')
    return
  }

  if (ganttChartInstance.value) {
    ganttChartInstance.value.dispose()
  }

  ganttChartInstance.value = echarts.init(ganttChart.value)

  let tasks = listTasks.value
  
  // 在开发环境下，如果没有数据，使用mock数据
  if (import.meta.env.DEV && tasks.length === 0) {
    const now = new Date()
    const mockTasks = [
      {
        id: 'gantt-mock-1',
        name: '需求分析与设计',
        content: '需求分析与设计',
        startTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 2
      },
      {
        id: 'gantt-mock-2',
        name: '前端页面开发',
        content: '前端页面开发',
        startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 3
      },
      {
        id: 'gantt-mock-3',
        name: '后端API接口开发',
        content: '后端API接口开发',
        startTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 3
      },
      {
        id: 'gantt-mock-4',
        name: '数据库设计与优化',
        content: '数据库设计与优化',
        startTime: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 2
      },
      {
        id: 'gantt-mock-5',
        name: '系统测试与bug修复',
        content: '系统测试与bug修复',
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 1
      },
      {
        id: 'gantt-mock-6',
        name: '性能优化与部署',
        content: '性能优化与部署',
        startTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 1
      },
      {
        id: 'gantt-mock-7',
        name: '用户培训与文档编写',
        content: '用户培训与文档编写',
        startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 1
      },
      {
        id: 'gantt-mock-8',
        name: '项目验收与上线',
        content: '项目验收与上线',
        startTime: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 1
      }
    ]
    tasks = mockTasks
  }
  
  if (tasks.length === 0) {
    // 如果没有数据，显示空状态
    const option = {
      title: {
        text: '甘特图视图',
        subtext: '暂无任务数据',
        left: 'center',
        top: 'center'
      }
    }
    ganttChartInstance.value.setOption(option)
    return
  }

  // 准备数据
  const categories = tasks.map(task => task.content || task.name || task.title || '未命名任务')
  const data = tasks.map((task, index) => {
    const times = getTimeObj(task)
    return {
      name: categories[index],
      value: [
        index,
        times.start,
        times.end,
        times.end - times.start
      ],
      itemStyle: {
        normal: {
          color: '#409EFF'  // 使用鲜亮的蓝色，与新建任务按钮一致
        }
      }
    }
  })

  const option = {
    title: {
      text: '甘特图视图',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal'
      }
    },
    tooltip: {
      formatter: function(params) {
        const startDate = new Date(params.value[1]).toLocaleDateString('zh-CN')
        const endDate = new Date(params.value[2]).toLocaleDateString('zh-CN')
        const duration = Math.ceil((params.value[2] - params.value[1]) / (1000 * 60 * 60 * 24))
        return `${params.name}<br/>开始: ${startDate}<br/>结束: ${endDate}<br/>工期: ${duration}天`
      }
    },
    grid: {
      left: '15%',
      right: '8%',
      bottom: '10%',
      top: 60,
      containLabel: true
    },
    xAxis: {
      type: 'time',
      position: 'top',
      splitLine: {
        show: true,
        lineStyle: {
          color: '#E9EDFF'
        }
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        formatter: function(value) {
          const date = new Date(value)
          return `${date.getMonth() + 1}/${date.getDate()}`
        },
        color: '#929ABA'
      }
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#929ABA',
        fontSize: 12,
        width: 100,
        overflow: 'truncate',
        ellipsis: '...'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#E9EDFF'
        }
      }
    },
    series: [
      {
        type: 'custom',
        renderItem: function(params, api) {
          const categoryIndex = api.value(0)
          const start = api.coord([api.value(1), categoryIndex])
          const end = api.coord([api.value(2), categoryIndex])
          const height = api.size([0, 1])[1] * 0.6
          
          const rectShape = echarts.graphic.clipRectByRect(
            {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height
            },
            {
              x: params.coordSys.x,
              y: params.coordSys.y,
              width: params.coordSys.width,
              height: params.coordSys.height
            }
          )
          
          return (
            rectShape && {
              type: 'rect',
              transition: ['shape'],
              shape: rectShape,
              style: api.style()
            }
          )
        },
        encode: {
          x: [1, 2],
          y: 0
        },
        data: data
      }
    ]
  }

  ganttChartInstance.value.setOption(option)
  
  // 监听窗口大小变化
  const resizeHandler = () => {
    if (ganttChartInstance.value) {
      ganttChartInstance.value.resize()
    }
  }
  
  window.removeEventListener('resize', resizeHandler)
  window.addEventListener('resize', resizeHandler)
}

function getTimeObj(taskData) {
  if (!taskData) {
    const now = new Date()
    return {
      start: now.getTime(),
      end: now.getTime() + 86400000
    }
  }

  // 优先使用startTime，其次createTime
  let start = taskData.startTime ? new Date(taskData.startTime).getTime() : 
              (taskData.createTime ? new Date(taskData.createTime).getTime() : new Date().getTime())
  
  // 优先使用deadLine，其次end_at，最后默认为开始时间+1天
  let end = taskData.deadLine ? new Date(taskData.deadLine).getTime() : 
            (taskData.end_at ? new Date(taskData.end_at).getTime() : start + 86400000)

  // 确保结束时间大于开始时间
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

function getPriorityColor(priority) {
  const colorMap = {
    1: '#909399', // 低
    2: '#E6A23C', // 中
    3: '#F56C6C'  // 高
  }
  return colorMap[priority] || '#909399'
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

  .filter-col {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .filter-btn {
      padding: 0 4px;
      min-width: auto;
    }
  }

  .filter-content {
    max-height: 300px;
    overflow-y: auto;
    
    .el-checkbox {
      display: block;
      margin: 8px 0;
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
      gap: $spacing-lg;
      overflow-x: auto;
      padding-bottom: $spacing-lg;

      .kanban-column {
        flex: 1;
        min-width: 280px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .kanban-column-header {
          padding: 4px $spacing-lg;
          background: #f8f8f8;
          border-bottom: 1px solid $border-light;
          border-radius: 8px 8px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;

          h5 {
            font-size: $font-size-base;
            font-weight: 500;
            margin: 0;
          }
        }

        .kanban-tasks-wrapper {
          height: calc(100vh - 300px);
          overflow-y: auto;
          padding: $spacing-lg;
        }

        .kanban-tasks {
          min-height: 200px;
        }

        .kanban-loading {
          text-align: center;
          padding: $spacing-md;
          color: #999;
          font-size: 14px;
        }

        .kanban-task {
          margin-bottom: $spacing-md;
          cursor: move;
        }

        .task-card {
          position: relative;
          background: #fff;
          border: 1px solid $border-light;
          border-radius: 6px;
          padding: $spacing-md;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
            margin-bottom: $spacing-sm;
            color: $text-primary;
            display: flex;
            align-items: center;
            font-size: $font-size-base;
            line-height: 1.5;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            .important-star {
              color: #f7ba2a;
              margin-right: 4px;
              flex-shrink: 0;
            }
          }

          .task-desc {
            font-size: $font-size-small;
            color: $text-secondary;
            margin-bottom: $spacing-sm;
            line-height: 1.4;
            
            .desc-text {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          .task-info {
            font-size: $font-size-small;
            color: $text-regular;
            margin-bottom: $spacing-sm;

            .task-assignee {
              margin-bottom: 4px;
            }
          }

          .task-users {
            display: flex;
            align-items: center;
            margin-bottom: $spacing-sm;
            overflow: hidden;

            ul {
              display: flex;
              align-items: center;
              padding: 0;
              margin: 0;
              list-style: none;
              flex-wrap: nowrap;
              overflow: hidden;

              li {
                list-style: none;
                margin-right: -6px;
                flex-shrink: 0;

                &:first-child {
                  margin-right: 0;
                }
              }
            }
          }

          .task-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: $spacing-sm;
            padding-top: $spacing-sm;
            border-top: 1px solid #f0f0f0;

            .task-deadline {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              color: #666;

              .el-icon {
                font-size: 14px;
              }

              span.overdue {
                color: $danger-color;
                font-weight: 600;
              }
            }
          }
        }

        .ghost-card {
          opacity: 0.5;
          background: #f0f0f0;
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
