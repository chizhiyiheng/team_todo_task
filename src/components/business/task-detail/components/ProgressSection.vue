<template>
  <div class="progress-section">
    <div class="section-header">
      <el-button
        v-if="!isEditing"
        type="primary"
        size="small"
        plain
        @click="startEdit"
      >
        {{ t('task.updateProgress') }}
      </el-button>
    </div>
    
    <div class="section-content">
      <!-- View Mode: Read-only Progress Bar -->
      <div v-if="!isEditing" class="progress-bar-container">
        <el-progress
          :percentage="taskDetail.progress || 0"
          :color="progressColor"
          :stroke-width="20"
        />
      </div>
      
      <!-- Edit Mode: Editable Progress with Slider and Note -->
      <div v-else class="progress-edit-container">
        <!-- Progress Slider -->
        <div class="progress-slider-container">
          <div class="slider-label">
            <span>{{ t('task.progress') }}</span>
            <span class="progress-value">{{ editProgressValue }}%</span>
          </div>
          <el-slider
            v-model="editProgressValue"
            :show-tooltip="false"
            :marks="progressMarks"
          />
        </div>
        
        <!-- Progress Note Input -->
        <div class="progress-note-container">
          <el-input
            v-model="progressNote"
            type="textarea"
            :rows="3"
            :placeholder="t('task.progressNote')"
            class="progress-textarea"
            maxlength="500"
            show-word-limit
          />
        </div>
        
        <!-- Action Buttons -->
        <div class="progress-actions">
          <el-button
            type="primary"
            size="small"
            @click="handleSubmitProgress"
            :disabled="!hasChanges"
            :loading="isSubmitting"
          >
            {{ t('common.save') }}
          </el-button>
          <el-button
            size="small"
            @click="cancelEdit"
          >
            {{ t('common.cancel') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ProgressSection Component
 * 
 * Displays and manages task progress with editable progress bar and note input.
 * 
 * @component
 * @props {Object} taskDetail - The task detail object
 * 
 * @emits submit-progress - Emitted when user submits progress update
 */

import { ref, computed } from 'vue'
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
const emit = defineEmits(['submit-progress'])

// State
const isEditing = ref(false)
const editProgressValue = ref(0)
const progressNote = ref('')
const isSubmitting = ref(false)

// Progress marks for slider
const progressMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

// Computed properties
const progressColor = computed(() => {
  const progress = isEditing.value ? editProgressValue.value : (props.taskDetail.progress || 0)
  if (progress < 30) return '#F56C6C'
  if (progress < 70) return '#E6A23C'
  return '#67C23A'
})

const hasChanges = computed(() => {
  return editProgressValue.value !== (props.taskDetail.progress || 0) || progressNote.value.trim() !== ''
})

// Methods
function startEdit() {
  isEditing.value = true
  editProgressValue.value = props.taskDetail.progress || 0
  progressNote.value = ''
}

function cancelEdit() {
  isEditing.value = false
  editProgressValue.value = 0
  progressNote.value = ''
}

async function handleSubmitProgress() {
  if (!hasChanges.value) return
  
  isSubmitting.value = true
  try {
    await emit('submit-progress', {
      progress: editProgressValue.value,
      note: progressNote.value.trim()
    })
    // Reset edit state after successful submission
    isEditing.value = false
    editProgressValue.value = 0
    progressNote.value = ''
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.progress-section {
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;
  }
  
  .section-content {
    .progress-bar-container {
      padding: 16px;
      background-color: #F5F7FA;
      border-radius: 4px;
    }
    
    .progress-edit-container {
      padding: 16px;
      background-color: #F5F7FA;
      border-radius: 4px;
      
      .progress-slider-container {
        margin-bottom: 20px;
        
        .slider-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
          color: #606266;
          
          .progress-value {
            font-size: 18px;
            font-weight: 600;
            color: #409EFF;
          }
        }
      }
      
      .progress-note-container {
        margin-bottom: 12px;
        
        .progress-textarea {
          :deep(.el-textarea__inner) {
            font-family: inherit;
            line-height: 1.6;
            background-color: #fff;
          }
        }
      }
      
      .progress-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .progress-section {
    .section-content {
      .progress-bar-container {
        padding: 12px;
      }
      
      .progress-edit-container {
        padding: 12px;
        
        .progress-actions {
          flex-direction: column;
          
          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
