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

  deleteTodo(todoId) {
    return request.post('/api/todo/delete', { id: todoId })
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
