<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="handleClose"
    :title="null"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="task-detail-dialog"
    width="800px"
    :fullscreen="isMobile"
    top="5vh"
  >
    <!-- Custom Header -->
    <template #header>
      <TaskDetailHeader
        :task-detail="taskDetail"
        :editing-title="editingTitle"
        :edit-title-value="editTitleValue"
        @toggle-important="toggleImportant"
        @start-edit-title="startEditTitle"
        @save-title="saveTitle"
        @cancel-edit-title="cancelEditTitle"
        @close="handleClose"
        @update:edit-title-value="editTitleValue = $event"
      />
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container" v-loading="true" element-loading-text="加载中...">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- Content -->
    <div v-else-if="taskDetail" class="dialog-content">
      <!-- Basic Information Section -->
      <BasicInfoSection
        :task-detail="taskDetail"
        :available-users="availableUsers"
        @update-field="updateField"
      />
      
      <!-- Description Section -->
      <DescriptionSection
        :task-detail="taskDetail"
        :editing-description="editingDescription"
        :edit-description-value="editDescriptionValue"
        @start-edit-description="startEditDescription"
        @save-description="saveDescription"
        @cancel-edit-description="cancelEditDescription"
        @update:edit-description-value="editDescriptionValue = $event"
      />
      
      <!-- Attachment Section -->
      <AttachmentSection
        :attachment-list="taskDetail.attachmentList || []"
      />
      
      <!-- Tabs Section: Progress, SubTasks, Activity Log -->
      <div class="tabs-section">
        <el-tabs v-model="activeTab">
          <el-tab-pane :label="t('task.progress')" name="progress">
            <ProgressSection
              :task-detail="taskDetail"
              @submit-progress="submitProgress"
            />
          </el-tab-pane>
          
          <el-tab-pane name="subtasks">
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
          </el-tab-pane>
          
          <el-tab-pane name="activity">
            <template #label>
              {{ t('task.activityLog') }}
              <span v-if="taskDetail.activityLogList && taskDetail.activityLogList.length > 0" class="tab-count">
                ({{ taskDetail.activityLogList.length }})
              </span>
            </template>
            <ActivityLogSection
              :activity-log-list="taskDetail.activityLogList || []"
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
        <el-button
          :type="taskDetail.isTop === 1 ? 'warning' : 'default'"
          :icon="taskDetail.isTop === 1 ? 'StarFilled' : 'Star'"
          @click="toggleImportant"
        >
          {{ taskDetail.isTop === 1 ? t('task.cancelImportant') : t('task.markImportant') }}
        </el-button>
        
        <el-button
          type="success"
          icon="CircleCheck"
          @click="markAsComplete"
          :disabled="taskDetail.status === 1"
        >
          {{ t('task.markComplete') }}
        </el-button>
        
        <el-button
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
import TaskDetailHeader from './components/TaskDetailHeader.vue'
import BasicInfoSection from './components/BasicInfoSection.vue'
import DescriptionSection from './components/DescriptionSection.vue'
import AttachmentSection from './components/AttachmentSection.vue'
import ProgressSection from './components/ProgressSection.vue'
import SubTaskSection from './components/SubTaskSection.vue'
import ActivityLogSection from './components/ActivityLogSection.vue'
import { useTaskDetail } from './hooks/useTaskDetail'
import { useTaskEdit } from './hooks/useTaskEdit'
import { useTaskActions } from './hooks/useTaskActions'
import { useAvailableUsers } from './hooks/useAvailableUsers'

// Composables
const { t } = useI18n()

// Props definition
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  taskId: {
    type: String,
    required: true
  }
})

// Emits definition
const emit = defineEmits(['update:modelValue', 'task-updated', 'task-deleted'])

// Convert taskId to ref for hooks
const taskIdRef = toRef(props, 'taskId')

// Use task detail hook
const { isLoading, taskDetail, loadTaskDetail } = useTaskDetail(taskIdRef, t)

// Use task actions hook
const { updateField, toggleImportant, markAsComplete, deleteTask, submitProgress, addSubTask, toggleSubTask } = useTaskActions(
  taskDetail,
  emit,
  t
)

// Use available users hook
const { availableUsers } = useAvailableUsers()

// Use task edit hook
const {
  editingTitle,
  editTitleValue,
  titleInputRef,
  startEditTitle,
  saveTitle,
  cancelEditTitle,
  editingDescription,
  editDescriptionValue,
  startEditDescription,
  saveDescription,
  cancelEditDescription
} = useTaskEdit(taskDetail, updateField, t)

// Computed properties
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

// State for nested dialog
const openedSubTaskId = ref(null)
const showSubTaskDialog = ref(false)

// State for tabs
const activeTab = ref('progress')

// Watch for dialog open
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.taskId) {
    loadTaskDetail()
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
    await loadTaskDetail()
  }
}

/**
 * Handle toggle subtask completion
 */
async function handleToggleSubTask(subTaskId, isFinished) {
  const success = await toggleSubTask(subTaskId, isFinished)
  if (success) {
    // Reload task detail to get updated subtask list
    await loadTaskDetail()
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
 * Handle subtask dialog close
 */
function handleSubTaskDialogClose() {
  showSubTaskDialog.value = false
  openedSubTaskId.value = null
  // Reload parent task to get updated data
  loadTaskDetail()
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
    padding: 24px;
    min-height: 400px;
  }

  .dialog-content {
    padding: 12px;
    max-height: calc(90vh - 200px);
    overflow-y: auto;
  }

  .error-container {
    padding: 24px;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-start;
    gap: 12px;
    padding: 12px 12px 0;
    border-top: 1px solid #e4e7ed;
  }

  .tabs-section {
    margin-top: 24px;
    border-top: 1px solid #e4e7ed;
    padding-top: 24px;

    :deep(.el-tabs__header) {
      margin-bottom: 20px;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }

    :deep(.el-tabs__active-bar) {
      height: 2px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
      padding: 0 20px;
      height: 40px;
      line-height: 40px;
      
      &:hover {
        color: #409eff;
      }
    }

    :deep(.el-tabs__content) {
      padding: 0;
    }

    :deep(.el-tab-pane) {
      padding: 0;
    }

    .tab-count {
      margin-left: 4px;
      color: #909399;
      font-size: 13px;
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .task-detail-dialog {
    .dialog-content {
      padding: 16px;
      max-height: calc(100vh - 120px);
    }

    .dialog-footer {
      flex-direction: column;
      padding: 12px 16px;
      
      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
