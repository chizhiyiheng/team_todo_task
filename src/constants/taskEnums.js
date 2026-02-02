/**
 * Task Status Enums
 * 任务状态枚举
 * 根据接口文档：0-待接收 1-待处理 2-已完成 3-进行中 4-已逾期 5-已取消 6-已删除
 */
export const TASK_STATUS = {
  TO_RECEIVE: 0,   // 待接收
  PENDING: 1,      // 待处理
  COMPLETED: 2,    // 已完成
  IN_PROGRESS: 3,  // 进行中
  OVERDUE: 4,      // 已逾期
  CANCELLED: 5,    // 已取消
  DELETED: 6       // 已删除
}

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.TO_RECEIVE, label: '待接收', type: 'info' },
  { value: TASK_STATUS.PENDING, label: '待处理', type: 'warning' },
  { value: TASK_STATUS.COMPLETED, label: '已完成', type: 'success' },
  { value: TASK_STATUS.IN_PROGRESS, label: '进行中', type: 'primary' },
  { value: TASK_STATUS.OVERDUE, label: '已逾期', type: 'danger' },
  { value: TASK_STATUS.CANCELLED, label: '已取消', type: 'info' },
  { value: TASK_STATUS.DELETED, label: '已删除', type: 'danger' }
]

// 正常状态（非删除状态）
export const NORMAL_STATUS_LIST = [
  TASK_STATUS.TO_RECEIVE,
  TASK_STATUS.PENDING,
  TASK_STATUS.COMPLETED,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.OVERDUE,
  TASK_STATUS.CANCELLED
]

/**
 * Task Priority Enums
 * 任务优先级枚举
 */
export const TASK_PRIORITY = {
  LOW: 1,      // 低
  MEDIUM: 2,   // 中
  HIGH: 3      // 高
}

export const TASK_PRIORITY_OPTIONS = [
  { value: TASK_PRIORITY.LOW, label: '低', color: '#909399' },
  { value: TASK_PRIORITY.MEDIUM, label: '中', color: '#E6A23C' },
  { value: TASK_PRIORITY.HIGH, label: '高', color: '#F56C6C' }
]

/**
 * Get status label by value
 * @param {number} status - Status value
 * @returns {string} Status label
 */
export function getStatusLabel(status) {
  const option = TASK_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.label || '-'
}

/**
 * Get status type by value
 * @param {number} status - Status value
 * @returns {string} Status type (for tag styling)
 */
export function getStatusType(status) {
  const option = TASK_STATUS_OPTIONS.find(opt => opt.value === status)
  return option?.type || 'info'
}

/**
 * Get priority label by value
 * @param {number} priority - Priority value
 * @returns {string} Priority label
 */
export function getPriorityLabel(priority) {
  const option = TASK_PRIORITY_OPTIONS.find(opt => opt.value === priority)
  return option?.label || '-'
}

/**
 * Get priority color by value
 * @param {number} priority - Priority value
 * @returns {string} Priority color
 */
export function getPriorityColor(priority) {
  const option = TASK_PRIORITY_OPTIONS.find(opt => opt.value === priority)
  return option?.color || '#909399'
}

/**
 * Task Reminder Enums
 * 任务提醒枚举
 */
export const TASK_REMINDER = {
  NONE: 0,        // 不提醒
  BEFORE_15_MIN: 1,  // 提前15分钟
  BEFORE_1_HOUR: 2,  // 提前1小时
  CUSTOM: 3       // 自定义
}

/**
 * Task Reminder Options
 * 任务提醒选项配置
 */
export const TASK_REMINDER_OPTIONS = [
  { value: TASK_REMINDER.NONE, label: 'task.reminderNone' },
  { value: TASK_REMINDER.BEFORE_15_MIN, label: 'task.reminder15Min' },
  { value: TASK_REMINDER.BEFORE_1_HOUR, label: 'task.reminder1Hour' },
  { value: TASK_REMINDER.CUSTOM, label: 'task.reminderCustom' }
]

/**
 * Get reminder label by value
 * @param {number} remindOption - Reminder option value
 * @param {Function} t - Translation function
 * @returns {string} Reminder label
 */
export function getReminderLabel(remindOption, t) {
  const option = TASK_REMINDER_OPTIONS.find(opt => opt.value === remindOption)
  return option ? t(option.label) : '-'
}