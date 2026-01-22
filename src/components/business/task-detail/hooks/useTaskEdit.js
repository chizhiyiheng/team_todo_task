/**
 * useTaskEdit Hook
 * 
 * Manages task editing logic for title and description.
 * 
 * @param {Ref<Object>} taskDetail - The task detail object
 * @param {Function} updateField - Function to update a field
 * @param {Function} t - i18n translation function
 * @returns {Object} Edit state and methods
 */

import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

export function useTaskEdit(taskDetail, updateField, t) {
  // Title editing state
  const editingTitle = ref(false)
  const editTitleValue = ref('')
  const titleInputRef = ref(null)

  // Description editing state
  const editingDescription = ref(false)
  const editDescriptionValue = ref('')

  /**
   * Start editing title
   */
  function startEditTitle() {
    if (!taskDetail.value) return
    
    editingTitle.value = true
    editTitleValue.value = taskDetail.value.title
    
    nextTick(() => {
      titleInputRef.value?.focus()
      titleInputRef.value?.select()
    })
  }

  /**
   * Save title changes
   */
  async function saveTitle() {
    const trimmedValue = editTitleValue.value.trim()
    
    if (trimmedValue === '') {
      ElMessage.warning(t('task.titleCannotBeEmpty'))
      return
    }
    
    if (trimmedValue === taskDetail.value.title) {
      editingTitle.value = false
      return
    }
    
    await updateField('title', trimmedValue)
    editingTitle.value = false
  }

  /**
   * Cancel title editing
   */
  function cancelEditTitle() {
    editingTitle.value = false
  }

  /**
   * Start editing description
   */
  function startEditDescription() {
    if (!taskDetail.value) return
    
    editingDescription.value = true
    editDescriptionValue.value = taskDetail.value.content || ''
  }

  /**
   * Save description changes
   */
  async function saveDescription() {
    await updateField('content', editDescriptionValue.value)
    editingDescription.value = false
  }

  /**
   * Cancel description editing
   */
  function cancelEditDescription() {
    editingDescription.value = false
  }

  return {
    // Title editing
    editingTitle,
    editTitleValue,
    titleInputRef,
    startEditTitle,
    saveTitle,
    cancelEditTitle,
    
    // Description editing
    editingDescription,
    editDescriptionValue,
    startEditDescription,
    saveDescription,
    cancelEditDescription
  }
}
