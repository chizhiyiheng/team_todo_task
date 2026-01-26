/**
 * 操作日志枚举定义
 */

// 操作类型：0 创建 1 修改 2 完成 3 删除 4 分配 5 提醒 6 提交进度 7 取消
export const OPERATION_TYPES = {
    CREATE: 0,
    UPDATE: 1,
    COMPLETE: 2,
    DELETE: 3,
    ASSIGN: 4,
    REMIND: 5,
    PROGRESS: 6,
    CANCEL: 7
}

export const OPERATION_TYPE_LABELS = {
    [OPERATION_TYPES.CREATE]: '创建',
    [OPERATION_TYPES.UPDATE]: '修改',
    [OPERATION_TYPES.COMPLETE]: '完成',
    [OPERATION_TYPES.DELETE]: '删除',
    [OPERATION_TYPES.ASSIGN]: '分配',
    [OPERATION_TYPES.REMIND]: '提醒',
    [OPERATION_TYPES.PROGRESS]: '提交进度',
    [OPERATION_TYPES.CANCEL]: '取消'
}

export default {
    OPERATION_TYPES,
    OPERATION_TYPE_LABELS
}
