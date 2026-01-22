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
  const taskDetail = ref(null)

  /**
   * Load task detail from API
   */
  async function loadTaskDetail() {
    if (!taskId.value) return

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
    taskDetail,
    loadTaskDetail
  }
}
