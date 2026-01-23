// 生成最近两个月内的日期
const getRecentDate = (daysAgo) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

const getFutureDate = (daysLater) => {
  const date = new Date()
  date.setDate(date.getDate() + daysLater)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

// 生成30条mock数据用于测试分页
const generateMockTodos = () => {
  const todos = []
  const statuses = [
    { value: 0, name: '待接收' },
    { value: 1, name: '待处理' },
    { value: 2, name: '已完成' },
    { value: 3, name: '进行中' },
    { value: 4, name: '已逾期' },
    { value: 5, name: '已取消' }
  ]
  
  const sources = [
    { value: 0, name: '系统' },
    { value: 7, name: '任务' },
    { value: 8, name: '项目' },
    { value: 9, name: '会议' }
  ]
  
  const users = [
    { umId: 'LIUQINGHONG264', name: '刘庆红' },
    { umId: 'USER001', name: '张三' },
    { umId: 'USER002', name: '李四' },
    { umId: 'USER003', name: '王五' },
    { umId: 'USER004', name: '赵六' }
  ]
  
  const creators = [
    { umId: 'LIUQINGHONG264', name: '刘庆红' },
    { umId: 'ZHANGMING001', name: '张明' },
    { umId: 'LIHUA002', name: '李华' },
    { umId: 'WUGANG004', name: '吴刚' },
    { umId: 'HANMEI008', name: '韩梅' }
  ]
  
  const taskNames = [
    '需求分析与设计', '前端页面开发', '后端API接口开发', '数据库设计与优化',
    '系统测试与bug修复', '性能优化与部署', '用户培训与文档编写', '项目验收与上线',
    '代码审查', '单元测试编写', '集成测试', '安全漏洞修复',
    '系统架构设计', '接口联调测试', '用户手册编写', '性能压测',
    '代码重构优化', '移动端适配', '数据迁移方案', '监控告警配置',
    '第三方集成开发', 'CI/CD流程优化', '国际化支持', '容器化部署',
    '微服务拆分', '日志系统搭建', '缓存优化', '消息队列集成',
    '权限系统开发', '报表功能开发'
  ]
  
  for (let i = 0; i < 30; i++) {
    const status = statuses[i % statuses.length]
    const source = sources[i % sources.length]
    const creator = creators[i % creators.length]
    const taskName = taskNames[i]
    
    // 根据状态决定时间
    let deadLine, finishTime, startTime, createTime, updateTime
    if (status.value === 2) {
      // 已完成
      createTime = getRecentDate(15 + i)
      startTime = getRecentDate(12 + i)
      updateTime = getRecentDate(5 + i)
      deadLine = getRecentDate(6 + i)
      finishTime = getRecentDate(5 + i)
    } else if (status.value === 4) {
      // 已逾期
      createTime = getRecentDate(10 + i)
      startTime = getRecentDate(8 + i)
      updateTime = getRecentDate(2 + i)
      deadLine = getRecentDate(3 + i)
      finishTime = null
    } else {
      // 其他状态
      createTime = getRecentDate(5 + i)
      startTime = getRecentDate(3 + i)
      updateTime = getRecentDate(1 + Math.floor(i / 5))
      deadLine = getFutureDate(5 + i)
      finishTime = null
    }
    
    // 确保LIUQINGHONG264在大部分任务的执行人列表中（用于测试"我执行的"tab）
    const attendeeList = []
    
    // 前20个任务包含LIUQINGHONG264作为执行人
    if (i < 20) {
      attendeeList.push({
        umId: 'LIUQINGHONG264',
        name: '刘庆红',
        status: 1
      })
    }
    
    // 随机添加1-2个其他执行人
    const otherAttendeeCount = (i % 2) + 1
    for (let j = 0; j < otherAttendeeCount; j++) {
      const user = users[(i + j + 1) % users.length]
      if (user.umId !== 'LIUQINGHONG264') {
        attendeeList.push({
          umId: user.umId,
          name: user.name,
          status: 1
        })
      }
    }
    
    todos.push({
      id: `TODO_${String(i + 1).padStart(3, '0')}`,
      umId: creator.umId,
      name: taskName,
      title: taskName,
      source: source.value,
      sourceId: `${source.name}_${String(i + 1).padStart(3, '0')}`,
      status: status.value,
      todoStatus: status.value,
      deadLine,
      remindOption: i % 2,
      finishTime,
      remindTime: deadLine ? new Date(new Date(deadLine).getTime() - 3600000).toISOString().slice(0, 19).replace('T', ' ') : null,
      updateTime,
      createTime,
      startTime,
      isTop: i % 10 === 0 ? 1 : 0,
      priority: (i % 3) + 1,
      projectId: `PROJ${String((i % 10) + 1).padStart(3, '0')}`,
      parentTodoId: '',
      tag: i % 10 === 0 ? 1 : 0,
      content: taskName,
      desc: `${taskName}的详细描述信息`,
      attendeeList,
      percent: status.value === 2 ? 100 : (status.value === 3 ? (i % 8) * 10 + 20 : 0),
      realDeadLine: 1,
      creatorName: creator.name,
      creatorUmId: creator.umId,
      file_num: i % 5,
      sub_num: i % 4,
      sub_complete: Math.floor((i % 4) / 2)
    })
  }
  
  return todos
}

export const mockTodoList = generateMockTodos()

// 为了兼容性，保留这些导出（虽然不再使用）
export const mockTodoListPage2 = []
export const mockTodoListPage3 = []
