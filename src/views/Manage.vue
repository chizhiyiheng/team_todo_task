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
        <el-button type="primary" :icon="Plus" @click="handleAddTask">
          {{ $t('task.createTask') }}
        </el-button>
        <el-dropdown @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" :src="userAvatar" />
            <span class="user-name">{{ userName }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                {{ $t('menu.settings') }}
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                {{ $t('menu.logout') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Menu, Plus, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useTaskStore } from '@/stores/task'
import { useTeamStore } from '@/stores/team'
import { useAppStore } from '@/stores/app'
import { useDevice } from '@/utils/device'
import Sidebar from '@/components/layout/Sidebar.vue'

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

const pageTitle = computed(() => route.meta.title || t('menu.myTasks'))
const userName = computed(() => userStore.userName)
const userAvatar = computed(() => userStore.userAvatar)

const executedCount = computed(() => taskStore.taskList.filter(task => task.status === '0').length)
const assignedCount = computed(() => taskStore.taskList.filter(task => task.status === '1').length)
const teams = computed(() => teamStore.teamList)

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
  console.log('Add task')
}

function handleCommand(command) {
  if (command === 'settings') {
    router.push('/settings')
  } else if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}

onMounted(() => {
  appStore.setDeviceType(isMobile.value)
  if (isDesktop.value) {
    taskStore.fetchTaskList({ todoStatus: '2', pageNum: 1, pageSize: 10000 })
    taskStore.fetchTaskStatistics()
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

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.3s;

    &:hover {
      background: #f5f7fa;
    }

    .user-name {
      font-size: 14px;
      color: #606266;
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
  padding: 20px;
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
