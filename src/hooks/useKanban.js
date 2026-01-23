import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { todoApi } from '@/api'

export function useKanban(props) {
  const kanbanStatusList = ['pending', 'in_progress', 'completed', 'overdue', 'cancelled']
  
  const kanbanColumns = ref({
    pending: { list: [], page: 1, pageSize: 20, total: 0, loading: false, hasMore: true },
    in_progress: { list: [], page: 1, pageSize: 20, total: 0, loading: false, hasMore: true },
    completed: { list: [], page: 1, pageSize: 20, total: 0, loading: false, hasMore: true },
    overdue: { list: [], page: 1, pageSize: 20, total: 0, loading: false, hasMore: true },
    cancelled: { list: [], page: 1, pageSize: 20, total: 0, loading: false, hasMore: true }
  })

  function mapStatusKeyToValue(statusKey) {
    const map = {
      pending: 1,
      in_progress: 3,
      completed: 2,
      overdue: 4,
      cancelled: 5
    }
    return map[statusKey] || 1
  }

  async function fetchKanbanColumnData(statusKey, append = false) {
    const column = kanbanColumns.value[statusKey]
    if (column.loading) return
    
    column.loading = true
    try {
      const params = {
        page: column.page,
        pageSize: column.pageSize,
        status: mapStatusKeyToValue(statusKey),
        queryType: props.taskType === 'my' ? (props.mode === 'assigned' ? 1 : 2) : 0
      }
      
      if (props.teamId) {
        params.projectId = String(props.teamId)
      }
      
      const response = await todoApi.getTodoList(params)
      if (response.code === '200') {
        const newList = response.body.list || []
        if (append) {
          column.list.push(...newList)
        } else {
          column.list = newList
        }
        column.total = response.body.total || 0
        column.hasMore = newList.length >= column.pageSize
      }
    } catch (error) {
      console.error('Fetch kanban column data error:', error)
      ElMessage.error('获取看板数据失败')
    } finally {
      column.loading = false
    }
  }

  async function initKanbanData() {
    // 如果是开发环境且没有真实数据，使用mock数据
    const useMock = import.meta.env.DEV
    
    for (const statusKey of kanbanStatusList) {
      kanbanColumns.value[statusKey] = {
        list: [],
        page: 1,
        pageSize: 20,
        total: 0,
        loading: false,
        hasMore: true
      }
      
      if (useMock) {
        // Mock数据
        const mockTasks = generateMockTasks(statusKey, 5)
        kanbanColumns.value[statusKey].list = mockTasks
        kanbanColumns.value[statusKey].total = mockTasks.length
        kanbanColumns.value[statusKey].hasMore = false
      } else {
        await fetchKanbanColumnData(statusKey)
      }
    }
  }
  
  function generateMockTasks(statusKey, count) {
    const statusValue = mapStatusKeyToValue(statusKey)
    const tasks = []
    const names = [
      '完成项目文档编写',
      '修复登录页面bug',
      '优化数据库查询性能',
      '设计新功能原型',
      '代码审查和重构',
      '编写单元测试',
      '部署生产环境',
      '用户反馈处理'
    ]
    const users = [
      { name: '张三', umId: 'UM001' },
      { name: '李四', umId: 'UM002' },
      { name: '王五', umId: 'UM003' }
    ]
    
    for (let i = 0; i < count; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)]
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const daysOffset = Math.floor(Math.random() * 10) - 5
      const deadLine = new Date()
      deadLine.setDate(deadLine.getDate() + daysOffset)
      
      tasks.push({
        id: `mock_${statusKey}_${i}`,
        title: `${randomName} ${i + 1}`,
        content: `这是一个${randomName}的详细描述`,
        todoStatus: statusValue,
        status: statusValue,
        deadLine: deadLine.toISOString(),
        tag: Math.random() > 0.7 ? 1 : 0,
        todoUsers: [
          {
            ...randomUser,
            status: 1,
            owner: 1
          }
        ],
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      })
    }
    
    return tasks
  }

  function handleKanbanScroll(event, statusKey) {
    const { scrollTop, scrollHeight, clientHeight } = event.target
    const column = kanbanColumns.value[statusKey]
    
    if (scrollHeight - scrollTop - clientHeight < 50 && !column.loading && column.hasMore) {
      column.page++
      fetchKanbanColumnData(statusKey, true)
    }
  }

  async function handleDragChange(evt, targetStatusKey) {
    if (evt.added) {
      const task = evt.added.element
      
      if (!task || !task.id) {
        console.error('Invalid task:', task)
        return
      }
      
      const statusValue = mapStatusKeyToValue(targetStatusKey)
      const taskId = task.id
      
      try {
        task.status = statusValue
        task.todoStatus = statusValue
        
        const response = await todoApi.updateTodoStatus(taskId, statusValue)
        if (response.code === '200') {
          ElMessage.success('状态更新成功')
          kanbanColumns.value[targetStatusKey].total++
        } else {
          throw new Error(response.message || '更新失败')
        }
      } catch (error) {
        console.error('Update task status error:', error)
        ElMessage.error('状态更新失败')
        kanbanColumns.value[targetStatusKey].page = 1
        kanbanColumns.value[targetStatusKey].list = []
        await fetchKanbanColumnData(targetStatusKey)
      }
    }
    
    if (evt.removed) {
      const fromStatus = evt.removed.element.todoStatus || evt.removed.element.status
      const fromStatusKey = Object.keys(kanbanColumns.value).find(key => 
        mapStatusKeyToValue(key) === fromStatus
      )
      if (fromStatusKey && kanbanColumns.value[fromStatusKey]) {
        kanbanColumns.value[fromStatusKey].total--
      }
    }
  }

  return {
    kanbanStatusList,
    kanbanColumns,
    initKanbanData,
    fetchKanbanColumnData,
    handleKanbanScroll,
    handleDragChange,
    mapStatusKeyToValue
  }
}
