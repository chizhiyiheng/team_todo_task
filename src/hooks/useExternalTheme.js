import { onMounted } from 'vue'
import { useTheme } from './useTheme'

export function useExternalTheme() {
  const { setTheme } = useTheme()

  const initExternalTheme = () => {
    // 1. 监听 URL 参数 (例如 ?theme=#ff0000)
    const params = new URLSearchParams(window.location.search)
    const themeFromUrl = params.get('theme')
    if (themeFromUrl) {
      console.log('[ExternalTheme] Theme from URL:', themeFromUrl)
      setTheme(themeFromUrl)
    }

    // 2. 暴露全局方法供 Native 调用
    // Android/iOS WebView 可以直接调用 window.setAppTheme('#ff0000')
    window.setAppTheme = (color) => {
      console.log('[ExternalTheme] Theme from Global Method:', color)
      setTheme(color)
    }

    // 3. 监听 postMessage (iframe 或 Electron 场景)
    window.addEventListener('message', (event) => {
      const { type, payload } = event.data
      if (type === 'SET_THEME' && payload?.color) {
        console.log('[ExternalTheme] Theme from postMessage:', payload.color)
        setTheme(payload.color)
      }
    })

    console.log('[ExternalTheme] Initialized')
  }

  return {
    initExternalTheme
  }
}
