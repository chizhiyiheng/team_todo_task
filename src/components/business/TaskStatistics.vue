<template>
  <div class="task-statistics">
    <div class="statistics-header">
      <div class="header-content">
        <h3 style="font-size: 14px;">{{ title }}</h3>
        <div v-if="showControls" class="statistics-controls">
          <el-select v-model="statusFilter" :placeholder="$t('task.filterByStatus')" style="width: 120px" @change="filterChanged">
            <el-option :label="$t('task.statusAll')" value="all" />
            <el-option :label="$t('task.statusPending')" value="pending" />
            <el-option :label="$t('task.statusInProgress')" value="in_progress" />
            <el-option :label="$t('task.statusCompleted')" value="completed" />
            <el-option :label="$t('task.statusOverdue')" value="overdue" />
          </el-select>
          <el-select v-model="viewMode" :placeholder="$t('task.viewMode')" style="width: 120px" @change="viewModeChanged">
            <el-option :label="$t('task.listView')" value="list" />
            <el-option :label="$t('task.kanbanView')" value="kanban" />
            <el-option :label="$t('task.ganttView')" value="gantt" />
          </el-select>
          <el-button v-if="showCreateButton" type="primary" :icon="Plus" @click="createNewTask">
            {{ $t('task.createTask') }}
          </el-button>
        </div>
        <div class="statistics-summary">
          <div class="summary-item">
            <div class="summary-value">{{ totalCount }}</div>
            <div class="summary-label">{{ $t('task.totalTasks') }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-value completed">{{ statusData.completed }}</div>
            <div class="summary-label">{{ $t('task.completedTasks') }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-value in-progress">{{ statusData.in_progress }}</div>
            <div class="summary-label">{{ $t('task.inProgressTasks') }}</div>
          </div>
          <div class="summary-item">
            <div class="summary-value overdue">{{ statusData.overdue }}</div>
            <div class="summary-label">{{ $t('task.overdueTasks') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="statistics-content">
      <div class="statistics-section">
        <div class="charts-container">
          <div class="chart-item">
            <div ref="statusChartRef" style="height: 180px;"></div>
          </div>
          <div class="chart-item">
            <div ref="userChartRef" style="height: 180px;"></div>
          </div>
        </div>
      </div>

      <div v-if="showList" class="task-list">
        <TaskList
          :view-mode="viewMode"
          :status-filter="statusFilter"
          :task-type="taskType"
          :team-id="selectedTeam"
          :mode="mode"
          @view-mode-changed="onTaskListViewModeChanged"
          @filter-changed="onTaskListFilterChanged"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/task'
import * as echarts from 'echarts'
import TaskList from './TaskList.vue'
import { useTheme } from '@/hooks/useTheme' // 导入 useTheme

const props = defineProps({
  title: {
    type: String,
    default: '任务统计'
  },
  taskType: {
    type: String,
    default: 'my'
  },
  teamId: {
    type: Number,
    default: null
  },
  showCreateButton: {
    type: Boolean,
    default: true
  },
  showList: {
    type: Boolean,
    default: true
  },
  mode: {
    type: String,
    default: 'executed'
  },
  showControls: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['filter-changed', 'view-mode-changed', 'create-task'])

const { t } = useI18n()
const taskStore = useTaskStore()
const { currentTheme } = useTheme() // 获取当前主题色

const statusFilter = ref('all')
const viewMode = ref('list')
const selectedTeam = ref(props.teamId)

const statusData = ref({
  pending: 0,
  in_progress: 0,
  completed: 0,
  overdue: 0
})

const userStats = ref({})
const _userStatsForChart = ref({})
const totalCount = ref(0)

const statusChartRef = ref(null)
const userChartRef = ref(null)
let statusChartInstance = null
let userChartInstance = null

onMounted(() => {
  initCharts()
  fetchData()
  selectedTeam.value = props.teamId
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  destroyCharts()
})

function handleResize() {
  if (statusChartInstance) {
    statusChartInstance.resize()
  }
  if (userChartInstance) {
    userChartInstance.resize()
  }
}

watch(() => props.teamId, (newVal) => {
  selectedTeam.value = newVal
  fetchData()
})

watch(() => taskStore.taskStatistics, () => {
  fetchData()
}, { deep: true })

function initCharts() {
  if (typeof echarts === 'undefined') {
    console.error('ECharts is not available')
    return
  }

  if (statusChartRef.value) {
    statusChartInstance = echarts.init(statusChartRef.value)
    const statusOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'horizontal',
        left: 'center',
        bottom: 0
      },
      series: [
        {
          name: '任务状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: []
        }
      ]
    }
    statusChartInstance.setOption(statusOption)
  }

  if (userChartRef.value) {
    userChartInstance = echarts.init(userChartRef.value)
    const userOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: [],
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            interval: 0,
            rotate: 30,
            overflow: 'truncate',
            width: 80
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '待处理',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          data: [],
          itemStyle: {
            color: '#ff9800'
          }
        },
        {
          name: '进行中',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          data: [],
          itemStyle: {
            color: '#2196f3'
          }
        },
        {
          name: '已完成',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          data: [],
          itemStyle: {
            color: '#4caf50'
          }
        },
        {
          name: '已逾期',
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          data: [],
          itemStyle: {
            color: '#f44336'
          }
        }
      ]
    }
    userChartInstance.setOption(userOption)
  }
}

async function fetchData() {
  const stats = taskStore.taskStatistics
  if (!stats) return

  statusData.value = {
    pending: stats.pendingTasks || 0,
    in_progress: stats.inProgressTasks || 0,
    completed: stats.completedTasks || 0,
    overdue: stats.overdueTasks || 0
  }

  userStats.value = {}
  _userStatsForChart.value = {}

  totalCount.value = stats.totalTasks || 0

  if (stats.userTaskDistribution) {
    stats.userTaskDistribution.forEach(user => {
      const name = user.name
      userStats.value[name] = {
        name,
        total: user.total,
        pending: user.total - user.completed - user.inProgress - user.overdue,
        in_progress: user.inProgress,
        completed: user.completed,
        overdue: user.overdue
      }
      _userStatsForChart.value[name] = userStats.value[name]
    })
  }

  updateCharts()
}

function truncateName(name) {
  if (!name) return ''
  const index = name.indexOf('@')
  if (index > 0) {
    return name.slice(0, index)
  }
  return name
}

function updateCharts() {
  if (statusChartInstance) {
    statusChartInstance.setOption({
      series: [
        {
          data: [
            { value: statusData.value.pending, name: t('task.statusPending'), itemStyle: { color: '#ff9800' } },
            { value: statusData.value.in_progress, name: t('task.statusInProgress'), itemStyle: { color: '#2196f3' } },
            { value: statusData.value.completed, name: t('task.statusCompleted'), itemStyle: { color: '#4caf50' } },
            { value: statusData.value.overdue, name: t('task.statusOverdue'), itemStyle: { color: '#f44336' } }
          ]
        }
      ]
    })
  }

  if (userChartInstance) {
    const statsList = Object.values(userStats.value)
    statsList.sort((a, b) => b.total - a.total)

    const names = statsList.map(item => truncateName(item.name))
    const pendingData = statsList.map(item => item.pending)
    const inProgressData = statsList.map(item => item.in_progress)
    const completedData = statsList.map(item => item.completed)
    const overdueData = statsList.map(item => item.overdue)

    _userStatsForChart.value = {}
    statsList.forEach((item, index) => {
      const label = names[index]
      _userStatsForChart.value[label] = item
    })

    userChartInstance.setOption({
      xAxis: [
        {
          data: names
        }
      ],
      series: [
        {
          name: t('task.statusPending'),
          data: pendingData,
          itemStyle: { color: getComputedStyle(document.documentElement).getPropertyValue('--el-color-warning') || '#ff9800' }
        },
        {
          name: t('task.statusInProgress'),
          data: inProgressData,
          itemStyle: { color: currentTheme.value }
        },
        {
          name: t('task.statusCompleted'),
          data: completedData,
          itemStyle: { color: getComputedStyle(document.documentElement).getPropertyValue('--el-color-success') || '#4caf50' }
        },
        {
          name: t('task.statusOverdue'),
          data: overdueData,
          itemStyle: { color: getComputedStyle(document.documentElement).getPropertyValue('--el-color-danger') || '#f44336' }
        }
      ]
    })
  }
}

function destroyCharts() {
  if (statusChartInstance) {
    statusChartInstance.dispose()
    statusChartInstance = null
  }
  if (userChartInstance) {
    userChartInstance.dispose()
    userChartInstance = null
  }
}

function filterChanged(status) {
  emit('filter-changed', status)
}

function viewModeChanged(mode) {
  emit('view-mode-changed', mode)
}

function onTaskListViewModeChanged(mode) {
  viewMode.value = mode
}

function onTaskListFilterChanged(status) {
  statusFilter.value = status
}

function createNewTask() {
  emit('create-task')
}
</script>

<style scoped lang="scss">
.task-statistics {
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .statistics-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .header-content {
      display: flex;
      align-items: center;
      width: 100%;
    }

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .statistics-controls {
      display: flex;
      gap: 12px;
      margin-left: 24px;
    }

    .statistics-summary {
      margin-left: auto;
      display: flex;
      gap: 12px;

      .summary-item {
        background: #f7f8fa;
        border-radius: 10px;
        padding: 8px 14px;
        text-align: center;
        min-width: 70px;
        display: flex;
        flex-direction: column;
        align-items: center;

        .summary-label {
          font-size: 12px;
          color: #333;
          margin-top: 4px;
        }

        .summary-value {
          font-size: 18px;
          font-weight: 600;
          color: #ff6b35;
          line-height: 1.2;

          &.completed {
            color: $success-color;
          }

          &.in-progress {
            color: $primary-color;
          }

          &.overdue {
            color: $danger-color;
          }
        }
      }
    }
  }

  .statistics-content {
    .statistics-section {
      margin-bottom: 12px;

      .charts-container {
        display: flex;
        gap: 20px;
        margin-bottom: 12px;
        flex-wrap: wrap;

        .chart-item {
          flex: 1;
          min-width: 300px;
        }
      }
    }

    .task-list {
      margin-top: 20px;
    }
  }
}

@media (max-width: 768px) {
  .task-statistics {
    padding: 8px;

    .statistics-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .statistics-controls {
        flex-direction: column;
        width: 100%;
        margin-left: 0;
      }

      .statistics-summary {
        width: 100%;
        justify-content: space-around;
        flex-wrap: wrap;
      }
    }

    .charts-container {
      flex-direction: column;
    }
  }
}
</style>
