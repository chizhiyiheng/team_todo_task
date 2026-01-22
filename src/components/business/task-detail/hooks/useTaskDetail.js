/**
 * useTaskDetail Hook
 * 
 * Manages task detail data loading and state management.
 * 
 * @param {Ref<string>} taskId - The task ID to load
 * @returns {Object} Task detail state and methods
 */

import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { todoApi } from '@/api/index.js'

export function useTaskDetail(taskId, t) {
  // State
  const isLoading = ref(false)
  const isInitialLoad = ref(true)
  const taskDetail = ref(null)

  /**
   * Load task detail from API
   * @param {boolean} isRefresh - Whether this is a refresh (not initial load)
   */
  async function loadTaskDetail(isRefresh = false) {
    if (!taskId.value) return

    // Only set isInitialLoad to false if this is a refresh
    if (isRefresh) {
      isInitialLoad.value = false
    }

    isLoading.value = true
    try {
      const response = await todoApi.getTodoDetail(taskId.value)
      if (response.code === '200') {
        taskDetail.value = response.body
      } else {
        ElMessage.error(response.message || t('task.operationFailed'))
        taskDetail.value = null
      }
    } catch (error) {
      ElMessage.error(t('task.operationFailed'))
      console.error('Load task detail error:', error)
      taskDetail.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    isInitialLoad,
    taskDetail,
    loadTaskDetail
  }
}
