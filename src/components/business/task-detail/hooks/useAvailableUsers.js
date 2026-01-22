/**
 * useAvailableUsers Hook
 * 
 * Manages available users for executor selection.
 * Since there's no dedicated user API, we extract users from:
 * 1. Current task's todoUsers
 * 2. Task store's task list (attendeeList)
 * 3. Hardcoded common users as fallback
 * 
 * @returns {Object} Available users state and methods
 */

import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/task'

export function useAvailableUsers() {
  const taskStore = useTaskStore()
  
  // Fallback users (common users from mock data)
  const fallbackUsers = [
    { umId: 'USER001', name: '张三' },
    { umId: 'USER002', name: '李四' },
    { umId: 'USER003', name: '王五' },
    { umId: 'USER004', name: '赵六' },
    { umId: 'USER005', name: '孙七' },
    { umId: 'USER006', name: '郑伟' },
    { umId: 'USER007', name: '陈静' },
    { umId: 'USER008', name: '蒋勇' },
    { umId: 'USER009', name: '杨光' },
    { umId: 'USER010', name: '朱丽' },
    { umId: 'LIUQINGHONG264', name: '刘青红' }
  ]

  /**
   * Get available users from task store and fallback
   */
  const availableUsers = computed(() => {
    const userMap = new Map()
    
    // Add fallback users first
    fallbackUsers.forEach(user => {
      userMap.set(user.umId, user)
    })
    
    // Extract users from task store
    if (taskStore.taskList && taskStore.taskList.length > 0) {
      taskStore.taskList.forEach(task => {
        const attendees = task.attendeeList || []
        attendees.forEach(user => {
          if (user.umId && user.name) {
            userMap.set(user.umId, {
              umId: user.umId,
              name: user.name
            })
          }
        })
        
        // Also add creator
        if (task.creatorUmId && task.creatorName) {
          userMap.set(task.creatorUmId, {
            umId: task.creatorUmId,
            name: task.creatorName
          })
        }
      })
    }
    
    // Convert map to array and sort by name
    return Array.from(userMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'zh-CN')
    )
  })

  return {
    availableUsers
  }
}
