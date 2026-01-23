import mockApi from '@/mock'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

console.log('Environment check:', {
  VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK,
  isMock: isMock,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
})

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL
    this.mockApi = mockApi
  }

  async request(config) {
    if (isMock) {
      return this.mockRequest(config)
    }
    return this.httpRequest(config)
  }

  async mockRequest(config) {
    let { url, method = 'GET', params, data } = config

    console.log('Mock API Request:', { url, method, params, data })

    try {
      let result
      // 处理路径参数形式的URL
      const deleteMatch = url.match(/^\/api\/todo\/delete\/(.+)$/)
      if (deleteMatch) {
        url = '/api/todo/delete'
        data = { id: deleteMatch[1] }
      }

      // 处理标记重要接口
      const markImportantMatch = url.match(/^\/api\/todo\/markImportant\/(.+)$/)
      if (markImportantMatch) {
        url = '/api/todo/markImportant'
        data = { id: markImportantMatch[1] }
      }

      // 处理取消标记重要接口
      const unmarkImportantMatch = url.match(/^\/api\/todo\/unmarkImportant\/(.+)$/)
      if (unmarkImportantMatch) {
        url = '/api/todo/unmarkImportant'
        data = { id: unmarkImportantMatch[1] }
      }

      // 处理进展列表接口
      const progressListMatch = url.match(/^\/api\/todo\/progress\/list\/(.+)$/)
      if (progressListMatch) {
        url = '/api/todo/progress/list'
        data = { todoId: progressListMatch[1] }
      }

      switch (url) {
        case '/api/todo/list':
          result = await this.mockApi.getTodoList(params || data)
          break
        case '/api/todo/user/list':
          result = await this.mockApi.getUserList()
          break
        case '/api/todo/add':
          result = await this.mockApi.addTodo(data)
          break
        case '/api/todo/update':
          result = await this.mockApi.updateTodo(data)
          break
        case '/api/todo/user/updateStatus':
          result = await this.mockApi.updateExecutorStatus(data.todoId, data.todoUserUmId, data.status)
          break
        case '/api/todo/cancel':
          result = await this.mockApi.cancelTodo(data.todoId)
          break
        case '/api/todo/detail':
          result = await this.mockApi.getTodoDetail(data || params)
          break
        case '/api/todo/delete':
          // 支持路径参数形式 /api/todo/delete/{id}
          const deleteIdMatch = url.match(/\/api\/todo\/delete\/(.+)/)
          const deleteId = deleteIdMatch ? deleteIdMatch[1] : (data?.id || params?.id)
          result = await this.mockApi.deleteTodo(deleteId)
          break
        case '/api/task/statistics':
          result = await this.mockApi.getTaskStatistics(params || data)
          break
        case '/api/ai/analysis':
          result = await this.mockApi.getAIAnalysis(params || data)
          break
        case '/api/team/list':
          result = await this.mockApi.getTeamList(params || data)
          break
        case '/api/task/detail':
          result = await this.mockApi.getTaskDetail(params?.taskId || data?.taskId)
          break
        case '/api/task/update':
          result = await this.mockApi.updateTaskStatus(data?.taskId, data?.status)
          break
        case '/api/task/create':
          result = await this.mockApi.createTask(data)
          break
        case '/api/task/delete':
          result = await this.mockApi.deleteTask(params?.taskId || data?.taskId)
          break
        // 进展列表接口（按执行人分组）
        case '/api/todo/progress/list':
          result = await this.mockApi.getProgressList(data?.todoId || params?.todoId)
          break
        case '/api/todo/progress/submit':
          result = await this.mockApi.submitProgress(data)
          break
        // 文件上传相关接口
        case '/api/todo/attachment/upload':
          result = await this.mockApi.uploadFile(data.get('file'))
          break
        case '/api/file/delete':
          result = await this.mockApi.deleteFile(data?.fileId || params?.fileId)
          break
        // 操作日志接口
        case '/api/todo/activityLog':
          result = await this.mockApi.getActivityLog(data?.todoId || params?.todoId)
          break
        // 标记重要接口
        case '/api/todo/markImportant':
          result = await this.mockApi.markImportant(data?.id)
          break
        // 取消标记重要接口
        case '/api/todo/unmarkImportant':
          result = await this.mockApi.unmarkImportant(data?.id)
          break
        default:
          result = { code: '404', message: '接口不存在', body: null }
      }
      console.log('Mock API Response:', result)
      return result
    } catch (error) {
      console.error('Mock API Error:', error)
      return { code: '500', message: error.message, body: null }
    }
  }

  async httpRequest(config) {
    const { url, method = 'GET', params, data, headers = {} } = config

    try {
      let fetchOptions = {
        method,
        headers: {
          ...headers
        }
      }

      // 如果不是 FormData，添加 Content-Type
      if (!(data instanceof FormData)) {
        fetchOptions.headers['Content-Type'] = 'application/json'
      }

      // 处理请求体
      if (method !== 'GET') {
        if (data instanceof FormData) {
          fetchOptions.body = data
        } else {
          fetchOptions.body = JSON.stringify(data)
        }
      }

      const response = await fetch(`${this.baseURL}${url}`, fetchOptions)

      const result = await response.json()
      return result
    } catch (error) {
      console.error('HTTP API Error:', error)
      return { code: '500', message: error.message, body: null }
    }
  }

  get(url, params) {
    return this.request({ url, method: 'GET', params })
  }

  post(url, data, config = {}) {
    return this.request({ url, method: 'POST', data, ...config })
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data })
  }

  delete(url, data) {
    return this.request({ url, method: 'DELETE', data })
  }
}

export default new ApiService()
