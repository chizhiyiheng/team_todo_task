import request from './request'

export const todoApi = {
  getTodoList(params) {
    return request.post('/api/todo/list', params)
  },

  updateTodoStatus(todoId, status) {
    return request.post('/api/todo/update', { todoId, status })
  },

  updateTodo(data) {
    return request.post('/api/todo/update', data)
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

  // TODO: 待补充进展详情接口
  getProgressDetail(todoId) {
    return request.post('/api/todo/progress/detail', { todoId })
  },

  submitProgress(data) {
    return request.post('/api/todo/progress/submit', data)
  },

  // 文件上传接口（对接第三方文件系统）
  uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/api/file/upload', formData, {
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
