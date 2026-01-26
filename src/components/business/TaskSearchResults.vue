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
import { ref, watch, nextTick } from 'vue'
import { Search, Clock, Loading } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
const resultsListRef = ref(null)

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
  
  // 滚动到底部前50px时触发加载
  if (scrollHeight - scrollTop - clientHeight < 50 && props.hasMore && !props.loading) {
    emit('load-more')
  }
}

/**
 * 监听visible变化，重置滚动位置
 */
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      if (resultsListRef.value) {
        resultsListRef.value.scrollTop = 0
      }
    })
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
}

.search-results-dropdown {
  width: 300px;
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
  .search-results-dropdown {
    width: calc(100vw - 32px);
    max-height: 400px;
  }
}
</style>
