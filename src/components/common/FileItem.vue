<template>
  <!-- Text-only mode: simple inline display -->
  <span v-if="textOnly" class="file-item-text" @click="handleDownload">
    <el-icon :size="12" class="file-icon-inline">
      <component :is="fileIcon" />
    </el-icon>
    <span class="file-name-text">{{ file.fileName }}</span>
  </span>
  
  <!-- Card mode: full display with icon, name, size, download -->
  <div v-else class="file-item" :class="{ 'file-item--compact': compact }">
    <div class="file-icon">
      <el-icon :size="iconSize">
        <component :is="fileIcon" />
      </el-icon>
    </div>
    
    <div class="file-info">
      <div class="file-name" :title="file.fileName">
        {{ file.fileName }}
      </div>
      <div v-if="!compact" class="file-size">
        {{ formattedFileSize }}
      </div>
    </div>
    
    <div v-if="showDownload" class="file-actions">
      <el-button
        type="primary"
        :icon="Download"
        size="small"
        circle
        @click="handleDownload"
        :title="t('task.download')"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * FileItem Component
 * 
 * 可复用的文件显示组件，支持多种显示模式：
 * - 默认模式：完整卡片，显示图标、文件名、大小、下载按钮
 * - 紧凑模式 (compact)：卡片但不显示文件大小
 * - 纯文字模式 (textOnly)：只显示图标和文件名，可点击下载
 * 
 * @component
 * @props {Object} file - 文件对象，包含 fileName, fileSize, fileType, filePath
 * @props {Boolean} showDownload - 是否显示下载按钮（卡片模式）
 * @props {Boolean} textOnly - 纯文字模式
 * @props {Boolean} compact - 紧凑模式（不显示文件大小）
 * @props {Number} iconSize - 图标大小
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  Download,
  Document,
  Picture,
  VideoCamera,
  Headset,
  FolderOpened,
  Files
} from '@element-plus/icons-vue'

const { t } = useI18n()

const props = defineProps({
  file: {
    type: Object,
    required: true
  },
  showDownload: {
    type: Boolean,
    default: true
  },
  textOnly: {
    type: Boolean,
    default: false
  },
  compact: {
    type: Boolean,
    default: false
  },
  iconSize: {
    type: Number,
    default: 20
  }
})

/**
 * Format file size from bytes to human-readable format
 */
const formattedFileSize = computed(() => {
  const bytes = props.file?.fileSize
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
})

/**
 * Get appropriate icon component based on file type
 */
const fileIcon = computed(() => {
  const fileType = props.file?.fileType
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
})

/**
 * Download file
 */
function handleDownload() {
  const filePath = props.file?.filePath
  if (!filePath) {
    ElMessage.warning(t('task.downloadFailed'))
    return
  }
  
  try {
    const link = document.createElement('a')
    link.href = filePath
    link.download = props.file.fileName || 'download'
    link.target = '_blank'
    
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
// Text-only mode (inline)
.file-item-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  margin-right: 8px;
  margin-bottom: 4px;
  background-color: rgba($primary-color, 0.08);
  border-radius: 4px;
  font-size: 12px;
  color: $primary-color;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba($primary-color, 0.15);
  }
  
  .file-icon-inline {
    flex-shrink: 0;
  }
  
  .file-name-text {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// Card mode (default)
.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background-color: $bg-page;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
    
    .file-actions {
      opacity: 1;
    }
  }
  
  // Compact mode
  &--compact {
    padding: 6px 10px;
    
    .file-icon {
      width: 28px;
      height: 28px;
    }
  }
  
  .file-icon {
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
  
  .file-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .file-name {
      font-size: 13px;
      font-weight: 500;
      color: $text-primary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .file-size {
      font-size: 11px;
      color: $text-secondary;
    }
  }
  
  .file-actions {
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .file-item-text {
    .file-name-text {
      max-width: 100px;
    }
  }
  
  .file-item {
    padding: 6px 10px;
    
    .file-icon {
      width: 28px;
      height: 28px;
    }
    
    .file-info {
      .file-name {
        font-size: 12px;
      }
      
      .file-size {
        font-size: 10px;
      }
    }
    
    .file-actions {
      opacity: 1; // Always show on mobile
    }
  }
}
</style>
