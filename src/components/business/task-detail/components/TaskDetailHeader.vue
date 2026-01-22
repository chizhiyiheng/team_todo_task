<template>
  <div class="dialog-header">
    <!-- Important Star Icon -->
    <el-icon
      class="important-icon"
      :class="{ 'is-important': taskDetail?.isTop === 1 }"
      @click="$emit('toggle-important')"
      :title="taskDetail?.isTop === 1 ? t('task.cancelImportant') : t('task.markImportant')"
    >
      <StarFilled v-if="taskDetail?.isTop === 1" />
      <Star v-else />
    </el-icon>

    <!-- Title (Editable) -->
    <div class="title-section" v-if="!editingTitle">
      <h3 class="task-title" @click="startEditTitle">
        {{ taskDetail?.title || '' }}
        <el-icon class="edit-icon"><Edit /></el-icon>
      </h3>
    </div>

    <!-- Title Editing Mode -->
    <div class="title-editing" v-else>
      <el-input
        ref="titleInputRef"
        v-model="editTitleValue"
        @blur="saveTitle"
        @keyup.enter="saveTitle"
        @keydown.esc="handleEscKey"
        placeholder="请输入任务标题"
        class="title-input"
      />
    </div>

    <!-- Close Button -->
    <el-icon class="close-icon" @click="$emit('close')">
      <Close />
    </el-icon>
  </div>
</template>

<script setup>
/**
 * TaskDetailHeader Component
 * 
 * Header section of the task detail dialog with title editing and important marking.
 * Manages its own editing state and validation internally.
 * 
 * @component
 * @props {Object} taskDetail - The task detail object
 * 
 * @emits toggle-important - Emitted when important icon is clicked
 * @emits update-field - Emitted when a field needs to be updated with (fieldName, value)
 * @emits close - Emitted when close button is clicked
 */

import { ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { StarFilled, Star, Edit, Close } from '@element-plus/icons-vue'

const { t } = useI18n()

const props = defineProps({
  taskDetail: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'toggle-important',
  'update-field',
  'close'
])

// Local editing state
const editingTitle = ref(false)
const editTitleValue = ref('')
const titleInputRef = ref(null)

/**
 * Start editing title
 */
function startEditTitle() {
  if (!props.taskDetail) return
  
  editingTitle.value = true
  editTitleValue.value = props.taskDetail.title
  
  nextTick(() => {
    // Element Plus input ref needs to access the input element
    const inputEl = titleInputRef.value?.input || titleInputRef.value?.$el?.querySelector('input')
    if (inputEl) {
      inputEl.focus()
    }
  })
}

/**
 * Save title changes
 */
async function saveTitle() {
  if (!props.taskDetail) return
  
  const trimmedValue = editTitleValue.value.trim()
  
  // Validate
  if (trimmedValue === '') {
    ElMessage.warning(t('task.titleCannotBeEmpty'))
    editTitleValue.value = props.taskDetail.title
    editingTitle.value = false
    return
  }
  
  // Check if changed
  if (trimmedValue === props.taskDetail.title) {
    editingTitle.value = false
    return
  }
  
  // Exit editing mode immediately for better UX
  editingTitle.value = false
  
  // Update field (optimistic update handled in parent)
  emit('update-field', 'title', trimmedValue)
}

/**
 * Handle ESC key press
 */
function handleEscKey(event) {
  event.preventDefault()
  event.stopPropagation()
  cancelEditTitle()
}

/**
 * Cancel title editing
 */
function cancelEditTitle() {
  editTitleValue.value = props.taskDetail.title
  editingTitle.value = false
}
</script>

<style scoped lang="scss">
.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;

  .important-icon {
    font-size: 24px;
    color: #c0c4cc;
    cursor: pointer;
    transition: all 0.3s;
    flex-shrink: 0;

    &:hover {
      color: #f56c6c;
      transform: scale(1.1);
    }

    &.is-important {
      color: #f56c6c;
    }
  }

  .title-section {
    flex: 1;
    min-width: 0;

    .task-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      word-break: break-word;
      line-height: 32px;
      min-height: 32px;

      .edit-icon {
        font-size: 16px;
        color: #909399;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .edit-icon {
        opacity: 1;
      }
    }
  }

  .title-editing {
    flex: 1;
    display: flex;
    align-items: center;

    .title-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        padding: 0 11px;
        box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
      }

      :deep(.el-input__inner) {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        line-height: 32px;
        height: 32px;
        padding: 0;
      }
    }
  }

  .close-icon {
    font-size: 20px;
    color: #909399;
    cursor: pointer;
    transition: all 0.3s;
    flex-shrink: 0;

    &:hover {
      color: #606266;
      transform: scale(1.1);
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .dialog-header {
    padding: 16px;

    .task-title {
      font-size: 16px;
      line-height: 28px;
      min-height: 28px;
    }

    .important-icon {
      font-size: 20px;
    }

    .title-editing {
      .title-input {
        :deep(.el-input__inner) {
          font-size: 16px;
          line-height: 28px;
          height: 28px;
        }
      }
    }
  }
}
</style>
