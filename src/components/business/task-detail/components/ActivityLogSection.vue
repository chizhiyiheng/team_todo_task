<template>
  <div class="activity-log-section" v-loading="isLoading" element-loading-text="加载中...">
    <div class="section-content">
      <!-- Activity Log Timeline -->
      <div v-if="!isLoading && activityLogList.length > 0" class="log-timeline">
        <el-timeline>
          <el-timeline-item
            v-for="log in activityLogList"
            :key="log.id"
            :timestamp="formatTime(log.operationTime)"
            placement="top"
          >
            <div class="log-content">
              <span class="log-operator">{{ log.userName }}</span>
              <!-- <span class="log-action">{{ getOperationLabel(log.operationType) }}</span> -->
              <span class="log-desc">{{ log.remark }}</span>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="!isLoading" class="empty-state">
        <el-empty
          :description="t('task.noActivityLog')"
          :image-size="80"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * ActivityLogSection Component
 * 
 * Displays the activity log list for a task, showing operation history
 * with time, operator, and description.
 * Fetches activity log data independently from the API.
 * 
 * @component
 * @props {string} todoId - The ID of the todo to fetch activity logs for
 */

import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { todoApi } from '@/api/index.js'
import { OPERATION_TYPE_LABELS } from '@/constants/oplogEnums.js'

// Composables
const { t } = useI18n()

// Props definition
const props = defineProps({
  todoId: {
    type: String,
    required: true
  }
})

// State
const isLoading = ref(false)
const activityLogList = ref([])

/**
 * Load activity log from API
 */
async function loadActivityLog() {
  if (!props.todoId) return

  isLoading.value = true
  try {
    const response = await todoApi.getOpLogList(props.todoId)
    if (response.code === '200') {
      activityLogList.value = response.body || []
    } else {
      ElMessage.error(response.message || t('task.operationFailed'))
      activityLogList.value = []
    }
  } catch (error) {
    console.error('Load activity log error:', error)
    activityLogList.value = []
  } finally {
    isLoading.value = false
  }
}

/**
 * Format time string to readable format
 * @param {string} time - Time string from API
 * @returns {string} Formatted time string
 */
function formatTime(time) {
  if (!time) return ''
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

/**
 * Get operation type label
 * @param {number} type - Operation type code
 * @returns {string} Operation type label
 */
function getOperationLabel(type) {
  return OPERATION_TYPE_LABELS[type] || ''
}

// Watch for todoId changes
watch(() => props.todoId, () => {
  loadActivityLog()
}, { immediate: true })
</script>

<style scoped lang="scss">
.activity-log-section {
  .section-content {
    .log-timeline {
      max-height: 400px;
      overflow-y: auto;
      padding: 12px 0;
      
      /* Custom scrollbar styles */
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: $border-light;
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: $text-placeholder;
        border-radius: 3px;
        
        &:hover {
          background: #A8ABB2;
        }
      }

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
      
      .log-content {
        font-size: 14px;
        color: $text-regular;
        line-height: 1.6;
        padding: 8px 12px;
        background-color: $bg-page;
        border-radius: 4px;
        
        .log-operator {
          font-weight: 600;
          color: $text-primary;
          margin-right: 4px;
        }
        
        .log-desc {
          color: $text-regular;
        }
      }
    }
    
    .empty-state {
      padding: 24px;
      text-align: center;
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .activity-log-section {
    .section-content {
      .log-timeline {
        max-height: 300px;
        padding: 8px 0;

        :deep(.el-timeline-item__timestamp) {
          font-size: 12px;
        }
        
        .log-content {
          font-size: 13px;
          padding: 6px 10px;
        }
      }
      
      .empty-state {
        padding: 16px;
      }
    }
  }
}
</style>
