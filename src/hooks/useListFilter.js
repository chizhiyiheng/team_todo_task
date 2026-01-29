import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { todoApi } from '@/api'
import { TASK_STATUS, NORMAL_STATUS_LIST } from '@/constants/taskEnums'

/**
 * 列表筛选 Hook
 * 用于管理任务列表的数据获取、分页、筛选等功能
 * 
 * @param {Object} props - 组件的 props
 * @param {String} props.taskType - 任务类型：'my' 我的任务, 'team' 团队任务
 * @param {String} props.mode - 查询模式：'executed' 我执行的, 'assigned' 我分配的
 * @param {Number} props.teamId - 团队/项目 ID
 * @returns {Object} 返回列表数据、筛选方法等
 */
export function useListFilter(props) {
  // ==================== 状态管理 ====================
  
  // 列表数据与分页状态
  const listTasks = ref([])           // 任务列表数据
  const listPage = ref(1)              // 当前页码
  const listPageSize = ref(10)         // 每页条数
  const listTotal = ref(0)             // 总记录数
  const listLoading = ref(false)       // 加载状态
  
  // 筛选条件与筛选项列表
  const selectedAssignees = ref([])    // 已选择的执行人 ID 列表
  const selectedStatuses = ref([])     // 已选择的状态列表
  const assigneeList = ref([])         // 可选的执行人列表
  
  // 状态筛选的特殊逻辑状态
  const isAllStatusSelected = ref(false)  // 是否选择了"全部"
  const isDeletedSelected = ref(false)    // 是否选择了"已删除"
  
  // 计算属性：正常状态是否被禁用（当选择了已删除时）
  const isNormalStatusDisabled = computed(() => isDeletedSelected.value)

  // ==================== 核心方法 ====================
  
  /**
   * 获取任务列表数据
   * 根据当前的分页、筛选条件等参数请求任务列表
   */
  async function fetchListTasks() {
    // 防止重复请求
    if (listLoading.value) return
    
    listLoading.value = true
    try {
      // 组装列表查询参数
      const params = {
        page: listPage.value,
        pageSize: listPageSize.value,
        // queryType: 0 全部任务；1 我分配的；2 分配给我的（我执行的）
        queryType: props.taskType === 'my' ? (props.mode === 'assigned' ? 1 : 2) : 0
      }
      
      // 执行人筛选：只在有选择时传递 umList 参数
      if (selectedAssignees.value.length > 0) {
        params.umList = selectedAssignees.value
      }
      
      // 状态筛选：只在有选择时传递 statusList 参数
      if (selectedStatuses.value.length > 0) {
        params.statusList = selectedStatuses.value
      }
      
      // 团队/项目维度筛选
      if (props.teamId) {
        params.projectId = String(props.teamId)
      }
      
      console.log('[useListFilter] Fetching tasks with params:', params)
      console.log('[useListFilter] Props:', { taskType: props.taskType, mode: props.mode, teamId: props.teamId })
      console.trace('[useListFilter] Call stack')
      
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

  /**
   * 获取执行人列表
   * 用于执行人筛选下拉框
   */
  async function fetchAssigneeList() {
    try {
      // 获取执行人列表，用于筛选
      const response = await todoApi.getUserList()
      if (response.code === '200') {
        assigneeList.value = response.data || []
      }
    } catch (error) {
      console.error('Fetch assignee list error:', error)
    }
  }
  
  // ==================== 筛选处理方法 ====================
  
  /**
   * 执行人筛选变更处理
   * 变更筛选后回到第一页并重新获取数据
   */
  function handleAssigneeFilterChange() {
    listPage.value = 1
    fetchListTasks()
  }

  /**
   * 状态筛选变更处理
   * 实现复杂的状态筛选逻辑：
   * 1. 勾选"全部"时，勾选所有正常状态
   * 2. 取消任意正常状态时，取消"全部"
   * 3. 勾选"已删除"时，取消所有正常状态并禁用
   * 4. 取消"已删除"时，恢复正常状态可选
   */
  function handleStatusFilterChange(newSelectedStatuses) {
    console.log('[useListFilter] Status filter changed:', newSelectedStatuses)
    
    // 检查是否包含"全部"和"已删除"
    const hasAll = newSelectedStatuses.includes('all')
    const hasDeleted = newSelectedStatuses.includes(TASK_STATUS.DELETED)
    
    // 获取正常状态的选择情况
    const normalStatusesInSelection = newSelectedStatuses.filter(status => 
      NORMAL_STATUS_LIST.includes(status)
    )
    
    let finalStatuses = [...newSelectedStatuses]
    
    // 处理"全部"的逻辑
    if (hasAll && !isAllStatusSelected.value) {
      // 刚勾选了"全部"
      isAllStatusSelected.value = true
      // 添加所有正常状态，移除"全部"标识
      finalStatuses = [...NORMAL_STATUS_LIST]
      if (hasDeleted) {
        finalStatuses.push(TASK_STATUS.DELETED)
      }
    } else if (!hasAll && isAllStatusSelected.value) {
      // 取消了"全部"
      isAllStatusSelected.value = false
    } else if (isAllStatusSelected.value && normalStatusesInSelection.length < NORMAL_STATUS_LIST.length) {
      // 在"全部"状态下取消了某个正常状态
      isAllStatusSelected.value = false
      // 从finalStatuses中移除"all"
      finalStatuses = finalStatuses.filter(status => status !== 'all')
    }
    
    // 处理"已删除"的逻辑
    if (hasDeleted && !isDeletedSelected.value) {
      // 刚勾选了"已删除"
      isDeletedSelected.value = true
      isAllStatusSelected.value = false
      // 只保留"已删除"状态
      finalStatuses = [TASK_STATUS.DELETED]
    } else if (!hasDeleted && isDeletedSelected.value) {
      // 取消了"已删除"
      isDeletedSelected.value = false
      // 移除已删除状态
      finalStatuses = finalStatuses.filter(status => status !== TASK_STATUS.DELETED)
    }
    
    // 检查是否所有正常状态都被选中（用于同步"全部"状态）
    if (!hasDeleted && !isDeletedSelected.value) {
      const allNormalSelected = NORMAL_STATUS_LIST.every(status => 
        finalStatuses.includes(status)
      )
      isAllStatusSelected.value = allNormalSelected
    }
    
    // 更新选中的状态
    selectedStatuses.value = finalStatuses
    
    console.log('[useListFilter] Final statuses:', finalStatuses)
    console.log('[useListFilter] isAllStatusSelected:', isAllStatusSelected.value)
    console.log('[useListFilter] isDeletedSelected:', isDeletedSelected.value)
    
    // 重新获取数据
    listPage.value = 1
    fetchListTasks()
  }
  
  /**
   * 处理"全部"状态的勾选
   */
  function handleAllStatusChange(checked) {
    if (checked) {
      // 勾选全部：选择所有正常状态
      isAllStatusSelected.value = true
      isDeletedSelected.value = false
      selectedStatuses.value = [...NORMAL_STATUS_LIST]
    } else {
      // 取消全部：清空所有状态
      isAllStatusSelected.value = false
      selectedStatuses.value = []
    }
    
    listPage.value = 1
    fetchListTasks()
  }
  
  /**
   * 处理"已删除"状态的勾选
   */
  function handleDeletedStatusChange(checked) {
    if (checked) {
      // 勾选已删除：只选择已删除状态
      isDeletedSelected.value = true
      isAllStatusSelected.value = false
      selectedStatuses.value = [TASK_STATUS.DELETED]
    } else {
      // 取消已删除：移除已删除状态
      isDeletedSelected.value = false
      selectedStatuses.value = selectedStatuses.value.filter(status => status !== TASK_STATUS.DELETED)
    }
    
    listPage.value = 1
    fetchListTasks()
  }

  // ==================== 分页处理方法 ====================
  
  /**
   * 页码变更处理
   * @param {Number} page - 新的页码
   */
  function handlePageChange(page) {
    listPage.value = page
    fetchListTasks()
  }

  /**
   * 每页条数变更处理
   * @param {Number} pageSize - 新的每页条数
   */
  function handlePageSizeChange(pageSize) {
    listPageSize.value = pageSize
    listPage.value = 1
    fetchListTasks()
  }

  // ==================== 监听器 ====================
  
  /**
   * 监听 mode 变化（我执行的 / 我分配的）
   * 变化时重置到第一页并重新获取数据
   * 注意：跳过初始化时的触发，避免重复请求
   */
  watch(() => props.mode, (newVal, oldVal) => {
    console.log('[useListFilter] mode changed:', oldVal, '->', newVal)
    // 避免初始化时重复调用
    if (oldVal === undefined) return
    listPage.value = 1
    fetchListTasks()
  })

  /**
   * 监听 taskType 变化（我的任务 / 团队任务）
   * 变化时重置到第一页并重新获取数据
   */
  watch(() => props.taskType, (newVal, oldVal) => {
    console.log('[useListFilter] taskType changed:', oldVal, '->', newVal)
    // 避免初始化时重复调用
    if (oldVal === undefined) return
    listPage.value = 1
    fetchListTasks()
  })

  /**
   * 监听 teamId 变化
   * 变化时重置到第一页并重新获取数据
   */
  watch(() => props.teamId, (newVal, oldVal) => {
    console.log('[useListFilter] teamId changed:', oldVal, '->', newVal)
    // 避免初始化时重复调用
    if (oldVal === undefined) return
    listPage.value = 1
    fetchListTasks()
  })

  // ==================== 返回值 ====================
  
  return {
    // 数据
    listTasks,
    listPage,
    listPageSize,
    listTotal,
    listLoading,
    selectedAssignees,
    selectedStatuses,
    assigneeList,
    isAllStatusSelected,
    isDeletedSelected,
    isNormalStatusDisabled,
    // 方法
    fetchListTasks,
    fetchAssigneeList,
    handleAssigneeFilterChange,
    handleStatusFilterChange,
    handleAllStatusChange,
    handleDeletedStatusChange,
    handlePageChange,
    handlePageSizeChange
  }
}
