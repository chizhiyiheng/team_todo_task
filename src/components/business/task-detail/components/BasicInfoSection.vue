<template>
  <div class="basic-info-section">
    <h4 class="section-title">{{ t('task.basicInfo') }}</h4>
    
    <div class="info-grid">
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

      <!-- 任务状态展示（只读） -->
      <div class="info-item">
        <label class="info-label">{{ t('task.status') }}</label>
        <div class="info-value status-wrapper">
          <el-tag :type="getStatusType(taskDetail?.status)" class="status-tag">
            {{ getStatusLabel(taskDetail?.status) }}
          </el-tag>
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
          :disabled="isUpdating || !canEdit"
          style="width: 100%"
          :clearable="false"
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
          :disabled="!canEdit"
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
 * 
 * @emits update-field - Emitted when a field needs to be updated
 */

import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { TASK_PRIORITY_OPTIONS, getStatusType, getStatusLabel } from '@/constants/taskEnums'
import TagSelect from '@/components/common/TagSelect.vue'

const { t } = useI18n()
const userStore = useUserStore()

// Props
const props = defineProps({
  taskDetail: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update-field'])

// State
const isUpdating = ref(false)
const tempDeadline = ref(null)

// Priority options from enums
const priorityOptions = TASK_PRIORITY_OPTIONS

// 判断当前用户是否为分配人（创建人）
const canEdit = computed(() => {
  const currentUserUmId = userStore.userInfo?.umId
  if (!props.taskDetail?.umId || !currentUserUmId) return false
  return props.taskDetail.umId === currentUserUmId
})

// Source mapping
const sourceConfig = {
  '-1': '老数据同步',
  '0': '手动创建',
  '1': '会议纪要',
  '8': 'i平安',
  '9': 'i平安',
  '10': 'i平安'
}



// Watch for taskDetail changes to update temp deadline
watch(() => props.taskDetail?.deadLine, (newValue) => {
  tempDeadline.value = newValue || null
}, { immediate: true })

// Methods
function getSourceText(source) {
  if (source === null || source === undefined) return '-'
  return sourceConfig[String(source)] || `未知来源(${source})`
}

async function handleDeadlineChange(value) {
  isUpdating.value = true
  try {
    await emit('update-field', 'deadLine', value)
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
  padding-bottom: $spacing-xxl;

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    align-items: center;

    .info-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      min-width: 0; // 关键：允许 flex 子元素收缩

      &.full-width {
        grid-column: 1 / -1; // 跨越所有列
      }

      .info-label {
        font-size: 14px;
        color: $text-regular;
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
          // 使用全局 .user-list 样式
        }

        &.readonly {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          background-color: $bg-page;
          border-radius: 4px;
          font-size: 14px;
          color: $text-primary;
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
              color: $text-secondary;
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

        &.status-wrapper {
          display: flex;
          align-items: center;

          .status-tag {
            height: 32px;
            padding: 0 12px;
            display: inline-flex;
            align-items: center;
            font-size: 14px;
            white-space: nowrap;
            border: none;
          }
        }
      }

      .user-avatar {
        flex-shrink: 0;
        background-color: $primary-color;
        color: white;
        font-size: 12px;
      }
    }
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .basic-info-section {
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
