<template>
  <div class="attachment-section">
    <h4 class="section-title">
      <div class="title-left">
        {{ t('task.attachment') }}
        <span v-if="attachmentList.length > 0" class="count">({{ attachmentList.length }})</span>
      </div>
      <el-upload
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handleFileChange"
        action="#"
      >
        <el-button type="primary" link size="small">
          <el-icon><Upload /></el-icon> {{ t('task.upload') }}
        </el-button>
      </el-upload>
    </h4>
    
    <div class="section-content">
      <!-- Attachment Grid -->
      <el-row v-if="attachmentList.length > 0" :gutter="12" class="attachment-grid">
        <el-col
          v-for="(attachment, index) in attachmentList"
          :key="attachment.fileId || index"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <FileItem
            :file="attachment"
            :show-download="true"
          />
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
 * Displays the list of attachments for a task using FileItem component.
 * 
 * @component
 * @props {Array} attachmentList - Array of attachment objects
 */

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useUpload } from '@/composables/useUpload'
import FileItem from '@/components/common/FileItem.vue'

const { t } = useI18n()

const props = defineProps({
  attachmentList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update-field'])

const { upload } = useUpload()

async function handleFileChange(file) {
  if (file.raw) {
    const uploadedData = await upload(file.raw)
    
    if (uploadedData) {
      // Create new attachment list with the uploaded file
      const newAttachmentList = [...props.attachmentList, uploadedData]
      emit('update-field', 'attachmentList', newAttachmentList)
      // ElMessage.success(t('task.uploadSuccess'))
    }
  }
}
</script>

<style scoped lang="scss">
.attachment-section {
  padding: $spacing-lg 0;
  
  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    
    .title-left {
      font-size: $font-size-large;
      font-weight: 600;
      color: $text-primary;
    }
  }
  
  .section-content {
    .attachment-grid {
      :deep(.el-col) {
        margin-bottom: 12px;
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
    padding: $spacing-md 0;
    
    .section-content {
      .attachment-grid {
        :deep(.el-col) {
          margin-bottom: 8px;
        }
      }
      
      .empty-state {
        padding: 6px 0;
      }
    }
  }
}
</style>
