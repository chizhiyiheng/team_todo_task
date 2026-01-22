/**
 * Mock Activity Log Data
 * 
 * 模拟操作日志数据
 */

/**
 * 生成模拟的操作日志数据
 * @param {string} todoId - 待办ID
 * @returns {Array} 操作日志列表
 */
export function generateMockActivityLogs(todoId) {
  const now = Date.now()
  
  return [
    {
      id: `LOG_${todoId}_1`,
      action: 'create',
      desc: '创建了任务',
      operator: '刘青红',
      time: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString() // 7天前
    },
    {
      id: `LOG_${todoId}_2`,
      action: 'update',
      desc: '修改了任务标题',
      operator: '张三',
      time: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() // 5天前
    },
    {
      id: `LOG_${todoId}_3`,
      action: 'assign',
      desc: '分配给了李四',
      operator: '刘青红',
      time: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString() // 4天前
    },
    {
      id: `LOG_${todoId}_4`,
      action: 'progress',
      desc: '更新了进度至 30%',
      operator: '李四',
      time: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
    },
    {
      id: `LOG_${todoId}_5`,
      action: 'comment',
      desc: '添加了备注：需要协调资源',
      operator: '王五',
      time: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString() // 2天前
    },
    {
      id: `LOG_${todoId}_6`,
      action: 'progress',
      desc: '更新了进度至 60%',
      operator: '李四',
      time: new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString() // 1天前
    },
    {
      id: `LOG_${todoId}_7`,
      action: 'attachment',
      desc: '上传了附件：设计文档.pdf',
      operator: '张三',
      time: new Date(now - 12 * 60 * 60 * 1000).toISOString() // 12小时前
    },
    {
      id: `LOG_${todoId}_8`,
      action: 'priority',
      desc: '将优先级调整为高',
      operator: '刘青红',
      time: new Date(now - 2 * 60 * 60 * 1000).toISOString() // 2小时前
    }
  ]
}

/**
 * 预定义的操作日志模板
 * 可用于生成不同类型的操作日志
 */
export const activityLogTemplates = {
  create: (operator) => `${operator} 创建了任务`,
  update: (operator, field) => `${operator} 修改了${field}`,
  assign: (operator, assignee) => `${operator} 分配给了${assignee}`,
  progress: (operator, percent) => `${operator} 更新了进度至 ${percent}%`,
  comment: (operator, comment) => `${operator} 添加了备注：${comment}`,
  attachment: (operator, fileName) => `${operator} 上传了附件：${fileName}`,
  priority: (operator, priority) => `${operator} 将优先级调整为${priority}`,
  status: (operator, status) => `${operator} 将状态修改为${status}`,
  deadline: (operator, deadline) => `${operator} 修改了截止时间为 ${deadline}`,
  delete: (operator) => `${operator} 删除了任务`
}

export default {
  generateMockActivityLogs,
  activityLogTemplates
}
