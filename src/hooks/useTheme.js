import { ref } from 'vue'
import { useCssVar } from '@vueuse/core'

/**
 * 颜色混合函数
 * 参考 Element Plus 的实现，用于生成色阶
 */
const mix = (color1, color2, weight) => {
  weight = Math.max(Math.min(Number(weight), 1), 0)
  const r1 = parseInt(color1.substring(1, 3), 16)
  const g1 = parseInt(color1.substring(3, 5), 16)
  const b1 = parseInt(color1.substring(5, 7), 16)
  const r2 = parseInt(color2.substring(1, 3), 16)
  const g2 = parseInt(color2.substring(3, 5), 16)
  const b2 = parseInt(color2.substring(5, 7), 16)
  const r = Math.round(r1 * (1 - weight) + r2 * weight)
  const g = Math.round(g1 * (1 - weight) + g2 * weight)
  const b = Math.round(b1 * (1 - weight) + b2 * weight)
  const _r = ('0' + (r || 0).toString(16)).slice(-2)
  const _g = ('0' + (g || 0).toString(16)).slice(-2)
  const _b = ('0' + (b || 0).toString(16)).slice(-2)
  return '#' + _r + _g + _b
}

export function useTheme() {
  const elColorPrimary = useCssVar('--el-color-primary', document.documentElement)
  const currentTheme = ref(elColorPrimary.value || '#409eff')

  // 设置主题色
  const setTheme = (color) => {
    if (!color) return
    
    // 设置主色
    elColorPrimary.value = color
    currentTheme.value = color

    // 生成色阶: light-1 ~ light-9
    for (let i = 1; i <= 9; i++) {
      const cssVarName = `--el-color-primary-light-${i}`
      // light-i 表示白色的比例。light-9 应该是最浅的（90%白色，10%主色）
      // mix(c1, c2, w) = c1*(1-w) + c2*w
      // mix('white', color, weight) -> weight 是主色的比例
      // i=1 -> 想要 10% 白, 90% 主 -> weight=0.9
      // i=9 -> 想要 90% 白, 10% 主 -> weight=0.1
      const mixedColor = mix('#ffffff', color, 1 - i * 0.1)
      document.documentElement.style.setProperty(cssVarName, mixedColor)
    }

    // 生成 dark-2
    const dark2 = mix('#000000', color, 0.2)
    document.documentElement.style.setProperty('--el-color-primary-dark-2', dark2)
  }

  return {
    currentTheme,
    setTheme
  }
}
