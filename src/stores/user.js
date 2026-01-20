import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const userId = ref(null)
  const token = ref('')
  const permissions = ref([])

  const isLoggedIn = computed(() => !!userId.value && !!token.value)
  const userName = computed(() => userInfo.value?.name || userInfo.value?.nickname || '')
  const userAvatar = computed(() => userInfo.value?.avatar || '')

  function setUserInfo(info) {
    userInfo.value = info
    userId.value = info?.id || info?.userid
  }

  function setToken(newToken) {
    token.value = newToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken)
    }
  }

  function setPermissions(perms) {
    permissions.value = perms || []
  }

  function logout() {
    userInfo.value = null
    userId.value = null
    token.value = ''
    permissions.value = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  function loadFromStorage() {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token')
      if (savedToken) {
        token.value = savedToken
      }
    }
  }

  return {
    userInfo,
    userId,
    token,
    permissions,
    isLoggedIn,
    userName,
    userAvatar,
    setUserInfo,
    setToken,
    setPermissions,
    logout,
    loadFromStorage
  }
})
