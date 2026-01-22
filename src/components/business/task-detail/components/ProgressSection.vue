<template>
  <div class="progress-section" v-loading="isLoading">
    <div class="section-content">
      <!-- View Mode: Read-only Progress Bar -->
      <div v-if="!isEditing" class="progress-display">
        <div class="progress-info">
          <div class="progress-label">{{ t('task.progress') }}</div>
          <div class="progress-percentage">{{ currentProgress }}%</div>
        </div>
        <div class="progress-bar-wrapper">
          <el-progress
            :percentage="currentProgress"
            :color="progressColor"
            :stroke-width="12"
            :show-text="false"
          />
        </div>
        <el-button
          type="primary"
          size="small"
          text
          @click="startEdit"
          class="update-btn"
        >
          <el-icon><Edit /></el-icon>
          {{ t('task.updateProgress') }}
        </el-button>
      </div>
      
      <!-- Edit Mode: Editable Progress with Slider, Note and Attachments -->
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
  </div>
</template>

<script setup>
/**
 * ProgressSection Component
 * 
 * Displays and manages task progress with editable progress bar, note input, and file attachments.
 * This component is fully independent and manages its own progress data.
 * 
 * @component
 * @props {String} todoId - The task ID
 * @emits progress-updated - Emitted when progress is successfully updated with attachments
 */

import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Paperclip, Upload, Edit } from '@element-plus/icons-vue'
import { todoApi } from '@/api'

// Composables
const { t } = useI18n()

// Props definition
const props = defineProps({
  todoId: {
    type: String,
    required: true
  }
})

// Emits definition
const emit = defineEmits(['progress-updated'])

// State
const isLoading = ref(false)
const progressData = ref(null)
const isEditing = ref(false)
const editProgressValue = ref(0)
const progressNote = ref('')
const isSubmitting = ref(false)
const fileList = ref([])
const uploadedFiles = ref([]) // 存储已上传成功的文件信息（包含fileId）
const uploadRef = ref(null)

// Progress marks for slider
const progressMarks = {
  0: '0%',
  25: '25%',
  50: '50%',
  75: '75%',
  100: '100%'
}

// Computed properties
const currentProgress = computed(() => {
  return progressData.value?.progressPercent || 0
})

const progressColor = computed(() => {
  const progress = isEditing.value ? editProgressValue.value : currentProgress.value
  if (progress < 30) return '#F56C6C'
  if (progress < 70) return '#E6A23C'
  return '#67C23A'
})

const hasChanges = computed(() => {
  return editProgressValue.value !== currentProgress.value || 
         progressNote.value.trim() !== '' ||
         uploadedFiles.value.length > 0
})

// Watch todoId changes to reload progress data
watch(() => props.todoId, (newId) => {
  if (newId) {
    loadProgressDetail()
  }
}, { immediate: true })

// Methods
/**
 * Load progress detail from API
 */
async function loadProgressDetail() {
  if (!props.todoId) return
  
  isLoading.value = true
  try {
    // TODO: 待后端接口联调，确认返回数据结构
    const response = await todoApi.getProgressDetail(props.todoId)
    
    if (response.code === '200') {
      progressData.value = response.data
    } else {
      ElMessage.error(response.message || t('task.operationFailed'))
    }
  } catch (error) {
    console.error('Load progress detail failed:', error)
    ElMessage.error(t('task.operationFailed'))
  } finally {
    isLoading.value = false
  }
}

function startEdit() {
  isEditing.value = true
  editProgressValue.value = currentProgress.value
  progressNote.value = ''
  fileList.value = []
  uploadedFiles.value = []
}

function cancelEdit() {
  // 取消编辑时，删除已上传的文件
  if (uploadedFiles.value.length > 0) {
    uploadedFiles.value.forEach(file => {
      if (file.fileId) {
        deleteUploadedFile(file.fileId)
      }
    })
  }
  
  isEditing.value = false
  editProgressValue.value = 0
  progressNote.value = ''
  fileList.value = []
  uploadedFiles.value = []
}

/**
 * Handle file selection change - 立即上传到第三方系统
 */
async function handleFileChange(file, files) {
  // 检查是否是新增的文件
  const existingFile = fileList.value.find(f => f.uid === file.uid)
  
  if (!existingFile && file.raw) {
    // 立即上传文件到第三方系统
    try {
      // 设置为上传中状态（但不显示进度条）
      file.status = 'uploading'
      file.percentage = 0
      
      const response = await todoApi.uploadFile(file.raw)
      
      if (response.code === '200') {
        // 上传成功，设置为 success 状态
        file.status = 'success'
        file.percentage = 100
        
        // 保存上传成功的文件信息
        uploadedFiles.value.push({
          uid: file.uid,
          fileId: response.data.fileId,
          fileName: response.data.fileName,
          fileSize: response.data.fileSize,
          fileType: response.data.fileType,
          filePath: response.data.filePath,
          uploadTime: response.data.uploadTime
        })
        
        // 上传成功不显示提示
      } else {
        // 上传失败
        file.status = 'fail'
        ElMessage.error({
          message: `${file.name} 上传失败: ${response.message || '未知错误'}`,
          duration: 5000
        })
        
        // 从列表中移除失败的文件
        const index = files.findIndex(f => f.uid === file.uid)
        if (index > -1) {
          files.splice(index, 1)
        }
        fileList.value = files
        return
      }
    } catch (error) {
      console.error('File upload failed:', error)
      file.status = 'fail'
      ElMessage.error({
        message: `${file.name} 上传失败: ${error.message || '网络错误'}`,
        duration: 5000
      })
      
      // 从列表中移除失败的文件
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

/**
 * Handle file removal - 调用删除接口
 * before-remove 返回 false 可以阻止删除，返回 true 或 Promise.resolve() 允许删除
 */
async function handleBeforeRemove(file) {
  // 查找对应的已上传文件信息
  const uploadedFile = uploadedFiles.value.find(f => f.uid === file.uid)
  
  if (uploadedFile && uploadedFile.fileId) {
    try {
      const response = await todoApi.deleteFile(uploadedFile.fileId)
      
      if (response.code === '200') {
        // 删除成功，从已上传列表中移除
        const index = uploadedFiles.value.findIndex(f => f.uid === file.uid)
        if (index > -1) {
          uploadedFiles.value.splice(index, 1)
        }
        
        ElMessage.success('文件已删除')
        return true // 允许从列表中移除
      } else {
        // 删除失败，阻止移除
        ElMessage.error(response.message || '删除文件失败')
        return false // 阻止从列表中移除
      }
    } catch (error) {
      console.error('Delete file failed:', error)
      ElMessage.error('删除文件失败')
      return false // 阻止从列表中移除
    }
  } else {
    // 如果没有 fileId（可能是上传失败的文件），直接允许移除
    return true
  }
}

/**
 * Handle file upload limit exceeded
 */
function handleExceed() {
  ElMessage.warning(t('task.uploadLimitExceeded'))
}

/**
 * 删除已上传的文件（内部方法，不显示提示）
 */
async function deleteUploadedFile(fileId) {
  try {
    await todoApi.deleteFile(fileId)
  } catch (error) {
    console.error('Delete uploaded file failed:', error)
  }
}

/**
 * Submit progress update with attachments
 */
async function handleSubmitProgress() {
  if (!hasChanges.value) return
  
  isSubmitting.value = true
  const hasAttachments = uploadedFiles.value.length > 0
  
  try {
    // 使用已上传成功的文件信息
    const attachmentList = uploadedFiles.value.map(file => ({
      fileId: file.fileId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileType: file.fileType,
      filePath: file.filePath,
      uploadTime: file.uploadTime
    }))
    
    // Prepare request data
    const requestData = {
      todoId: props.todoId,
      progressPercent: editProgressValue.value,
      progressDesc: progressNote.value.trim() || undefined,
      attachmentList: attachmentList.length > 0 ? attachmentList : undefined
    }
    
    // Call API
    await todoApi.submitProgress(requestData)
    
    ElMessage.success(t('task.progressUpdateSuccess'))
    
    // Reset edit state
    isEditing.value = false
    editProgressValue.value = 0
    progressNote.value = ''
    fileList.value = []
    uploadedFiles.value = []
    
    // Reload progress detail
    await loadProgressDetail()
    
    // 如果有附件上传，通知父组件刷新任务详情（获取新的附件列表）
    if (hasAttachments) {
      emit('progress-updated')
    }
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
    .progress-display {
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      
      .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        .progress-label {
          font-size: 14px;
          font-weight: 500;
          color: #606266;
        }
        
        .progress-percentage {
          font-size: 24px;
          font-weight: 600;
          color: #409EFF;
          font-family: 'Helvetica Neue', Arial, sans-serif;
        }
      }
      
      .progress-bar-wrapper {
        margin-bottom: 16px;
        
        :deep(.el-progress__bar) {
          border-radius: 6px;
        }
        
        :deep(.el-progress-bar__outer) {
          background-color: #e4e7ed;
          border-radius: 6px;
        }
        
        :deep(.el-progress-bar__inner) {
          border-radius: 6px;
          transition: all 0.4s ease;
        }
      }
      
      .update-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        padding: 4px 8px;
        
        .el-icon {
          font-size: 14px;
        }
        
        &:hover {
          background-color: rgba(64, 158, 255, 0.1);
        }
      }
    }
    
    .progress-edit-container {
      padding: 24px;
      background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      
      .progress-slider-container {
        margin-bottom: 24px;
        
        .slider-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          
          span:first-child {
            font-size: 15px;
            color: #606266;
            font-weight: 500;
          }
          
          .progress-value {
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            letter-spacing: -1px;
          }
        }
        
        :deep(.el-slider__runway) {
          height: 10px;
          border-radius: 5px;
          background: linear-gradient(90deg, #e4e7ed 0%, #f0f2f5 100%);
        }
        
        :deep(.el-slider__bar) {
          height: 10px;
          border-radius: 5px;
          background: linear-gradient(90deg, #409EFF 0%, #66b1ff 100%);
          box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
        }
        
        :deep(.el-slider__button) {
          width: 20px;
          height: 20px;
          border: 3px solid #409EFF;
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
          transition: all 0.3s ease;
          
          &:hover {
            transform: scale(1.1);
          }
        }
        
        :deep(.el-slider__marks-text) {
          font-size: 12px;
          color: #909399;
        }
      }
      
      .progress-note-container {
        margin-bottom: 20px;
        
        .progress-textarea {
          :deep(.el-textarea__inner) {
            font-family: inherit;
            line-height: 1.6;
            background-color: #fff;
            border-radius: 8px;
            border: 1px solid #e4e7ed;
            padding: 12px;
            transition: all 0.3s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            
            &:hover {
              border-color: #c0c4cc;
            }
            
            &:focus {
              background-color: #fff;
              border-color: #409EFF;
              box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
            }
          }
        }
      }
      
      .progress-upload-container {
        margin-bottom: 20px;
        padding: 16px;
        background-color: #fff;
        border-radius: 8px;
        border: 1px solid #e4e7ed;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        transition: all 0.3s ease;
        
        &:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }
        
        .upload-label {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          font-size: 14px;
          color: #303133;
          font-weight: 500;
          
          .el-icon {
            font-size: 16px;
            color: #409EFF;
          }
        }
        
        .progress-upload {
          :deep(.el-upload) {
            width: 100%;
          }
          
          :deep(.el-upload-dragger) {
            width: 100%;
            height: auto;
            padding: 24px;
            border: 2px dashed #d9d9d9;
            border-radius: 8px;
            background-color: #fafafa;
            transition: all 0.3s ease;
            
            &:hover {
              border-color: #409EFF;
              background-color: #f0f7ff;
            }
          }
          
          .upload-dragger-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            
            .upload-icon {
              font-size: 48px;
              color: #c0c4cc;
              transition: all 0.3s ease;
            }
            
            .upload-text {
              font-size: 14px;
              color: #606266;
              font-weight: 500;
            }
            
            .upload-hint {
              font-size: 12px;
              color: #909399;
            }
          }
          
          :deep(.el-upload-dragger:hover) {
            .upload-icon {
              color: #409EFF;
              transform: scale(1.1);
            }
          }
          
          :deep(.el-upload-list) {
            margin-top: 12px;
          }
          
          :deep(.el-upload-list__item) {
            border-radius: 6px;
            background-color: #f5f7fa;
            border: 1px solid #e4e7ed;
            transition: all 0.3s ease;
            
            &:hover {
              background-color: #ecf5ff;
              border-color: #b3d8ff;
            }
            
            // 隐藏成功状态图标
            .el-upload-list__item-status-label {
              display: none !important;
            }
            
            // 隐藏文件图标（可选，如果你想保留文件图标就删除这段）
            .el-icon--document {
              color: #909399;
            }
          }
          
          // 强制隐藏所有进度条相关元素
          :deep(.el-progress),
          :deep(.el-upload-list__item-progress) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
          }
        }
      }
      
      .progress-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 12px;
        border-top: 1px solid #e4e7ed;
        
        .el-button {
          min-width: 80px;
          border-radius: 6px;
        }
      }
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .progress-section {
    .section-content {
      .progress-display {
        padding: 12px;
        border-radius: 6px;
        
        .progress-info {
          margin-bottom: 12px;
          
          .progress-label {
            font-size: 13px;
          }
          
          .progress-percentage {
            font-size: 18px;
          }
        }
        
        .progress-bar-wrapper {
          margin-bottom: 12px;
          
          :deep(.el-progress__text) {
            font-size: 12px;
          }
        }
        
        .update-btn {
          font-size: 12px;
          padding: 3px 6px;
          
          .el-icon {
            font-size: 12px;
          }
        }
      }
      
      .progress-edit-container {
        padding: 12px;
        border-radius: 6px;
        
        .progress-slider-container {
          margin-bottom: 16px;
          
          .slider-label {
            margin-bottom: 12px;
            
            span:first-child {
              font-size: 13px;
            }
            
            .progress-value {
              font-size: 24px;
            }
          }
          
          :deep(.el-slider__runway) {
            height: 8px;
          }
          
          :deep(.el-slider__bar) {
            height: 8px;
          }
          
          :deep(.el-slider__button) {
            width: 18px;
            height: 18px;
            border-width: 2px;
          }
          
          :deep(.el-slider__marks-text) {
            font-size: 11px;
          }
        }
        
        .progress-note-container {
          margin-bottom: 16px;
          
          .progress-textarea {
            :deep(.el-textarea__inner) {
              font-size: 13px;
              padding: 10px;
              min-height: 80px;
            }
          }
        }
        
        .progress-upload-container {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: 6px;
          
          .upload-label {
            margin-bottom: 10px;
            font-size: 13px;
            
            .el-icon {
              font-size: 14px;
            }
          }
          
          .progress-upload {
            :deep(.el-upload-dragger) {
              padding: 16px;
              border-radius: 6px;
            }
            
            .upload-dragger-content {
              gap: 6px;
              
              .upload-icon {
                font-size: 36px;
              }
              
              .upload-text {
                font-size: 13px;
              }
              
              .upload-hint {
                font-size: 11px;
              }
            }
            
            :deep(.el-upload-list__item) {
              border-radius: 4px;
              padding: 8px;
              margin-bottom: 8px;
              
              .el-upload-list__item-name {
                font-size: 12px;
              }
            }
          }
        }
        
        .progress-actions {
          gap: 10px;
          padding-top: 12px;
          
          .el-button {
            flex: 1;
            font-size: 14px;
            padding: 10px 16px;
            height: 40px;
            border-radius: 6px;
            font-weight: 500;
            transition: all 0.3s ease;
            
            &:active {
              transform: scale(0.98);
            }
          }
        }
      }
    }
  }
}
</style>
