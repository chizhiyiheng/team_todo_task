/**
 * Task Status Enums
 * 任务状态枚举
 * 0-待处理 1-已完成 2-待接收 3-进行中 4-已逾期 5-已取消
 */
export const TASK_STATUS = {
  PENDING: 0,      // 待处理
  COMPLETED: 1,    // 已完成
  TO_RECEIVE: 2,   // 待接收
  IN_PROGRESS: 3,  // 进行中
  OVERDUE: 4,      // 已逾期
  CANCELLED: 5     // 已取消
}

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.TO_RECEIVE, label: '待接收', type: 'info' },
  { value: TASK_STATUS.PENDING, label: '待处理', type: 'warning' },
  { value: TASK_STATUS.IN_PROGRESS, label: '进行中', type: 'primary' },
  { value: TASK_STATUS.COMPLETED, label: '已完成', type: 'success' },
  { value: TASK_STATUS.OVERDUE, label: '已逾期', type: 'danger' },
  { value: TASK_STATUS.CANCELLED, label: '已取消', type: 'info' }
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
