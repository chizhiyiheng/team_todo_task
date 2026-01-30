<template>
  <div v-if="visible" class="search-results-container">
    <div class="search-results-dropdown">
      <div v-if="loading" class="loading-state">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>搜索中...</span>
      </div>
      
      <div v-else-if="results.length === 0" class="empty-state">
        <el-icon><Search /></el-icon>
        <span>{{ keyword ? '未找到相关任务' : '请输入关键词搜索' }}</span>
      </div>
      
      <div v-else class="results-list" ref="resultsListRef" @scroll="handleScroll">
        <div
          v-for="task in results"
          :key="task.id"
          class="result-item"
          @click="handleTaskClick(task)"
        >
          <div class="task-title" v-html="highlightKeyword(task.title)"></div>
          <div class="task-deadline">
            <el-icon><Clock /></el-icon>
            <span>{{ formatDeadline(task.deadLine) }}</span>
          </div>
        </div>
        
        <div v-if="hasMore" class="loading-more">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载更多...</span>
        </div>
        
        <div v-if="!hasMore && results.length > 0" class="no-more">
          已加载全部结果
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { Search, Clock, Loading } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  keyword: {
    type: String,
    default: ''
  },
  results: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasMore: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['task-click', 'load-more', 'close'])

const resultsListRef = ref(null)
const savedScrollTop = ref(0)
const isLoadingMore = ref(false)
const preventScrollReset = ref(false)
const lastResultsLength = ref(0)
const scrollRestoreTimer = ref(null)

/**
 * 高亮关键词
 */
function highlightKeyword(text) {
  if (!props.keyword || !text) return text
  
  const regex = new RegExp(`(${escapeRegExp(props.keyword)})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 格式化截止时间
 */
function formatDeadline(deadline) {
  if (!deadline) return '无截止时间'
  
  const date = dayjs(deadline)
  const now = dayjs()
  const diffDays = date.diff(now, 'day')
  
  if (diffDays < 0) {
    return `已逾期 ${Math.abs(diffDays)} 天`
  } else if (diffDays === 0) {
    return '今天截止'
  } else if (diffDays === 1) {
    return '明天截止'
  } else if (diffDays <= 7) {
    return `${diffDays} 天后截止`
  } else {
    return date.format('YYYY-MM-DD')
  }
}

/**
 * 点击任务
 */
function handleTaskClick(task) {
  emit('task-click', task)
  emit('close')
}

/**
 * 滚动加载更多
 */
function handleScroll(e) {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  
  // 始终保存当前滚动位置
  if (scrollTop > 0) {
    savedScrollTop.value = scrollTop
  }
  
  // 滚动到底部前50px时触发加载
  if (scrollHeight - scrollTop - clientHeight < 50 && props.hasMore && !props.loading && !isLoadingMore.value) {
    console.log('[TaskSearchResults] Triggering load more, current scroll:', scrollTop)
    isLoadingMore.value = true
    preventScrollReset.value = true
    // 确保保存了触发加载时的滚动位置
    savedScrollTop.value = scrollTop
    
    emit('load-more')
  }
}

/**
 * 监听visible变化，只在真正的新搜索时重置滚动位置
 */
watch(() => props.visible, (newVal, oldVal) => {
  console.log('[TaskSearchResults] Visible changed:', oldVal, '->', newVal)
  
  // 只在从隐藏变为显示时重置滚动位置（新搜索）
  // 并且不是在加载更多过程中
  if (newVal && !oldVal && !preventScrollReset.value) {
    console.log('[TaskSearchResults] Resetting scroll to top for new search')
    nextTick(() => {
      if (resultsListRef.value) {
        resultsListRef.value.scrollTop = 0
        savedScrollTop.value = 0
      }
    })
  }
})

/**
 * 监听结果数组长度变化，用于检测加载更多完成
 */
watch(() => props.results.length, (newLength, oldLength) => {
  console.log('[TaskSearchResults] Results length changed:', oldLength, '->', newLength)
  
  // 如果是加载更多完成（长度增加且正在加载更多）
  if (isLoadingMore.value && newLength > oldLength) {
    console.log('[TaskSearchResults] Load more completed, will restore scroll position')
    
    // 清除之前的定时器
    if (scrollRestoreTimer.value) {
      clearTimeout(scrollRestoreTimer.value)
    }
    
    // 使用多次尝试恢复滚动位置
    const restoreScrollPosition = (attempt = 0) => {
      if (attempt > 20) { // 增加尝试次数
        console.log('[TaskSearchResults] Max restore attempts reached')
        isLoadingMore.value = false
        preventScrollReset.value = false
        return
      }
      
      if (resultsListRef.value && savedScrollTop.value > 0) {
        const currentScrollTop = resultsListRef.value.scrollTop
        console.log(`[TaskSearchResults] Restore attempt ${attempt + 1}, current: ${currentScrollTop}, target: ${savedScrollTop.value}`)
        
        // 只要当前位置小于目标位置（即被重置到了顶部或上方），就尝试恢复
        if (currentScrollTop < savedScrollTop.value) {
          resultsListRef.value.scrollTop = savedScrollTop.value
          
          // 继续尝试，确保位置稳定
          scrollRestoreTimer.value = setTimeout(() => {
            restoreScrollPosition(attempt + 1)
          }, 50)
        } else {
          // 再次确认位置是否正确
          if (Math.abs(currentScrollTop - savedScrollTop.value) < 10) {
            console.log('[TaskSearchResults] Scroll position restored successfully')
            isLoadingMore.value = false
            preventScrollReset.value = false
          } else {
             // 如果当前位置比目标位置还大（用户可能已经手动滚动），或者还没到位
             // 继续监控一小段时间
             scrollRestoreTimer.value = setTimeout(() => {
                restoreScrollPosition(attempt + 1)
             }, 50)
          }
        }
      } else {
        // 如果元素不存在或不需要恢复
        isLoadingMore.value = false
        preventScrollReset.value = false
      }
    }
    
    // 等待DOM更新后开始恢复
    nextTick(() => {
      // 立即尝试恢复一次
      if (resultsListRef.value && savedScrollTop.value > 0) {
         resultsListRef.value.scrollTop = savedScrollTop.value
      }
      setTimeout(() => {
        restoreScrollPosition()
      }, 10)
    })
  } else if (!isLoadingMore.value) {
      // 非加载更多情况下的数据变化（如首次搜索），重置滚动状态
      savedScrollTop.value = 0
  }
  
  // 更新上次结果长度
  lastResultsLength.value = newLength
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (scrollRestoreTimer.value) {
    clearTimeout(scrollRestoreTimer.value)
  }
})
</script>

<style scoped lang="scss">
.search-results-container {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  z-index: 1000;
  width: 100%;
}

.search-results-dropdown {
  width: 100%;
  max-height: 500px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
  gap: 12px;

  .el-icon {
    font-size: 32px;
  }

  span {
    font-size: 14px;
  }
}

.results-list {
  max-height: 500px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
    
    &:hover {
      background-color: #c0c4cc;
    }
  }
}

.result-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.task-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.5;
  word-break: break-word;

  :deep(.highlight) {
    background-color: #fff3cd;
    color: #ff6b35;
    font-weight: 600;
    padding: 0 2px;
  }
}

.task-deadline {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;

  .el-icon {
    font-size: 14px;
  }
}

.loading-more,
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  font-size: 12px;
  color: #909399;
  gap: 8px;
}

.no-more {
  color: #c0c4cc;
}

@media (max-width: 768px) {
  .search-results-container {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    width: auto;
    margin-top: 4px;
  }
  
  .search-results-dropdown {
    max-height: 60vh;
  }
  
  .results-list {
    max-height: 60vh;
  }
  
  .result-item {
    padding: 10px 12px;
  }
  
  .task-title {
    font-size: 13px;
  }
}
</style>
