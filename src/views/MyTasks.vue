<template>
  <div class="my-tasks-page">
    <TaskStatistics
      :title="statisticsTitle"
      task-type="my"
      :show-create-button="true"
      :mode="activeTab"
      :show-list="false"
      :show-controls="false"
      @filter-changed="handleFilterChange"
      @view-mode-changed="handleViewModeChange"
      @create-task="handleCreateTask"
    />
    <div class="task-toolbar">
      <div class="toolbar-left">
      </div>
      <div class="toolbar-right">
        <div class="filter-label">执行人:</div>
        <el-select
          v-model="assigneeFilter"
          style="width: 160px"
          :loading="assigneeLoading"
          @focus="handleAssigneeFocus"
        >
          <el-option :label="$t('common.all')" value="all" />
          <el-option
            v-for="user in assigneeOptions"
            :key="user.id"
            :value="user.id"
            :label="user.name"
          />
        </el-select>
        <div class="filter-label">状态:</div>
        <el-select
          v-model="statusFilter"
          style="width: 140px"
          @change="handleStatusFilterChange"
        >
          <el-option :label="$t('task.statusAll')" value="all" />
          <el-option label="待接收" value="to_receive" />
          <el-option :label="$t('task.statusPending')" value="pending" />
          <el-option :label="$t('task.statusCompleted')" value="completed" />
          <el-option :label="$t('task.statusInProgress')" value="in_progress" />
          <el-option :label="$t('task.statusOverdue')" value="overdue" />
          <el-option :label="$t('task.statusCancelled')" value="cancelled" />
        </el-select>
        <el-button-group>
          <el-button :class="{ active: viewMode === 'list' }" @click="handleViewModeChange('list')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </el-button>
          <el-button :class="{ active: viewMode === 'kanban' }" @click="handleViewModeChange('kanban')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </el-button>
          <el-button :class="{ active: viewMode === 'gantt' }" @click="handleViewModeChange('gantt')">
            <el-icon><Calendar /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
    <div v-if="viewMode === 'list'" class="project-panel">
      <div class="project-table">
        <div class="project-table-head">
          <div class="task-row el-row">
            <div class="el-col" style="flex: 1">标题</div>
            <div class="el-col" style="width: 120px; flex: none; justify-content: center">状态</div>
            <div class="el-col" style="width: 120px; flex: none">执行人</div>
            <div class="el-col" style="width: 120px; flex: none">创建人</div>
            <div class="el-col" style="width: 170px; flex: none">时间</div>
            <div class="el-col" style="width: 100px; flex: none">来源</div>
            <div class="el-col" style="width: 160px; flex: none">操作</div>
          </div>
        </div>
        <div class="project-table-body">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-row"
            @click="viewTask(task)"
          >
            <div class="priority-color" :style="{ backgroundColor: getPriorityColor(task) }"></div>
            <div class="el-row">
              <div class="el-col row-name" :class="{ complete: isTaskCompleted(task) }" style="flex: 1">
                <div class="item-title">
                  <el-icon v-if="task.mark === '1' || task.isTop === 1" class="important-star"><StarFilled /></el-icon>
                  {{ task.name || task.content }}
                </div>
                <div class="item-icons">
                  <div v-if="task.desc" class="item-icon"><i class="taskfont">&#xe71a;</i></div>
                  <div v-if="task.file_num > 0" class="item-icon"><i class="taskfont">&#xe71c;</i><em>{{ task.file_num }}</em></div>
                  <div v-if="task.sub_num > 0" class="item-icon"><i class="taskfont">&#xe71f;</i><em>{{ task.sub_complete }}/{{ task.sub_num }}</em></div>
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
                   <div class="op-icon" :class="{ active: task.mark === '1' }" @click.stop="handleIconClick('mark-important', task)">
                     <el-icon v-if="task.mark === '1'"><StarFilled /></el-icon>
                     <el-icon v-else><Star /></el-icon>
                   </div>
                   <div class="op-icon" @click.stop="handleIconClick('edit-task', task)">
                     <el-icon><Edit /></el-icon>
                   </div>
                   <div class="op-icon" @click.stop="handleIconClick('set-reminder', task)">
                     <el-icon><Bell /></el-icon>
                   </div>
                   <div class="op-icon" @click.stop="handleIconClick('delete-task', task)">
                     <el-icon><Delete /></el-icon>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <TaskList
      v-else
      :view-mode="viewMode"
      :status-filter="statusFilter"
      :assignee-filter="assigneeFilter"
      :show-header="false"
      task-type="my"
      :mode="activeTab"
      @view-mode-changed="handleViewModeChange"
      @filter-changed="handleFilterChange"
      @task-deleted="handleTaskDeleted"
    />

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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import { formatDate, isOverdue } from '@/utils/date'
import { Edit, Delete, Bell, Star, StarFilled, List, Grid, Calendar } from '@element-plus/icons-vue'
import TaskStatistics from '@/components/business/TaskStatistics.vue'
import TaskList from '@/components/business/TaskList.vue'
import TaskDetailDialog from '@/components/business/task-detail/TaskDetailDialog.vue'
import { todoApi } from '@/api'

const emit = defineEmits(['view-mode-changed', 'filter-changed', 'assignee-filter-changed', 'task-deleted'])

const route = useRoute()
const { t } = useI18n()
const taskStore = useTaskStore()

const statusFilter = ref('all')
const viewMode = ref('list')
const assigneeFilter = ref('all')
const searchKeyword = ref('')
const assigneeOptions = ref([])
const assigneeLoading = ref(false)

// Task detail dialog state
const showTaskDetail = ref(false)
const selectedTaskId = ref(null)

const activeTab = computed(() => route.query.tab || 'executed')
const statisticsTitle = computed(() => {
  return t('task.taskStatistics')
})

// 获取执行人列表
async function fetchAssigneeList() {
  assigneeLoading.value = true
  try {
    const response = await todoApi.getUserList()
    if (response.code === '200') {
      // 根据umId获取用户详细信息
      const userIds = response.data || []
      const userMap = new Map()
      
      // 从任务列表中提取用户信息
      ;(taskStore.taskList || []).forEach(task => {
        const list = task.attendeeList || []
        list.forEach(attendee => {
          if (attendee.umId && userIds.includes(attendee.umId)) {
            userMap.set(attendee.umId, {
              id: attendee.umId,
              name: attendee.name
            })
          }
        })
      })
      
      assigneeOptions.value = Array.from(userMap.values())
    }
  } catch (error) {
    console.error('Failed to fetch assignee list:', error)
  } finally {
    assigneeLoading.value = false
  }
}

// 执行人下拉框获得焦点时加载数据
function handleAssigneeFocus() {
  if (assigneeOptions.value.length === 0) {
    fetchAssigneeList()
  }
}

const filteredTasks = computed(() => {
  let tasks = taskStore.taskList || []

  if (statusFilter.value !== 'all') {
    const statusMap = {
      'to_receive': 0,    // 待接收
      'pending': 1,       // 待处理
      'completed': 2,     // 已完成
      'in_progress': 3,   // 进行中
      'overdue': 4,       // 已逾期
      'cancelled': 5      // 已取消
    }
    
    const targetStatus = statusMap[statusFilter.value]
    if (targetStatus !== undefined) {
      tasks = tasks.filter(task => task.todoStatus === targetStatus)
    }
  }

  if (assigneeFilter.value !== 'all') {
    tasks = tasks.filter(task => {
      const attendees = task.attendeeList || task.task_user || []
      return attendees.some(a => a.umId === assigneeFilter.value || a.userid === assigneeFilter.value)
    })
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    tasks = tasks.filter(task => {
      return (task.content || task.name || '').toLowerCase().includes(keyword) ||
             (task.desc || '').toLowerCase().includes(keyword)
    })
  }

  if (activeTab.value === 'assigned') {
    tasks = tasks.filter(task => task.creatorUmId === 'LIUQINGHONG264')
  } else {
    tasks = tasks.filter(task => task.attendeeList && task.attendeeList.length > 0)
  }

  return tasks
})

function handleFilterChange(status) {
  statusFilter.value = status
}

function handleStatusFilterChange(value) {
  statusFilter.value = value
  
  // 根据状态筛选调用接口
  const statusMap = {
    'to_receive': 0,
    'pending': 1,
    'completed': 2,
    'in_progress': 3,
    'overdue': 4,
    'cancelled': 5
  }
  
  const params = { page: 1, pageSize: 10000 }
  
  // 如果不是全部状态，传递status参数
  if (value !== 'all') {
    params.status = statusMap[value]
  }
  
  taskStore.fetchTaskList(params)
}

function handleViewModeChange(mode) {
  viewMode.value = mode
}

function handleSearch(keyword) {
  searchKeyword.value = keyword
}

function handleCreateTask() {
  console.log('Create new task')
}

function getAttendeeList(task) {
  return task.attendeeList || []
}

function getPriorityColor(task) {
  const colors = ['#ed4014', '#ff9900', '#19be6b', '#2db7f5']
  if (!task.id) return colors[0]
  return colors[task.id.charCodeAt(0) % 4] || '#2db7f5'
}

function handleTaskUpdate(data) {
  console.log('Task updated:', data)
}

function getTaskStatusName(task) {
  const statusMap = {
    0: '待接收',
    1: t('task.statusPending'),
    2: t('task.statusCompleted'),
    3: t('task.statusInProgress'),
    4: t('task.statusOverdue'),
    5: t('task.statusCancelled')
  }
  return statusMap[task.todoStatus] || statusMap[parseInt(task.status)] || '-'
}

function getTaskStatusClass(task) {
  const status = task.todoStatus !== undefined ? task.todoStatus : parseInt(task.status)
  const classMap = {
    0: 'start',      // 待接收
    1: 'start',      // 待处理
    2: 'end',        // 已完成
    3: 'progress',   // 进行中
    4: 'start',      // 已逾期
    5: 'cancel'      // 已取消
  }
  return classMap[status] || 'start'
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

function viewTask(task) {
  console.log('View task:', task)
  // Open task detail dialog
  selectedTaskId.value = task.id
  showTaskDetail.value = true
}

function editTask(task) {
  console.log('Edit task:', task)
  // Open task detail dialog in edit mode
  selectedTaskId.value = task.id
  showTaskDetail.value = true
}

function deleteTask(task) {
  console.log('Delete task:', task)
  // 检查待办状态 - 只有已完成的待办才能删除
  if (task.todoStatus !== 2 && task.status !== '2') {
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

function handleTaskUpdated(updatedTask) {
  console.log('Task updated in dialog:', updatedTask)
  // Refresh the task list to show updated data
  taskStore.fetchTaskList({ page: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
}

function handleTaskDeleted(taskId) {
  console.log('Task deleted in dialog:', taskId)
  // Refresh the task list to remove deleted task
  taskStore.fetchTaskList({ page: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
}

function handleIconClick(action, task) {
  console.log('Icon click:', action, task)
  if (action === 'edit-task') {
    editTask(task)
  } else if (action === 'mark-important') {
    task.mark = task.mark === '1' ? '0' : '1'
    if (task.isTop === 1 && task.mark === '0') {
      task.isTop = 0
    }
  } else if (action === 'delete-task') {
    deleteTask(task)
  } else if (action === 'set-reminder') {
    // Handle reminder
  }
}

function isTaskCompleted(task) {
  return task.todoStatus === 2 || task.status === '2' || task.status === 2
}

onMounted(() => {
  console.log('MyTasks onMounted')
  taskStore.fetchTaskList({ page: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
})

watch(() => taskStore.taskList.length, (newLength) => {
  console.log('Task list updated count:', newLength)
})

watch(activeTab, () => {
  console.log('Tab changed:', activeTab.value)
})
</script>

<style scoped lang="scss">
// 模拟变量
$primary-title-color: #1f2937;
$primary-desc-color: #909399;
$flow-status-start-color: $danger-color;
$flow-status-progress-color: #fc984b;
$flow-status-test-color: #8b5cf6;
$flow-status-end-color: $success-color;
$flow-status-cancel-color: $info-color;

.my-tasks-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.task-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 6px 8px;
  margin-top: 12px;
  margin-bottom: 4px;
  flex-wrap: wrap;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: 14px;
    color: #666;
    white-space: nowrap;
  }

  .el-button-group {
    .el-button {
      background: transparent !important;
      border-color: #dcdfe6 !important;
      color: #606266 !important;

      &.active {
        background: #fff !important;
        border-color: #409eff !important;
        color: #409eff !important;
      }

      &:hover {
        background: #f5f7fa !important;
        border-color: #c6e2ff !important;
        color: #409eff !important;
      }
    }
  }
}

.project-panel {
  display: flex !important;
  flex-direction: column;
  padding: 0;
}

.project-table {
  margin-top: 18px;
  display: flex;
  flex-direction: column;

  .project-table-head {
    margin-bottom: 12px;
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
        
        .item-icons {
           display: flex;
           align-items: center;
           
           .item-icon {
              margin-left: 8px;
              color: #999;
              display: flex;
              align-items: center;
              
              .taskfont {
                  font-size: 14px;
                  font-style: normal;
              }
              
              em {
                  font-style: normal;
                  font-size: 12px;
                  margin-left: 2px;
              }
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
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
</style>
