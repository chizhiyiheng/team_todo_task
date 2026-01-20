import { mockTodoList, mockTodoListPage2 } from './todoData'
import { mockTaskStatistics, mockAIAnalysis, mockTeamList, mockTaskDetail } from './taskData'

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  async getTodoList(params) {
    await delay()

    const { pageNum = 1, pageSize = 20, todoStatus } = params

    let allTasks = [...mockTodoList, ...mockTodoListPage2]

    if (todoStatus !== undefined && todoStatus !== '2') {
      allTasks = allTasks.filter(task => task.todoStatus === parseInt(todoStatus))
    }

    const total = allTasks.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const list = allTasks.slice(start, end)

    return {
      code: '200',
      message: 'success',
      body: {
        list,
        pageNum,
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
        isFirstPage: pageNum === 1,
        isLastPage: pageNum >= Math.ceil(total / pageSize),
        hasPreviousPage: pageNum > 1,
        hasNextPage: pageNum < Math.ceil(total / pageSize),
        navigateFirstPage: 1,
        navigateLastPage: Math.ceil(total / pageSize),
        navigatePages: [1, 2],
        prePage: pageNum > 1 ? pageNum - 1 : 0,
        nextPage: pageNum < Math.ceil(total / pageSize) ? pageNum + 1 : 0,
        startRow: start + 1,
        endRow: Math.min(end, total),
        size: list.length
      }
    }
  },

  async getTaskStatistics(params) {
    await delay()
    return mockTaskStatistics
  },

  async getAIAnalysis(params) {
    await delay(800)
    return mockAIAnalysis
  },

  async getTeamList(params) {
    await delay()
    return mockTeamList
  },

  async getTaskDetail(taskId) {
    await delay()
    return mockTaskDetail(taskId)
  },

  async updateTaskStatus(taskId, status) {
    await delay()
    return {
      code: '200',
      message: 'success',
      body: {
        id: taskId,
        status
      }
    }
  },

  async createTask(taskData) {
    await delay()
    return {
      code: '200',
      message: 'success',
      body: {
        id: 'NEW_' + Date.now(),
        ...taskData
      }
    }
  },

  async deleteTask(taskId) {
    await delay()
    return {
      code: '200',
      message: 'success',
      body: {
        id: taskId
      }
    }
  }
}

export default mockApi
