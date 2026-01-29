import request from './request'

export const todoApi = {
  getTodoList(params) {
    return request.post('/api/todo/list', params)
  },

  getUserList() {
    return request.get('/api/todo/user/list')
  },

  updateTodoStatus(todoId, status) {
    return request.post('/api/todo/update', { todoId, status })
  },

  updateTodo(data) {
    return request.post('/api/todo/update', data)
  },

  updateExecutorStatus(todoId, todoUserUmId, status) {
    return request.post('/api/todo/user/updateStatus', { todoId, todoUserUmId, status })
  },

  getTodoDetail(todoId) {
    return request.post('/api/todo/detail', { id: todoId })
  },

  addTodo(data) {
    return request.post('/api/todo/add', data)
  },

  deleteTodo(id) {
    return request.delete(`/api/todo/delete/${id}`)
  },

  cancelTodo(todoId) {
    return request.post('/api/todo/cancel', { todoId })
  },

  // 获取进展列表（按执行人分组）
  getProgressList(todoId) {
    return request.get(`/api/todo/progress/list/${todoId}`)
  },

  submitProgress(data) {
    return request.post('/api/todo/progress/submit', data)
  },

  // 文件上传接口（对接第三方文件系统）
  uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/api/todo/attachment/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 删除文件接口
  deleteFile(fileId) {
    return request.post('/api/file/delete', { fileId })
  },

  // 获取待办操作日志
  getActivityLog(todoId) {
    return request.post('/api/todo/activityLog', { todoId })
  },

  // 标记重要
  markImportant(id) {
    return request.post(`/api/todo/markImportant/${id}`)
  },

  // 取消标记重要
  unmarkImportant(id) {
    return request.post(`/api/todo/unmarkImportant/${id}`)
  },

  // 根据待办任务id查询待办操作日志列表
  getOpLogList(todoId) {
    return request.get(`/api/todo/oplog/getByTodoId/${todoId}`)
  },

  // 获取操作日志详情
  getOpLogDetail(id) {
    return request.get(`/api/todo/oplog/get/${id}`)
  },

  // 语音转文字接口
  transcribeAudio(formData) {
    return request.post('/api/todo/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30秒超时，语音转换可能需要较长时间
    })
  }
}

export const taskApi = {
  getTaskStatistics(params) {
    return request.get('/api/task/statistics', params)
  },

  getTaskDetail(taskId) {
    return request.get('/api/task/detail', { taskId })
  },

  createTask(taskData) {
    return request.post('/api/task/create', taskData)
  },

  updateTaskStatus(taskId, status) {
    return request.post('/api/task/update', { taskId, status })
  },

  deleteTask(taskId) {
    return request.delete('/api/task/delete', { taskId })
  }
}

export const teamApi = {
  getTeamList(params) {
    return request.get('/api/team/list', params)
  },

  getTeamDetail(teamId) {
    return request.get('/api/team/detail', { teamId })
  }
}

export const aiApi = {
  getAnalysis(params) {
    return request.get('/api/ai/analysis', params)
  }
}

export default {
  todo: todoApi,
  task: taskApi,
  team: teamApi,
  ai: aiApi
}
