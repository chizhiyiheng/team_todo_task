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
import { OPERATION_TYPES } from '@/constants/oplogEnums'

/**
 * 生成模拟的操作日志数据
 * @param {string} todoId - 待办ID
 * @returns {Array} 操作日志列表
 */
export function generateMockActivityLogs(todoId) {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const oneHour = 60 * 60 * 1000

  // 模拟操作人
  const users = [
    { userId: 'LIUQINGHONG264', userName: '刘青红' },
    { userId: 'ZHANGSAN001', userName: '张三' },
    { userId: 'LISI002', userName: '李四' },
    { userId: 'WANGWU003', userName: '王五' }
  ]

  // 生成日志列表
  return [
    {
      id: `LOG_${todoId}_1`,
      todoId: todoId,
      userId: users[0].userId,
      userName: users[0].userName,
      operationType: OPERATION_TYPES.CREATE, // 0: 创建
      operationTime: new Date(now - 7 * oneDay).toISOString(), // 7天前
      operatorIp: '192.168.1.101',
      remark: '创建了任务',
      createdTime: new Date(now - 7 * oneDay).toISOString(),
      updatedTime: new Date(now - 7 * oneDay).toISOString(),
      createdBy: users[0].userId,
      updatedBy: users[0].userId
    },
    {
      id: `LOG_${todoId}_2`,
      todoId: todoId,
      userId: users[1].userId,
      userName: users[1].userName,
      operationType: OPERATION_TYPES.UPDATE, // 1: 修改
      operationTime: new Date(now - 5 * oneDay).toISOString(), // 5天前
      operatorIp: '192.168.1.102',
      remark: '修改了任务标题',
      createdTime: new Date(now - 5 * oneDay).toISOString(),
      updatedTime: new Date(now - 5 * oneDay).toISOString(),
      createdBy: users[1].userId,
      updatedBy: users[1].userId
    },
    {
      id: `LOG_${todoId}_3`,
      todoId: todoId,
      userId: users[0].userId,
      userName: users[0].userName,
      operationType: OPERATION_TYPES.ASSIGN, // 4: 分配
      operationTime: new Date(now - 4 * oneDay).toISOString(), // 4天前
      operatorIp: '192.168.1.101',
      remark: '分配给了李四',
      createdTime: new Date(now - 4 * oneDay).toISOString(),
      updatedTime: new Date(now - 4 * oneDay).toISOString(),
      createdBy: users[0].userId,
      updatedBy: users[0].userId
    },
    {
      id: `LOG_${todoId}_4`,
      todoId: todoId,
      userId: users[2].userId,
      userName: users[2].userName,
      operationType: OPERATION_TYPES.PROGRESS, // 6: 提交进度
      operationTime: new Date(now - 3 * oneDay).toISOString(), // 3天前
      operatorIp: '192.168.1.103',
      remark: '更新了进度至 30%',
      createdTime: new Date(now - 3 * oneDay).toISOString(),
      updatedTime: new Date(now - 3 * oneDay).toISOString(),
      createdBy: users[2].userId,
      updatedBy: users[2].userId
    },
    {
      id: `LOG_${todoId}_5`,
      todoId: todoId,
      userId: users[3].userId,
      userName: users[3].userName,
      operationType: OPERATION_TYPES.UPDATE, // 1: 修改 (这里用修改暂代备注，或者需要新增备注类型? 暂时归为修改或自定义)
      // 注意：用户要求的类型中没有明确的“备注”，但实际场景常见。既然给了枚举0-7，这里严谨点可以用REMIND或者UPDATE
      // 假设"添加了备注"属于UPDATE或者REMIND，这里暂时用REMIND(提醒)或者UPDATE(修改属性)
      // 检查需求：操作类型：0 创建 1 修改 2 完成 3 删除 4 分配 5 提醒 6 提交进度 7 取消
      // 备注可能算修改，或者暂且用 1 修改。
      operationType: OPERATION_TYPES.UPDATE,
      operationTime: new Date(now - 2 * oneDay).toISOString(), // 2天前
      operatorIp: '192.168.1.104',
      remark: '添加了备注：需要协调资源',
      createdTime: new Date(now - 2 * oneDay).toISOString(),
      updatedTime: new Date(now - 2 * oneDay).toISOString(),
      createdBy: users[3].userId,
      updatedBy: users[3].userId
    },
    {
      id: `LOG_${todoId}_6`,
      todoId: todoId,
      userId: users[2].userId,
      userName: users[2].userName,
      operationType: OPERATION_TYPES.PROGRESS, // 6: 提交进度
      operationTime: new Date(now - 1 * oneDay).toISOString(), // 1天前
      operatorIp: '192.168.1.103',
      remark: '更新了进度至 60%',
      createdTime: new Date(now - 1 * oneDay).toISOString(),
      updatedTime: new Date(now - 1 * oneDay).toISOString(),
      createdBy: users[2].userId,
      updatedBy: users[2].userId
    },
    {
      id: `LOG_${todoId}_7`,
      todoId: todoId,
      userId: users[0].userId,
      userName: users[0].userName,
      operationType: OPERATION_TYPES.UPDATE, // 1: 修改 (优先级调整)
      operationTime: new Date(now - 2 * oneHour).toISOString(), // 2小时前
      operatorIp: '192.168.1.101',
      remark: '将优先级调整为高',
      createdTime: new Date(now - 2 * oneHour).toISOString(),
      updatedTime: new Date(now - 2 * oneHour).toISOString(),
      createdBy: users[0].userId,
      updatedBy: users[0].userId
    }
  ]
}
