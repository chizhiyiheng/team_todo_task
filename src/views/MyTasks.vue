<template>
  <div class="my-tasks-page">
    <TaskStatistics
      :title="statisticsTitle"
      task-type="my"
      :show-create-button="false"
      :mode="activeTab"
      :show-list="false"
      @filter-changed="handleFilterChange"
      @view-mode-changed="handleViewModeChange"
    />
    <div v-if="viewMode === 'list'" class="project-panel my-tasks-panel">
      <div class="project-table">
        <div class="project-table-head">
          <el-row class="task-row">
            <el-col :span="8">
              <div class="ellipsis">{{ $t('task.title') }}</div>
            </el-col>
            <el-col :span="3">
              <div class="ellipsis">{{ $t('task.assignee') }}</div>
            </el-col>
            <el-col :span="3">
              <div class="ellipsis">{{ $t('task.creator') }}</div>
            </el-col>
            <el-col :span="4">
              <div class="ellipsis">{{ $t('task.deadline') }}</div>
            </el-col>
            <el-col :span="2">
              <div class="ellipsis">{{ $t('task.source') }}</div>
            </el-col>
            <el-col :span="4">
              <div class="ellipsis">{{ $t('task.actions') }}</div>
            </el-col>
          </el-row>
        </div>
        <div class="project-table-body">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-row"
            @click="viewTask(task)"
          >
            <em class="priority-color" :style="{ backgroundColor: getPriorityColor(task) }"></em>
            <el-row>
              <el-col :span="8" :class="['row-name', task.status === '1' ? 'complete' : '']">
                <div class="task-menu-wrapper" @click.stop>
                  <TaskMenu :task="task" @on-update="handleTaskUpdate" />
                </div>
                <div class="item-title">
                  <div @click.stop style="display: inline-block; margin-right: 6px;">
                    <TaskMenu :task="task" @on-update="handleTaskUpdate">
                      <span v-if="getTaskStatusName(task)" :class="['flow-item-status', getTaskStatusClass(task)]">{{ getTaskStatusName(task) }}</span>
                    </TaskMenu>
                  </div>
                  {{ task.content }}
                </div>
                <div class="item-icons">
                  <div v-if="task.desc" class="item-icon">
                    <i class="taskfont">&#xe71a;</i>
                  </div>
                  <div v-if="task.fileNum > 0" class="item-icon">
                    <i class="taskfont">&#xe71c;</i>
                    <em>{{task.fileNum}}</em>
                  </div>
                </div>
              </el-col>
              <el-col :span="3" class="row-user">
                <div class="user-list">
                  <el-avatar 
                    v-for="(user, index) in getAttendeeList(task)" 
                    :key="user.umId || index" 
                    :size="24" 
                    :src="user.avatar"
                    class="user-avatar"
                  >
                    {{ user.name ? user.name.charAt(0) : 'U' }}
                  </el-avatar>
                </div>
              </el-col>
              <el-col :span="3" class="row-assigner">
                <div class="assigner-name">{{ task.creatorName }}</div>
              </el-col>
              <el-col :span="4" class="row-time">
                <div v-if="task.deadLine" :class="['task-time', isOverdue(task.deadLine) && task.status !== '1' ? 'overdue' : '']">
                  {{ formatDate(task.deadLine) }}
                </div>
              </el-col>
              <el-col :span="2" class="row-source">
                <div class="source-text">{{ getSourceName(task.source) }}</div>
              </el-col>
              <el-col :span="4" class="row-operation">
                <div class="operation-icons">
                  <div class="op-icon" :class="{ active: task.mark === '1' }" @click.stop="handleIconClick('mark-important', task)">
                    <i class="taskfont">&#xe6ec;</i>
                  </div>
                  <div class="op-icon" @click.stop="handleIconClick('edit-task', task)">
                    <el-icon><Edit /></el-icon>
                  </div>
                  <div class="op-icon" @click.stop="handleIconClick('delete-task', task)">
                    <el-icon><Delete /></el-icon>
                  </div>
                  <div class="op-icon" @click.stop="handleIconClick('set-reminder', task)">
                    <el-icon><Bell /></el-icon>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
    <TaskList
      v-else
      :view-mode="viewMode"
      :status-filter="statusFilter"
      task-type="my"
      :mode="activeTab"
      @view-mode-changed="handleViewModeChange"
      @filter-changed="handleFilterChange"
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
import { useTaskStore } from '@/stores/task'
import { formatDate, isOverdue } from '@/utils/date'
import { Edit, Delete, Bell, Star } from '@element-plus/icons-vue'
import TaskStatistics from '@/components/business/TaskStatistics.vue'
import TaskList from '@/components/business/TaskList.vue'
import TaskMenu from '@/components/business/TaskMenu.vue'
import TableAction from '@/components/common/TableAction.vue'
import TaskDetailDialog from '@/components/business/task-detail/TaskDetailDialog.vue'

const route = useRoute()
const { t } = useI18n()
const taskStore = useTaskStore()

const statusFilter = ref('all')
const viewMode = ref('list')

// Task detail dialog state
const showTaskDetail = ref(false)
const selectedTaskId = ref(null)

const activeTab = computed(() => route.query.tab || 'executed')
const statisticsTitle = computed(() => {
  return activeTab.value === 'assigned' ? t('task.myAssignedTasks') : t('task.myExecutedTasks')
})

const filteredTasks = computed(() => {
  let tasks = taskStore.taskList

  if (statusFilter.value !== 'all') {
    tasks = tasks.filter(task => {
      if (statusFilter.value === 'completed') {
        return task.status === '1'
      } else if (statusFilter.value === 'pending') {
        return task.status === '0' && !isOverdue(task.deadLine)
      } else if (statusFilter.value === 'in_progress') {
        return task.status === '2'
      } else if (statusFilter.value === 'cancelled') {
        return task.status === '-1'
      } else if (statusFilter.value === 'overdue') {
        return task.status === '0' && isOverdue(task.deadLine)
      }
      return true
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

function handleViewModeChange(mode) {
  viewMode.value = mode
}

function getAttendeeNames(attendeeList) {
  if (!attendeeList || attendeeList.length === 0) return '-'
  return attendeeList.map(a => a.name).join(', ')
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
  if (task.status === '1') return t('task.statusCompleted')
  if (task.status === '2') return t('task.statusInProgress')
  if (task.status === '-1') return t('task.statusCancelled')
  return t('task.statusPending')
}

function getTaskStatusClass(task) {
  if (task.status === '1') return 'end'
  if (task.status === '2') return 'progress'
  if (task.status === '-1') return 'cancel'
  return 'start'
}

function handleTableAction(action, task) {
  console.log('Action:', action, task)
  if (action === 'edit-task') {
    editTask(task)
  }
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

function handleTaskUpdated(updatedTask) {
  console.log('Task updated in dialog:', updatedTask)
  // Refresh the task list to show updated data
  taskStore.fetchTaskList({ todoStatus: '2', pageNum: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
}

function handleTaskDeleted(taskId) {
  console.log('Task deleted in dialog:', taskId)
  // Refresh the task list to remove deleted task
  taskStore.fetchTaskList({ todoStatus: '2', pageNum: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
}

function handleIconClick(action, task) {
  console.log('Icon click:', action, task)
  if (action === 'edit-task') {
    editTask(task)
  } else if (action === 'mark-important') {
    // Handle mark important
  } else if (action === 'delete-task') {
    // Handle delete
  } else if (action === 'set-reminder') {
    // Handle reminder
  }
}

onMounted(() => {
  console.log('MyTasks onMounted')
  taskStore.fetchTaskList({ todoStatus: '2', pageNum: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
})

watch(() => taskStore.taskList, (newList) => {
  console.log('Task list updated:', newList.length, newList)
}, { deep: true })

watch(() => taskStore.taskStatistics, (newStats) => {
  console.log('Task statistics updated:', newStats)
}, { deep: true })

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
          padding-left: 32px;
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
        padding: 12px 12px 12px 34px !important;
        line-height: 24px;
        position: relative;
        
        &.complete {
          .item-title {
            color: #aaaaaa;
            text-decoration: line-through;
          }
        }

        .task-menu-wrapper {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
        }

        .item-title {
          flex: 1;
          padding: 0 8px;
          word-break: break-all;
          font-size: 14px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;

          &:hover {
            color: $primary-color;
          }

          .flow-item-status {
             font-size: 12px;
             height: 20px;
             line-height: 18px;
             padding: 0 4px;
             border-radius: 3px;
             margin-right: 6px;
             border: 1px solid transparent;
             
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
