/**
 * useExecutorActions Hook
 * 
 * 管理执行人相关操作，包括：
 * - 更新执行人状态
 * - 更新执行人列表（统一处理增删）
 * - 权限检查
 * 
 * @param {Ref<Object>} taskDetail - 任务详情对象
 * @param {Function} emit - Vue emit 函数
 * @param {Function} t - i18n 翻译函数
 * @param {Function} refreshTask - 刷新任务详情的函数
 * @returns {Object} 执行人操作方法
 */

import { ElMessage } from 'element-plus'
import { todoApi } from '@/api/index.js'
import { TASK_STATUS } from '@/constants/taskEnums'

export function useExecutorActions(taskDetail, emit, t, refreshTask) {
    /**
     * 更新执行人状态
     * @param {string} umId - 执行人umId
     * @param {number} status - 新状态
     */
    async function updateExecutorStatus(umId, status) {
        if (!taskDetail.value) return false

        const oldTodoUsers = [...taskDetail.value.todoUsers]
        const executorIndex = taskDetail.value.todoUsers.findIndex(user => user.umId === umId)

        if (executorIndex === -1) {
            ElMessage.error('未找到该执行人')
            return false
        }

        const oldStatus = taskDetail.value.todoUsers[executorIndex].status

        // 乐观更新 UI
        taskDetail.value.todoUsers[executorIndex].status = status

        try {
            // 调用单独的更新执行人状态接口
            const response = await todoApi.updateExecutorStatus(
                taskDetail.value.id,
                umId,
                status
            )

            if (response.code === '200') {
                ElMessage.success(t('task.updateSuccess'))
                // 不需要 emit entire task-updated，因为我们只更新了状态，且后面会刷新
                // emit('task-updated', taskDetail.value) 

                // 成功后总是刷新任务详情，以确保数据一致性
                // 优化：仅当涉及到已完成状态变更时才刷新（已完成->其他 或 其他->已完成）
                const isStatusChangedInvolvingCompleted = oldStatus === TASK_STATUS.COMPLETED || status === TASK_STATUS.COMPLETED

                if (refreshTask && isStatusChangedInvolvingCompleted) {
                    await refreshTask(true) // true 表示静默刷新
                }

                return true
            } else {
                // 回滚失败
                taskDetail.value.todoUsers = oldTodoUsers
                ElMessage.error(response.message || t('task.operationFailed'))
                return false
            }
        } catch (error) {
            // 回滚错误
            taskDetail.value.todoUsers = oldTodoUsers
            ElMessage.error(t('task.operationFailed'))
            console.error('Update executor status error:', error)
            return false
        }
    }

    /**
     * 更新执行人列表（统一处理增删）
     * @param {Array<string>} newUmIds - 新的执行人umId数组
     * @param {Array<Object>} availableUsers - 可用用户列表
     */
    async function updateTodoUsers(newUmIds, availableUsers) {
        if (!taskDetail.value) return false

        // 构造新的todoUsers数组
        // 对于已存在的执行人，保留其原有的所有字段（包括status等）
        // 对于新增的执行人，只设置umId和name，不设置status（后端会给默认值）
        const newTodoUsers = newUmIds.map(umId => {
            // 查找是否是已存在的执行人
            const existingUser = taskDetail.value.todoUsers.find(user => user.umId === umId)

            if (existingUser) {
                // 已存在的执行人，保留原有字段
                return existingUser
            } else {
                // 新增的执行人，只设置基本信息
                const user = availableUsers.find(u => u.umId === umId)
                return {
                    umId: umId,
                    name: user?.name || ''
                    // 不设置status，让后端给默认值
                }
            }
        })

        // 移除乐观更新，等待接口成功后再刷新
        // taskDetail.value.todoUsers = newTodoUsers

        try {
            const response = await todoApi.updateTodo({
                id: taskDetail.value.id,
                umId: taskDetail.value.umId,
                name: taskDetail.value.name,
                title: taskDetail.value.title,
                todoUsers: newTodoUsers.map(user => {
                    // 对于已存在的用户，传递所有字段
                    // 对于新增的用户，只传递umId和name
                    if (user.status !== undefined) {
                        return {
                            umId: user.umId,
                            name: user.name,
                            status: user.status
                        }
                    } else {
                        return {
                            umId: user.umId,
                            name: user.name
                        }
                    }
                })
            })

            if (response.code === '200') {
                ElMessage.success('更新执行人成功')
                emit('task-updated', taskDetail.value)

                // 刷新任务详情以获取后端分配的默认状态
                if (refreshTask) {
                    await refreshTask(true)
                }

                return true
            } else {
                ElMessage.error(response.message || t('task.operationFailed'))
                return false
            }
        } catch (error) {
            ElMessage.error(t('task.operationFailed'))
            console.error('Update todo users error:', error)
            return false
        }
    }

    /**
     * 检查当前用户是否可以编辑指定执行人的状态
     * @param {string} executorUmId - 执行人umId
     * @param {string} currentUserUmId - 当前用户umId
     * @returns {boolean}
     */
    function canEditExecutorStatus(executorUmId, currentUserUmId) {
        if (!taskDetail.value) return false

        // 任务创建人可以编辑所有执行人状态
        if (taskDetail.value.umId === currentUserUmId) {
            return true
        }

        // 执行人只能编辑自己的状态
        return executorUmId === currentUserUmId
    }

    return {
        updateExecutorStatus,
        updateTodoUsers,
        canEditExecutorStatus
    }
}
