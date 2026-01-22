import { mockTodoList, mockTodoListPage2 } from './todoData'
import { mockTaskStatistics, mockAIAnalysis, mockTeamList, mockTaskDetail } from './taskData'
import { generateMockActivityLogs } from './activityLogData'

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  async getTodoList(params) {
    await delay()

    const { page = 1, pageSize = 10, status, queryType, deadLine, finishTime, projectId, parentTodoId } = params

    let allTasks = [...mockTodoList, ...mockTodoListPage2]

    // 根据status筛选
    if (status !== undefined && status !== null) {
      allTasks = allTasks.filter(task => task.todoStatus === parseInt(status))
    }

    // 根据queryType筛选
    if (queryType !== undefined && queryType !== null) {
      if (queryType === 1) {
        // 查我分配的待办
        allTasks = allTasks.filter(task => task.creatorUmId === 'LIUQINGHONG264')
      } else if (queryType === 2) {
        // 查我执行的待办
        allTasks = allTasks.filter(task => {
          const attendees = task.attendeeList || []
          return attendees.some(a => a.umId === 'LIUQINGHONG264')
        })
      }
    }

    // 根据projectId筛选
    if (projectId) {
      allTasks = allTasks.filter(task => task.projectId === projectId)
    }

    // 根据parentTodoId筛选
    if (parentTodoId) {
      allTasks = allTasks.filter(task => task.parentTodoId === parentTodoId)
    }

    const total = allTasks.length
    const pageCount = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const list = allTasks.slice(start, end)

    return {
      code: '200',
      message: 'success',
      body: {
        list,
        total,
        page,
        pageSize,
        pageCount
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
        status: parseInt(task.status || 0),
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

  async deleteTodo(id) {
    await delay()
    
    // 查找待办是否存在
    const allTasks = [...mockTodoList, ...mockTodoListPage2]
    const task = allTasks.find(t => t.id === id)
    
    if (!task) {
      return {
        code: 'TODO_NOT_FOUND',
        message: '待办不存在',
        data: null
      }
    }
    
    // 检查待办状态（只有已完成的待办才能删除）
    if (task.todoStatus !== 1) {
      return {
        code: 'TEAM_TASK_OPERATE_STATUS_INVALID',
        message: '待办状态无效，只有已完成的待办才能删除',
        data: null
      }
    }
    
    // 模拟删除成功
    const index = mockTodoList.findIndex(t => t.id === id)
    if (index > -1) {
      mockTodoList.splice(index, 1)
    } else {
      const index2 = mockTodoListPage2.findIndex(t => t.id === id)
      if (index2 > -1) {
        mockTodoListPage2.splice(index2, 1)
      }
    }
    
    return {
      code: '200',
      message: 'success',
      data: id
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
  },

  // TODO: 进展详情接口 - 待后端联调确认数据结构
  async getProgressDetail(todoId) {
    await delay()
    return {
      code: '200',
      message: 'success',
      data: {
        todoId: todoId,
        progressPercent: 45,  // 进度百分比
        progressDesc: '已完成需求分析和设计文档，正在进行开发',  // 进度描述
        updateTime: '2024-01-20 14:30:00',  // 最后更新时间
        updateUser: '张三',  // 更新人
        attachmentList: [
          {
            fileName: '需求文档.pdf',
            fileSize: 2048576,
            fileType: 'application/pdf',
            filePath: 'https://example.com/files/requirement.pdf',
            uploadTime: '2024-01-20 10:00:00'
          },
          {
            fileName: '设计图.png',
            fileSize: 512000,
            fileType: 'image/png',
            filePath: 'https://example.com/files/design.png',
            uploadTime: '2024-01-20 11:30:00'
          }
        ],
        // 进展历史记录（可选，用于未来扩展）
        historyList: [
          {
            id: 'PROGRESS_1',
            progressPercent: 20,
            progressDesc: '完成需求分析',
            updateTime: '2024-01-18 09:00:00',
            updateUser: '张三'
          },
          {
            id: 'PROGRESS_2',
            progressPercent: 45,
            progressDesc: '已完成需求分析和设计文档，正在进行开发',
            updateTime: '2024-01-20 14:30:00',
            updateUser: '张三'
          }
        ]
      }
    }
  },

  // TODO: 进展更新接口 - 待后端联调确认请求和响应格式
  async submitProgress(data) {
    await delay()
    // data 结构:
    // {
    //   todoId: string,
    //   progressPercent: number,
    //   progressDesc: string,
    //   attachmentList: Array
    // }
    return {
      code: '200',
      message: '进度更新成功',
      data: {
        todoId: data.todoId,
        progressPercent: data.progressPercent,
        progressDesc: data.progressDesc,
        updateTime: new Date().toISOString(),
        updateUser: '当前用户'
      }
    }
  },

  // 文件上传接口 Mock（模拟第三方文件系统）
  async uploadFile(file) {
    await delay(800) // 模拟上传延迟
    
    // 模拟上传失败的情况（10%概率）
    if (Math.random() < 0.1) {
      return {
        code: '500',
        message: '文件上传失败',
        data: null
      }
    }
    
    // 生成模拟的文件ID和URL
    const fileId = 'FILE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const mockUrl = `https://file-system.example.com/files/${fileId}/${file.name}`
    
    return {
      code: '200',
      message: '上传成功',
      data: {
        fileId: fileId,                    // 第三方系统返回的文件ID
        fileName: file.name,                // 文件名
        fileSize: file.size,                // 文件大小（字节）
        fileType: file.type,                // 文件类型
        filePath: mockUrl,                  // 文件访问路径
        uploadTime: new Date().toISOString(), // 上传时间
        // 第三方系统可能返回的其他字段
        md5: 'mock_md5_' + Math.random().toString(36).substr(2, 16),
        storageType: 'third_party_storage',
        bucket: 'company-files',
        region: 'cn-hangzhou'
      }
    }
  },

  // 删除文件接口 Mock
  async deleteFile(fileId) {
    await delay(300)
    
    // 模拟删除失败的情况（5%概率）
    if (Math.random() < 0.5) {
      return {
        code: '500',
        message: '文件删除失败',
        data: null
      }
    }
    
    return {
      code: '200',
      message: '删除成功',
      data: {
        fileId: fileId,
        deletedAt: new Date().toISOString()
      }
    }
  },

  // 获取待办操作日志接口 Mock
  async getActivityLog(todoId) {
    await delay(400)
    
    const mockLogs = generateMockActivityLogs(todoId)
    
    return {
      code: '200',
      message: 'success',
      body: mockLogs
    }
  }
}

export default mockApi
