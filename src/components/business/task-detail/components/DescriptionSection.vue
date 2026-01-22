<template>
  <div class="description-section">
    <div class="section-header">
      <h3 class="section-title">{{ t('task.description') }}</h3>
    </div>
    
    <div class="section-content">
      <!-- View Mode -->
      <div
        v-if="!editingDescription"
        class="description-view"
        @click="startEditDescription"
      >
        <div v-if="taskDetail.content" class="description-text">
          {{ taskDetail.content }}
        </div>
        <div v-else class="description-placeholder">
          {{ t('task.clickToAddDescription') }}
        </div>
      </div>
      
      <!-- Edit Mode -->
      <div v-else class="description-edit">
        <el-input
          v-model="editDescriptionValue"
          type="textarea"
          :rows="6"
          :placeholder="t('task.clickToAddDescription')"
          class="description-textarea"
        />
        <div class="edit-actions">
          <el-button type="primary" size="small" @click="saveDescription">
            {{ t('common.save') }}
          </el-button>
          <el-button size="small" @click="cancelEditDescription">
            {{ t('common.cancel') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * DescriptionSection Component
 * 
 * Displays and manages task description with inline editing.
 * Manages its own editing state and validation internally.
 * 
 * @component
 * @props {Object} taskDetail - The task detail object
 * 
 * @emits update-field - Emitted when a field needs to be updated with (fieldName, value)
 */

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

// Composables
const { t } = useI18n()

// Props definition
const props = defineProps({
  taskDetail: {
    type: Object,
    required: true
  }
})

// Emits definition
const emit = defineEmits(['update-field'])

// Local editing state
const editingDescription = ref(false)
const editDescriptionValue = ref('')

/**
 * Start editing description
 */
function startEditDescription() {
  if (!props.taskDetail) return
  
  editingDescription.value = true
  editDescriptionValue.value = props.taskDetail.content || ''
}

/**
 * Save description changes
 */
function saveDescription() {
  if (!props.taskDetail) return
  
  const currentContent = props.taskDetail.content || ''
  
  // Check if changed
  if (editDescriptionValue.value === currentContent) {
    editingDescription.value = false
    return
  }
  
  // Exit editing mode immediately for better UX
  editingDescription.value = false
  
  // Update field (optimistic update handled in parent)
  emit('update-field', 'content', editDescriptionValue.value)
}

/**
 * Cancel description editing
 */
function cancelEditDescription() {
  editingDescription.value = false
}
</script>

<style scoped lang="scss">
.description-section {
  padding: 24px 0;
  border-bottom: 1px solid #e4e7ed;
  
  .section-header {
    margin-bottom: 12px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }
  
  .section-content {
    .description-view {
      min-height: 100px;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
      
      &:hover {
        border-color: #409EFF;
        background-color: #ecf5ff;
      }
      
      .description-text {
        color: #303133;
        font-size: 14px;
        line-height: 1.8;
        white-space: pre-wrap;
        word-break: break-word;
      }
      
      .description-placeholder {
        color: #a8abb2;
        font-size: 14px;
        line-height: 1.8;
        display: flex;
        align-items: center;
        gap: 8px;
        
        &::before {
          content: '✏️';
          font-size: 16px;
        }
      }
    }
    
    .description-edit {
      .description-textarea {
        margin-bottom: 12px;
        
        :deep(.el-textarea__inner) {
          font-family: inherit;
          line-height: 1.8;
          font-size: 14px;
          border-radius: 6px;
          padding: 16px;
          
          &:focus {
            border-color: #409eff;
            box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
          }
        }
      }
      
      .edit-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .description-section {
    padding: 20px 0;
    
    .section-header {
      .section-title {
        font-size: 15px;
      }
    }
    
    .section-content {
      .description-view {
        min-height: 80px;
        padding: 12px;
        
        .description-text,
        .description-placeholder {
          font-size: 13px;
        }
      }
      
      .description-edit {
        .description-textarea {
          :deep(.el-textarea__inner) {
            font-size: 13px;
            padding: 12px;
          }
        }
        
        .edit-actions {
          gap: 8px;
          
          .el-button {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
