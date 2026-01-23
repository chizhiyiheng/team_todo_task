<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="handleClose"
    :title="null"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="task-detail-dialog"
    width="750px"
    :fullscreen="isMobile"
    top="5vh"
  >
    <!-- Custom Header -->
    <template #header>
      <TaskDetailHeader
        :task-detail="taskDetail"
        @toggle-important="toggleImportant"
        @update-field="updateField"
        @close="handleClose"
      />
    </template>

    <!-- Initial Loading State with Skeleton -->
    <div v-if="isLoading && isInitialLoad" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Content with Refresh Loading Overlay -->
    <div v-else-if="taskDetail" class="dialog-content" v-loading="isLoading" element-loading-text="加载中...">
      <!-- Basic Information Section -->
      <BasicInfoSection
        :task-detail="taskDetail"
        @update-field="updateField"
      />
      
      <!-- Executor Section -->
      <ExecutorSection
        :task-detail="taskDetail"
        :available-users="availableUsers"
        @executor-updated="handleExecutorUpdated"
      />
      
      <!-- Description Section -->
      <DescriptionSection
        :task-detail="taskDetail"
        @update-field="updateField"
      />
      
      <!-- Attachment Section -->
      <AttachmentSection
        :attachment-list="taskDetail.attachmentList || []"
      />
      
      <!-- Tabs Section: Progress, Activity Log -->
      <div class="tabs-section">
        <el-tabs v-model="activeTab">
          <el-tab-pane :label="t('task.progress')" name="progress">
            <ProgressSection
              :todo-id="taskDetail.id"
              @progress-updated="handleProgressUpdated"
            />
          </el-tab-pane>
          
          <!-- SubTasks Tab - Temporarily Disabled -->
          <!-- <el-tab-pane name="subtasks">
            <template #label>
              {{ t('task.subTasks') }}
              <span v-if="taskDetail.subTodoList && taskDetail.subTodoList.length > 0" class="tab-count">
                ({{ taskDetail.subTodoList.length }})
              </span>
            </template>
            <SubTaskSection
              :sub-task-list="taskDetail.subTodoList || []"
              @add-subtask="handleAddSubTask"
              @toggle-subtask="handleToggleSubTask"
              @open-subtask="handleOpenSubTask"
            />
          </el-tab-pane> -->
          
          <el-tab-pane :label="t('task.activityLog')" name="activity">
            <ActivityLogSection
              :todo-id="taskDetail.id"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="error-container">
      <el-empty description="加载失败，请重试" />
    </div>

    <!-- Footer Actions -->
    <template #footer v-if="taskDetail && !isLoading">
      <div class="dialog-footer">
        <!-- <el-button
          :type="taskDetail.isTop === 1 ? 'warning' : 'default'"
          :icon="taskDetail.isTop === 1 ? 'StarFilled' : 'Star'"
          @click="toggleImportant"
          plain
        >
          {{ taskDetail.isTop === 1 ? t('task.cancelImportant') : t('task.markImportant') }}
        </el-button> -->

        <el-button
          v-if="taskDetail.status !== TASK_STATUS.COMPLETED && taskDetail.status !== TASK_STATUS.CANCELLED"
          type="info"
          @click="cancelTask"
          plain
        >
          {{ t('task.cancelTask') }}
        </el-button>
        
        <el-button
          v-if="taskDetail.status === TASK_STATUS.COMPLETED"
          type="danger"
          icon="Delete"
          @click="deleteTask"
        >
          {{ t('common.delete') }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- Nested SubTask Dialog (Recursive) -->
  <TaskDetailDialog
    v-if="openedSubTaskId"
    v-model="showSubTaskDialog"
    :task-id="openedSubTaskId"
    @task-updated="handleSubTaskDialogClose"
    @task-deleted="handleSubTaskDialogClose"
  />
</template>

<script setup>
/**
 * TaskDetailDialog Component
 * 
 * A comprehensive task detail dialog that displays and manages task information.
 * This component is refactored to use composition hooks for better maintainability.
 * 
 * @component
 * @props {boolean} modelValue - Dialog visibility state (v-model)
 * @props {string} taskId - The ID of the task to display
 * 
 * @emits update:modelValue - Emitted when dialog visibility changes
 * @emits task-updated - Emitted when task is updated
 * @emits task-deleted - Emitted when task is deleted
 */

import { watch, computed, toRef, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { TASK_STATUS } from '@/constants/taskEnums'
import TaskDetailHeader from './components/TaskDetailHeader.vue'
import BasicInfoSection from './components/BasicInfoSection.vue'
import ExecutorSection from './components/ExecutorSection.vue'
import DescriptionSection from './components/DescriptionSection.vue'
import AttachmentSection from './components/AttachmentSection.vue'
import ProgressSection from './components/ProgressSection.vue'
import SubTaskSection from './components/SubTaskSection.vue'
import ActivityLogSection from './components/ActivityLogSection.vue'
import { useTaskDetail } from './hooks/useTaskDetail'
import { useTaskActions } from './hooks/useTaskActions'
import { useAvailableUsers } from './hooks/useAvailableUsers'

// Composables
const { t } = useI18n()
const userStore = useUserStore()

// Props definition
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  taskId: {
    type: String,
    required: false,
    default: ''
  }
})

// Emits definition
const emit = defineEmits(['update:modelValue', 'task-updated', 'task-deleted'])

// Convert taskId to ref for hooks
const taskIdRef = toRef(props, 'taskId')

// Use task detail hook
const { isLoading, isInitialLoad, taskDetail, loadTaskDetail } = useTaskDetail(taskIdRef, t)

// Use task actions hook
const { updateField, toggleImportant, markAsComplete, deleteTask, addSubTask, toggleSubTask, cancelTask } = useTaskActions(
  taskDetail,
  emit,
  t,
  // 传递刷新函数，包装一下以适配 useTaskActions 的调用方式 (参数可能是布尔值)
  async (isSilent) => {
    await loadTaskDetail(true, isSilent)
  }
)

// Use available users hook
const { availableUsers } = useAvailableUsers()

const isMobile = window.innerWidth <= 768

// State for nested dialog
const openedSubTaskId = ref(null)
const showSubTaskDialog = ref(false)

// State for tabs
const activeTab = ref('progress')

// Watch for dialog open
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.taskId && props.taskId.trim()) {
    loadTaskDetail() // Initial load
  }
})

// Handle dialog close
function handleClose() {
  emit('update:modelValue', false)
}

/**
 * Handle add subtask
 */
async function handleAddSubTask(content) {
  const success = await addSubTask(content)
  if (success) {
    // Reload task detail to get updated subtask list
    await loadTaskDetail(true, false) // Pass true for refresh, false for non-silent
  }
}

/**
 * Handle toggle subtask completion
 */
async function handleToggleSubTask(subTaskId, isFinished) {
  const success = await toggleSubTask(subTaskId, isFinished)
  if (success) {
    // Reload task detail to get updated subtask list
    await loadTaskDetail(true, false) // Pass true for refresh, false for non-silent
  }
}

/**
 * Handle open subtask detail (recursive)
 */
function handleOpenSubTask(subTaskId) {
  openedSubTaskId.value = subTaskId
  showSubTaskDialog.value = true
}

/**
 * Handle progress updated with attachments
 * Reload task detail to get updated attachment list
 */
async function handleProgressUpdated() {
  await loadTaskDetail(true, false) // Pass true for refresh, false for non-silent
}

/**
 * Handle executor updated (with silent refresh)
 */
async function handleExecutorUpdated(isSilent) {
  await loadTaskDetail(true, isSilent) // isSilent = true for silent refresh
}

/**
 * Handle task updated from executor section
 */
function handleTaskUpdated() {
  emit('task-updated', taskDetail.value)
}

/**
 * Handle subtask dialog close
 */
function handleSubTaskDialogClose() {
  showSubTaskDialog.value = false
  openedSubTaskId.value = null
  // Reload parent task to get updated data
  loadTaskDetail(true, false) // Pass true for refresh, false for non-silent
}
</script>

<style scoped lang="scss">
.task-detail-dialog {
  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  .loading-container {
    padding: $spacing-xxl;
    min-height: 400px;
  }

  .dialog-content {
    padding: $spacing-md;
    max-height: calc(90vh - 200px);
    overflow-y: auto;
  }

  .error-container {
    padding: $spacing-xxl;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-start;
    gap: $spacing-md;
    padding: $spacing-md $spacing-md 0;
    border-top: 1px solid $border-light;
  }

  .tabs-section {
    margin-top: $spacing-xxl;
    padding-top: $spacing-xxl;

    :deep(.el-tabs__header) {
      margin-bottom: $spacing-xl;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }

    :deep(.el-tabs__active-bar) {
      height: 2px;
    }

    :deep(.el-tabs__item) {
      font-size: $font-size-base;
      padding: 0 $spacing-xl;
      height: 40px;
      line-height: 40px;
      
      &:hover {
        color: $primary-color;
      }
    }

    :deep(.el-tabs__content) {
      padding: 0;
    }

    :deep(.el-tab-pane) {
      padding: 0;
    }

    .tab-count {
      margin-left: $spacing-xs;
      color: $text-secondary;
      font-size: $font-size-small;
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  :global(.task-detail-dialog.el-dialog) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :global(.task-detail-dialog .el-dialog__body) {
    flex: 1;
    overflow: hidden;
    padding: 0;
  }

  .task-detail-dialog {
    .dialog-content {
      padding: 16px;
      height: 100%;
      max-height: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    .dialog-footer {
      gap: 8px;
      padding: 12px 16px;
      flex-shrink: 0;
      
      .el-button {
        flex: 1;
        min-width: 0;
        padding: 8px 12px;
        font-size: 13px;
        
        // Hide button text, show only icons on mobile
        span:not(.el-icon) {
          display: none;
        }
        
        .el-icon {
          margin-right: 0;
        }
      }
    }
  }
}
</style>
