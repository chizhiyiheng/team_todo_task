<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    class="progress-log-dialog"
    destroy-on-close
    @close="handleClose"
  >
    <el-tabs v-model="activeTab" class="progress-tabs">
      <!-- 进展时间线 Tab -->
      <el-tab-pane :label="t('task.progressTimeline')" name="timeline">
        <div v-if="historyList.length > 0" class="timeline-container">
          <el-timeline>
            <el-timeline-item
              v-for="item in historyList"
              :key="item.id"
              :timestamp="formatTime(item.submitTime)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="progress-value">
                  <el-progress
                    :percentage="item.progressPercent"
                    :stroke-width="8"
                    :color="getProgressColor(item.progressPercent)"
                  />
                </div>
                <div class="progress-desc">{{ item.progressDesc }}</div>
                <!-- 附件列表（纯文字模式） -->
                <div v-if="item.attachmentList && item.attachmentList.length > 0" class="timeline-attachments">
                  <FileItem
                    v-for="(file, fileIndex) in item.attachmentList"
                    :key="file.fileId || fileIndex"
                    :file="file"
                    :text-only="true"
                  />
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
        <el-empty v-else :description="t('task.noProgressHistory')" :image-size="80" />
      </el-tab-pane>
      
      <!-- 进展附件 Tab -->
      <el-tab-pane :label="t('task.progressAttachments')" name="attachments">
        <div v-if="attachmentList.length > 0" class="attachment-list">
          <FileItem
            v-for="(file, index) in attachmentList"
            :key="file.fileId || index"
            :file="file"
            :show-download="true"
          />
        </div>
        <el-empty v-else :description="t('task.noProgressAttachments')" :image-size="80" />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
/**
 * ProgressLogDialog Component
 * 
 * 进展日志弹窗，包含两个 tab：
 * - 进展时间线：显示历史进展记录
 * - 进展附件：显示该进展的所有附件
 * 
 * @component
 * @props {Boolean} visible - 控制弹窗显示
 * @props {Object} progressItem - 进展项数据
 * @emits update:visible - 关闭弹窗时触发
 */

import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import FileItem from '@/components/common/FileItem.vue'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  progressItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

// State
const activeTab = ref('timeline')

// Computed
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const dialogTitle = computed(() => {
  if (!props.progressItem) return t('task.progressLog')
  
  if (props.progressItem.isCurrentUser) {
    return t('task.myProgress') + ' - ' + t('task.progressLog')
  }
  return t('task.executorProgress', { name: props.progressItem.name }) + ' - ' + t('task.progressLog')
})

const historyList = computed(() => {
  return props.progressItem?.historyList || []
})

const attachmentList = computed(() => {
  return props.progressItem?.attachmentList || []
})

// Methods
function handleClose() {
  activeTab.value = 'timeline'
}

function formatTime(time) {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

function getProgressColor(percent) {
  if (percent < 30) return 'var(--el-color-danger)'
  if (percent < 70) return 'var(--el-color-warning)'
  return 'var(--el-color-success)'
}

// Reset tab when dialog opens
watch(() => props.visible, (val) => {
  if (val) {
    activeTab.value = 'timeline'
  }
})
</script>

<style scoped lang="scss">
.progress-log-dialog {
  :deep(.el-dialog__body) {
    padding-top: 0;
  }
  
  .progress-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }
    
    :deep(.el-tabs__content) {
      max-height: 400px;
      overflow-y: auto;
    }
  }
  
  .timeline-container {
    padding: 12px 0;
    
    :deep(.el-timeline) {
      padding-left: 0;
    }
    
    :deep(.el-timeline-item__wrapper) {
      padding-left: 28px;
    }
    
    :deep(.el-timeline-item__timestamp) {
      font-size: 13px;
      color: $text-secondary;
      margin-bottom: 8px;
    }
    
    :deep(.el-timeline-item__node) {
      background-color: $primary-color;
    }
    
    :deep(.el-timeline-item__tail) {
      border-left: 2px solid $border-light;
    }
    
    .timeline-content {
      padding: 12px;
      background-color: $bg-page;
      border-radius: 6px;
      
      .progress-value {
        margin-bottom: 8px;
        
        :deep(.el-progress__text) {
          font-size: 12px;
          font-weight: 600;
        }
      }
      
      .progress-desc {
        font-size: 14px;
        color: $text-regular;
        line-height: 1.6;
      }
      
      .timeline-attachments {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px dashed $border-light;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }
  }
  
  .attachment-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

// Mobile responsive
@media (max-width: 768px) {
  .progress-log-dialog {
    :deep(.el-dialog) {
      width: 90% !important;
      margin: 10vh auto !important;
    }
    
    .progress-tabs {
      :deep(.el-tabs__content) {
        max-height: 300px;
      }
    }
    
    .timeline-container {
      :deep(.el-timeline-item__timestamp) {
        font-size: 12px;
      }
      
      .timeline-content {
        padding: 10px;
        
        .progress-desc {
          font-size: 13px;
        }
      }
    }
  }
}
</style>
