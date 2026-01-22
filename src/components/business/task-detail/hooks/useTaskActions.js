/**
 * useTaskActions Hook
 * 
 * Manages task actions like toggle important, mark complete, and delete.
 * 
 * @param {Ref<Object>} taskDetail - The task detail object
 * @param {Function} emit - Vue emit function
 * @param {Function} t - i18n translation function
 * @returns {Object} Action methods
 */

import { ElMessage, ElMessageBox } from 'element-plus'
import { todoApi } from '@/api/index.js'
import dayjs from 'dayjs'

export function useTaskActions(taskDetail, emit, t) {
  /**
   * Generic method to update a field
   */
  async function updateField(field, value) {
    if (!taskDetail.value) return false

    // Store old value for potential rollback
    const oldValue = taskDetail.value[field]
    
    // Optimistically update the UI
    taskDetail.value[field] = value

    try {
      const response = await todoApi.updateTodo({
        id: taskDetail.value.id,
        umId: taskDetail.value.umId,
        name: taskDetail.value.name,
        title: taskDetail.value.title,
        [field]: value
      })
      
      if (response.code === '200') {
        ElMessage.success(t('task.updateSuccess'))
        emit('task-updated', taskDetail.value)
        return true
      } else {
        // Rollback on failure
        taskDetail.value[field] = oldValue
        ElMessage.error(response.message || t('task.operationFailed'))
        return false
      }
    } catch (error) {
      // Rollback on error
      taskDetail.value[field] = oldValue
      ElMessage.error(t('task.operationFailed'))
      console.error('Update field error:', error)
      return false
    }
  }

  /**
   * Toggle important status
   */
  async function toggleImportant() {
    if (!taskDetail.value) return

    const newIsTop = taskDetail.value.isTop === 1 ? 0 : 1
    try {
      const response = await todoApi.updateTodo({
        id: taskDetail.value.id,
        umId: taskDetail.value.umId,
        name: taskDetail.value.name,
        title: taskDetail.value.title,
        isTop: newIsTop
      })
      
      if (response.code === '200') {
        taskDetail.value.isTop = newIsTop
        ElMessage.success(newIsTop === 1 ? t('task.markImportant') : t('task.cancelImportant'))
        emit('task-updated', taskDetail.value)
      } else {
        ElMessage.error(response.message || t('task.operationFailed'))
      }
    } catch (error) {
      ElMessage.error(t('task.operationFailed'))
      console.error('Toggle important error:', error)
    }
  }

  /**
   * Mark task as complete
   */
  async function markAsComplete() {
    if (!taskDetail.value) return

    try {
      const response = await todoApi.updateTodo({
        id: taskDetail.value.id,
        umId: taskDetail.value.umId,
        name: taskDetail.value.name,
        title: taskDetail.value.title,
        todoStatus: 1,
        finishTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      })
      
      if (response.code === '200') {
        taskDetail.value.status = 1
        taskDetail.value.finishTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        ElMessage.success(t('task.markComplete'))
        emit('task-updated', taskDetail.value)
      } else {
        ElMessage.error(response.message || t('task.operationFailed'))
      }
    } catch (error) {
      ElMessage.error(t('task.operationFailed'))
      console.error('Mark complete error:', error)
    }
  }

  /**
   * Delete task
   */
  async function deleteTask() {
    if (!taskDetail.value) return

    try {
      await ElMessageBox.confirm(
        t('task.deleteConfirm'),
        t('task.confirmDelete'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )
      
      const response = await todoApi.deleteTodo(taskDetail.value.id)
      if (response.code === '200') {
        ElMessage.success(t('task.deleteSuccess'))
        emit('task-deleted', taskDetail.value.id)
        emit('update:modelValue', false)
      } else {
        ElMessage.error(response.message || t('task.operationFailed'))
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(t('task.operationFailed'))
        console.error('Delete task error:', error)
      }
    }
  }

  /**
   * Submit progress update with progress value and note
   * @param {Object} data - Progress data containing progress value and note
   * @param {number} data.progress - Progress percentage (0-100)
   * @param {string} data.note - Progress note
   */
  async function submitProgress(data) {
    if (!taskDetail.value) return

    try {
      const response = await todoApi.updateTodo({
        id: taskDetail.value.id,
        umId: taskDetail.value.umId,
        name: taskDetail.value.name,
        title: taskDetail.value.title,
        progress: data.progress,
        progressNote: data.note
      })
      
      if (response.code === '200') {
        // Update local progress value
        taskDetail.value.progress = data.progress
        ElMessage.success(t('task.submitSuccess'))
        emit('task-updated', taskDetail.value)
        return true
      } else {
        ElMessage.error(response.message || t('task.operationFailed'))
        return false
      }
    } catch (error) {
      ElMessage.error(t('task.operationFailed'))
      console.error('Submit progress error:', error)
      return false
    }
  }

  /**
   * Add a new subtask
   * @param {string} content - The content of the subtask
   */
  async function addSubTask(content) {
    if (!taskDetail.value || !content) return

    try {
      const response = await todoApi.addTodo({
        umId: taskDetail.value.umId,
        name: taskDetail.value.name,
        title: content,
        content: content,
        parentTodoId: taskDetail.value.id,
        status: 0
      })
      
      if (response.code === '200') {
        ElMessage.success(t('task.addSubTaskSuccess'))
        emit('task-updated', taskDetail.value)
        return true
      } else {
        ElMessage.error(response.message || t('task.operationFailed'))
        return false
      }
    } catch (error) {
      ElMessage.error(t('task.operationFailed'))
      console.error('Add subtask error:', error)
      return false
    }
  }

  /**
   * Toggle subtask completion status
   * @param {string} subTaskId - The ID of the subtask
   * @param {boolean} isFinished - The new completion status
   */
  async function toggleSubTask(subTaskId, isFinished) {
    if (!taskDetail.value) return

    try {
      const response = await todoApi.updateTodo({
        id: subTaskId,
        umId: taskDetail.value.umId,
        name: taskDetail.value.name,
        title: taskDetail.value.title,
        todoStatus: isFinished ? 1 : 0
      })
      
      if (response.code === '200') {
        ElMessage.success(t('task.updateSuccess'))
        emit('task-updated', taskDetail.value)
        return true
      } else {
        ElMessage.error(response.message || t('task.operationFailed'))
        return false
      }
    } catch (error) {
      ElMessage.error(t('task.operationFailed'))
      console.error('Toggle subtask error:', error)
      return false
    }
  }

  return {
    updateField,
    toggleImportant,
    markAsComplete,
    deleteTask,
    submitProgress,
    addSubTask,
    toggleSubTask
  }
}
