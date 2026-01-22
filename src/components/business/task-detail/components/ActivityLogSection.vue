<template>
  <div class="activity-log-section" v-loading="isLoading" element-loading-text="加载中...">
    <div class="section-content">
      <!-- Activity Log Timeline -->
      <div v-if="!isLoading && activityLogList.length > 0" class="log-timeline">
        <el-timeline>
          <el-timeline-item
            v-for="log in activityLogList"
            :key="log.id"
            :timestamp="formatTime(log.time)"
            placement="top"
          >
            <div class="log-content">
              <span class="log-operator">{{ log.operator }}</span>
              <span class="log-desc">{{ log.desc }}</span>
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
    const response = await todoApi.getActivityLog(props.todoId)
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
        background: #E4E7ED;
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #C0C4CC;
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
        color: #909399;
        margin-bottom: 8px;
      }

      :deep(.el-timeline-item__node) {
        background-color: #409eff;
      }

      :deep(.el-timeline-item__tail) {
        border-left: 2px solid #e4e7ed;
      }
      
      .log-content {
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
        padding: 8px 12px;
        background-color: #f5f7fa;
        border-radius: 4px;
        
        .log-operator {
          font-weight: 600;
          color: #303133;
          margin-right: 4px;
        }
        
        .log-desc {
          color: #606266;
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
