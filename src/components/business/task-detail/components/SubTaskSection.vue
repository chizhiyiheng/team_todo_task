<template>
  <div class="section subtask-section">
    <div class="section-content">
      <!-- Sub Task List -->
      <div v-if="subTaskList.length > 0" class="subtask-list">
        <div
          v-for="subTask in subTaskList"
          :key="subTask.id"
          class="subtask-item"
          @click="handleSubTaskClick(subTask)"
        >
          <el-checkbox
            :model-value="subTask.isFinished"
            @change="handleSubTaskToggle(subTask, $event)"
            @click.stop
            class="subtask-checkbox"
          />
          <span
            class="subtask-content"
            :class="{ 'is-finished': subTask.isFinished }"
          >
            {{ subTask.content || subTask.title }}
          </span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <el-empty :description="t('task.noSubTasks')" :image-size="80" />
      </div>

      <!-- Add Sub Task -->
      <div class="add-subtask">
        <el-input
          v-if="showAddInput"
          v-model="newSubTaskContent"
          :placeholder="t('task.addSubTask')"
          @keyup.enter="handleAddSubTask"
          @blur="handleCancelAdd"
          ref="addInputRef"
          class="add-input"
        >
          <template #suffix>
            <div class="input-actions">
              <el-icon @click="handleAddSubTask" class="action-icon confirm">
                <Check />
              </el-icon>
              <el-icon @click="handleCancelAdd" class="action-icon cancel">
                <Close />
              </el-icon>
            </div>
          </template>
        </el-input>
        <el-button
          v-else
          type="primary"
          :icon="Plus"
          @click="showAddInputField"
          class="add-button"
          plain
        >
          {{ t('task.addSubTask') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * SubTaskSection Component
 * 
 * Displays and manages subtasks for a task.
 * Features:
 * - Display subtask list with checkboxes
 * - Add new subtasks
 * - Click subtask to open detail dialog (recursive)
 * - Empty state display
 * 
 * @component
 */

import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { List, Plus, Check, Close } from '@element-plus/icons-vue'

// Composables
const { t } = useI18n()

// Props
const props = defineProps({
  subTaskList: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['add-subtask', 'toggle-subtask', 'open-subtask'])

// Refs
const showAddInput = ref(false)
const newSubTaskContent = ref('')
const addInputRef = ref(null)

/**
 * Show add input field and focus
 */
function showAddInputField() {
  showAddInput.value = true
  nextTick(() => {
    addInputRef.value?.focus()
  })
}

/**
 * Handle add subtask
 */
function handleAddSubTask() {
  const content = newSubTaskContent.value.trim()
  if (!content) {
    handleCancelAdd()
    return
  }

  emit('add-subtask', content)
  newSubTaskContent.value = ''
  showAddInput.value = false
}

/**
 * Handle cancel add
 */
function handleCancelAdd() {
  newSubTaskContent.value = ''
  showAddInput.value = false
}

/**
 * Handle subtask checkbox toggle
 */
function handleSubTaskToggle(subTask, value) {
  emit('toggle-subtask', subTask.id, value)
}

/**
 * Handle subtask click to open detail
 */
function handleSubTaskClick(subTask) {
  emit('open-subtask', subTask.id)
}
</script>

<style scoped lang="scss">
.subtask-section {
  .section-content {
    .subtask-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;

      .subtask-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background-color: #f5f7fa;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background-color: #e8eaed;
        }

        .subtask-checkbox {
          flex-shrink: 0;
        }

        .subtask-content {
          flex: 1;
          font-size: 14px;
          color: #303133;
          line-height: 1.5;
          word-break: break-word;

          &.is-finished {
            color: #909399;
            text-decoration: line-through;
          }
        }
      }
    }

    .empty-state {
      padding: 20px 0;
      text-align: center;
    }

    .add-subtask {
      margin-top: 16px;

      .add-input {
        .input-actions {
          display: flex;
          gap: 8px;
          align-items: center;

          .action-icon {
            cursor: pointer;
            font-size: 16px;
            transition: color 0.2s;

            &.confirm {
              color: #67c23a;

              &:hover {
                color: #85ce61;
              }
            }

            &.cancel {
              color: #f56c6c;

              &:hover {
                color: #f78989;
              }
            }
          }
        }
      }

      .add-button {
        width: 100%;
      }
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .subtask-section {
    .section-content {
      .subtask-list {
        .subtask-item {
          padding: 10px;

          .subtask-content {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>
