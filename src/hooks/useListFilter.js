import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { todoApi } from '@/api'

export function useListFilter(props) {
  const listTasks = ref([])
  const listPage = ref(1)
  const listPageSize = ref(20)
  const listTotal = ref(0)
  const listLoading = ref(false)
  const selectedAssignees = ref([])
  const selectedStatuses = ref([])
  const assigneeList = ref([])

  async function fetchListTasks() {
    if (listLoading.value) return
    
    listLoading.value = true
    try {
      // 如果是开发环境，使用mock数据
      if (import.meta.env.DEV) {
        const mockTasks = generateMockListTasks(20)
        listTasks.value = mockTasks
        listTotal.value = mockTasks.length
        listLoading.value = false
        return
      }
      
      const params = {
        page: listPage.value,
        pageSize: listPageSize.value,
        queryType: props.taskType === 'my' ? (props.mode === 'assigned' ? 1 : 2) : 0
      }
      
      if (selectedAssignees.value.length > 0) {
        params.assigneeIds = selectedAssignees.value
      }
      
      if (selectedStatuses.value.length > 0) {
        params.statuses = selectedStatuses.value
      }
      
      if (props.teamId) {
        params.projectId = String(props.teamId)
      }
      
      const response = await todoApi.getTodoList(params)
      if (response.code === '200') {
        listTasks.value = response.body.list || []
        listTotal.value = response.body.total || 0
      }
    } catch (error) {
      console.error('Fetch list tasks error:', error)
      ElMessage.error('获取任务列表失败')
    } finally {
      listLoading.value = false
    }
  }

  async function fetchAssigneeList() {
    try {
      // 如果是开发环境，使用mock数据
      if (import.meta.env.DEV) {
        assigneeList.value = [
          { id: 'UM001', name: '张三', umId: 'UM001' },
          { id: 'UM002', name: '李四', umId: 'UM002' },
          { id: 'UM003', name: '王五', umId: 'UM003' }
        ]
        return
      }
      
      const response = await todoApi.getUserList()
      if (response.code === '200') {
        assigneeList.value = response.body || []
      }
    } catch (error) {
      console.error('Fetch assignee list error:', error)
    }
  }
  
  function generateMockListTasks(count) {
    const tasks = []
    const names = [
      '完成项目文档编写',
      '修复登录页面bug',
      '优化数据库查询性能',
      '设计新功能原型',
      '代码审查和重构',
      '编写单元测试',
      '部署生产环境',
      '用户反馈处理',
      '接口联调测试',
      '性能优化分析'
    ]
    const users = [
      { name: '张三', umId: 'UM001' },
      { name: '李四', umId: 'UM002' },
      { name: '王五', umId: 'UM003' }
    ]
    const statuses = [1, 2, 3, 4, 5]
    
    for (let i = 0; i < count; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)]
      const randomUser = users[Math.floor(Math.random() * users.length)]
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      const daysOffset = Math.floor(Math.random() * 10) - 5
      const deadLine = new Date()
      deadLine.setDate(deadLine.getDate() + daysOffset)
      
      tasks.push({
        id: `mock_list_${i}`,
        title: `${randomName} ${i + 1}`,
        content: `这是一个${randomName}的详细描述`,
        todoStatus: randomStatus,
        status: randomStatus,
        deadLine: deadLine.toISOString(),
        tag: Math.random() > 0.7 ? 1 : 0,
        source: Math.floor(Math.random() * 3),
        todoUsers: [
          {
            ...randomUser,
            status: 1,
            owner: 1
          }
        ],
        name: randomUser.name,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      })
    }
    
    return tasks
  }

  function handleAssigneeFilterChange() {
    listPage.value = 1
    fetchListTasks()
  }

  function handleStatusFilterChange() {
    listPage.value = 1
    fetchListTasks()
  }

  return {
    listTasks,
    listPage,
    listPageSize,
    listTotal,
    listLoading,
    selectedAssignees,
    selectedStatuses,
    assigneeList,
    fetchListTasks,
    fetchAssigneeList,
    handleAssigneeFilterChange,
    handleStatusFilterChange
  }
}
