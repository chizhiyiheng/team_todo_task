<template>
  <div class="manage-layout" :class="{ 'is-mobile': isMobile }">
    <div class="page-header">
      <div class="header-left">
        <el-button
          v-if="isMobile"
          :icon="Menu"
          @click="toggleSidebar"
          circle
          size="small"
        />
        <h3 class="page-title">{{ pageTitle }}</h3>
      </div>
      <div class="header-right">
        <div class="task-search" ref="searchContainerRef">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索任务"
            clearable
            :prefix-icon="Search"
            @input="handleSearchInput"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
            @clear="handleSearchClear"
          />
          <TaskSearchResults
            :visible="showSearchResults"
            :keyword="searchKeyword"
            :results="searchResults"
            :loading="searchLoading"
            :has-more="hasMoreResults"
            @task-click="handleSearchTaskClick"
            @load-more="handleLoadMore"
            @close="closeSearchResults"
          />
        </div>
        <el-button type="primary" :icon="Plus" @click="handleAddTask" class="create-task-btn">
          {{ $t('task.createTask') }}
        </el-button>
        <el-button type="success" :icon="Microphone" @click="showVoiceDialog = true" class="voice-task-btn">
          语音转待办
        </el-button>
      </div>
    </div>

    <div class="manage-content">
      <Sidebar
        :executed-count="executedCount"
        :assigned-count="assignedCount"
        :teams="teams"
        :is-collapsed="isSidebarCollapsed"
        :is-mobile-open="sidebarVisible"
        @tab-changed="handleTabChanged"
        @team-selected="handleTeamSelected"
        @close-sidebar="closeSidebar"
        class="sidebar-component"
      />
      <div
        class="sidebar-overlay"
        v-if="isMobile && sidebarVisible"
        @click="toggleSidebar"
      ></div>
      <div class="main-view">
        <router-view />
      </div>
    </div>

    <!-- Create Task Dialog -->
    <CreateTaskDialog
      v-model="showCreateTask"
      task-type="personal"
      @task-created="handleTaskCreated"
    />

    <!-- Voice to Text Dialog -->
    <VoiceToTextDialog
      v-model="showVoiceDialog"
      @todo-created="handleVoiceTodoCreated"
    />

    <!-- Task Detail Dialog -->
    <TaskDetailDialog
      v-model="showTaskDetail"
      :task-id="selectedTaskId"
      @task-updated="handleTaskUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Menu, Plus, Search, Microphone } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useTaskStore } from '@/stores/task'
import { useTeamStore } from '@/stores/team'
import { useAppStore } from '@/stores/app'
import { useDevice } from '@/utils/device'
import Sidebar from '@/components/layout/Sidebar.vue'
import CreateTaskDialog from '@/components/business/CreateTaskDialog.vue'
import TaskSearchResults from '@/components/business/TaskSearchResults.vue'
import TaskDetailDialog from '@/components/business/task-detail/TaskDetailDialog.vue'
import VoiceToTextDialog from '@/components/business/VoiceToTextDialog.vue'
import apiService from '@/api/request'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const userStore = useUserStore()
const taskStore = useTaskStore()
const teamStore = useTeamStore()
const appStore = useAppStore()

const { isMobile, isDesktop } = useDevice()

const sidebarVisible = ref(false)
const isSidebarCollapsed = ref(false)
const searchKeyword = ref('')
const showCreateTask = ref(false)
const showVoiceDialog = ref(false)

// 搜索相关状态
const showSearchResults = ref(false)
const searchResults = ref([])
const searchLoading = ref(false)
const searchPageNum = ref(1)
const searchPageSize = ref(10)
const searchTotal = ref(0)
const searchContainerRef = ref(null)
const searchDebounceTimer = ref(null)

// 任务详情弹窗
const showTaskDetail = ref(false)
const selectedTaskId = ref(null)

const pageTitle = computed(() => {
  // 如果是我的任务页面，根据 tab 参数显示不同标题
  if (route.path === '/manage/my-tasks') {
    const tab = route.query.tab || 'executed'
    if (tab === 'executed') {
      return t('task.myExecutedTasks')
    } else if (tab === 'assigned') {
      return t('task.myAssignedTasks')
    }
  }
  // 如果是团队任务页面，显示团队名称
  if (route.path.startsWith('/manage/project/')) {
    const teamId = parseInt(route.params.teamId)
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      return team.name
    }
    return t('menu.teamTasks')
  }
  // 其他页面使用 meta.title
  return route.meta.title || t('menu.myTasks')
})
const executedCount = computed(() => (taskStore.taskList || []).filter(task => task.status === '0').length)
const assignedCount = computed(() => (taskStore.taskList || []).filter(task => task.status === '1').length)
const teams = computed(() => teamStore.teamList || [])
const hasMoreResults = computed(() => searchResults.value.length < searchTotal.value)

function toggleSidebar() {
  if (isMobile.value) {
    sidebarVisible.value = !sidebarVisible.value
  } else {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }
}

function closeSidebar() {
  if (isMobile.value) {
    sidebarVisible.value = false
  }
}

function handleTabChanged(type) {
  if (type === 'executed') {
    router.push('/manage/my-tasks?tab=executed')
  } else if (type === 'assigned') {
    router.push('/manage/my-tasks?tab=assigned')
  }
}

function handleTeamSelected(teamId) {
  router.push(`/manage/project/${teamId}`)
}

function handleAddTask() {
  showCreateTask.value = true
}

/**
 * 任务创建成功处理
 * 只刷新统计数据，任务列表由子页面自己刷新
 * @param {String|Number} taskId - 新创建的任务 ID
 */
function handleTaskCreated(taskId) {
  console.log('[Manage] Task created:', taskId)
  // 只刷新统计数据，任务列表由子页面自己管理
  taskStore.fetchTaskStatistics()
}

/**
 * 搜索输入处理（防抖）
 */
function handleSearchInput() {
  // 清除之前的定时器
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }

  // 如果输入为空，清空结果
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    showSearchResults.value = false
    return
  }

  // 设置新的定时器
  searchDebounceTimer.value = setTimeout(() => {
    performSearch()
  }, 300)
}

/**
 * 搜索框获得焦点
 */
function handleSearchFocus() {
  if (searchKeyword.value.trim() && searchResults.value.length > 0) {
    showSearchResults.value = true
  }
}

/**
 * 搜索框失去焦点
 */
function handleSearchBlur() {
  // 延迟关闭，以便点击搜索结果
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

/**
 * 清空搜索
 */
function handleSearchClear() {
  searchKeyword.value = ''
  searchResults.value = []
  showSearchResults.value = false
  searchPageNum.value = 1
  searchTotal.value = 0
}

/**
 * 执行搜索
 */
async function performSearch(isLoadMore = false) {
  if (!searchKeyword.value.trim()) return

  try {
    // 如果是加载更多，页码+1，否则重置为1
    if (!isLoadMore) {
      searchLoading.value = true
      searchPageNum.value = 1
      searchResults.value = []
    } else {
      searchPageNum.value++
    }

    console.log('[Manage] Performing search, isLoadMore:', isLoadMore, 'page:', searchPageNum.value)

    const response = await apiService.get('/api/todo/search', {
      keyword: searchKeyword.value.trim(),
      pageNum: searchPageNum.value,
      pageSize: searchPageSize.value
    })

    if (response.code === '200' && response.data) {
      const { list, total } = response.data
      
      console.log('[Manage] Search response:', { listLength: list.length, total, isLoadMore })
      
      if (isLoadMore) {
        // 使用 push 方法直接添加到现有数组，避免创建新数组引用
        searchResults.value.push(...list)
      } else {
        searchResults.value = list
        // 只在新搜索时设置显示状态，避免触发滚动重置
        showSearchResults.value = true
      }
      
      searchTotal.value = total
    }
  } catch (error) {
    console.error('[Manage] Search error:', error)
  } finally {
    searchLoading.value = false
  }
}

/**
 * 加载更多搜索结果
 */
function handleLoadMore() {
  performSearch(true)
}

/**
 * 点击搜索结果
 */
function handleSearchTaskClick(task) {
  console.log('[Manage] Search task clicked:', task)
  selectedTaskId.value = task.id
  showTaskDetail.value = true
  closeSearchResults()
}

/**
 * 关闭搜索结果
 */
function closeSearchResults() {
  showSearchResults.value = false
}

/**
 * 语音转待办创建成功处理
 * @param {Object} todoData - 待办数据
 */
function handleVoiceTodoCreated(todoData) {
  console.log('[Manage] Voice todo created:', todoData)
  // 调用创建待办接口
  // 这里可以复用现有的创建逻辑
  taskStore.fetchTaskStatistics()
}

/**
 * 任务详情更新后刷新
 */
function handleTaskUpdated() {
  // 刷新统计数据
  taskStore.fetchTaskStatistics()
  // 如果有搜索关键词，重新搜索
  if (searchKeyword.value.trim()) {
    performSearch()
  }
}

/**
 * 组件挂载时
 * 只设置设备类型和获取团队列表
 * 任务数据由各个子页面自己管理，避免重复请求
 */
onMounted(() => {
  console.log('[Manage] Component mounted')
  appStore.setDeviceType(isMobile.value)
  if (isDesktop.value) {
    // 只获取团队列表，任务数据由子页面（MyTasks/TeamTasks）自己获取
    teamStore.fetchTeamList()
  }

  // 点击外部关闭搜索结果
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  sidebarVisible.value = false
  document.removeEventListener('click', handleClickOutside)
  
  // 清除定时器
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value)
  }
})

/**
 * 点击外部关闭搜索结果
 */
function handleClickOutside(event) {
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
    showSearchResults.value = false
  }
}
</script>

<style scoped lang="scss">
.manage-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .create-task-btn {
    background-color: #ff6b35 !important;
    border-color: #ff6b35 !important;

    &:hover {
      background-color: #e55a2b !important;
      border-color: #e55a2b !important;
    }
  }

  .task-search {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;

    :deep(.el-input) {
      width: 220px;
    }
  }
}

.manage-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.sidebar-component {
  height: 100%;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.main-view {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

@media (max-width: 768px) {
  .manage-layout {
    .page-header {
      padding: 12px 16px;
      flex-wrap: wrap;
      gap: 12px;
      
      .header-left {
        flex: 1;
        min-width: 0;
      }
      
      .header-right {
        width: 100%;
        justify-content: space-between;
        gap: 8px;
        
        .task-search {
          flex: 1;
          min-width: 0;
          
          :deep(.el-input) {
            width: 100%;
          }
        }
        
        .create-task-btn {
          flex-shrink: 0;
          padding: 8px 12px;
          font-size: 13px;
          white-space: nowrap;
        }
        
        .voice-task-btn {
          flex-shrink: 0;
          padding: 8px 12px;
          font-size: 13px;
          white-space: nowrap;
        }
      }
    }

    .page-title {
      font-size: 16px;
    }
  }

  .main-view {
    padding: 8px;
  }
}
</style>
