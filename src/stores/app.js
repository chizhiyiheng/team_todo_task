import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useAppStore = defineStore('app', () => {
  const isMobile = ref(false)
  const isDesktop = ref(true)
  const sidebarCollapsed = ref(false)
  const language = ref('zh')
  const theme = ref('light')

  function setDeviceType(mobile) {
    isMobile.value = mobile
    isDesktop.value = !mobile
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setSidebarCollapsed(collapsed) {
    sidebarCollapsed.value = collapsed
  }

  function setLanguage(lang) {
    language.value = lang
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  function setTheme(themeMode) {
    theme.value = themeMode
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', themeMode)
      document.documentElement.setAttribute('data-theme', themeMode)
    }
  }

  function loadSettings() {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language')
      if (savedLang) {
        language.value = savedLang
      }

      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        theme.value = savedTheme
        document.documentElement.setAttribute('data-theme', savedTheme)
      }
    }
  }

  return {
    isMobile,
    isDesktop,
    sidebarCollapsed,
    language,
    theme,
    setDeviceType,
    toggleSidebar,
    setSidebarCollapsed,
    setLanguage,
    setTheme,
    loadSettings
  }
})
