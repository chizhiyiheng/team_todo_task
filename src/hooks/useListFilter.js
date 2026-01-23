import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { todoApi } from '@/api'

export function useListFilter(props) {
  const listTasks = ref([])
  const listPage = ref(1)
  const listPageSize = ref(10)
  const listTotal = ref(0)
  const listLoading = ref(false)
  const selectedAssignees = ref([])
  const selectedStatuses = ref([])
  const assigneeList = ref([])

  async function fetchListTasks() {
    if (listLoading.value) return
    
    listLoading.value = true
    try {
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
      const response = await todoApi.getUserList()
      if (response.code === '200') {
        assigneeList.value = response.data || []
      }
    } catch (error) {
      console.error('Fetch assignee list error:', error)
    }
  }
  
  function handleAssigneeFilterChange() {
    listPage.value = 1
    fetchListTasks()
  }

  function handleStatusFilterChange() {
    listPage.value = 1
    fetchListTasks()
  }

  function handlePageChange(page) {
    listPage.value = page
    fetchListTasks()
  }

  function handlePageSizeChange(pageSize) {
    listPageSize.value = pageSize
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
    handleStatusFilterChange,
    handlePageChange,
    handlePageSizeChange
  }
}
