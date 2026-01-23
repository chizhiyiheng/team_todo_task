<template>
  <div class="progress-section" v-loading="isLoading">
    <div class="section-content">
      <!-- Progress List -->
      <div v-if="!isEditing" class="progress-list">
        <!-- Empty state when no progress -->
        <div v-if="progressList.length === 0" class="empty-state">
          <el-empty :description="t('task.noProgressHistory')" :image-size="60" />
        </div>
        
        <!-- Progress Cards -->
        <div
          v-for="item in progressList"
          :key="item.umId"
          class="progress-card"
        >
          <!-- Card Header: Title + Actions -->
          <div class="card-header">
            <div class="progress-title">
              {{ getProgressTitle(item) }}
            </div>
            <div class="card-actions">
              <el-button
                type="primary"
                size="small"
                text
                @click="openProgressLog(item)"
              >
                <el-icon><View /></el-icon>
                {{ t('task.viewProgressLog') }}
              </el-button>
              <!-- Update button only for current user's progress -->
              <el-button
                v-if="item.isCurrentUser"
                type="primary"
                size="small"
                text
                @click="startEdit(item)"
              >
                <el-icon><Edit /></el-icon>
                {{ t('task.updateProgress') }}
              </el-button>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="progress-bar-section">
            <div class="progress-info">
              <span class="progress-percentage">{{ item.progressPercent }}%</span>
            </div>
            <el-progress
              :percentage="item.progressPercent"
              :color="getProgressColor(item.progressPercent)"
              :stroke-width="10"
              :show-text="false"
            />
          </div>
          
          <!-- Latest Progress Description -->
          <div v-if="getLatestProgress(item)" class="latest-progress">
            <div class="progress-desc">{{ getLatestProgress(item).progressDesc }}</div>
            <div class="progress-time">{{ formatTime(getLatestProgress(item).submitTime) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Edit Mode -->
      <div v-else class="progress-edit-container">
        <div class="edit-header">
          <span class="edit-title">{{ t('task.updateProgress') }}</span>
        </div>
        
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
        
        <!-- File Upload Section -->
        <div class="progress-upload-container">
          <div class="upload-label">
            <el-icon><Paperclip /></el-icon>
            {{ t('task.attachment') }}
          </div>
          
          <el-upload
            ref="uploadRef"
            :file-list="fileList"
            :on-change="handleFileChange"
            :before-remove="handleBeforeRemove"
            :auto-upload="false"
            :show-file-list="true"
            :limit="5"
            :on-exceed="handleExceed"
            multiple
            drag
            class="progress-upload"
          >
            <div class="upload-dragger-content">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">{{ t('task.dragOrClick') }}</div>
              <div class="upload-hint">{{ t('task.uploadTip') }}</div>
            </div>
          </el-upload>
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
    
    <!-- Progress Log Dialog -->
    <ProgressLogDialog
      v-model:visible="showLogDialog"
      :progress-item="selectedProgressItem"
    />
  </div>
</template>

<script setup>
/**
 * ProgressSection Component
 * 
 * Displays progress list grouped by executor with role-based views:
 * - Assigner: sees all executors' progress
 * - Executor: sees only their own progress
 * 
 * @component
 * @props {String} todoId - The task ID
 */

import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Paperclip, Upload, Edit, View } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { todoApi } from '@/api'
import { useUpload } from '@/composables/useUpload'
import ProgressLogDialog from './ProgressLogDialog.vue'

// Composables
const { t } = useI18n()

// Props
const props = defineProps({
  todoId: {
    type: String,
    required: true
  }
})

// State
const isLoading = ref(false)
const progressData = ref(null)
const isEditing = ref(false)
const editProgressValue = ref(0)
const progressNote = ref('')
const isSubmitting = ref(false)
const fileList = ref([])
const uploadedFiles = ref([])
const uploadRef = ref(null)
const showLogDialog = ref(false)

const { upload, deleteFile } = useUpload()
const selectedProgressItem = ref(null)
const editingExecutorId = ref(null)

// Progress marks for slider
const progressMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

// Computed
const progressList = computed(() => {
  return progressData.value?.progressList || []
})

const currentEditingProgress = computed(() => {
  if (!editingExecutorId.value) return 0
  const item = progressList.value.find(p => p.umId === editingExecutorId.value)
  return item?.progressPercent || 0
})

const hasChanges = computed(() => {
  return editProgressValue.value !== currentEditingProgress.value || 
         progressNote.value.trim() !== '' ||
         uploadedFiles.value.length > 0
})

// Watch todoId changes
watch(() => props.todoId, (newId) => {
  if (newId) {
    loadProgressList()
  }
}, { immediate: true })

// Methods
async function loadProgressList() {
  if (!props.todoId) return
  
  isLoading.value = true
  try {
    const response = await todoApi.getProgressList(props.todoId)
    
    if (response.code === '200') {
      progressData.value = response.data
    } else {
      ElMessage.error(response.message || t('task.operationFailed'))
    }
  } catch (error) {
    console.error('Load progress list failed:', error)
    ElMessage.error(t('task.operationFailed'))
  } finally {
    isLoading.value = false
  }
}

function getProgressTitle(item) {
  if (item.isCurrentUser) {
    return t('task.myProgress')
  }
  return t('task.executorProgress', { name: item.name })
}

function getProgressColor(percent) {
  if (percent < 30) return 'var(--el-color-danger)'
  if (percent < 70) return 'var(--el-color-warning)'
  return 'var(--el-color-success)'
}

function getLatestProgress(item) {
  const history = item.historyList || []
  return history.length > 0 ? history[history.length - 1] : null
}

function formatTime(time) {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function openProgressLog(item) {
  selectedProgressItem.value = item
  showLogDialog.value = true
}

function startEdit(item) {
  isEditing.value = true
  editingExecutorId.value = item.umId
  editProgressValue.value = item.progressPercent
  progressNote.value = ''
  fileList.value = []
  uploadedFiles.value = []
}

function cancelEdit() {
  // Delete uploaded files when canceling
  if (uploadedFiles.value.length > 0) {
    uploadedFiles.value.forEach(file => {
      if (file.fileId) {
        deleteUploadedFile(file.fileId)
      }
    })
  }
  
  isEditing.value = false
  editingExecutorId.value = null
  editProgressValue.value = 0
  progressNote.value = ''
  fileList.value = []
  uploadedFiles.value = []
}

async function handleFileChange(file, files) {
  const existingFile = fileList.value.find(f => f.uid === file.uid)
  
  if (!existingFile && file.raw) {
    file.status = 'uploading'
    file.percentage = 0
    
    const uploadedData = await upload(file.raw)
    
    if (uploadedData) {
      file.status = 'success'
      file.percentage = 100
      
      uploadedFiles.value.push({
        uid: file.uid,
        ...uploadedData
      })
    } else {
      file.status = 'fail'
      // Error message is handled in useUpload
      
      const index = files.findIndex(f => f.uid === file.uid)
      if (index > -1) {
        files.splice(index, 1)
      }
      fileList.value = files
      return
    }
  }
  
  fileList.value = files
}

async function handleBeforeRemove(file) {
  const uploadedFile = uploadedFiles.value.find(f => f.uid === file.uid)
  
  if (uploadedFile && uploadedFile.fileId) {
    const success = await deleteFile(uploadedFile.fileId)
    
    if (success) {
      const index = uploadedFiles.value.findIndex(f => f.uid === file.uid)
      if (index > -1) {
        uploadedFiles.value.splice(index, 1)
      }
      ElMessage.success('文件已删除')
      return true
    } else {
      return false
    }
  } else {
    return true
  }
}

function handleExceed() {
  ElMessage.warning(t('task.uploadLimitExceeded'))
}

async function deleteUploadedFile(fileId) {
  await deleteFile(fileId)
}

async function handleSubmitProgress() {
  if (!hasChanges.value) return
  
  isSubmitting.value = true
  const hasAttachments = uploadedFiles.value.length > 0
  
  try {
    const attachmentList = uploadedFiles.value.map(file => ({
      fileId: file.fileId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      filePath: file.filePath,
      uploadTime: file.uploadTime
    }))
    
    const requestData = {
      todoId: props.todoId,
      executorId: editingExecutorId.value,
      progressPercent: editProgressValue.value,
      progressDesc: progressNote.value.trim() || undefined,
      attachmentList: attachmentList.length > 0 ? attachmentList : undefined
    }
    
    await todoApi.submitProgress(requestData)
    
    ElMessage.success(t('task.progressUpdateSuccess'))
    
    isEditing.value = false
    editingExecutorId.value = null
    editProgressValue.value = 0
    progressNote.value = ''
    fileList.value = []
    uploadedFiles.value = []
    
    await loadProgressList()
  } catch (error) {
    console.error('Progress update failed:', error)
    ElMessage.error(t('task.progressUpdateFailed'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.progress-section {
  .section-content {
    .progress-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .empty-state {
        padding: 16px 0;
        text-align: center;
      }
      
      .progress-card {
        padding: 16px;
        background: linear-gradient(135deg, $bg-page 0%, #fafbfc 100%);
        border-radius: 8px;
        border: 1px solid $border-light;
        transition: all 0.3s ease;
        
        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          
          .progress-title {
            font-size: 14px;
            font-weight: 600;
            color: $text-primary;
          }
          
          .card-actions {
            display: flex;
            gap: 8px;
            
            .el-button {
              padding: 4px 8px;
              font-size: 12px;
              
              .el-icon {
                margin-right: 4px;
              }
            }
          }
        }
        
        .progress-bar-section {
          .progress-info {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 6px;
            
            .progress-percentage {
              font-size: 16px;
              font-weight: 600;
              color: $primary-color;
            }
          }
          
          :deep(.el-progress__bar) {
            border-radius: 5px;
          }
          
          :deep(.el-progress-bar__outer) {
            background-color: #e4e7ed;
            border-radius: 5px;
          }
          
          :deep(.el-progress-bar__inner) {
            border-radius: 5px;
            transition: all 0.4s ease;
          }
        }
        
        .latest-progress {
          margin-top: 12px;
          padding: 10px 12px;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 6px;
          border-left: 3px solid $primary-color;
          
          .progress-desc {
            font-size: 13px;
            color: $text-regular;
            line-height: 1.5;
            margin-bottom: 4px;
          }
          
          .progress-time {
            font-size: 12px;
            color: $text-secondary;
          }
        }
      }
    }
    
    .progress-edit-container {
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
      border-radius: 8px;
      border: 1px solid $border-light;
      
      .edit-header {
        margin-bottom: 16px;
        
        .edit-title {
          font-size: 15px;
          font-weight: 600;
          color: $text-primary;
        }
      }
      
      .progress-slider-container {
        margin-bottom: 20px;
        
        .slider-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          
          span:first-child {
            font-size: 14px;
            color: $text-regular;
            font-weight: 500;
          }
          
          .progress-value {
            font-size: 24px;
            font-weight: 700;
            color: $primary-color;
          }
        }
        
        :deep(.el-slider__runway) {
          height: 8px;
          border-radius: 4px;
        }
        
        :deep(.el-slider__bar) {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg, #409EFF 0%, #66b1ff 100%);
        }
        
        :deep(.el-slider__button) {
          width: 18px;
          height: 18px;
          border: 3px solid #409EFF;
        }
      }
      
      .progress-note-container {
        margin-bottom: 16px;
        
        .progress-textarea {
          :deep(.el-textarea__inner) {
            border-radius: 6px;
            padding: 10px;
          }
        }
      }
      
      .progress-upload-container {
        margin-bottom: 16px;
        padding: 14px;
        background-color: #fff;
        border-radius: 6px;
        border: 1px solid $border-light;
        
        .upload-label {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          font-size: 14px;
          color: $text-primary;
          font-weight: 500;
          
          .el-icon {
            color: $primary-color;
          }
        }
        
        .progress-upload {
          :deep(.el-upload) {
            width: 100%;
          }
          
          :deep(.el-upload-dragger) {
            width: 100%;
            padding: 20px;
            border: 2px dashed #d9d9d9;
            border-radius: 6px;
            
            &:hover {
              border-color: $primary-color;
            }
          }
          
          .upload-dragger-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            
            .upload-icon {
              font-size: 36px;
              color: #c0c4cc;
            }
            
            .upload-text {
              font-size: 13px;
              color: $text-regular;
            }
            
            .upload-hint {
              font-size: 12px;
              color: $text-secondary;
            }
          }
          
          :deep(.el-upload-list__item) {
            border-radius: 4px;
            background-color: $bg-page;
            
            .el-upload-list__item-status-label {
              display: none !important;
            }
          }
          
          :deep(.el-progress),
          :deep(.el-upload-list__item-progress) {
            display: none !important;
          }
        }
      }
      
      .progress-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 12px;
        border-top: 1px solid $border-light;
        
        .el-button {
          min-width: 80px;
          border-radius: 6px;
        }
      }
    }
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .progress-section {
    .section-content {
      .progress-list {
        gap: 12px;
        
        .progress-card {
          padding: 12px;
          
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            
            .progress-title {
              font-size: 13px;
            }
            
            .card-actions {
              .el-button {
                font-size: 11px;
              }
            }
          }
          
          .progress-bar-section {
            .progress-info {
              .progress-percentage {
                font-size: 14px;
              }
            }
          }
          
          .latest-progress {
            padding: 8px 10px;
            
            .progress-desc {
              font-size: 12px;
            }
            
            .progress-time {
              font-size: 11px;
            }
          }
        }
      }
      
      .progress-edit-container {
        padding: 14px;
        
        .progress-slider-container {
          .slider-label {
            .progress-value {
              font-size: 20px;
            }
          }
        }
        
        .progress-actions {
          .el-button {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
