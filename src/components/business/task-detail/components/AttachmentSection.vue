<template>
  <div class="attachment-section">
    <h4 class="section-title">
      <el-icon><Paperclip /></el-icon>
      {{ t('task.attachment') }}
      <span v-if="attachmentList.length > 0" class="count">({{ attachmentList.length }})</span>
    </h4>
    
    <div class="section-content">
      <!-- Attachment Grid -->
      <el-row v-if="attachmentList.length > 0" :gutter="12" class="attachment-grid">
        <el-col
          v-for="(attachment, index) in attachmentList"
          :key="index"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <div class="attachment-item">
            <div class="attachment-icon">
              <el-icon :size="20">
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
                :icon="Download"
                size="small"
                circle
                @click="downloadAttachment(attachment)"
                :title="t('task.download')"
              />
            </div>
          </div>
        </el-col>
      </el-row>
      
      <!-- Empty State -->
      <div v-else class="empty-state">
        <el-empty :description="t('task.noAttachments')" :image-size="60" />
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
  padding: 16px 0;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    
    .count {
      font-size: 13px;
      font-weight: 400;
      color: $text-secondary;
    }
  }
  
  .section-content {
    .attachment-grid {
      .attachment-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        background-color: $bg-page;
        border-radius: 6px;
        border: 1px solid transparent;
        transition: all 0.2s ease;
        height: 100%;
        
        &:hover {
          background-color: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary-light-7);
          
          .attachment-actions {
            opacity: 1;
          }
        }
        
        .attachment-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background-color: $bg-white;
          border-radius: 4px;
          color: $primary-color;
        }
        
        .attachment-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
          
          .attachment-name {
            font-size: 13px;
            font-weight: 500;
            color: $text-primary;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .attachment-size {
            font-size: 11px;
            color: $text-secondary;
          }
        }
        
        .attachment-actions {
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
      }
    }
    
    .empty-state {
      padding: 8px 0;
      text-align: center;
      :deep(.el-empty) {
        padding: 8px;
      }
      :deep(.el-empty__description) {
        margin-top: 8px;
      }
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .attachment-section {
    padding: 12px 0;
    
    .section-title {
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .section-content {
      .attachment-grid {
        .attachment-item {
          padding: 6px 10px;
          
          .attachment-icon {
            width: 28px;
            height: 28px;
            
            .el-icon {
              font-size: 18px;
            }
          }
          
          .attachment-info {
            .attachment-name {
              font-size: 12px;
            }
            
            .attachment-size {
              font-size: 10px;
            }
          }
          
          .attachment-actions {
            opacity: 1; // Always show on mobile
          }
        }
      }
      
      .empty-state {
        padding: 6px 0;
      }
    }
  }
}
</style>
