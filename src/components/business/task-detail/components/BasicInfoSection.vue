<template>
  <div class="basic-info-section">
    <h4 class="section-title">{{ t('task.basicInfo') }}</h4>
    
    <div class="info-grid">
      <!-- 执行人选择 -->
      <div class="info-item">
        <label class="info-label">{{ t('task.assignee') }}</label>
        <div class="info-value executors-container">
          <div class="executors-list">
            <el-tooltip
              v-for="user in displayExecutors"
              :key="user.umId"
              :content="`${user.name} (${user.umId})`"
              placement="top"
            >
              <div class="executor-item">
                <el-avatar :size="28" class="executor-avatar">
                  {{ user.name.charAt(0) }}
                </el-avatar>
                <span class="executor-name">{{ user.name }}</span>
              </div>
            </el-tooltip>
            
            <el-button
              class="add-executor-btn"
              circle
              size="small"
              :loading="isUpdating"
              @click="showUserSelector = true"
            >
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 创建人展示（只读） -->
      <div class="info-item">
        <label class="info-label">{{ t('task.creator') }}</label>
        <div class="info-value readonly">
          <el-avatar :size="24" class="user-avatar">
            {{ taskDetail?.name?.charAt(0) || '?' }}
          </el-avatar>
          <span class="creator-info">
            <span class="creator-name">{{ taskDetail?.name || '-' }}</span>
            <span class="creator-umid" v-if="taskDetail?.umId">
              ({{ taskDetail.umId }})
            </span>
          </span>
        </div>
      </div>

      <!-- 截止时间选择 -->
      <div class="info-item">
        <label class="info-label">{{ t('task.deadline') }}</label>
        <el-date-picker
          v-model="tempDeadline"
          @change="handleDeadlineChange"
          type="datetime"
          placeholder="选择截止时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          class="info-value date-picker"
          :disabled="isUpdating"
          style="width: 100%"
          :clearable="false"
        />
      </div>

      <!-- 状态选择 -->
      <div class="info-item">
        <label class="info-label">{{ t('task.status') }}</label>
        <TagSelect
          :model-value="taskDetail?.status"
          @update:model-value="handleStatusChange"
          :options="statusOptions"
          placeholder="选择状态"
          :loading="isUpdating"
          class="info-value-tag"
        />
      </div>

      <!-- 优先级选择 -->
      <div class="info-item">
        <label class="info-label">{{ t('task.priority') }}</label>
        <TagSelect
          :model-value="taskDetail?.priority"
          @update:model-value="handlePriorityChange"
          :options="priorityOptions"
          placeholder="选择优先级"
          :loading="isUpdating"
          class="info-value-tag"
        />
      </div>

      <!-- 来源展示（只读） -->
      <div class="info-item">
        <label class="info-label">{{ t('task.source') }}</label>
        <div class="info-value readonly">
          {{ getSourceText(taskDetail?.source) }}
        </div>
      </div>
    </div>

    <!-- 选人组件 -->
    <UserSelector
      v-model="showUserSelector"
      :users="availableUsers"
      :selected-users="selectedExecutors"
      @confirm="handleExecutorsConfirm"
    />
  </div>
</template>

<script setup>
/**
 * BasicInfoSection Component
 * 
 * Displays and manages basic task information including:
 * - Executor selection (multi-select, auto-save)
 * - Creator display (read-only)
 * - Deadline selection (date-picker, auto-save)
 * - Status selection (select + tag, auto-save)
 * - Priority selection (select, auto-save)
 * - Source display (read-only)
 * 
 * @component
 * @props {Object} taskDetail - The task detail object
 * @props {Array} availableUsers - List of available users for executor selection
 * 
 * @emits update-field - Emitted when a field needs to be updated
 */

import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus } from '@element-plus/icons-vue'
import TagSelect from '@/components/common/TagSelect.vue'
import UserSelector from '@/components/common/UserSelector.vue'

const { t } = useI18n()

// Props
const props = defineProps({
  taskDetail: {
    type: Object,
    default: null
  },
  availableUsers: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update-field'])

// State
const isUpdating = ref(false)
const showUserSelector = ref(false)
const tempDeadline = ref(null)

// Status configuration
const statusOptions = [
  { value: 0, label: '待处理', type: 'warning' },
  { value: 1, label: '已完成', type: 'success' },
  { value: 2, label: '进行中', type: 'primary' },
  { value: 3, label: '已逾期', type: 'danger' }
]

// Priority configuration
const priorityOptions = [
  { value: 1, label: '低', color: '#909399', dot: true },
  { value: 2, label: '中', color: '#E6A23C', dot: true },
  { value: 3, label: '高', color: '#F56C6C', dot: true }
]

// Source mapping
const sourceConfig = {
  '-1': '老数据同步',
  '0': '手动创建',
  '1': '会议纪要',
  '8': 'i平安',
  '9': 'i平安',
  '10': 'i平安'
}

// Computed properties
const selectedExecutors = computed(() => {
  if (!props.taskDetail?.todoUsers) return []
  return props.taskDetail.todoUsers.map(user => user.umId)
})

const deadlineValue = computed(() => {
  return props.taskDetail?.deadLine || null
})

const displayExecutors = computed(() => {
  if (!props.taskDetail?.todoUsers) return []
  return props.taskDetail.todoUsers
})

// Watch for taskDetail changes to update temp deadline
watch(() => props.taskDetail?.deadLine, (newValue) => {
  tempDeadline.value = newValue || null
}, { immediate: true })

// Methods
function getSourceText(source) {
  if (source === null || source === undefined) return '-'
  return sourceConfig[String(source)] || `未知来源(${source})`
}

async function handleExecutorsConfirm(umIds) {
  isUpdating.value = true
  try {
    // Convert umIds to todoUsers array
    const todoUsers = umIds.map(umId => {
      const user = props.availableUsers.find(u => u.umId === umId)
      return {
        umId: umId,
        name: user?.name || '',
        status: 0
      }
    })
    
    await emit('update-field', 'todoUsers', todoUsers)
  } finally {
    isUpdating.value = false
  }
}

async function handleDeadlineChange(value) {
  isUpdating.value = true
  try {
    await emit('update-field', 'deadLine', value)
  } finally {
    isUpdating.value = false
  }
}

async function handleStatusChange(value) {
  isUpdating.value = true
  try {
    await emit('update-field', 'todoStatus', value)
  } finally {
    isUpdating.value = false
  }
}

async function handlePriorityChange(value) {
  isUpdating.value = true
  try {
    await emit('update-field', 'priority', value)
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped lang="scss">
.basic-info-section {
  padding-bottom: 24px;
  border-bottom: 1px solid #e4e7ed;

  .section-title {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px 40px;
    align-items: center;

    .info-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      min-width: 0; // 关键：允许 flex 子元素收缩

      .info-label {
        font-size: 14px;
        color: #606266;
        font-weight: 500;
        white-space: nowrap;
        flex-shrink: 0;
        min-width: 70px;
        text-align: right;
      }

      .info-value-tag {
        flex: 1;
        display: flex;
        align-items: center;
        min-width: 0;
      }

      .info-value {
        flex: 1;
        min-width: 0; // 关键：允许内容收缩

        &.executors-container {
          .executors-list {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;

            .executor-item {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 4px 8px 4px 4px;
              background-color: #f5f7fa;
              border-radius: 16px;
              transition: all 0.2s;

              .executor-avatar {
                flex-shrink: 0;
                background-color: #409eff;
                color: white;
                font-size: 12px;
              }

              .executor-name {
                font-size: 13px;
                color: #303133;
                white-space: nowrap;
              }
            }

            .add-executor-btn {
              width: 28px;
              height: 28px;
              padding: 0;
              border: 1px dashed #d9d9d9;
              background-color: transparent;
              color: #909399;
              transition: all 0.2s;

              &:hover {
                border-color: #409eff;
                color: #409eff;
                background-color: #ecf5ff;
              }
            }
          }
        }

        &.readonly {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          background-color: #f5f7fa;
          border-radius: 4px;
          font-size: 14px;
          color: #303133;
          height: 32px;
          line-height: 32px;
          overflow: hidden; // 关键：隐藏溢出内容

          .creator-info {
            display: flex;
            align-items: center;
            gap: 4px;
            flex: 1;
            overflow: hidden;
            min-width: 0; // 关键：允许收缩

            .creator-name {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: fit-content; // 改为适应内容宽度
              min-width: 0; // 关键：允许收缩
            }

            .creator-umid {
              color: #909399;
              font-size: 12px;
              flex-shrink: 0;
              white-space: nowrap;
            }
          }
        }

        // 统一所有输入控件的高度
        :deep(.el-input__wrapper) {
          min-height: 32px;
        }

        :deep(.el-select) {
          .el-input__wrapper {
            min-height: 32px;
          }
        }

        &.date-picker {
          :deep(.el-input__wrapper) {
            min-height: 32px;
            width: 100%;
          }
        }
      }

      .user-avatar {
        flex-shrink: 0;
        background-color: #409eff;
        color: white;
        font-size: 12px;
      }
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .basic-info-section {
    padding-bottom: 20px;

    .section-title {
      margin-bottom: 16px;
      font-size: 15px;
    }

    .info-grid {
      grid-template-columns: 1fr;
      gap: 14px;

      .info-item {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;

        .info-label {
          text-align: left;
          min-width: auto;
        }
      }
    }
  }
}
</style>
