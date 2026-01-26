import { mockTodoList } from './todoData'
import { mockTaskStatistics, mockAIAnalysis, mockTeamList, mockTaskDetail } from './taskData'
import { generateMockActivityLogs } from './activityLogData'

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  async getTodoList(params) {
    await delay()

    const { page = 1, pageSize = 10, statusList, umList, queryType, deadLine, finishTime, projectId, parentTodoId } = params

    let allTasks = [...mockTodoList]

    // 根据 statusList 筛选（数组参数）
    if (statusList && Array.isArray(statusList) && statusList.length > 0) {
      allTasks = allTasks.filter(task => statusList.includes(task.todoStatus))
    }

    // 根据 umList 筛选执行人（数组参数）
    if (umList && Array.isArray(umList) && umList.length > 0) {
      allTasks = allTasks.filter(task => {
        const todoUsers = task.todoUsers || []
        return todoUsers.some(user => umList.includes(user.umId))
      })
    }

    // 根据queryType筛选
    if (queryType !== undefined && queryType !== null) {
      if (queryType === 1) {
        // 查我分配的待办
        allTasks = allTasks.filter(task => task.creatorUmId === 'LIUQINGHONG264')
      } else if (queryType === 2) {
        // 查我执行的待办
        allTasks = allTasks.filter(task => {
          const attendees = task.todoUsers || []
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

  async getUserList() {
    await delay()

    // 从所有待办中提取执行人列表
    const allTasks = [...mockTodoList]
    const userMap = new Map()

    allTasks.forEach(task => {
      const todoUsers = task.todoUsers || []
      todoUsers.forEach(user => {
        if (user.umId && !userMap.has(user.umId)) {
          userMap.set(user.umId, {
            id: user.umId,
            umId: user.umId,
            name: user.name
          })
        }
      })
    })

    return {
      code: '200',
      message: 'success',
      data: Array.from(userMap.values())
    }
  },

  async getTodoDetail(params) {
    await delay()
    const todoId = params.id || params

    const allTasks = [...mockTodoList]
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
        todoUsers: (task.todoUsers || []).map(user => ({
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
    const allTasks = [...mockTodoList]
    const task = allTasks.find(t => t.id === id)

    if (!task) {
      return {
        code: 'TODO_NOT_FOUND',
        message: '待办不存在',
        data: null
      }
    }

    // 检查待办状态（只有已完成的待办才能删除）
    if (task.todoStatus !== 2) {
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

    // 在mock数据中更新任务状态
    const allTasks = [...mockTodoList]
    const task = allTasks.find(t => t.id === taskId)

    if (task) {
      task.status = status
      task.todoStatus = status
      task.updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
    }

    return {
      code: '200',
      message: 'success',
      body: {
        id: taskId,
        status
      }
    }
  },

  async updateExecutorStatus(todoId, todoUserUmId, status) {
    await delay()

    const allTasks = [...mockTodoList, ...mockTodoListPage2]
    const task = allTasks.find(t => t.id === todoId)

    if (!task) {
      return {
        code: '404',
        message: '任务不存在',
        body: null
      }
    }

    const executor = task.todoUsers.find(u => u.umId === todoUserUmId)
    if (!executor) {
      return {
        code: '404',
        message: '执行人不存在',
        body: null
      }
    }

    executor.status = status
    task.updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')

    return {
      code: '200',
      message: '更新状态成功',
      body: null
    }
  },

  async cancelTodo(todoId) {
    await delay()

    const allTasks = [...mockTodoList, ...mockTodoListPage2]
    const task = allTasks.find(t => t.id === todoId)

    if (!task) {
      return {
        code: '404',
        message: '待办不存在',
        body: null
      }
    }

    if (task.status === 2) { // 2: Completed
      return {
        code: '400',
        message: '已完成的任务无法取消',
        body: null
      }
    }

    // 更新任务状态为已取消 (5)
    task.status = 5
    task.todoStatus = 5 // 同步更新 todoStatus
    task.updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ')

    // 将所有执行人的状态也更新为已取消 (5)
    if (task.todoUsers && task.todoUsers.length > 0) {
      task.todoUsers.forEach(user => {
        user.status = 5
      })
    }

    return {
      code: '200',
      message: '取消成功',
      body: {
        id: todoId,
        status: 5
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

  // 进展列表接口 - 按执行人分组返回
  async getProgressList(todoId) {
    await delay()

    // 从 mockTodoList 获取任务信息
    const task = mockTodoList.find(t => t.id === todoId)
    const currentUserUmId = 'LIUQINGHONG264'  // 模拟当前用户
    const isAssigner = task?.creatorUmId === currentUserUmId

    // 根据任务的执行人列表生成进展数据
    const todoUsers = task?.todoUsers || []

    const progressList = todoUsers.map((user, index) => {
      // 生成历史记录，每条记录包含 attachmentList
      const historyList = [

        {
          progressPercent: 20 + (index * 15) % 80,
          progressDesc: '已完成需求分析和设计文档，正在进行开发',
          umId: user.umId,
          name: user.name,
          submitTime: '2024-01-20 14:30:00',
          attachmentList: [
            {
              fileId: `FILE_${user.umId}_H2_001`,
              fileName: '需求文档.pdf',
              fileSize: 2048576,
              fileType: 'application/pdf',
              filePath: 'https://example.com/files/requirement.pdf',
              uploadTime: '2024-01-20 10:00:00'
            },
            {
              fileId: `FILE_${user.umId}_H2_002`,
              fileName: '设计图.png',
              fileSize: 512000,
              fileType: 'image/png',
              filePath: 'https://example.com/files/design.png',
              uploadTime: '2024-01-20 11:30:00'
            }
          ]
        },
        {
          progressPercent: 10 + (index * 10) % 50,
          progressDesc: '开始任务，进行需求分析',
          umId: user.umId,
          name: user.name,
          submitTime: '2024-01-18 09:00:00',
          attachmentList: [
            {
              fileId: `FILE_${user.umId}_H1_001`,
              fileName: '需求分析.docx',
              fileSize: 1024000,
              fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              filePath: 'https://example.com/files/analysis.docx',
              uploadTime: '2024-01-18 09:00:00'
            }
          ]
        },
      ]

      // 从 historyList 中聚合所有附件
      const allAttachments = historyList.reduce((acc, item) => {
        return acc.concat(item.attachmentList || [])
      }, [])

      // 获取最新一条记录的信息作为外层数据
      const latestProgress = historyList[historyList.length - 1]

      return {
        umId: user.umId,
        name: user.name,
        progressPercent: latestProgress.progressPercent,
        progressDesc: latestProgress.progressDesc,
        submitTime: latestProgress.submitTime,
        isCurrentUser: user.umId === currentUserUmId,
        historyList: historyList,
        attachmentList: allAttachments  // 从 historyList 拼装的总附件列表
      }
    })

    // 如果不是分配人，只返回当前用户的进展
    const filteredList = isAssigner
      ? progressList
      : progressList.filter(p => p.isCurrentUser)

    return {
      code: '200',
      message: 'success',
      data: {
        todoId: todoId,
        isAssigner: isAssigner,  // 是否为分配人
        progressList: filteredList
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

  // 获取待办操作日志列表接口 Mock
  async getOpLogList(todoId) {
    await delay(400)

    const mockLogs = generateMockActivityLogs(todoId)

    return {
      code: '200',
      message: 'success',
      body: mockLogs
    }
  },

  // 获取操作日志详情接口 Mock
  async getOpLogDetail(id) {
    await delay(300)

    const todoId = id.split('_')[1] || 'TODO_1'
    const mockLogs = generateMockActivityLogs(todoId)
    const log = mockLogs.find(l => l.id === id) || mockLogs[0]

    if (!log) {
      return {
        code: '404',
        message: 'Log not found',
        body: null
      }
    }

    return {
      code: '200',
      message: 'success',
      body: log
    }
  },

  // 标记重要接口 Mock
  async markImportant(id) {
    await delay()

    const allTasks = [...mockTodoList]
    const task = allTasks.find(t => t.id === id)

    if (!task) {
      return {
        code: '404',
        message: '待办不存在',
        body: null
      }
    }

    // 更新 isTop 状态
    task.isTop = 1

    return {
      code: '200',
      message: '标记重要成功',
      body: {
        id: id,
        isTop: 1
      }
    }
  },

  // 取消标记重要接口 Mock
  async unmarkImportant(id) {
    await delay()

    const allTasks = [...mockTodoList]
    const task = allTasks.find(t => t.id === id)

    if (!task) {
      return {
        code: '404',
        message: '待办不存在',
        body: null
      }
    }

    // 更新 isTop 状态
    task.isTop = 0

    return {
      code: '200',
      message: '取消标记重要成功',
      body: {
        id: id,
        isTop: 0
      }
    }
  },

  // 搜索待办列表接口 Mock
  async searchTodoList(params) {
    await delay(300)

    const { keyword = '', pageNum = 1, pageSize = 10 } = params

    if (!keyword) {
      return {
        code: '200',
        message: 'success',
        data: {
          total: 0,
          list: [],
          pageNum,
          pageSize
        }
      }
    }

    // 从所有待办中搜索
    let allTasks = [...mockTodoList]
    
    // 根据关键词过滤（标题或ID匹配）
    const filteredTasks = allTasks.filter(task => {
      const title = task.content || task.name || ''
      const id = task.id || ''
      return title.toLowerCase().includes(keyword.toLowerCase()) || 
             id.toLowerCase().includes(keyword.toLowerCase())
    })

    const total = filteredTasks.length
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const list = filteredTasks.slice(start, end).map(task => ({
      id: task.id,
      title: task.content || task.name || '未命名任务',
      deadLine: task.deadLine || ''
    }))

    return {
      code: '200',
      message: 'success',
      data: {
        total,
        list,
        pageNum,
        pageSize
      }
    }
  }
}

export default mockApi
