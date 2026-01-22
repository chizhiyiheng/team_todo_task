<template>
  <el-dialog 
    :model-value="modelValue" 
    @update:model-value="handleClose" 
    :title="null"
    :show-close="false"
    :close-on-click-modal="false" 
    class="create-task-dialog" 
    width="600px" 
    :fullscreen="isMobile"
  >
    <!-- Custom Header -->
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">{{ t('task.createTask') }}</h3>
        <el-icon class="close-icon" @click="handleClose">
          <Close />
        </el-icon>
      </div>
    </template>

    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px" label-position="left"
      v-loading="isSubmitting" class="inline-form">
      <!-- 创建至（仅团队任务） -->
      <el-form-item v-if="isTeamTask" :label="t('task.createTo')" prop="projectId">
        <el-select v-model="formData.projectId" :placeholder="t('task.selectProject')" clearable>
          <el-option label="默认项目" value="" />
          <!-- TODO: 后续从项目列表中加载 -->
        </el-select>
      </el-form-item>

      <!-- 任务主题 -->
      <el-form-item :label="t('task.title')" prop="title">
        <el-input v-model="formData.title" :placeholder="t('task.titlePlaceholder')" maxlength="100" show-word-limit
          clearable />
      </el-form-item>

      <!-- 截止时间 -->
      <el-form-item :label="t('task.deadline')" prop="deadLine">
        <el-date-picker v-model="formData.deadLine" type="datetime" :placeholder="t('task.selectDeadline')"
          format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="disabledDate" />
      </el-form-item>

      <!-- 优先级 -->
      <el-form-item :label="t('task.priority')" prop="priority">
        <TagSelect v-model="formData.priority" :options="TASK_PRIORITY_OPTIONS"
          :placeholder="t('task.selectPriority')" />
      </el-form-item>

      <!-- 负责人 -->
      <el-form-item :label="t('task.assignee')" prop="todoUsers">
        <div class="assignee-container">
          <div class="user-list">
            <el-tooltip v-for="user in selectedUsersList" :key="user.umId" :content="`${user.name} (${user.umId})`"
              placement="top">
              <div class="user-item">
                <el-avatar :size="28" class="user-avatar">
                  {{ user.name.charAt(0) }}
                </el-avatar>
                <span class="user-name">{{ user.name }}</span>
                <el-icon class="remove-icon" @click.stop="removeUser(user.umId)">
                  <Close />
                </el-icon>
              </div>
            </el-tooltip>

            <el-button class="add-user-btn" circle size="small" @click="showUserSelector = true">
              <el-icon>
                <Plus />
              </el-icon>
            </el-button>
          </div>
        </div>
      </el-form-item>

      <!-- 任务可见性（仅团队任务） -->
      <el-form-item v-if="isTeamTask" :label="t('task.visibility')" prop="visibility">
        <el-radio-group v-model="formData.visibility">
          <el-radio :value="0">{{ t('task.visibilityPrivate') }}</el-radio>
          <el-radio :value="1">{{ t('task.visibilityPublic') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 标记为重要任务 -->
      <el-form-item label=" ">
        <el-checkbox v-model="formData.isImportant">
          {{ t('task.markAsImportant') }}
        </el-checkbox>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ t('common.confirm') }}
        </el-button>
      </div>
    </template>

    <!-- 选人弹窗 -->
    <UserSelector v-model="showUserSelector" :users="availableUsers" :selected-users="selectedUserIds"
      @confirm="handleUsersConfirm" />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Plus, Close } from '@element-plus/icons-vue'
import { todoApi } from '@/api'
import { TASK_PRIORITY_OPTIONS } from '@/constants/taskEnums'
import UserSelector from '@/components/common/UserSelector.vue'
import TagSelect from '@/components/common/TagSelect.vue'
import { useAvailableUsers } from './task-detail/hooks/useAvailableUsers'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()
const { availableUsers } = useAvailableUsers()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false
  },
  taskType: {
    type: String,
    default: 'personal', // 'personal' | 'team'
    validator: (value) => ['personal', 'team'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'task-created'])

const isMobile = window.innerWidth <= 768
const formRef = ref(null)
const isSubmitting = ref(false)
const showUserSelector = ref(false)

// 表单数据
const formData = reactive({
  title: '',
  deadLine: '',
  priority: 2, // 默认中优先级
  todoUsers: [],
  visibility: 1, // 默认公开（仅团队任务）
  isImportant: false,
  projectId: '' // 创建至（仅团队任务）
})

// 计算属性：是否为团队任务
const isTeamTask = computed(() => props.taskType === 'team')

// 计算属性：已选择的用户ID列表
const selectedUserIds = computed(() => {
  return formData.todoUsers.map(user => user.umId)
})

// 计算属性：已选择的用户完整信息列表
const selectedUsersList = computed(() => {
  return formData.todoUsers
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: t('task.titleRequired'), trigger: 'blur' },
    { min: 1, max: 100, message: t('task.titleLength'), trigger: 'blur' }
  ],
  todoUsers: [
    { required: true, message: t('task.assigneeRequired'), trigger: 'change' }
  ]
}

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁用昨天之前的日期
}

// 处理用户选择确认
const handleUsersConfirm = (umIds) => {
  // 根据选中的 umId 从 availableUsers 中获取完整的用户信息
  formData.todoUsers = umIds.map(umId => {
    const user = availableUsers.value.find(u => u.umId === umId)
    return {
      umId: user.umId,
      name: user.name
    }
  })
}

// 移除用户
const removeUser = (umId) => {
  const index = formData.todoUsers.findIndex(user => user.umId === umId)
  if (index > -1) {
    formData.todoUsers.splice(index, 1)
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
  resetForm()
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  formData.title = ''
  formData.deadLine = ''
  formData.priority = 2
  formData.todoUsers = []
  formData.visibility = 1
  formData.isImportant = false
  formData.projectId = ''
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    const valid = await formRef.value?.validate()
    if (!valid) return

    isSubmitting.value = true

    // 构建请求数据
    const requestData = {
      umId: userStore.userId || '',
      name: userStore.userName || '',
      title: formData.title,
      deadLine: formData.deadLine || undefined,
      priority: formData.priority,
      tag: formData.isImportant ? 1 : 0,
      source: 0, // 默认来源
      todoUsers: formData.todoUsers.map(user => ({
        umId: user.umId,
        name: user.name
      }))
    }

    // 如果是团队任务，添加额外字段
    if (isTeamTask.value) {
      requestData.projectId = formData.projectId || undefined
      requestData.visibility = formData.visibility
    }

    // 调用接口
    const response = await todoApi.addTodo(requestData)

    if (response.code === '200') {
      ElMessage.success(t('task.createSuccess'))
      emit('task-created', response.body) // 返回新创建的任务ID
      handleClose()
    } else {
      ElMessage.error(response.message || t('task.createFailed'))
    }
  } catch (error) {
    console.error('Create task error:', error)
    ElMessage.error(t('task.createFailed'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.create-task-dialog {
  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-md 0;
    border-bottom: 1px solid $border-light;

    .dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
      line-height: 32px;
    }

    .close-icon {
      font-size: 20px;
      color: $text-secondary;
      cursor: pointer;
      transition: all 0.3s;
      flex-shrink: 0;

      &:hover {
        color: $text-regular;
        transform: scale(1.1);
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: $spacing-xxl;
  }

  // 内联表单样式
  .inline-form {
    :deep(.el-form-item) {
      margin-bottom: $spacing-xl;

      &:last-child {
        margin-bottom: 0;
      }
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: $text-regular;
      font-size: $font-size-base;
      padding-right: $spacing-md;
      line-height: 32px;
    }

    :deep(.el-form-item__content) {
      flex: 1;
    }

    // 弱化输入框边框
    :deep(.el-input__wrapper) {
      box-shadow: none;
      border: 1px solid $border-light;
      transition: all 0.2s;

      &:hover {
        border-color: $text-placeholder;
      }

      &.is-focus {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.1);
      }
    }

    // 日期选择器样式
    :deep(.el-date-editor) {
      width: 100%;

      .el-input__wrapper {
        box-shadow: none;
        border: 1px solid $border-light;

        &:hover {
          border-color: $text-placeholder;
        }
      }

      &.is-active .el-input__wrapper {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.1);
      }
    }

    // 下拉选择器样式
    :deep(.el-select) {
      width: 100%;

      .el-input__wrapper {
        box-shadow: none;
        border: 1px solid $border-light;

        &:hover {
          border-color: $text-placeholder;
        }
      }

      &.is-focus .el-input__wrapper {
        border-color: $primary-color;
        box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.1);
      }
    }
  }

  .assignee-container {
    width: 100%;
    min-height: 40px;

    .add-user-btn {
      width: 32px;
      height: 32px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-md;
  }
}

// Mobile responsive styles
@media (max-width: 768px) {
  .create-task-dialog {
    .dialog-header {
      padding: $spacing-md 0;
      .dialog-title {
        font-size: 16px;
        line-height: 28px;
      }

      .close-icon {
        font-size: 18px;
      }
    }

    :deep(.el-dialog__body) {
      padding: $spacing-xl;
    }

    .inline-form {
      :deep(.el-form-item) {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: $spacing-lg;
      }

      :deep(.el-form-item__label) {
        width: 100% !important;
        padding-bottom: 6px;
        line-height: 1.5;
      }

      :deep(.el-form-item__content) {
        width: 100%;
        margin-left: 0 !important;
      }
    }

    .assignee-container {
      min-height: 32px;
    }

    .dialog-footer {
      .el-button {
        flex: 1;
      }
    }
  }
}
</style>
