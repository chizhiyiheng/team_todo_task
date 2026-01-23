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
/**
 * 我的任务页面
 * 显示当前用户的任务列表，包括"我执行的"和"我分配的"两个标签页
 * 
 * 功能：
 * 1. 任务统计展示（通过 TaskStatistics 组件）
 * 2. 任务列表展示（通过 TaskList 组件）
 * 3. 视图模式切换（列表/看板/甘特图）
 * 4. 标签页切换（我执行的/我分配的）
 */

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

// ==================== 状态管理 ====================

// 视图模式：list 列表视图, kanban 看板视图, gantt 甘特图视图
const viewMode = ref('list')

// 当前激活的标签页：executed 我执行的, assigned 我分配的
// 从 URL 查询参数中获取，默认为 'executed'
// 使用 ref 而不是 computed，避免初始化时的 undefined 问题
const activeTab = ref(route.query.tab || 'executed')

// 统计区域标题
const statisticsTitle = computed(() => {
  return t('task.taskStatistics')
})

// ==================== 事件处理 ====================

/**
 * 视图模式切换处理
 * @param {String} mode - 新的视图模式 (list/kanban/gantt)
 */
function handleViewModeChange(mode) {
  viewMode.value = mode
}

/**
 * 创建任务处理
 * TODO: 实现创建任务功能
 */
function handleCreateTask() {
  console.log('Create new task')
}

/**
 * 任务删除处理
 * 当任务被删除后，只刷新统计数据
 * TaskList 组件会自己处理列表数据的刷新
 * 
 * @param {String|Number} taskId - 被删除的任务 ID
 */
function handleTaskDeleted(taskId) {
  console.log('Task deleted in dialog:', taskId)
  // 只刷新统计数据，TaskList 会处理自己的数据刷新
  taskStore.fetchTaskStatistics()
}

// ==================== 生命周期 ====================

/**
 * 组件挂载时
 * 只获取统计数据，TaskList 组件会自己获取任务列表
 * 这样避免了重复请求
 */
onMounted(() => {
  console.log('[MyTasks] Component mounted')
  // 只获取统计数据，TaskList 组件会自己获取任务列表
  taskStore.fetchTaskStatistics()
})

// ==================== 监听器 ====================

/**
 * 监听任务列表长度变化
 * 用于调试和日志记录
 */
watch(() => taskStore.taskList.length, (newLength) => {
  console.log('[MyTasks] Task list updated count:', newLength)
})

/**
 * 监听标签页切换
 * 用于调试和日志记录
 */
watch(activeTab, (newTab) => {
  console.log('[MyTasks] Tab changed to:', newTab)
})

/**
 * 监听路由查询参数变化
 * 当 URL 中的 tab 参数变化时，更新 activeTab
 */
watch(() => route.query.tab, (newTab) => {
  if (newTab && newTab !== activeTab.value) {
    activeTab.value = newTab
  }
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
