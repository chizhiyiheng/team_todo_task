<template>
  <div id="app" :class="{ 'is-mobile': isMobile }">
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '@/stores/app'
import { useDevice } from '@/utils/device'

const appStore = useAppStore()
const { isMobile } = useDevice()

function handleResize() {
  const mobile = window.innerWidth < 768
  appStore.setDeviceType(mobile)
}

onMounted(() => {
  appStore.loadSettings()
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
#app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.is-mobile {
  .el-message {
    min-width: 280px;
  }
}
</style>
