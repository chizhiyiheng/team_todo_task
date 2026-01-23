<template>
  <div class="my-tasks-page">
    <TaskStatistics
      :title="statisticsTitle"
      task-type="my"
      :show-create-button="true"
      :mode="activeTab"
      :show-list="false"
      :show-controls="false"
      @view-mode-changed="handleViewModeChange"
      @create-task="handleCreateTask"
    />
    <div class="task-toolbar">
      <div class="toolbar-left">
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button :class="{ active: viewMode === 'list' }" @click="handleViewModeChange('list')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </el-button>
          <el-button :class="{ active: viewMode === 'kanban' }" @click="handleViewModeChange('kanban')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </el-button>
          <el-button :class="{ active: viewMode === 'gantt' }" @click="handleViewModeChange('gantt')">
            <el-icon><Calendar /></el-icon>
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <TaskList
      :view-mode="viewMode"
      :show-header="false"
      task-type="my"
      :mode="activeTab"
      @view-mode-changed="handleViewModeChange"
      @task-deleted="handleTaskDeleted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/task'
import { Calendar } from '@element-plus/icons-vue'
import TaskStatistics from '@/components/business/TaskStatistics.vue'
import TaskList from '@/components/business/TaskList.vue'

const route = useRoute()
const { t } = useI18n()
const taskStore = useTaskStore()

const viewMode = ref('list')

const activeTab = computed(() => route.query.tab || 'executed')
const statisticsTitle = computed(() => {
  return t('task.taskStatistics')
})

function handleViewModeChange(mode) {
  viewMode.value = mode
}

function handleCreateTask() {
  console.log('Create new task')
}

function handleTaskDeleted(taskId) {
  console.log('Task deleted in dialog:', taskId)
  // Refresh the task list to remove deleted task
  taskStore.fetchTaskList({ page: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
}

onMounted(() => {
  console.log('MyTasks onMounted')
  taskStore.fetchTaskList({ page: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
})

watch(() => taskStore.taskList.length, (newLength) => {
  console.log('Task list updated count:', newLength)
})

watch(activeTab, () => {
  console.log('Tab changed:', activeTab.value)
})
</script>

<style scoped lang="scss">
.my-tasks-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.task-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 6px 8px;
  margin-top: 12px;
  margin-bottom: 4px;
  flex-wrap: wrap;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .filter-label {
    font-size: 14px;
    color: #666;
    white-space: nowrap;
  }

  .el-button-group {
    .el-button {
      background: transparent !important;
      border-color: #dcdfe6 !important;
      color: #606266 !important;

      &.active {
        background: #fff !important;
        border-color: #409eff !important;
        color: #409eff !important;
      }

      &:hover {
        background: #f5f7fa !important;
        border-color: #c6e2ff !important;
        color: #409eff !important;
      }
    }
  }
}
</style>
