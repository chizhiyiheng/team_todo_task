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

  async getTodoDetail(params) {
    await delay()
    const todoId = params.id || params
    
    const allTasks = [...mockTodoList, ...mockTodoListPage2]
    const task = allTasks.find(t => t.id === todoId)
    
    if (!task) {
      return {
        code: '404',
        message: 'Task not found',
        body: null
      }
    }

    return {
      code: '200',
      message: 'success',
      body: {
        id: task.id,
        umId: task.creatorUmId || 'LIUQINGHONG264',
        name: task.creatorName || '刘青红',
        title: task.content || task.name || '任务标题',
        content: task.desc || '',
        status: parseInt(task.todoStatus || task.status || 0),
        progress: task.percent || 0,
        priority: task.priority || 2,
        isTop: task.isTop || 0,
        deadLine: task.deadLine || '',
        startTime: task.startTime || task.createTime || '',
        finishTime: task.finishTime || '',
        remindOption: task.remindOption || 0,
        remindTime: task.remindTime || '',
        source: task.source || 0,
        sourceId: task.sourceId || '',
        attachmentList: task.attachmentList || [],
        todoUsers: (task.attendeeList || []).map(user => ({
          umId: user.umId,
          name: user.name,
          status: user.status || 0
        })),
        subTodoList: task.subTodoList || [],
        activityLogList: [
          {
            id: 'LOG_1',
            action: 'create',
            desc: '创建了任务',
            operator: task.creatorName || '刘青红',
            time: task.createTime || new Date().toISOString()
          }
        ]
      }
    }
  },

  async updateTodo(data) {
    await delay()
    return {
      code: '200',
      message: 'success',
      body: { ...data }
    }
  },

  async addTodo(data) {
    await delay()
    return {
      code: '200',
      message: 'success',
      body: {
        id: 'NEW_TODO_' + Date.now(),
        ...data,
        createTime: new Date().toISOString()
      }
    }
  },

  async deleteTodo(params) {
    await delay()
    const todoId = params.id || params
    return {
      code: '200',
      message: 'success',
      body: { id: todoId }
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
