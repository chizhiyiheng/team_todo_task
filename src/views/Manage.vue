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
        <div class="task-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索任务"
            clearable
            :prefix-icon="Search"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
        </div>
        <el-button type="primary" :icon="Plus" @click="handleAddTask" class="create-task-btn">
          {{ $t('task.createTask') }}
        </el-button>
      </div>
    </div>

    <div class="manage-content">
      <Sidebar
        v-if="!isMobile || sidebarVisible"
        :executed-count="executedCount"
        :assigned-count="assignedCount"
        :teams="teams"
        :is-collapsed="isSidebarCollapsed"
        @tab-changed="handleTabChanged"
        @team-selected="handleTeamSelected"
        @create-space="handleCreateSpace"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Menu, Plus, Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useTaskStore } from '@/stores/task'
import { useTeamStore } from '@/stores/team'
import { useAppStore } from '@/stores/app'
import { useDevice } from '@/utils/device'
import Sidebar from '@/components/layout/Sidebar.vue'
import CreateTaskDialog from '@/components/business/CreateTaskDialog.vue'

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

const pageTitle = computed(() => route.meta.title || t('menu.myTasks'))
const executedCount = computed(() => (taskStore.taskList || []).filter(task => task.status === '0').length)
const assignedCount = computed(() => (taskStore.taskList || []).filter(task => task.status === '1').length)
const teams = computed(() => teamStore.teamList || [])

function toggleSidebar() {
  if (isMobile.value) {
    sidebarVisible.value = !sidebarVisible.value
  } else {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
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

function handleCreateSpace() {
  console.log('Create new space')
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
 * 搜索处理
 * TODO: 实现搜索功能，需要与子页面通信
 */
function handleSearch() {
  console.log('[Manage] Search keyword:', searchKeyword.value)
  // TODO: 通过事件或其他方式通知子页面进行搜索
  // taskStore.fetchTaskList({ page: 1, pageSize: 10000, keyword: searchKeyword.value })
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
})

onUnmounted(() => {
  sidebarVisible.value = false
})
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
    }

    .page-title {
      font-size: 16px;
    }
  }

  .main-view {
    padding: 12px;
  }
}
</style>
