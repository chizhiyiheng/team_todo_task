import { ref, onMounted, onUnmounted } from 'vue'

const MOBILE_BREAKPOINT = 768

export const useDevice = () => {
  const isMobile = ref(false)
  const isDesktop = ref(true)

  const updateDevice = () => {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
    isDesktop.value = window.innerWidth >= MOBILE_BREAKPOINT
  }

  const handleResize = () => {
    updateDevice()
  }

  onMounted(() => {
    updateDevice()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    isMobile,
    isDesktop
  }
}

export const isMobileDevice = () => {
  return window.innerWidth < MOBILE_BREAKPOINT
}

export const isDesktopDevice = () => {
  return window.innerWidth >= MOBILE_BREAKPOINT
}
