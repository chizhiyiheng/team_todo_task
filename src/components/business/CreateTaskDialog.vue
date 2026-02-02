<template>
  <el-dialog 
    :model-value="modelValue" 
    @update:model-value="handleClose" 
    :title="null"
    :show-close="false"
    :close-on-click-modal="false" 
    class="create-task-dialog" 
    width="700px" 
    :fullscreen="isMobile"
  >
    <!-- Custom Header -->
    <template #header>
      <div class="dialog-header">
        <h3 class="dialog-title">{{ t('task.createTask') }}</h3>
        <!-- 模式切换（仅在显示快速创建时显示） -->
        <div v-if="showQuickCreate" class="mode-switch">
          <button 
            class="mode-btn" 
            :class="{ active: createMode === 'quick' }" 
            @click="switchMode('quick')"
          >
            <el-icon><Lightning /></el-icon>
            {{ t('task.quickCreate') }}
          </button>
          <button 
            class="mode-btn" 
            :class="{ active: createMode === 'form' }" 
            @click="switchMode('form')"
          >
            <el-icon><List /></el-icon>
            {{ t('task.formCreate') }}
          </button>
        </div>
        <el-icon class="close-icon" @click="handleClose">
          <Close />
        </el-icon>
      </div>
    </template>

    <!-- 快速创建模式 -->
    <div v-if="showQuickCreate && createMode === 'quick'" class="quick-create-container">
      <div class="input-section">
        <div class="input-wrapper">
          <el-input
            v-model="quickInput"
            type="textarea"
            :rows="4"
            :placeholder="t('task.quickInputPlaceholder')"
            class="quick-input"
            resize="none"
          />
          <!-- <button 
            class="voice-btn" 
            :class="{ recording: isRecording }" 
            @click="toggleVoice"
            :title="t('task.voiceInput')"
          >
            <el-icon><Microphone v-if="!isRecording" /><VideoPause v-else /></el-icon>
          </button> -->
        </div>
        <button class="extract-btn" @click="extractTaskInfo" :disabled="!quickInput.trim()">
          <el-icon><MagicStick /></el-icon>
        </button>
      </div>

      <!-- AI响应区域 -->
      <div v-if="showAIResponse" class="ai-response-section">
        <div class="ai-response-header">
          <div class="ai-avatar">
            <el-icon><Promotion /></el-icon>
          </div>
          <div>
            <div class="ai-response-title">{{ t('task.aiAssistant') }}</div>
            <div v-if="isAnalyzing" class="ai-typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <div v-if="extractedData" class="extracted-content">
          <!-- 任务信息卡片 -->
          <div class="task-info-grid">
            <div class="task-info-item">
              <div class="task-info-label">
                <el-icon><Document /></el-icon>
                {{ t('task.title') }}
              </div>
              <div class="task-info-value" @click="editField('title')">
                <span class="value">{{ extractedData.title }}</span>
                <el-icon class="edit-icon"><Edit /></el-icon>
              </div>
            </div>

            <div class="task-info-item">
              <div class="task-info-label">
                <el-icon><Flag /></el-icon>
                {{ t('task.priority') }}
              </div>
              <el-popover
                placement="bottom-start"
                :width="200"
                trigger="click"
                v-model:visible="showPriorityPopover"
                :teleported="true"
                :hide-after="0"
                :show-arrow="false"
                popper-class="priority-select-popover"
                :offset="4"
                :popper-options="{
                  strategy: 'fixed',
                  modifiers: [
                    {
                      name: 'preventOverflow',
                      options: {
                        boundary: 'viewport',
                        padding: 8
                      }
                    }
                  ]
                }"
              >
                <template #reference>
                  <div class="task-info-value">
                    <span class="value">
                      <el-tag :type="getPriorityType(extractedData.priority)" size="small">
                        {{ getPriorityText(extractedData.priority) }}
                      </el-tag>
                    </span>
                    <el-icon class="edit-icon"><ArrowDown /></el-icon>
                  </div>
                </template>
                <div class="priority-list">
                  <div 
                    v-for="option in TASK_PRIORITY_OPTIONS" 
                    :key="option.value"
                    class="priority-item"
                    :class="{ selected: extractedData.priority === option.value }"
                    @click="selectPriority(option.value)"
                  >
                    <el-tag :type="option.type" size="small">{{ option.label }}</el-tag>
                    <el-icon v-if="extractedData.priority === option.value" class="check-icon">
                      <Check />
                    </el-icon>
                  </div>
                </div>
              </el-popover>
            </div>

            <div class="task-info-item">
              <div class="task-info-label">
                <el-icon><Clock /></el-icon>
                {{ t('task.deadline') }}
              </div>
              <el-popover
                placement="bottom-start"
                :width="280"
                trigger="click"
                v-model:visible="showDatePopover"
                :teleported="true"
                :hide-after="0"
                :show-arrow="false"
                popper-class="date-select-popover"
                :offset="4"
                :popper-options="{
                  strategy: 'fixed',
                  modifiers: [
                    {
                      name: 'preventOverflow',
                      options: {
                        boundary: 'viewport',
                        padding: 8
                      }
                    }
                  ]
                }"
              >
                <template #reference>
                  <div class="task-info-value" @click="showDatePopover = true">
                    <span class="value">{{ formatDisplayDate(extractedData.deadLine) }}</span>
                    <el-icon class="edit-icon"><Calendar /></el-icon>
                  </div>
                </template>
                <div class="date-picker-content">
                  <el-date-picker
                    v-model="extractedData.deadLine"
                    type="datetime"
                    :placeholder="t('task.selectDeadline')"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="disabledDate"
                    size="default"
                  />
                  <div class="date-actions">
                    <el-button size="small" @click="showDatePopover = false">
                      {{ t('common.cancel') }}
                    </el-button>
                    <el-button type="primary" size="small" @click="showDatePopover = false">
                      {{ t('common.confirm') }}
                    </el-button>
                  </div>
                </div>
              </el-popover>
            </div>

            <div class="task-info-item full-width">
              <div class="task-info-label">
                <el-icon><Star /></el-icon>
                {{ t('task.importantTask') }}
              </div>
              <div class="task-info-value">
                <span class="value">{{ extractedData.isImportant ? t('common.yes') : t('common.no') }}</span>
                <el-switch
                  v-model="extractedData.isImportant"
                  inline-prompt
                  :active-text="t('common.yes')"
                  :inactive-text="t('common.no')"
                />
              </div>
            </div>
          </div>

          <!-- 执行人单独一行 -->
          <div class="executor-section">
            <div class="executor-label">
              <el-icon><User /></el-icon>
              {{ t('task.assignee') }}
            </div>
            <div class="assignee-container">
              <div class="user-list">
                <el-popover
                  v-for="user in selectedExecutorsList"
                  :key="user.umId"
                  placement="bottom-start"
                  :width="280"
                  trigger="click"
                  v-model:visible="user.showReplacePopover"
                  :teleported="true"
                  :hide-after="0"
                  :show-arrow="false"
                  popper-class="executor-replace-popover"
                  :offset="4"
                  :popper-options="{
                    strategy: 'fixed',
                    modifiers: [
                      {
                        name: 'preventOverflow',
                        options: {
                          boundary: 'viewport',
                          padding: 8
                        }
                      }
                    ]
                  }"
                >
                  <template #reference>
                    <div class="user-item" @click="handleExecutorClick(user)" :title="`${user.realname || user.name} (${user.umId})`">
                      <el-avatar :size="28" class="user-avatar">
                        {{ (user.realname || user.name || "?").charAt(0) }}
                      </el-avatar>
                      <span class="user-name">{{ user.realname || user.name }}</span>
                      <el-icon class="remove-icon" @click.stop="removeExecutor(user.umId)">
                        <Close />
                      </el-icon>
                    </div>
                  </template>
                  <div class="assignee-list">
                    <!-- 调试信息 -->
                    <div style="padding: 10px; background: #f0f0f0; margin-bottom: 10px; font-size: 12px;">
                      <div>当前替换用户: {{ replacingExecutor?.name }}</div>
                      <div>可选项数量: {{ currentExecutorOptions.length }}</div>
                      <div>所有用户数量: {{ allUsers.length }}</div>
                    </div>
                    
                    <div v-if="currentExecutorOptions.length === 0" class="no-executor-tip">
                      {{ t('task.noExecutorAvailable') }}
                    </div>
                    <div 
                      v-for="replaceUser in currentExecutorOptions" 
                      :key="replaceUser.umId"
                      class="assignee-item"
                      :class="{ selected: replacingExecutor?.umId === replaceUser.umId }"
                      @click="replaceExecutor(replaceUser)"
                    >
                      <el-avatar :size="32">{{ (replaceUser.realname || replaceUser.name || "?").charAt(0) }}</el-avatar>
                      <div class="assignee-info">
                        <div class="assignee-name">{{ replaceUser.realname || replaceUser.name }}</div>
                        <div class="assignee-id">{{ replaceUser.umId }}</div>
                        <div v-if="replaceUser.jobTitle" class="assignee-title">{{ replaceUser.jobTitle }}</div>
                        <div v-if="replaceUser.deptName" class="assignee-dept">{{ replaceUser.deptName }}</div>
                      </div>
                      <el-icon v-if="replacingExecutor?.umId === replaceUser.umId" class="check-icon">
                        <Check />
                      </el-icon>
                    </div>
                  </div>
                </el-popover>
                <el-button class="add-user-btn" circle size="small" @click="handleOpenUserSelector">
                  <el-icon>
                    <Plus />
                  </el-icon>
                </el-button>
                
              </div>
            </div>
          </div>

          <!-- AI规划内容（暂时隐藏） -->
          <!-- <div v-if="extractedData.aiPlanning" class="ai-planning-section">
            <div class="planning-title">
              <el-icon><Promotion /></el-icon>
              {{ t('task.aiPlanning') }}
            </div>
            <div class="planning-content" v-html="extractedData.aiPlanning"></div>
          </div> -->
        </div>

        <el-button 
          type="primary" 
          class="create-btn" 
          @click="handleQuickSubmit"
          :loading="isSubmitting"
          :disabled="!extractedData"
        >
          <el-icon><Plus /></el-icon>
          {{ t('task.createTask') }}
        </el-button>
      </div>
    </div>

    <!-- 表单创建模式 -->
    <el-form 
      v-else
      ref="formRef" 
      :model="formData" 
      :rules="formRules" 
      label-width="80px" 
      label-position="left"
      v-loading="isSubmitting" 
      class="inline-form"
    >
      <!-- 创建至（仅团队任务） -->
      <el-form-item v-if="isTeamTask" :label="t('task.createTo')" prop="projectId">
        <el-select v-model="formData.projectId" :placeholder="t('task.selectProject')" clearable>
          <el-option label="默认项目" value="" />
          <!-- TODO: 后续从项目列表中加载 -->
        </el-select>
      </el-form-item>

      <!-- 任务主题 -->
      <el-form-item :label="t('task.title')" prop="title">
        <el-input v-model.trim="formData.title" :placeholder="t('task.titlePlaceholder')" maxlength="100" show-word-limit
          clearable />
      </el-form-item>

      <!-- 截止时间 -->
      <el-form-item :label="t('task.deadline')" prop="deadLine">
        <el-date-picker v-model="formData.deadLine" type="datetime" :placeholder="t('task.selectDeadline')"
          format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="disabledDate" :clearable="false" />
      </el-form-item>

      <!-- 优先级 -->
      <el-form-item :label="t('task.priority')" prop="priority">
        <TagSelect v-model="formData.priority" :options="TASK_PRIORITY_OPTIONS"
          :placeholder="t('task.selectPriority')" />
      </el-form-item>

      <!-- 执行人 -->
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

            <el-button class="add-user-btn" circle size="small" @click="handleOpenUserSelector">
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

      <!-- 高级选项 -->
      <div class="advanced-options-wrapper">
        <div class="advanced-options">
          <div class="advanced-options-header" @click="showAdvancedOptions = !showAdvancedOptions">
            <span class="advanced-options-title">{{ t('task.advancedOptions') }}</span>
            <el-icon class="toggle-icon" :class="{ 'is-expanded': showAdvancedOptions }">
              <ArrowDown v-if="!showAdvancedOptions" />
              <ArrowUp v-else />
            </el-icon>
          </div>

          <el-collapse-transition>
            <div v-show="showAdvancedOptions" class="advanced-options-content">
              <!-- 标记为重要任务 -->
              <el-form-item :label="t('task.mark')" prop="isImportant" class="advanced-form-item">
                <el-checkbox v-model="formData.isImportant">
                  {{ t('task.importantTask') }}
                </el-checkbox>
              </el-form-item>

              <!-- 任务描述 -->
              <el-form-item :label="t('task.description')" prop="content" class="advanced-form-item">
                <!-- <RichTextEditor
                  v-model="formData.content"
                  :placeholder="t('task.descriptionPlaceholder')"
                  :max-length="2000"
                  min-height="120px"
                /> -->
              </el-form-item>

              <!-- 提醒设置 -->
              <el-form-item :label="t('task.reminder')" prop="remindOption" class="advanced-form-item">
                <div class="reminder-options">
                  <el-radio-group v-model="formData.remindOption">
                    <el-radio
                      v-for="option in TASK_REMINDER_OPTIONS"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ t(option.label) }}
                    </el-radio>
                  </el-radio-group>
                  
                  <!-- 自定义提醒时间 -->
                  <el-date-picker
                    v-if="showCustomReminderTime"
                    v-model="formData.remindTime"
                    type="datetime"
                    :placeholder="t('task.selectReminderTime')"
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    :disabled-date="disabledReminderDate"
                    class="custom-time-picker"
                  />
                </div>
              </el-form-item>
            </div>
          </el-collapse-transition>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer" v-if="createMode === 'form'">
        <el-button @click="handleClose">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="isSubmitting">
          {{ t('common.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, toRaw, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { 
  Plus, 
  Close, 
  ArrowDown, 
  ArrowUp, 
  Lightning, 
  List, 
  Microphone, 
  VideoPause,
  MagicStick,
  Document,
  User,
  Flag,
  Clock,
  Star,
  Edit,
  Calendar,
  Check,
  Promotion
} from '@element-plus/icons-vue'
import { todoApi, aiApi } from '@/api'
import { TASK_PRIORITY_OPTIONS, TASK_REMINDER_OPTIONS } from '@/constants/taskEnums'
import TagSelect from '@/components/common/TagSelect.vue'
// import RichTextEditor from '@/components/common/RichTextEditor.vue'
import { useUserStore } from '@/stores/user'
// import { useMemberSelect } from '@/hooks/useMemberSelect'

const { t } = useI18n()
const userStore = useUserStore()
// const { openMemberSelect } = useMemberSelect()

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
const showAdvancedOptions = ref(false)

// 快速创建相关
const showQuickCreate = ref(true) // 是否显示快速创建功能
const createMode = ref('quick') // 'quick' | 'form'
const quickInput = ref('')
const isRecording = ref(false)
const showAIResponse = ref(false)
const isAnalyzing = ref(false)
const extractedData = ref(null)
const showAssigneePopover = ref(false)
const showPriorityPopover = ref(false)
const showDatePopover = ref(false)

// 语音识别相关
let recognition = null
const isSpeechSupported = ref(false)

// 表单数据
const formData = reactive({
  title: '',
  deadLine: '',
  priority: 2, // 默认中优先级
  todoUsers: [],
  visibility: 1, // 默认公开（仅团队任务）
  isImportant: false,
  projectId: '', // 创建至（仅团队任务）
  content: '', // 任务描述
  remindOption: 1, // 提醒选项：0-不提醒，1-提前15分钟，2-提前1小时，3-自定义
  remindTime: '' // 自定义提醒时间
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

// 计算属性：是否显示自定义提醒时间选择器
const showCustomReminderTime = computed(() => {
  return formData.remindOption === 3
})

// 计算属性：过滤后的执行人列表（支持同名人员）
const filteredAssigneeList = computed(() => {
  if (!extractedData.value || !extractedData.value.assigneeName) {
    return []
  }

  // 如果有提取的执行人名称，从executorOptions中获取对应的员工列表
  const searchName = extractedData.value.assigneeName.trim()
  return executorOptions.value[searchName] || []
})

// 计算属性：所有执行人选项（合并所有姓名分组的选项）
const allExecutorOptions = computed(() => {
  const allUsers = []
  Object.values(executorOptions.value).forEach(userList => {
    if (Array.isArray(userList)) {
      allUsers.push(...userList)
    }
  })
  return allUsers
})

// 计算属性：已选择的执行人完整信息列表
const selectedExecutorsList = computed(() => {
  return selectedExecutors.value
})

// 所有用户列表（从store或API获取）
const allUsers = ref([])

// 执行人选项（按姓名分组）
const executorOptions = ref({})

// 已选择的执行人列表
const selectedExecutors = ref([])

// 当前正在替换的执行人
const replacingExecutor = ref(null)

// 当前执行人的可选列表
const currentExecutorOptions = computed(() => {
  if (!replacingExecutor.value) return []
  
  // 根据执行人姓名查找对应的可选列表
  const executorName = replacingExecutor.value.realname || replacingExecutor.value.name
  const optionsFromAI = executorOptions.value[executorName] || []
  
  // 如果 AI 提取的选项为空，使用所有用户作为备选
  if (optionsFromAI.length === 0) {
    // 返回所有用户，但排除当前已选择的执行人
    const selectedIds = selectedExecutors.value.map(u => u.umId)
    return allUsers.value.filter(user => !selectedIds.includes(user.umId))
  }
  
  return optionsFromAI
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: t('task.titleRequired'), trigger: 'blur' },
    { min: 1, max: 100, message: t('task.titleLength'), trigger: 'blur' }
  ],
  todoUsers: [
    { required: true, message: t('task.assigneeRequired'), trigger: 'change' }
  ],
  deadLine: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error(t('task.selectDeadline')))
          return
        }
        // 验证截止时间不能小于当前时间
        const selectedTime = new Date(value).getTime()
        const now = Date.now()
        if (selectedTime < now) {
          callback(new Error(t('task.deadlineCannotBeInPast')))
          return
        }
        callback()
      },
      trigger: 'change'
    }
  ],
  remindOption: [
    {
      validator: (rule, value, callback) => {
        // 只有选择自定义提醒时才校验
        if (formData.remindOption === 3) {
          if (!formData.remindTime) {
            callback(new Error(t('task.selectReminderTime')))
            return
          }
          // 验证提醒时间不能小于当前时间
          const selectedTime = new Date(formData.remindTime).getTime()
          const now = Date.now()
          if (selectedTime < now) {
            callback(new Error(t('task.remindTimeCannotBeInPast')))
            return
          }
          // 验证提醒时间不能超过截止时间
          if (formData.deadLine) {
            const deadline = new Date(formData.deadLine).getTime()
            if (selectedTime >= deadline) {
              callback(new Error(t('task.remindTimeExceedsDeadline')))
              return
            }
          }
        }
        callback()
      },
      trigger: 'change'
    }
  ]
}

// 初始化默认截止时间（第二天18:00:00）
const initDefaultDeadline = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(18, 0, 0, 0)
  formData.deadLine = formatDate(tomorrow)
}

// 格式化日期为 YYYY-MM-DD HH:mm:ss
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 初始化默认执行人（当前用户）
const initDefaultAssignee = () => {
  if (userStore.userId) {
    formData.todoUsers = [{
      umId: userStore.userId,
      name: userStore.userName
    }]
  }
}

// 禁用过去的日期
const disabledDate = (time) => {
  // 禁用昨天及之前的日期（保留今天可选）
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(23, 59, 59, 999)
  return time.getTime() <= yesterday.getTime()
}

// 禁用超过截止时间的提醒时间
const disabledReminderDate = (time) => {
  // 禁用昨天及之前的日期（保留今天可选）
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(23, 59, 59, 999)
  if (time.getTime() <= yesterday.getTime()) {
    return true
  }
  
  // 如果有截止时间，禁用超过截止时间的日期
  if (formData.deadLine) {
    const deadline = new Date(formData.deadLine).getTime()
    return time.getTime() >= deadline
  }
  
  return false
}

// 打开选人弹窗
const handleOpenUserSelector = async () => {
  console.log(formData.todoUsers)
  const selectusers = await openMemberSelect({
    title: '选择执行人',
    seleteds: toRaw(formData.todoUsers),
    limit: 10,
    type: 'person'
  })
  
  if (selectusers && selectusers.length >= 0) {
    // SDK 返回完整的用户信息，直接转换为需要的格式
    formData.todoUsers = selectusers.map(user => ({
      umId: user.umId,
      name: user.umName || user.userName || user.displayName,
      // icon: user.icon || user.iconUrl
    }))
  }
}

// 移除用户
const removeUser = (umId) => {
  const index = formData.todoUsers.findIndex(user => user.umId === umId)
  if (index > -1) {
    formData.todoUsers.splice(index, 1)
  }
}

// 监听提醒选项变化
watch(() => formData.remindOption, (newVal) => {
  if (newVal !== 3) {
    formData.remindTime = ''
  }
})

// 监听弹窗打开
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 弹窗打开时初始化默认值
    initDefaultDeadline()
    initDefaultAssignee()
    
    // 如果是快速创建模式且没有执行人，添加默认执行人
    if (createMode.value === 'quick' && selectedExecutors.value.length === 0) {
      initDefaultExecutors()
    }
    
    // 根据props.showQuickCreate设置快速创建功能
    // showQuickCreate.value = props.showQuickCreate
    
    // 默认使用表单模式
    // createMode.value = 'form'
  }
})

// 初始化默认执行人（快速创建模式）
const initDefaultExecutors = () => {
  if (userStore.userId && userStore.userName) {
    selectedExecutors.value = [{
      umId: userStore.userId,
      name: userStore.userName,
      realname: userStore.userName,
      showReplacePopover: false
    }]
    console.log('[CreateTaskDialog] Initialized default executors:', selectedExecutors.value)
  }
}

// 组件挂载时初始化
onMounted(() => {
  if (props.modelValue) {
    initDefaultDeadline()
    initDefaultAssignee()
    
    // 如果是快速创建模式，初始化默认执行人
    if (createMode.value === 'quick') {
      initDefaultExecutors()
    }
  }
  
  // 初始化语音识别
  initSpeechRecognition()
  
  // 加载用户列表
  loadUserList()
})

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
  formData.content = ''
  formData.remindOption = 1
  formData.remindTime = ''
  showAdvancedOptions.value = false
  
  // 重置快速创建相关
  quickInput.value = ''
  showAIResponse.value = false
  isAnalyzing.value = false
  extractedData.value = null
  showAssigneePopover.value = false
  showPriorityPopover.value = false
  showDatePopover.value = false
  selectedExecutors.value = []
  executorOptions.value = {}
  replacingExecutor.value = null
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    formRef.value?.validate().then(async valid => {
      if(valid) {
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

        // 添加可选字段
        if (formData.content) {
          requestData.content = formData.content
        }

        if (formData.remindOption !== undefined) {
          requestData.remindOption = formData.remindOption
        }

        // 如果选择自定义提醒，添加自定义时间
        if (formData.remindOption === 3 && formData.remindTime) {
          requestData.remindTime = formData.remindTime
        }

        // 如果是团队任务，添加额外字段
        if (isTeamTask.value) {
          requestData.projectId = formData.projectId || undefined
          requestData.visibility = formData.visibility
        }

        // 调用接口
        const response = await todoApi.addTodo(requestData)
        isSubmitting.value = false
        if (response.code === '200') {
          ElMessage.success(t('task.createSuccess'))
          emit('task-created', response.body) // 返回新创建的任务ID
          handleClose()
        } else {
          ElMessage.error(response.message || t('task.createFailed'))
        }
      }
    })

    
  } catch (error) {
    console.error('Create task error:', error)
    ElMessage.error(t('task.createFailed'))
  } finally {
    isSubmitting.value = false
  }
}

// ============ 快速创建相关方法 ============

// 切换创建模式
const switchMode = (mode) => {
  createMode.value = mode
  
  // 如果从快速创建切换到表单创建，且有提取的数据，回填到表单
  if (mode === 'form' && extractedData.value) {
    fillFormDataFromExtracted()
  }
  
  // 如果切换到快速创建模式，但快速创建功能未启用，则切换到表单模式
  if (mode === 'quick' && !showQuickCreate.value) {
    createMode.value = 'form'
  }
}

// 初始化语音识别
const initSpeechRecognition = () => {
  // 检查浏览器是否支持语音识别
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  
  if (SpeechRecognition) {
    isSpeechSupported.value = true
    recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      // 将识别的文本追加到快速创建文本框中
      quickInput.value = quickInput.value ? quickInput.value + transcript : transcript
      isRecording.value = false
    }
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      isRecording.value = false
      ElMessage.error(t('task.voiceInputError'))
    }
    
    recognition.onend = () => {
      isRecording.value = false
    }
  } else {
    console.warn('Speech recognition not supported')
  }
}

// 切换语音输入
const toggleVoice = () => {
  if (!isSpeechSupported.value) {
    ElMessage.warning(t('task.voiceNotSupported'))
    return
  }
  
  if (isRecording.value) {
    // 停止录音
    recognition.stop()
    isRecording.value = false
  } else {
    // 开始录音
    recognition.start()
    isRecording.value = true
  }
}

// AI提取任务信息
const extractTaskInfo = async () => {
  const inputText = quickInput.value.trim()

  if (!inputText) {
    ElMessage.warning(t('task.inputRequired'))
    return
  }

  showAIResponse.value = true
  isAnalyzing.value = true
  extractedData.value = null
  executorOptions.value = {}

  try {
    // 生成当前时间
    const currentData = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')

    // 构建提示词
    const prompt = `### 你是一个专业的任务管理助手，请根据以下对话内容，精准提取其中的待办事项信息。请严格按照以下要求处理：

1. 仅从文本中提取明确提及的待办事项，不得臆测或补充；
2. 每个待办事项必须包含以下字段，字段值必须为字符串或空字符串（''）：
    - "title"：待办标题（简洁、明确，概括任务核心）
    - "description"：待办描述（对任务的详细说明，可包含背景、要求、注意事项等）
    - "dead_line"：任务截止时间（格式：YYYY-MM-DD HH:mm，若未提及则留空）
    - "executor"：任务执行人，如果识别到有多个用英文逗号隔开，示例：李彪,陈鹏
3. 时间提取规则：
    - 当前时间日期是：'${currentData}';
    - 若对话中提到'明天''后天''下周'等模糊时间，需根据当前日期推算出具体日期；
    - 若仅提'今天'或'立即'，则开始时间设为当前时间，时间格式'yyyy-MM-dd hh:mm:ss'；
    - 若时间不完整（如只提'10月15日'），则按'YYYY-10-15 00:00'格式补全，但保留原始信息；
    - 若无任何时间信息，"dead_line" 默认为当前时间加1天，年份使用当前年份；
4. 责任人匹配规则：
    - 仅当文本中明确提到'XXX负责''XXX处理''XXX要完成'等语义时，才可提取；
    - 不允许自行补全或推测姓名；
    - 如果提到了多个人，用英文逗号隔开，示例：李彪,陈鹏；
5. 输出格式必须为标准 JSON 字符串，不允许有其他信息，不允许使用其他格式，每个待办事项为一个对象，字段顺序如下：
   \`\`\`json
   {
     'title': '',
     'description': '',
     'dead_line': '',
     'executor': '',
   }
   \`\`\`
6. 如果对话中没有可提取的待办事项，请返回空对象：{}`

    // 调用AI提取接口
    const response = await aiApi.extractTodoTask({
      msgContent: inputText,
      modelName: 'pagpt',
      prompt: prompt
    })

    if (response.code === 200 && response.data) {
      // 解析返回的JSON数据
      const data = JSON.parse(response.data)

      // 构建提取数据
      extractedData.value = {
        title: data.title || '',
        description: data.description || '',
        deadLine: data.dead_line || '',
        assigneeName: '',
        assigneeId: null,
        priority: 2, // 默认中优先级
        isImportant: false
      }

      // 处理执行人信息
      if (data.executor) {
        // 解析执行人列表（逗号分隔）
        const executorNames = data.executor.split(',').map(name => name.trim())

        // 构建执行人选项（按姓名分组）
        executorOptions.value = {}
        selectedExecutors.value = []

        // 遍历执行人名称，从返回的数据中获取对应的员工信息
        executorNames.forEach(name => {
          if (data[name] && Array.isArray(data[name]) && data[name].length > 0) {
            // 将所有员工信息添加到选项中
            executorOptions.value[name] = data[name]
            
            // 取第一个作为默认选中的执行人
            const firstUser = data[name][0]
            selectedExecutors.value.push({
              umId: firstUser.umId,
              name: firstUser.realname || firstUser.name,
              realname: firstUser.realname || firstUser.name,
              showReplacePopover: false // 添加弹窗显示状态
            })
          }
        })

        // 如果有多个执行人，显示第一个
        if (executorNames.length > 0) {
          extractedData.value.assigneeName = executorNames[0]
        }
      }

      ElMessage.success('AI提取成功！')
    } else {
      ElMessage.error(response.message || 'AI提取失败')
    }
  } catch (error) {
    console.error('AI analysis error:', error)
    ElMessage.error('AI提取失败，请重试')
  } finally {
    isAnalyzing.value = false
  }
}

// 模拟AI分析（待替换为真实接口）
const simulateAIAnalysis = async (inputText) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 简单解析输入文本
      const data = {
        title: inputText.split(/[，,。；;]/)[0] || inputText.substring(0, 20),
        assigneeName: '',
        assigneeId: null,
        priority: 2, // 默认中优先级
        deadLine: '',
        isImportant: false,
        aiPlanning: generateAIPlanning(inputText)
      }
      
      // 尝试提取执行人
      const assigneeMatch = inputText.match(/([张李王刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎葛薛庞][\u4e00-\u9fa5]{1,2})/g)
      if (assigneeMatch) {
        data.assigneeName = assigneeMatch[0]
      }
      
      // 尝试提取截止时间
      const dateMatch = inputText.match(/(\d{4}[-年]\d{1,2}[-月]\d{1,2}[日]?\s*\d{1,2}[:点]\d{1,2})/)
      if (dateMatch) {
        data.deadLine = formatDateForAPI(new Date(dateMatch[1].replace(/年|月|日|点/g, match => {
          return match === '年' ? '-' : match === '月' ? '-' : match === '日' ? '' : ':'
        })))
      } else {
        // 默认一周后
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        nextWeek.setHours(18, 0, 0)
        data.deadLine = formatDateForAPI(nextWeek)
      }
      
      // 尝试提取优先级
      if (inputText.includes('紧急') || inputText.includes('urgent')) {
        data.priority = 3
      } else if (inputText.includes('高') || inputText.includes('important')) {
        data.priority = 1
      }
      
      // 尝试提取重要标记
      if (inputText.includes('重要') || inputText.includes('star')) {
        data.isImportant = true
      }
      
      extractedData.value = data
      resolve()
    }, 1500)
  })
}

// 生成AI规划内容
const generateAIPlanning = (inputText) => {
  return `
    <div class="planning-section">
      <h4>任务分解</h4>
      <ul>
        <li>明确任务目标和范围</li>
        <li>制定详细的执行计划</li>
        <li>设置关键里程碑节点</li>
        <li>定期检查进度和调整</li>
      </ul>
    </div>
    <div class="planning-section">
      <h4>执行建议</h4>
      <ul>
        <li>建议先与相关人员沟通确认需求</li>
        <li>合理分配时间，避免过度承诺</li>
        <li>及时记录问题和解决方案</li>
        <li>保持团队沟通，确保信息同步</li>
      </ul>
    </div>
  `
}

// 格式化日期为API格式
const formatDateForAPI = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化显示日期
const formatDisplayDate = (dateString) => {
  if (!dateString) return t('task.selectDeadline')
  
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}年${month}月${day}日 ${hours}:${minutes}`
}

// 编辑字段
const editField = (field) => {
  switch (field) {
    case 'title':
      const newTitle = prompt(t('task.enterTitle'), extractedData.value.title)
      if (newTitle) {
        extractedData.value.title = newTitle
      }
      break
  }
}

// 选择执行人
const selectAssignee = (user) => {
  extractedData.value.assigneeName = user.realname || user.name
  extractedData.value.assigneeId = user.umId
  showAssigneePopover.value = false
}

// 判断执行人是否已选中
const isExecutorSelected = (umId) => {
  return selectedExecutors.value.some(user => user.umId === umId)
}

// 点击执行人头像，弹出替换弹窗
const handleExecutorClick = (user) => {
  console.log('[CreateTaskDialog] Executor clicked:', user)
  console.log('[CreateTaskDialog] Current executorOptions:', executorOptions.value)
  console.log('[CreateTaskDialog] Current selectedExecutors:', selectedExecutors.value)
  
  replacingExecutor.value = user
  
  // 先关闭所有其他弹窗
  selectedExecutors.value.forEach(exec => {
    exec.showReplacePopover = false
  })
  
  // 使用 nextTick 确保响应式更新
  nextTick(() => {
    // 找到对应的用户并设置弹窗状态
    const targetUser = selectedExecutors.value.find(u => u.umId === user.umId)
    if (targetUser) {
      targetUser.showReplacePopover = true
      console.log('[CreateTaskDialog] Popover should show for:', targetUser.name)
      console.log('[CreateTaskDialog] Available options:', currentExecutorOptions.value)
    } else {
      console.warn('[CreateTaskDialog] Target user not found in selectedExecutors')
    }
  })
}

// 替换执行人
const replaceExecutor = (newUser) => {
  if (!replacingExecutor.value) return
  
  const index = selectedExecutors.value.findIndex(u => u.umId === replacingExecutor.value.umId)
  if (index > -1) {
    selectedExecutors.value[index] = {
      umId: newUser.umId,
      name: newUser.realname || newUser.name,
      realname: newUser.realname || newUser.name,
      showReplacePopover: false // 关闭该用户的替换弹窗
    }
  }
  
  // 关闭所有执行人的替换弹窗
  selectedExecutors.value.forEach(exec => {
    exec.showReplacePopover = false
  })
  
  replacingExecutor.value = null
}

// 切换执行人选中状态
const toggleExecutor = (user) => {
  const index = selectedExecutors.value.findIndex(u => u.umId === user.umId)
  if (index > -1) {
    selectedExecutors.value.splice(index, 1)
  } else {
    selectedExecutors.value.push({
      umId: user.umId,
      name: user.realname || user.name,
      realname: user.realname || user.name,
      showReplacePopover: false // 添加弹窗显示状态
    })
  }
}

// 移除执行人
const removeExecutor = (umId) => {
  const index = selectedExecutors.value.findIndex(user => user.umId === umId)
  if (index > -1) {
    selectedExecutors.value.splice(index, 1)
  }
}

// 选择优先级
const selectPriority = (priority) => {
  extractedData.value.priority = priority
  showPriorityPopover.value = false
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const option = TASK_PRIORITY_OPTIONS.find(opt => opt.value === priority)
  return option ? option.type : ''
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const option = TASK_PRIORITY_OPTIONS.find(opt => opt.value === priority)
  return option ? option.label : ''
}

// 从提取数据填充表单
const fillFormDataFromExtracted = () => {
  if (!extractedData.value) return

  formData.title = extractedData.value.title
  formData.priority = extractedData.value.priority
  formData.deadLine = extractedData.value.deadLine
  formData.isImportant = extractedData.value.isImportant

  // 如果有描述，填充到content字段
  if (extractedData.value.description) {
    formData.content = extractedData.value.description
  }

  // 填充执行人列表（支持多个执行人）
  if (selectedExecutors.value.length > 0) {
    formData.todoUsers = selectedExecutors.value.map(user => ({
      umId: user.umId,
      name: user.name
    }))
  }
}

// 快速创建提交
const handleQuickSubmit = async () => {
  if (!extractedData.value) {
    ElMessage.warning(t('task.extractFirst'))
    return
  }
  
  if (!extractedData.value.title) {
    ElMessage.warning(t('task.titleRequired'))
    return
  }
  
  // 切换到表单模式并填充数据
  switchMode('form')
  
  // 自动提交
  await nextTick()
  handleSubmit()
}

// 加载用户列表
const loadUserList = async () => {
  try {
    // TODO: 从API获取用户列表
    // const response = await todoApi.getUserList()
    // allUsers.value = response.body
    
    // 模拟用户数据
    allUsers.value = [
      { umId: '10001', name: '张三' },
      { umId: '10002', name: '李四' },
      { umId: '10003', name: '王五' },
      { umId: '10004', name: '赵六' },
      { umId: '10005', name: '张三丰' },
      { umId: '10006', name: '李四光' }
    ]
  } catch (error) {
    console.error('Load user list error:', error)
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

  // 高级选项样式
  .advanced-options-wrapper {
    width: 100%;
  }

  .advanced-options {
    width: 100%;

    .advanced-options-header {
      display: flex;
      align-items: center;
      padding: $spacing-sm 0;
      cursor: pointer;
      user-select: none;
      transition: all 0.3s;

      &:hover {
        .advanced-options-title {
          color: $primary-color;
        }
      }

      .advanced-options-title {
        font-size: $font-size-base;
        color: $text-regular;
        font-weight: 500;
        transition: color 0.3s;
      }

      .toggle-icon {
        font-size: 16px;
        color: $text-secondary;
        margin-left: $spacing-xs;
        transition: transform 0.3s;

        &.is-expanded {
          transform: rotate(180deg);
        }
      }
    }

    .advanced-options-content {
      padding-top: $spacing-md;

      .advanced-form-item {
        margin-bottom: $spacing-lg;

        &:last-child {
          margin-bottom: 0;
        }

        .reminder-options {
          display: flex;
          flex-direction: column;
          gap: $spacing-sm;

          :deep(.el-radio-group) {
            display: flex;
            flex-wrap: wrap;
            gap: $spacing-md;

            .el-radio {
              margin-right: 0;
              margin-bottom: 0;
            }
          }

          .custom-time-picker {
            margin-top: $spacing-sm;
            width: 100%;
          }
        }
      }
    }
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

      .mode-switch {
        .mode-btn {
          padding: 6px 10px;
          font-size: 13px;
        }
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

    // 快速创建移动端样式
    .quick-create-container {
      .input-wrapper {
        .quick-input {
          :deep(.el-textarea__inner) {
            font-size: 14px;
          }
        }

        .voice-btn {
          right: 60px;
          bottom: 8px;
          width: 36px;
          height: 36px;
        }
      }

      .extract-btn {
        right: 8px;
        bottom: 8px;
        width: 40px;
        height: 40px;
      }

      .task-info-grid {
        grid-template-columns: 1fr;
      }

      .task-info-item.full-width {
        grid-column: span 1;
      }
    }
  }
}

// ============ 快速创建样式 ============
.quick-create-container {
  padding: 0;

  .input-section {
    position: relative;
    margin-bottom: $spacing-xxl;

    .input-wrapper {
      position: relative;
      background: $bg-page;
      border-radius: $border-radius-large;
      border: 2px solid $primary-color;
      transition: all 0.3s ease;

      &:focus-within {
        border-color: var(--el-color-primary-light-3);
        box-shadow: 0 0 0 3px rgba(var(--el-color-primary-rgb), 0.1);
      }

      .quick-input {
        :deep(.el-textarea__inner) {
          border: none;
          background: transparent;
          box-shadow: none;
          padding: 16px 60px 16px 16px;
          font-size: 15px;
          line-height: 1.6;
          resize: none;
        }
      }

      .voice-btn {
        position: absolute;
        right: 80px;
        bottom: 12px;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: rgba(var(--el-color-primary-rgb), 0.1);
        color: var(--el-color-primary);
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: rgba(var(--el-color-primary-rgb), 0.2);
        }

        &.recording {
          background: var(--el-color-danger);
          color: white;
          animation: recording 1.5s infinite;
        }
      }

      @keyframes recording {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(var(--el-color-danger-rgb), 0.7);
        }
        50% {
          box-shadow: 0 0 0 20px rgba(var(--el-color-danger-rgb), 0);
        }
      }
    }

    .extract-btn {
      position: absolute;
      right: 12px;
      bottom: 12px;
      width: 46px;
      height: 46px;
      border: none;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
      color: white;
      cursor: pointer;
      font-size: 22px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.4);

      &:hover:not(:disabled) {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(var(--el-color-primary-rgb), 0.5);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }

  .ai-response-section {
    margin-top: 20px;
    animation: slideUp 0.5s ease;

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .ai-response-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;

      .ai-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
      }

      .ai-response-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .ai-typing {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: 12px;

        span {
          width: 6px;
          height: 6px;
          background: var(--el-color-primary);
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        span:nth-child(2) {
          animation-delay: 0.2s;
        }

        span:nth-child(3) {
          animation-delay: 0.4s;
        }
      }

      @keyframes typing {
        0%, 100% {
          opacity: 0.3;
          transform: scale(0.8);
        }
        50% {
          opacity: 1;
          transform: scale(1);
        }
      }
    }

    .extracted-content {
      .task-info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 16px;

        .task-info-item {
          opacity: 0;
          animation: fadeInUp 0.4s ease forwards;

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          &:nth-child(1) { animation-delay: 0.05s; }
          &:nth-child(2) { animation-delay: 0.1s; }
          &:nth-child(3) { animation-delay: 0.15s; }
          &:nth-child(4) { animation-delay: 0.2s; }
          &:nth-child(5) { animation-delay: 0.25s; }

          &.full-width {
            grid-column: span 2;
          }

          .task-info-label {
            font-size: 12px;
            color: var(--el-color-primary);
            margin-bottom: 4px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .task-info-value {
            font-size: 13px;
            color: var(--el-text-color-primary);
            font-weight: 500;
            padding: 10px 12px;
            background: white;
            border-radius: 8px;
            border: 2px solid rgba(var(--el-color-primary-rgb), 0.2);
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
            min-height: 40px;

            &:hover {
              border-color: var(--el-color-primary);
              box-shadow: 0 3px 12px rgba(var(--el-color-primary-rgb), 0.15);
              transform: translateY(-1px);
            }

            .value {
              flex: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .edit-icon {
              color: var(--el-text-color-placeholder);
              font-size: 12px;
              transition: all 0.3s ease;
              flex-shrink: 0;
            }

            &:hover .edit-icon {
              color: var(--el-color-primary);
            }
          }
        }
      }

      .ai-planning-section {
        background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb), 0.05) 0%, rgba(var(--el-color-primary-light-3-rgb), 0.05) 100%);
        border-radius: 12px;
        padding: 16px;
        margin-top: 16px;
        border: 2px solid rgba(var(--el-color-primary-rgb), 0.1);
        animation: fadeInUp 0.5s ease 0.6s forwards;

        .planning-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--el-color-primary);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .planning-content {
          font-size: 13px;
          color: var(--el-text-color-regular);
          line-height: 1.6;

          .planning-section {
            margin-bottom: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            h4 {
              font-size: 13px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              margin-bottom: 8px;
            }

            ul {
              margin: 0;
              padding-left: 20px;

              li {
                margin-bottom: 4px;
                line-height: 1.5;
              }
            }
          }
        }
      }
    }

    .create-btn {
      width: 100%;
      margin-top: 16px;
      padding: 14px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
    }
  }
}

// 模式切换样式
.mode-switch {
  display: flex;
  gap: 8px;
  background: rgba(var(--el-color-primary-rgb), 0.1);
  padding: 4px;
  border-radius: 12px;

  .mode-btn {
    padding: 7px 14px;
    border: none;
    background: transparent;
    color: var(--el-color-primary);
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
      background: rgba(var(--el-color-primary-rgb), 0.1);
    }

    &.active {
      background: white;
      color: var(--el-color-primary);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

// 执行人列表样式
.assignee-list {
  max-height: 300px;
  overflow-y: auto;

  .no-executor-tip {
    padding: 20px;
    text-align: center;
    color: var(--el-text-color-placeholder);
    font-size: 14px;
  }

  .assignee-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    margin-bottom: 8px;

    &:hover {
      background: #fff5f0;
      border-color: var(--el-color-warning);
    }

    &.selected {
      background: #fff5f0;
      border-color: var(--el-color-warning);
    }

    .assignee-info {
      flex: 1;

      .assignee-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .assignee-id {
        font-size: 12px;
        color: var(--el-text-color-placeholder);
      }

      .assignee-title {
        font-size: 11px;
        color: var(--el-text-color-secondary);
        background: rgba(var(--el-color-primary-rgb), 0.1);
        padding: 2px 6px;
        border-radius: 3px;
        margin-top: 4px;
        display: inline-block;
      }

      .assignee-dept {
        font-size: 11px;
        color: var(--el-text-color-placeholder);
        margin-top: 2px;
      }
    }

    .check-icon {
      color: var(--el-color-success);
      font-size: 16px;
    }
  }
}

// 优先级列表样式
.priority-list {
  .priority-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: #f8f9fa;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    margin-bottom: 8px;

    &:hover {
      background: #f0f9ff;
      border-color: var(--el-color-primary);
    }

    &.selected {
      background: #f0f9ff;
      border-color: var(--el-color-primary);
    }

    .check-icon {
      color: var(--el-color-success);
      font-size: 16px;
    }
  }
}

// 日期选择器样式
.date-picker-content {
  .date-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }
}

// 执行人区域样式
.executor-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);

  .executor-label {
    font-size: 12px;
    color: var(--el-color-primary);
    margin-bottom: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

// 执行人容器样式（复用表单创建样式）
.assignee-container {
  width: 100%;
  min-height: 40px;

  .user-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .user-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background: rgba(var(--el-color-primary-rgb), 0.1);
      border-radius: 16px;
      transition: all 0.3s ease;
      border: 1px solid rgba(var(--el-color-primary-rgb), 0.2);
      cursor: pointer;

      &:hover {
        background: rgba(var(--el-color-primary-rgb), 0.15);
        border-color: var(--el-color-primary);
        transform: translateY(-1px);
      }

      .user-avatar {
        flex-shrink: 0;
      }

      .user-name {
        font-size: 13px;
        color: var(--el-text-color-primary);
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .remove-icon {
        font-size: 12px;
        color: var(--el-text-color-placeholder);
        cursor: pointer;
        transition: all 0.3s ease;
        flex-shrink: 0;

        &:hover {
          color: var(--el-color-danger);
          transform: scale(1.2);
        }
      }
    }

    .add-user-btn {
      width: 32px;
      height: 32px;
      background: rgba(var(--el-color-primary-rgb), 0.1);
      border: 1px dashed var(--el-color-primary);
      color: var(--el-color-primary);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(var(--el-color-primary-rgb), 0.2);
        border-color: var(--el-color-primary-light-3);
        transform: scale(1.05);
      }
    }
  }
}
</style>
<!-- 全局弹窗样式（不使用 scoped） -->
<style lang="scss">
.executor-replace-popover {
  z-index: 9999 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 8px !important;
  
  .assignee-list {
    max-height: 300px;
    overflow-y: auto;

    .no-executor-tip {
      padding: 20px;
      text-align: center;
      color: var(--el-text-color-placeholder);
      font-size: 14px;
    }

    .assignee-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      margin-bottom: 8px;

      &:hover {
        background: #fff5f0;
        border-color: var(--el-color-warning);
      }

      &.selected {
        background: #fff5f0;
        border-color: var(--el-color-warning);
      }

      .assignee-info {
        flex: 1;

        .assignee-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .assignee-id {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
        }

        .assignee-title {
          font-size: 11px;
          color: var(--el-text-color-secondary);
          background: rgba(var(--el-color-primary-rgb), 0.1);
          padding: 2px 6px;
          border-radius: 3px;
          margin-top: 4px;
          display: inline-block;
        }

        .assignee-dept {
          font-size: 11px;
          color: var(--el-text-color-placeholder);
          margin-top: 2px;
        }
      }

      .check-icon {
        color: var(--el-color-success);
        font-size: 16px;
      }
    }
  }
}

.priority-select-popover {
  z-index: 9999 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 8px !important;
  
  .priority-list {
    .priority-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: #f8f9fa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      margin-bottom: 8px;

      &:hover {
        background: #f0f9ff;
        border-color: var(--el-color-primary);
      }

      &.selected {
        background: #f0f9ff;
        border-color: var(--el-color-primary);
      }

      .check-icon {
        color: var(--el-color-success);
        font-size: 16px;
      }
    }
  }
}

.date-select-popover {
  z-index: 9999 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 8px !important;
  
  .date-picker-content {
    .date-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 12px;
    }
  }
}

/* 修复弹窗在对话框中的定位问题 */
.el-dialog .el-popper {
  z-index: 9999 !important;
}

/* 确保弹窗内容不被遮挡 */
.el-popper.is-pure {
  padding: 12px !important;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .executor-replace-popover,
  .priority-select-popover,
  .date-select-popover {
    max-width: 90vw !important;
    margin: 0 5vw !important;
  }
}
</style>