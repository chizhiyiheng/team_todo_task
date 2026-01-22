import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useTaskStore = defineStore('task', () => {
  const taskList = ref([])
  const currentTask = ref(null)
  const taskStatistics = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const totalTasks = computed(() => taskStatistics.value?.totalTasks || 0)
  const completedTasks = computed(() => taskStatistics.value?.completedTasks || 0)
  const inProgressTasks = computed(() => taskStatistics.value?.inProgressTasks || 0)
  const overdueTasks = computed(() => taskStatistics.value?.overdueTasks || 0)
  const pendingTasks = computed(() => taskStatistics.value?.pendingTasks || 0)

  async function fetchTaskList(params) {
    loading.value = true
    error.value = null
    try {
      const response = await api.todo.getTodoList(params)
      if (response.code === '200') {
        taskList.value = response.body.list || []
        return response.body
      } else {
        throw new Error(response.message || '获取任务列表失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTaskStatistics(params) {
    loading.value = true
    error.value = null
    try {
      const response = await api.task.getTaskStatistics(params)
      if (response.code === '200') {
        taskStatistics.value = response.body
        return response.body
      } else {
        throw new Error(response.message || '获取任务统计失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTaskDetail(taskId) {
    loading.value = true
    error.value = null
    try {
      const response = await api.task.getTaskDetail(taskId)
      if (response.code === '200') {
        currentTask.value = response.body
        return response.body
      } else {
        throw new Error(response.message || '获取任务详情失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTask(taskData) {
    loading.value = true
    error.value = null
    try {
      const response = await api.task.createTask(taskData)
      if (response.code === '200') {
        taskList.value.unshift(response.body)
        return response.body
      } else {
        throw new Error(response.message || '创建任务失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTaskStatus({ taskId, status }) {
    loading.value = true
    error.value = null
    try {
      const response = await api.task.updateTaskStatus(taskId, status)
      if (response.code === '200') {
        const task = taskList.value.find(t => t.id === taskId)
        if (task) {
          task.status = status
        }
        return response.body
      } else {
        throw new Error(response.message || '更新任务状态失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(taskId) {
    loading.value = true
    error.value = null
    try {
      const response = await api.task.deleteTask(taskId)
      if (response.code === '200') {
        taskList.value = taskList.value.filter(t => t.id !== taskId)
        return response.body
      } else {
        throw new Error(response.message || '删除任务失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTasks(params = {}) {
    return fetchTaskList({ page: 1, pageSize: 10000, ...params })
  }

  function clearTaskList() {
    taskList.value = []
  }

  return {
    taskList,
    currentTask,
    taskStatistics,
    loading,
    error,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    pendingTasks,
    fetchTaskList,
    fetchTasks,
    fetchTaskStatistics,
    fetchTaskDetail,
    createTask,
    updateTaskStatus,
    deleteTask,
    clearTaskList
  }
})
