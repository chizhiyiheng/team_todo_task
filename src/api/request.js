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
    const { url, method = 'GET', params, data } = config

    console.log('Mock API Request:', { url, method, params, data })

    try {
      let result
      switch (url) {
        case '/api/todo/list':
          result = await this.mockApi.getTodoList(params || data)
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
      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: method !== 'GET' ? JSON.stringify(data) : undefined
      })

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

  post(url, data) {
    return this.request({ url, method: 'POST', data })
  }

  put(url, data) {
    return this.request({ url, method: 'PUT', data })
  }

  delete(url, params) {
    return this.request({ url, method: 'DELETE', params })
  }
}

export default new ApiService()
