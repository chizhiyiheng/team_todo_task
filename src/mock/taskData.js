export const mockTaskStatistics = {
  code: '200',
  message: 'success',
  body: {
    totalTasks: 20,
    completedTasks: 12,
    inProgressTasks: 0,
    overdueTasks: 0,
    pendingTasks: 8,
    taskDistribution: [
      { name: '已完成', value: 12, color: '#67c23a' },
      { name: '进行中', value: 0, color: '#409eff' },
      { name: '已逾期', value: 0, color: '#f56c6c' },
      { name: '待处理', value: 8, color: '#e6a23c' }
    ],
    userTaskDistribution: [
      { name: '张三', total: 3, completed: 2, inProgress: 0, overdue: 0, pending: 1 },
      { name: '李四', total: 2, completed: 1, inProgress: 0, overdue: 0, pending: 1 },
      { name: '王五', total: 2, completed: 1, inProgress: 0, overdue: 0, pending: 1 },
      { name: '赵六', total: 2, completed: 1, inProgress: 0, overdue: 0, pending: 1 },
      { name: '孙七', total: 2, completed: 1, inProgress: 0, overdue: 0, pending: 1 },
      { name: '周八', total: 2, completed: 1, inProgress: 0, overdue: 0, pending: 1 },
      { name: '吴九', total: 2, completed: 1, inProgress: 0, overdue: 0, pending: 1 },
      { name: '郑十', total: 2, completed: 1, inProgress: 0, overdue: 0, pending: 1 },
      { name: '陈十一', total: 2, completed: 1, inProgress: 0, overdue: 0, pending: 1 },
      { name: '刘十二', total: 1, completed: 1, inProgress: 0, overdue: 0, pending: 0 }
    ],
    weeklyTrend: [
      { date: '2024-12-01', completed: 2, created: 3 },
      { date: '2024-12-02', completed: 2, created: 2 },
      { date: '2024-12-03', completed: 2, created: 3 },
      { date: '2024-12-04', completed: 2, created: 2 },
      { date: '2024-12-05', completed: 2, created: 3 },
      { date: '2024-12-06', completed: 2, created: 2 },
      { date: '2024-12-07', completed: 0, created: 0 }
    ]
  }
}

export const mockAIAnalysis = {
  code: '200',
  message: 'success',
  body: {
    summary: '本周任务完成率达到57%，整体进度良好。建议关注逾期任务，及时跟进。',
    insights: [
      {
        type: 'warning',
        title: '逾期任务提醒',
        content: '您有12个任务已逾期，建议优先处理这些任务。',
        priority: 'high'
      },
      {
        type: 'info',
        title: '任务分配建议',
        content: '张三的任务负载较重，建议将部分任务分配给其他成员。',
        priority: 'medium'
      },
      {
        type: 'success',
        title: '完成率提升',
        content: '本周任务完成率较上周提升了5%，团队效率有所提高。',
        priority: 'low'
      },
      {
        type: 'info',
        title: '时间管理建议',
        content: '建议在周三前完成高优先级任务，避免周末加班。',
        priority: 'medium'
      }
    ],
    recommendations: [
      {
        id: 1,
        title: '优化任务分配',
        description: '根据团队成员的工作负载，合理分配任务，避免个别成员过载。',
        action: '查看详情'
      },
      {
        id: 2,
        title: '跟进逾期任务',
        description: '及时跟进已逾期任务，了解延期原因，制定补救措施。',
        action: '立即处理'
      },
      {
        id: 3,
        title: '提升团队协作',
        description: '加强团队沟通，及时同步任务进度，提高协作效率。',
        action: '了解更多'
      }
    ],
    predictions: {
      nextWeekTasks: 18,
      estimatedCompletionRate: 65,
      riskTasks: 5
    }
  }
}

export const mockTeamList = {
  code: '200',
  message: 'success',
  body: {
    list: [
      {
        id: 1,
        name: '产品研发部',
        description: '负责产品研发和迭代',
        memberCount: 25,
        taskCount: 45,
        completedTasks: 32,
        avatar: '',
        createdAt: '2024-01-01 10:00:00'
      },
      {
        id: 2,
        name: '技术支持部',
        description: '负责技术支持和客户服务',
        memberCount: 18,
        taskCount: 38,
        completedTasks: 28,
        avatar: '',
        createdAt: '2024-01-02 10:00:00'
      },
      {
        id: 3,
        name: '市场推广部',
        description: '负责市场推广和品牌建设',
        memberCount: 15,
        taskCount: 32,
        completedTasks: 24,
        avatar: '',
        createdAt: '2024-01-03 10:00:00'
      },
      {
        id: 4,
        name: '运营管理部',
        description: '负责日常运营和管理',
        memberCount: 12,
        taskCount: 28,
        completedTasks: 21,
        avatar: '',
        createdAt: '2024-01-04 10:00:00'
      },
      {
        id: 5,
        name: '人力资源部',
        description: '负责人力资源管理',
        memberCount: 8,
        taskCount: 13,
        completedTasks: 10,
        avatar: '',
        createdAt: '2024-01-05 10:00:00'
      }
    ],
    total: 5
  }
}

export const mockTaskDetail = (taskId) => ({
  code: '200',
  message: 'success',
  body: {
    id: taskId,
    title: '完成项目需求文档编写',
    content: '需要完成项目需求文档的编写，包括功能模块、技术架构、数据库设计等内容。',
    status: '1',
    priority: 'high',
    assignee: {
      id: 'USER001',
      name: '张三',
      avatar: ''
    },
    creator: {
      id: 'LIUQINGHONG264',
      name: '刘庆红',
      avatar: ''
    },
    startTime: '2024-12-02 10:08:42',
    endTime: '2024-12-06 18:00:00',
    createTime: '2024-12-05 10:08:42',
    updateTime: '2026-01-19 16:49:02',
    finishTime: '2026-01-19 16:49:02',
    project: {
      id: 1,
      name: '项目管理系统'
    },
    tags: ['重要', '文档'],
    attachments: [],
    comments: [
      {
        id: 1,
        userId: 'USER001',
        userName: '张三',
        content: '需求文档已开始编写，预计明天完成。',
        createTime: '2024-12-05 14:00:00'
      }
    ],
    subTasks: [
      {
        id: 1,
        title: '功能模块设计',
        status: '1',
        assignee: { id: 'USER001', name: '张三' }
      },
      {
        id: 2,
        title: '技术架构设计',
        status: '1',
        assignee: { id: 'USER001', name: '张三' }
      },
      {
        id: 3,
        title: '数据库设计',
        status: '0',
        assignee: { id: 'USER002', name: '李四' }
      }
    ]
  }
})
