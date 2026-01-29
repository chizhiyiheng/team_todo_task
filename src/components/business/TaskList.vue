<template>
  <div class="task-list">
    <div v-if="showHeader" class="task-list-header">
      <h4>{{ t('task.taskList') }}</h4>
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
        <div class="task-row el-row">
          <div class="el-col" style="flex: 1">{{ t('task.title') }}</div>
          <div class="el-col filter-col" style="width: 120px; flex: none; justify-content: center">
            {{ t('task.status') }}
            <el-popover placement="bottom" :width="140" trigger="click">
              <template #reference>
                <el-button link size="small" class="filter-btn">
                  <el-icon><Filter /></el-icon>
                </el-button>
              </template>
              <div class="filter-content">
                <el-checkbox-group v-model="selectedStatuses" @change="handleStatusFilterChange">
                  <el-checkbox :value="TASK_STATUS.PENDING">{{ t('task.statusPending') }}</el-checkbox>
                  <el-checkbox :value="TASK_STATUS.IN_PROGRESS">{{ t('task.statusInProgress') }}</el-checkbox>
                  <el-checkbox :value="TASK_STATUS.COMPLETED">{{ t('task.statusCompleted') }}</el-checkbox>
                  <el-checkbox :value="TASK_STATUS.OVERDUE">{{ t('task.statusOverdue') }}</el-checkbox>
                  <el-checkbox :value="TASK_STATUS.CANCELLED">{{ t('task.statusCancelled') }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </el-popover>
          </div>
          <div class="el-col filter-col" style="width: 120px; flex: none">
            {{ t('task.assignee') }}
            <el-popover placement="bottom" :width="240" trigger="click" @show="handleAssigneePopoverShow">
              <template #reference>
                <el-button link size="small" class="filter-btn">
                  <el-icon><Filter /></el-icon>
                </el-button>
              </template>
              <div class="filter-content" v-loading="assigneeLoading">
                <!-- 搜索框 -->
                <div class="filter-search">
                  <el-input
                    v-model="assigneeSearchKeyword"
                    :placeholder="t('task.searchAssignee')"
                    size="small"
                    clearable
                    @clear="handleAssigneeSearchClear"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                <!-- 执行人列表 -->
                <div class="assignee-list-wrapper">
                  <el-checkbox-group 
                    v-model="selectedAssignees" 
                    @change="handleAssigneeFilterChange"
                    class="assignee-checkbox-group"
                  >
                    <el-checkbox 
                      v-for="user in filteredAssigneeList" 
                      :key="user.id" 
                      :value="user.id"
                      class="assignee-checkbox"
                      style="display: block; width: 100%; margin: 0;"
                    >
                      <span class="assignee-name">{{ user.name }}</span>
                    </el-checkbox>
                  </el-checkbox-group>
                  <!-- 无结果提示 -->
                  <div v-if="filteredAssigneeList.length === 0 && assigneeList.length > 0" class="no-result">
                    {{ t('common.noSearchResult') }}
                  </div>
                </div>
              </div>
            </el-popover>
          </div>
          <div class="el-col" style="width: 120px; flex: none">{{ t('task.creator') }}</div>
          <div class="el-col" style="width: 170px; flex: none">{{ t('task.deadline') }}</div>
          <div class="el-col" style="width: 100px; flex: none">{{ t('task.source') }}</div>
          <div class="el-col" style="width: 160px; flex: none">{{ t('task.actions') }}</div>
        </div>
      </div>
      <div class="project-table-body">
        <div
          v-for="task in listTasks"
          :key="task.id"
          class="task-row"
          @click="viewTask(task)"
        >
          <div class="priority-color" :style="{ backgroundColor: getPriorityColor(task) }"></div>
          <div class="el-row">
            <div class="el-col row-name" :class="{ complete: isTaskCompleted(task) }" style="flex: 1">
              <div class="item-title">
                <el-icon v-if="task.mark === '1' || task.isTop === 1" class="important-star"><StarFilled /></el-icon>
                {{ task.title || task.content || task.name }}
              </div>
            </div>
            <div class="el-col row-status" style="width: 120px; flex: none; justify-content: center">
              <span class="flow-item-status" :class="getTaskStatusClass(task)">{{ getTaskStatusName(task) }}</span>
            </div>
            <div class="el-col row-user" style="width: 120px; flex: none">
              <div class="user-list">
                <el-avatar
                  v-for="user in getAttendeeList(task).slice(0, 3)"
                  :key="user.umId || user.userid"
                  :size="24"
                  :src="user.avatar"
                  class="user-avatar"
                >
                  {{ user.name ? user.name.substring(0, 1) : 'U' }}
                </el-avatar>
                <span v-if="getAttendeeList(task).length > 3" class="more-users">...</span>
              </div>
            </div>
            <div class="el-col row-assigner" style="width: 120px; flex: none">
              {{ task.creatorName || '-' }}
            </div>
            <div class="el-col row-time" style="width: 170px; flex: none">
              <span :class="['task-time', { overdue: isOverdue(task.deadLine) }]">
                {{ task.deadLine ? formatDate(task.deadLine) : '-' }}
              </span>
            </div>
            <div class="el-col row-source" style="width: 100px; flex: none">
              {{ getSourceName(task.source) }}
            </div>
            <div class="el-col row-operation" style="width: 160px; flex: none">
              <div class="operation-icons">
                <div class="op-icon" :class="{ active: task.mark === '1' }" @click.stop="handleOperationAction('mark-important', task)">
                  <el-icon v-if="task.mark === '1'"><StarFilled /></el-icon>
                  <el-icon v-else><Star /></el-icon>
                </div>
                <div class="op-icon" @click.stop="handleOperationAction('set-reminder', task)">
                  <el-icon><Bell /></el-icon>
                </div>
                <div class="op-icon" @click.stop="handleOperationAction('delete-task', task)">
                  <el-icon><Delete /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="task-list-pagination">
        <el-pagination
          v-model:current-page="listPage"
          v-model:page-size="listPageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="listTotal"
          :background="true"
          layout="total, prev, pager, next, sizes, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
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
                      <span class="title-text">{{ task.title || task.name || task.content }}</span>
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
              {{ t('common.loading') }}
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
/**
 * 任务列表组件
 * 支持三种视图模式：列表视图、看板视图、甘特图视图
 * 
 * 功能：
 * 1. 列表视图：表格形式展示任务，支持筛选、分页
 * 2. 看板视图：按状态分组的卡片式展示，支持拖拽
 * 3. 甘特图视图：时间轴形式展示任务进度
 * 4. 任务操作：标记重要、删除、提醒等
 * 5. 任务详情：点击任务查看详情弹窗
 * 
 * Props:
 * - viewMode: 视图模式 (list/kanban/gantt)
 * - taskType: 任务类型 (my/team)
 * - mode: 查询模式 (executed/assigned)
 * - teamId: 团队 ID
 * - showHeader: 是否显示头部
 */

import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { List, Grid, Calendar, Star, StarFilled, Edit, Delete, Bell, Clock, Filter, Loading, Search } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { isOverdue, isToday, expiresFormat, completeAtFormat, formatDate } from '@/utils/date'
import TaskMenu from './TaskMenu.vue'
import TableAction from '@/components/common/TableAction.vue'
import TaskDetailDialog from './task-detail/TaskDetailDialog.vue'
import { todoApi } from '@/api'
import draggable from 'vuedraggable'
import { useKanban } from '@/hooks/useKanban'
import { useListFilter } from '@/hooks/useListFilter'
import { TASK_STATUS, getStatusLabel, getStatusType } from '@/constants/taskEnums'
import { useI18n } from 'vue-i18n'

// ==================== Props & Emits ====================

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

// ==================== 基础设置 ====================

const { t } = useI18n()
const taskStore = useTaskStore()

// 当前视图模式
const viewMode = ref(props.viewMode)

// ==================== Hooks ====================

// 使用列表筛选 hook - 管理列表视图的数据和筛选
const {
  listTasks,
  listPage,
  listPageSize,
  listTotal,
  listLoading,
  selectedAssignees,
  selectedStatuses,
  assigneeList,
  fetchListTasks,
  fetchAssigneeList,
  handleAssigneeFilterChange,
  handleStatusFilterChange,
  handlePageChange,
  handlePageSizeChange
} = useListFilter(props)

// 使用看板 hook - 管理看板视图的数据和拖拽
const {
  kanbanStatusList,
  kanbanColumns,
  initKanbanData,
  handleKanbanScroll,
  handleDragChange
} = useKanban(props)

// ==================== 状态管理 ====================

// 甘特图相关
const ganttChart = ref(null)                    // 甘特图 DOM 引用
const ganttChartInstance = ref(null)            // 甘特图 ECharts 实例

// 任务详情弹窗状态
const showTaskDetail = ref(false)               // 是否显示任务详情弹窗
const selectedTaskId = ref(null)                // 当前选中的任务 ID

// 操作菜单配置
const operationMenu = [
  { icon: Star, title: t('task.markImportant'), action: 'mark-important' },
  { icon: Edit, title: t('task.editAction'), action: 'edit-task' },
  { icon: Delete, title: t('task.deleteAction'), action: 'delete-task' },
  { icon: Bell, title: t('task.reminderAction'), action: 'set-reminder' }
]

// 执行人列表加载状态
const assigneeLoading = ref(false)

// 执行人搜索关键词
const assigneeSearchKeyword = ref('')

// 过滤后的执行人列表
const filteredAssigneeList = computed(() => {
  if (!assigneeSearchKeyword.value) {
    return assigneeList.value
  }
  const keyword = assigneeSearchKeyword.value.toLowerCase().trim()
  return assigneeList.value.filter(user => 
    user.name.toLowerCase().includes(keyword)
  )
})

// ==================== 生命周期 ====================

/**
 * 组件卸载前
 * 清理甘特图实例
 */
onBeforeUnmount(() => {
  if (ganttChartInstance.value) {
    ganttChartInstance.value.dispose()
  }
})

// ==================== 监听器 ====================

/**
 * 监听 viewMode prop 变化
 * 当父组件改变视图模式时，切换到对应的视图并获取数据
 * 注意：跳过初始化时的触发，避免重复请求
 */
watch(() => props.viewMode, (newVal, oldVal) => {
  console.log('[TaskList] viewMode prop changed:', oldVal, '->', newVal)
  // 避免初始化时重复调用
  if (oldVal === undefined) return
  
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

// ==================== 工具方法 ====================

/**
 * 执行人筛选弹窗显示时的处理
 * 如果执行人列表为空，则获取执行人列表
 */
function handleAssigneePopoverShow() {
  // Fetch assignee list when popover shows
  if (assigneeList.value.length === 0) {
    fetchAssigneeList()
  }
}

/**
 * 清除执行人搜索
 */
function handleAssigneeSearchClear() {
  assigneeSearchKeyword.value = ''
}

/**
 * 获取任务的执行人列表
 * @param {Object} task - 任务对象
 * @returns {Array} 执行人列表
 */
function getAttendeeList(task) {
  return task.todoUsers || []
}

function getPriorityColor(task) {
  const colors = ['#ed4014', '#ff9900', '#19be6b', '#2db7f5']
  if (!task.id) return colors[0]
  return colors[task.id.charCodeAt(0) % 4] || '#2db7f5'
}

function getTaskStatusName(task) {
  const status = task.status !== undefined ? task.status : task.todoStatus
  return getStatusLabel(status)
}

function getTaskStatusClass(task) {
  const status = task.status !== undefined ? task.status : task.todoStatus
  const classMap = {
    [TASK_STATUS.TO_RECEIVE]: 'start',
    [TASK_STATUS.PENDING]: 'start',
    [TASK_STATUS.COMPLETED]: 'end',
    [TASK_STATUS.IN_PROGRESS]: 'progress',
    [TASK_STATUS.OVERDUE]: 'start',
    [TASK_STATUS.CANCELLED]: 'cancel'
  }
  return classMap[status] || 'start'
}

function isTaskCompleted(task) {
  const status = task.status !== undefined ? task.status : task.todoStatus
  return status === TASK_STATUS.COMPLETED
}

/**
 * 组件挂载时
 * 根据当前视图模式获取对应的数据
 * - 列表视图：获取任务列表和执行人列表
 * - 看板视图：初始化看板数据
 * - 甘特图视图：初始化甘特图
 */

onMounted(() => {
  refreshCurrentView()
})

onBeforeUnmount(() => {
  if (ganttChartInstance.value) {
    ganttChartInstance.value.dispose()
  }
})

watch(() => props.viewMode, (newVal) => {
  viewMode.value = newVal
  refreshCurrentView()
})

/**
 * 拖拽移动判断
 * @returns {Boolean} 是否允许拖拽
 */
function onDragMove(evt) {
  return true
}

/**
 * 获取任务状态键值
 * @param {Object} task - 任务对象
 * @returns {String} 状态键值 (pending/in_progress/completed/overdue/cancelled)
 */
function getTaskStatusKey(task) {
  const status = task.todoStatus !== undefined ? task.todoStatus : parseInt(task.status)
  if (status === TASK_STATUS.COMPLETED) return 'completed'
  if (status === TASK_STATUS.IN_PROGRESS) return 'in_progress'
  if (status === TASK_STATUS.OVERDUE) return 'overdue'
  if (status === TASK_STATUS.CANCELLED) return 'cancelled'
  return 'pending'
}

/**
 * 获取任务状态对应的标签类型
 * @param {Object} task - 任务对象
 * @returns {String} Element Plus 标签类型
 */
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
  if (status === TASK_STATUS.COMPLETED) {
    return 'completed'
  }
  if (status === TASK_STATUS.IN_PROGRESS) {
    return 'in_progress'
  }
  if (status === TASK_STATUS.OVERDUE || isOverdue(task.deadLine || task.end_at)) {
    return 'overdue'
  }
  if (status === TASK_STATUS.CANCELLED) {
    return 'cancelled'
  }
  return 'pending'
}

function getStatusText(status) {
  const statusMap = {
    pending: t('task.statusPending'),
    in_progress: t('task.statusInProgress'),
    completed: t('task.statusCompleted'),
    overdue: t('task.statusOverdue'),
    cancelled: t('task.statusCancelled')
  }
  return statusMap[status] || status
}

/**
 * 获取任务执行人名称列表
 * @param {Array} todoUsers - 执行人列表
 * @returns {String} 执行人名称，逗号分隔
 */
function getAttendeeNames(todoUsers) {
  if (!todoUsers || todoUsers.length === 0) return '-'
  return todoUsers.map(a => a.name).join(', ')
}

/**
 * 获取任务的执行人列表（用于看板视图）
 * 只返回状态为已接收或负责人的执行人
 * @param {Object} task - 任务对象
 * @returns {Array} 执行人列表
 */
function taskUsers(task) {
  const list = Array.isArray(task.todoUsers) ? task.todoUsers : []
  return list.filter(user => user && (user.status === 1 || user.owner === 1)).slice(0, 3)
}

function refreshCurrentView() {
  if (viewMode.value === 'list') {
    fetchListTasks()
    // 列表模式下也尝试获取执行人列表，以防万一
    if (assigneeList.value.length === 0) {
      fetchAssigneeList()
    }
  } else if (viewMode.value === 'kanban') {
    initKanbanData()
  } else if (viewMode.value === 'gantt') {
    nextTick(() => initGanttChart())
  }
}

function switchView(mode) {
  viewMode.value = mode
  emit('view-mode-changed', mode)
  refreshCurrentView()
}

function viewTask(task) {
  // Open task detail dialog
  selectedTaskId.value = task.id
  showTaskDetail.value = true
}

/**
 * 编辑任务
 * @param {Object} task - 任务对象
 * TODO: 实现编辑功能
 */
function editTask(task) {
  console.log('Edit task:', task)
}

function onTaskUpdate(data) {
  console.log('Task updated:', data)
  refreshCurrentView()
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
  if (!task) return
  
  const newIsTop = task.mark === '1' ? 0 : 1
  const oldMark = task.mark
  
  // Optimistically update the UI
  task.mark = newIsTop === 1 ? '1' : '0'
  
  // Call API
  ;(async () => {
    try {
      const response = newIsTop === 1 
        ? await todoApi.markImportant(task.id)
        : await todoApi.unmarkImportant(task.id)
      
      if (response.code === '200') {
        ElMessage.success(newIsTop === 1 ? t('task.markImportant') : t('task.cancelMarkImportantSuccess'))
        // Refresh task list to ensure consistency
        if (viewMode.value === 'list') {
          fetchListTasks()
        } else if (viewMode.value === 'kanban') {
          initKanbanData()
        }
      } else {
        // Rollback on failure
        task.mark = oldMark
        ElMessage.error(response.message || t('task.operationFailed'))
      }
    } catch (error) {
      // Rollback on error
      task.mark = oldMark
      ElMessage.error(t('task.operationFailed'))
      console.error('Toggle important error:', error)
    }
  })()
}

function removeTask(task) {
  console.log('Remove task:', task)
  
  // Check task status - only completed tasks can be deleted
  const status = task.todoStatus !== undefined ? task.todoStatus : parseInt(task.status)
  if (status !== TASK_STATUS.COMPLETED) {
    ElMessage.warning(t('task.onlyCompletedCanDelete'))
    return
  }
  
  // Confirm deletion
  ElMessageBox.confirm(
    t('task.deleteTaskConfirm'),
    t('task.deleteConfirmTitle'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      const result = await todoApi.deleteTodo(task.id)
      if (result.code === '200') {
        ElMessage.success(t('task.taskDeleteSuccess'))
        emit('task-deleted', task.id)
        // Refresh current view's task list
        if (viewMode.value === 'list') {
          fetchListTasks()
        } else if (viewMode.value === 'kanban') {
          initKanbanData()
        }
      } else {
        ElMessage.error(result.message || t('task.deleteFailed'))
      }
    } catch (error) {
      console.error('Delete task error:', error)
      ElMessage.error(t('task.deleteFailed'))
    }
  }).catch(() => {
    // User cancelled deletion
  })
}

function setReminder(task) {
  // Reminder functionality
  console.log('Set reminder:', task)
}

function handleTaskUpdated(updatedTask) {
  console.log('Task updated in dialog:', updatedTask)
  // Refresh the task list to show updated data
  refreshCurrentView()
}

function handleTaskDeleted(taskId) {
  console.log('Task deleted in dialog:', taskId)
  // Refresh the task list to remove deleted task
  refreshCurrentView()
}

function getSourceName(source) {
  const sourceMap = {
    0: t('task.sourceSystem'),
    7: t('task.sourceTask'),
    8: t('task.sourceProject'),
    9: t('task.sourceMeeting')
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
  
  // Use mock data in development environment if no data available
  if (import.meta.env.DEV && tasks.length === 0) {
    const now = new Date()
    const mockTasks = [
      {
        id: 'gantt-mock-1',
        name: t('task.ganttMockTask1'),
        content: t('task.ganttMockTask1'),
        startTime: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 2
      },
      {
        id: 'gantt-mock-2',
        name: t('task.ganttMockTask2'),
        content: t('task.ganttMockTask2'),
        startTime: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 3
      },
      {
        id: 'gantt-mock-3',
        name: t('task.ganttMockTask3'),
        content: t('task.ganttMockTask3'),
        startTime: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 3
      },
      {
        id: 'gantt-mock-4',
        name: t('task.ganttMockTask4'),
        content: t('task.ganttMockTask4'),
        startTime: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 2
      },
      {
        id: 'gantt-mock-5',
        name: t('task.ganttMockTask5'),
        content: t('task.ganttMockTask5'),
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 1
      },
      {
        id: 'gantt-mock-6',
        name: t('task.ganttMockTask6'),
        content: t('task.ganttMockTask6'),
        startTime: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 1
      },
      {
        id: 'gantt-mock-7',
        name: t('task.ganttMockTask7'),
        content: t('task.ganttMockTask7'),
        startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 1
      },
      {
        id: 'gantt-mock-8',
        name: t('task.ganttMockTask8'),
        content: t('task.ganttMockTask8'),
        startTime: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000).getTime(),
        deadLine: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).getTime(),
        todoStatus: 1
      }
    ]
    tasks = mockTasks
  }
  
  if (tasks.length === 0) {
    // Show empty state if no data
    const option = {
      title: {
        text: t('task.ganttChartTitle'),
        subtext: t('task.noTaskData'),
        left: 'center',
        top: 'center'
      }
    }
    ganttChartInstance.value.setOption(option)
    return
  }

  // Prepare data
  const categories = tasks.map(task => task.content || task.name || task.title || t('task.title'))
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
          color: '#409EFF'  // Use bright blue color, consistent with create task button
        }
      }
    }
  })

  const option = {
    title: {
      text: t('task.ganttChartTitle'),
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
        return `${params.name}<br/>${t('task.ganttStart')}: ${startDate}<br/>${t('task.ganttEnd')}: ${endDate}<br/>${t('task.ganttDuration')}: ${duration}${t('task.ganttDays')}`
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
  
  // Listen for window resize
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

  // Prefer startTime, then createTime
  let start = taskData.startTime ? new Date(taskData.startTime).getTime() : 
              (taskData.createTime ? new Date(taskData.createTime).getTime() : new Date().getTime())
  
  // Prefer deadLine, then end_at, default to start time + 1 day
  let end = taskData.deadLine ? new Date(taskData.deadLine).getTime() : 
            (taskData.end_at ? new Date(taskData.end_at).getTime() : start + 86400000)

  // Ensure end time is greater than start time
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
// Style variables
$primary-title-color: #1f2937;
$primary-desc-color: #909399;
$flow-status-start-color: $danger-color;
$flow-status-progress-color: #fc984b;
$flow-status-test-color: #8b5cf6;
$flow-status-end-color: $success-color;
$flow-status-cancel-color: $info-color;

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
    padding: 0;
    max-height: 400px;
    display: flex;
    flex-direction: column;
    
    .filter-search {
      padding: 12px;
      flex-shrink: 0;
      
      .el-input {
        width: 100%;
      }
    }
    
    .assignee-list-wrapper {
      flex: 1;
      overflow-y: auto;
      max-height: 320px;
      margin-top: 16px !important;;
      padding-top: 16px;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
        
        &:hover {
          background: #a8a8a8;
        }
      }
      
      .no-result {
        padding: 20px 12px;
        text-align: center;
        color: #909399;
        font-size: 13px;
      }
    }
    
    .assignee-checkbox-group {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 0 !important;
      padding-top: 0 !important;
      margin-top: 0 !important;
      
      :deep(.el-checkbox) {
        display: block !important;
        width: 100% !important;
      }
    }
    
    .assignee-list-wrapper .el-checkbox-group {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .assignee-list-wrapper .el-checkbox-group .el-checkbox {
      display: block !important;
      width: 100% !important;
      padding: 10px 12px !important;
      border-radius: 0 !important;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: #f5f7fa;
      }
      
      :deep(.el-checkbox__input) {
        vertical-align: middle;
        margin-right: 8px;
      }
      
      :deep(.el-checkbox__label) {
        font-size: 13px;
        color: #606266;
        padding-left: 0;
        vertical-align: middle;
      }
      
      :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
        color: #409eff;
      }
    }
    
    .assignee-list-wrapper .el-checkbox-group .assignee-checkbox {
      display: block !important;
      width: 100% !important;
      
      .assignee-name {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 180px;
        vertical-align: middle;
      }
    }
  }

  .task-list-view {
    &.project-table {
      margin-top: 2px;
      display: flex;
      flex-direction: column;

      .project-table-head {
        margin-bottom: 4px;
        border: 1px solid #F4F4F5;
        border-radius: 5px;
        overflow: hidden;
        
        .task-row {
          background-color: #ffffff;
          
          > .el-col {
            padding: 8px 12px;
            color: #888888;
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            border-right: 1px solid #F4F4F5;
            
            &:last-child {
              border-right: 0;
            }
            
            &:first-child {
              padding-left: 12px;
            }
            
            &.filter-col {
              position: relative;
              
              .filter-btn {
                padding: 0;
                margin-left: 4px;
                color: #909399;
                
                &:hover {
                  color: #409eff;
                }
              }
            }
          }
        }
      }

      .project-table-body {
        border: 1px solid #F4F4F5;
        border-top: 0;
        border-radius: 5px;
        
        &::-webkit-scrollbar {
          display: none;
        }

        .task-row {
          background-color: #ffffff;
          border-bottom: 1px solid #F4F4F5;
          position: relative;
          cursor: pointer;
          transition: box-shadow 0.3s;
          
          &:hover {
            box-shadow: 0 0 10px #e6ecfa;
            z-index: 1;
          }

          .priority-color {
            position: absolute;
            top: 0;
            left: 0;
            bottom: -1px;
            width: 3px;
            z-index: 2;
          }

          > .el-row {
            > .el-col {
              display: flex;
              align-items: center;
              padding: 10px 12px;
              border-right: 1px solid #F4F4F5;
              min-height: 48px;

              &:first-child {
                padding-left: 32px;
              }
              
              &:last-child {
                border-right: 0;
              }
            }
          }

          .row-name {
            padding: 12px 12px 12px 12px !important;
            line-height: 24px;
            position: relative;
            
            &.complete {
              .item-title {
                color: #aaaaaa;
                text-decoration: line-through;
              }
            }

            .item-title {
              flex: 1;
              padding: 0 8px;
              word-break: break-all;
              font-size: 14px;
              display: flex;
              align-items: center;
              flex-wrap: wrap;

              .important-star {
                color: #f7ba2a;
                margin-right: 4px;
              }

              &:hover {
                color: $primary-color;
              }
            }
          }

          .row-status {
            display: flex;
            align-items: center;
            justify-content: center;
            
            .flow-item-status {
              font-size: 12px;
              height: 20px;
              line-height: 18px;
              padding: 0 4px;
              border-radius: 3px;
              border: 1px solid transparent;
              display: inline-block;
              
              &.start {
                background-color: rgba($flow-status-start-color, 0.1);
                border-color: rgba($flow-status-start-color, 0.1);
                color: $flow-status-start-color;
              }
              
              &.progress {
                background-color: rgba($flow-status-progress-color, 0.1);
                border-color: rgba($flow-status-progress-color, 0.1);
                color: $flow-status-progress-color;
              }
              
              &.end {
                background-color: rgba($flow-status-end-color, 0.1);
                border-color: rgba($flow-status-end-color, 0.1);
                color: $flow-status-end-color;
              }
              
              &.cancel {
                background-color: rgba($flow-status-cancel-color, 0.1);
                border-color: rgba($flow-status-cancel-color, 0.1);
                color: $flow-status-cancel-color;
              }
            }
          }
          
          .row-user {
            .user-list {
              display: flex;
              align-items: center;
              
              .user-avatar {
                border: 2px solid #fff;
                margin-left: -8px;
                
                &:first-child {
                  margin-left: 0;
                }
              }
              
              .more-users {
                margin-left: 4px;
                color: #909399;
                font-size: 14px;
              }
            }
          }
          
          .row-assigner {
            font-size: 13px;
            color: $primary-title-color;
          }
          
          .row-time {
            .task-time {
              color: #777777;
              background-color: #EAEDF2;
              border: 1px solid #EAEDF2;
              padding: 0 4px;
              font-size: 12px;
              border-radius: 3px;
              
              &.overdue {
                color: #ffffff;
                background-color: #ed4014;
                border-color: #ed4014;
              }
            }
          }
          
          .row-source {
            font-size: 13px;
            color: $primary-desc-color;
          }
          
          .row-operation {
            .operation-icons {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              height: 100%;
              
              .op-icon {
                cursor: pointer;
                color: #999;
                font-size: 16px;
                display: flex;
                align-items: center;
                transition: color 0.3s;
                
                &:hover {
                  color: $primary-color;
                }
                
                &.active {
                  color: #ff9900;
                }
                
                .taskfont {
                  font-size: 16px;
                }
              }
            }
          }
        }
      }
      
      .task-list-pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 16px 0;
        margin-top: 8px;
        
        :deep(.el-pagination) {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 12px;
          
          .el-pagination__total {
            flex: 1;
            margin-right: 0;
            order: -1;
          }
          
          .el-pagination__sizes {
            order: 999;
            margin-left: auto;
            margin-right: 0;
            
            .el-select {
              width: 100px;
              
              .el-input {
                width: 90px;
              }
            }
          }
          
          .el-pagination__jump {
            margin-left: 12px;
            
            .el-pagination__goto {
              margin-right: 0;
            }
            
            .el-pagination__classifier {
              margin-left: 0;
            }
            
            .el-input {
              width: 40px;
              margin: 0 8px;
              
              .el-input__wrapper {
                padding: 1px 8px;
              }
            }
          }
          
          .btn-prev,
          .btn-next {
            margin: 0 4px;
          }
          
          .el-pager {
            margin: 0 4px;
            
            li {
              min-width: 32px;
              height: 32px;
              line-height: 32px;
              border-radius: 4px;
              margin: 0 2px;
              
              &.is-active {
                background-color: #409eff;
                color: #fff;
              }
            }
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
            min-width: 0; // 关键：允许flex子元素收缩

            .important-star {
              color: #f7ba2a;
              margin-right: 4px;
              flex-shrink: 0;
            }

            // 文字部分需要单独处理省略号
            .title-text {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              min-width: 0;
              flex: 1;
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
              line-clamp: 2;
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

@font-face {
  font-family: 'taskfont';
  src: url('@/assets/fonts/taskfont.woff2') format('woff2'),
       url('@/assets/fonts/taskfont.woff') format('woff'),
       url('@/assets/fonts/taskfont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.taskfont {
  font-family: "taskfont" !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
      &.project-table {
        .project-table-head {
          overflow-x: auto;
          overflow-y: hidden;
          border-radius: 5px;
          
          /* 隐藏滚动条但保持滚动功能 */
          &::-webkit-scrollbar {
            height: 4px;
          }
          
          &::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 2px;
          }
          
          .task-row {
            min-width: 900px; /* 确保表头不换行 */
            flex-wrap: nowrap;
          }
        }
        
        .project-table-body {
          overflow-x: auto;
          overflow-y: visible;
          
          /* 滚动条样式 */
          &::-webkit-scrollbar {
            height: 4px;
            display: block !important;
          }
          
          &::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          
          &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 2px;
          }
          
          .task-row {
            min-width: 900px; /* 与表头保持一致 */
            flex-wrap: nowrap;
          }
        }
      }
      
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
