<template>
  <div class="attachment-section">
    <h4 class="section-title">
      <el-icon><Paperclip /></el-icon>
      {{ t('task.attachment') }}
      <span v-if="attachmentList.length > 0" class="count">({{ attachmentList.length }})</span>
    </h4>
    
    <div class="section-content">
      <!-- Attachment List -->
      <div v-if="attachmentList.length > 0" class="attachment-list">
        <div
          v-for="(attachment, index) in attachmentList"
          :key="index"
          class="attachment-item"
        >
          <div class="attachment-icon">
            <el-icon :size="24">
              <component :is="getFileIcon(attachment.fileType)" />
            </el-icon>
          </div>
          
          <div class="attachment-info">
            <div class="attachment-name" :title="attachment.fileName">
              {{ attachment.fileName }}
            </div>
            <div class="attachment-size">
              {{ formatFileSize(attachment.fileSize) }}
            </div>
          </div>
          
          <div class="attachment-actions">
            <el-button
              type="primary"
              link
              @click="downloadAttachment(attachment)"
            >
              <el-icon><Download /></el-icon>
              {{ t('task.download') }}
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-else class="empty-state">
        <el-empty :description="t('task.noAttachments')" :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * AttachmentSection Component
 * 
 * Displays the list of attachments for a task with download functionality.
 * Shows file name, size, type icon, and provides download action.
 * 
 * @component
 * @props {Array} attachmentList - Array of attachment objects
 * 
 * Features:
 * - File type icon mapping
 * - File size formatting (B, KB, MB, GB)
 * - Download functionality
 * - Empty state display
 */

import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  Paperclip,
  Download,
  Document,
  Picture,
  VideoCamera,
  Headset,
  FolderOpened,
  Files
} from '@element-plus/icons-vue'

// Composables
const { t } = useI18n()

// Props
const props = defineProps({
  attachmentList: {
    type: Array,
    default: () => []
  }
})

/**
 * Format file size from bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "1.5 MB")
 */
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get appropriate icon component based on file type
 * @param {string} fileType - MIME type of the file
 * @returns {Component} Vue icon component
 */
function getFileIcon(fileType) {
  if (!fileType) return Document
  
  const type = fileType.toLowerCase()
  
  // Image files
  if (type.startsWith('image/')) {
    return Picture
  }
  
  // Video files
  if (type.startsWith('video/')) {
    return VideoCamera
  }
  
  // Audio files
  if (type.startsWith('audio/')) {
    return Headset
  }
  
  // Archive files
  if (type.includes('zip') || type.includes('rar') || type.includes('7z') || 
      type.includes('tar') || type.includes('gz')) {
    return FolderOpened
  }
  
  // PDF files
  if (type.includes('pdf')) {
    return Document
  }
  
  // Office documents
  if (type.includes('word') || type.includes('excel') || type.includes('powerpoint') ||
      type.includes('document') || type.includes('sheet') || type.includes('presentation')) {
    return Files
  }
  
  // Default
  return Document
}

/**
 * Download attachment file
 * @param {Object} attachment - Attachment object with filePath and fileName
 */
function downloadAttachment(attachment) {
  if (!attachment.filePath) {
    ElMessage.warning(t('task.downloadFailed'))
    return
  }
  
  try {
    // Create a temporary link element and trigger download
    const link = document.createElement('a')
    link.href = attachment.filePath
    link.download = attachment.fileName || 'download'
    link.target = '_blank'
    
    // Append to body, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success(t('task.downloadStarted'))
  } catch (error) {
    console.error('Download failed:', error)
    ElMessage.error(t('task.downloadFailed'))
  }
}
</script>

<style scoped lang="scss">
.attachment-section {
  padding: 24px 0;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    
    .count {
      font-size: 14px;
      font-weight: 400;
      color: #909399;
    }
  }
  
  .section-content {
    .attachment-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      
      .attachment-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background-color: #f5f7fa;
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:hover {
          background-color: #ecf5ff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .attachment-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: #fff;
          border-radius: 6px;
          color: #409eff;
        }
        
        .attachment-info {
          flex: 1;
          min-width: 0;
          
          .attachment-name {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .attachment-size {
            font-size: 12px;
            color: #909399;
          }
        }
        
        .attachment-actions {
          flex-shrink: 0;
          
          .el-button {
            font-size: 14px;
          }
        }
      }
    }
    
    .empty-state {
      padding: 24px 0;
      text-align: center;
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .attachment-section {
    padding: 20px 0;
    
    .section-content {
      .attachment-list {
        .attachment-item {
          padding: 10px;
          
          .attachment-icon {
            width: 36px;
            height: 36px;
            
            .el-icon {
              font-size: 20px;
            }
          }
          
          .attachment-info {
            .attachment-name {
              font-size: 13px;
            }
            
            .attachment-size {
              font-size: 11px;
            }
          }
          
          .attachment-actions {
            .el-button {
              font-size: 13px;
            }
          }
        }
      }
    }
  }
}
</style>
