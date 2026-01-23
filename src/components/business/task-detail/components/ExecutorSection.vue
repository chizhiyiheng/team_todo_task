<template>
  <div class="executor-section">
    <h4 class="section-title">{{ t('task.assignee') }}</h4>
    
    <div class="executor-grid">
      <!-- 执行人卡片 -->
      <div
        v-for="executor in executors"
        :key="executor.umId"
        class="executor-card"
      >
        <div class="card-content">
          <!-- 上行：头像和姓名 -->
          <div class="executor-info">
            <el-avatar :size="24" class="user-avatar">
              {{ executor.name.charAt(0) }}
            </el-avatar>
            <span class="executor-name" :title="executor.name">{{ executor.name }}</span>
          </div>
          
          <!-- 下行：状态选择 -->
          <div class="executor-actions">
            <TagSelect
              :model-value="executor.status"
              @update:model-value="(value) => handleStatusChange(executor.umId, value)"
              :options="getStatusOptions(executor.status)"
              :disabled-values="getDisabledStatusValues(executor.status)"
              :disabled="!canEdit(executor.umId)"
              placeholder="状态"
              :loading="isUpdating"
              class="status-select"
              size="small"
            />
          </div>
        </div>
      </div>
      
      <!-- 添加执行人按钮 -->
      <div class="add-executor-card" @click="showUserSelector = true">
        <el-button
          class="add-executor-btn"
          circle
          size="small"
          :loading="isUpdating"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
        <span class="add-text">添加执行人</span>
      </div>
    </div>
    
    <!-- 选人组件 -->
    <UserSelector
      v-model="showUserSelector"
      :users="availableUsers"
      :selected-users="selectedExecutorUmIds"
      @confirm="handleAddExecutors"
    />
  </div>
</template>

<script setup>
/**
 * ExecutorSection Component
 * 
 * 执行人管理模块，支持：
 * - 显示执行人列表及其各自的状态（双行卡片布局）
 * - 每个执行人可维护自己的任务状态（待处理、已完成、进行中）
 * - 执行人只能操作自己的状态，分配人可以操作所有人的
 * - 集中式增删：通过选人弹窗统一管理
 * - 状态变更时自动刷新任务详情
 */

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import TagSelect from '@/components/common/TagSelect.vue'
import UserSelector from '@/components/common/UserSelector.vue'
import { TASK_STATUS_OPTIONS, TASK_STATUS } from '@/constants/taskEnums'
import { useExecutorActions } from '../hooks/useExecutorActions'

const { t } = useI18n()
const userStore = useUserStore()

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
const emit = defineEmits(['executor-updated'])

// State
const isUpdating = ref(false)
const showUserSelector = ref(false)

// 执行人列表
const executors = computed(() => {
  if (!props.taskDetail?.todoUsers) return []
  return props.taskDetail.todoUsers
})

// 已选中的执行人umId列表
const selectedExecutorUmIds = computed(() => {
  return executors.value.map(executor => executor.umId)
})

// 获取状态选项
function getStatusOptions(currentStatus) {
  if (currentStatus === TASK_STATUS.OVERDUE) {
    return TASK_STATUS_OPTIONS.filter(option => 
      option.value === TASK_STATUS.OVERDUE || 
      option.value === TASK_STATUS.COMPLETED
    )
  }
  
  if (currentStatus === TASK_STATUS.CANCELLED) {
    return TASK_STATUS_OPTIONS.filter(option => 
      option.value === TASK_STATUS.CANCELLED
    )
  }
  
  return TASK_STATUS_OPTIONS.filter(option => 
    option.value !== TASK_STATUS.OVERDUE && 
    option.value !== TASK_STATUS.TO_RECEIVE && 
    option.value !== TASK_STATUS.CANCELLED
  )
}

// 获取禁用的状态值
function getDisabledStatusValues(currentStatus) {
  if (currentStatus === TASK_STATUS.OVERDUE) {
    return [TASK_STATUS.OVERDUE]
  }
  if (currentStatus === TASK_STATUS.CANCELLED) {
    return [TASK_STATUS.CANCELLED]
  }
  return []
}

// 执行人操作 hook
const executorActions = useExecutorActions(
  computed(() => props.taskDetail),
  emit,
  t,
  async (isSilent) => {
    emit('executor-updated', isSilent)
  }
)

// 检查是否可以编辑
function canEdit(executorUmId) {
  const currentUserUmId = userStore.userInfo?.umId
  return executorActions.canEditExecutorStatus(executorUmId, currentUserUmId)
}

// 处理状态变更
async function handleStatusChange(umId, status) {
  isUpdating.value = true
  try {
    await executorActions.updateExecutorStatus(umId, status)
  } finally {
    isUpdating.value = false
  }
}

// 处理执行人变更（增加或删除）
async function handleAddExecutors(umIds) {
  isUpdating.value = true
  try {
    await executorActions.updateTodoUsers(umIds, props.availableUsers)
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped lang="scss">
@use "sass:color";

.executor-section {
  padding-bottom: $spacing-xl;
  border-bottom: 1px solid $border-light;

  .section-title {
    margin-bottom: $spacing-md;
    font-size: 14px;
    color: $text-primary;
    font-weight: 600;
  }
  
  .executor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(125px, 1fr));
    gap: $spacing-sm;
    
    .executor-card {
      background-color: $bg-page;
      border: 1px solid $border-light;
      border-radius: 8px;
      padding: 8px 10px;
      transition: all 0.2s ease;
      min-width: 125px;
      display: flex;
      justify-content: center;
      align-items: center;
      
      &:hover {
        border-color: $primary-color;
        background-color: color.scale($bg-page, $lightness: -2%);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      
      .card-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
      }
      
      .executor-info {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-width: 0;
        width: 100%;
        
        .user-avatar {
          flex-shrink: 0;
          background-color: $primary-color;
          color: white;
          font-size: 10px;
        }
        
        .executor-name {
          font-size: 12px;
          color: $text-primary;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 80px;
        }
      }
      
      .executor-actions {
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: $spacing-xs;
        
        .status-select {
          
          :deep(.el-input__wrapper) {
            padding: 0 6px;
            text-align: center;
            height: 24px;
          }

          :deep(.el-input__inner) {
             text-align: center;
             font-size: 12px;
          }
        }
      }
    }
    
    .add-executor-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border: 1px dashed $border-base;
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
      color: $text-secondary;
      background-color: transparent;
      min-height: 58px;
      
      &:hover {
        border-color: $primary-color;
        color: $primary-color;
        background-color: rgba($primary-color, 0.05);
        
        .add-executor-btn {
          border-color: $primary-color;
          color: $primary-color;
        }
      }
      
      .add-executor-btn {
        border: 1px solid $border-base;
        background-color: transparent;
        color: inherit;
        transition: inherit;
      }
      
      .add-text {
        font-size: 12px;
      }
    }
  }
}

// Mobile responsive
@media (max-width: 480px) {
  .executor-section {
    .executor-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
  }
}
</style>
