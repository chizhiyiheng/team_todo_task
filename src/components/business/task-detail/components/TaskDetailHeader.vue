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
      <h3 class="task-title" @click="$emit('start-edit-title')">
        {{ taskDetail?.title || '' }}
        <el-icon class="edit-icon"><Edit /></el-icon>
      </h3>
    </div>

    <!-- Title Editing Mode -->
    <div class="title-editing" v-else>
      <el-input
        ref="titleInputRef"
        :model-value="editTitleValue"
        @update:model-value="$emit('update:edit-title-value', $event)"
        @keyup.enter="$emit('save-title')"
        @keyup.esc="$emit('cancel-edit-title')"
        placeholder="请输入任务标题"
      />
      <el-icon class="action-icon confirm" @click="$emit('save-title')">
        <Check />
      </el-icon>
      <el-icon class="action-icon cancel" @click="$emit('cancel-edit-title')">
        <Close />
      </el-icon>
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
 * 
 * @component
 * @props {Object} taskDetail - The task detail object
 * @props {boolean} editingTitle - Whether title is being edited
 * @props {string} editTitleValue - The current value of title input
 * 
 * @emits toggle-important - Emitted when important icon is clicked
 * @emits start-edit-title - Emitted when title is clicked to start editing
 * @emits save-title - Emitted when title save is triggered
 * @emits cancel-edit-title - Emitted when title editing is cancelled
 * @emits close - Emitted when close button is clicked
 * @emits update:edit-title-value - Emitted when title input value changes
 */

import { useI18n } from 'vue-i18n'
import { StarFilled, Star, Edit, Check, Close } from '@element-plus/icons-vue'

const { t } = useI18n()

defineProps({
  taskDetail: {
    type: Object,
    default: null
  },
  editingTitle: {
    type: Boolean,
    default: false
  },
  editTitleValue: {
    type: String,
    default: ''
  }
})

defineEmits([
  'toggle-important',
  'start-edit-title',
  'save-title',
  'cancel-edit-title',
  'close',
  'update:edit-title-value'
])
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
    gap: 8px;

    .el-input {
      flex: 1;
    }

    .action-icon {
      font-size: 20px;
      cursor: pointer;
      transition: all 0.3s;

      &.confirm {
        color: #67c23a;

        &:hover {
          color: #85ce61;
          transform: scale(1.1);
        }
      }

      &.cancel {
        color: #f56c6c;

        &:hover {
          color: #f78989;
          transform: scale(1.1);
        }
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
    }

    .important-icon {
      font-size: 20px;
    }
  }
}
</style>
