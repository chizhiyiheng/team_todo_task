<template>
  <el-dropdown trigger="click" @command="handleCommand" placement="bottom-start" :disabled="loading || loadStatus">
    <div class="task-menu-trigger">
      <slot>
        <div class="task-menu-icon">
          <div v-if="loading && showLoad" class="loading">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
          <template v-else>
            <el-icon v-if="task.status === '1'" class="completed">
              <CircleCheckFilled />
            </el-icon>
            <div v-else class="uncomplete-circle"></div>
          </template>
        </div>
      </slot>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="0">
          <span class="status-dot todo"></span> {{ $t('task.statusPending') }}
        </el-dropdown-item>
        <el-dropdown-item command="2">
          <span class="status-dot in-progress"></span> {{ $t('task.statusInProgress') }}
        </el-dropdown-item>
        <el-dropdown-item command="1">
          <span class="status-dot done"></span> {{ $t('task.statusCompleted') }}
        </el-dropdown-item>
        <el-dropdown-item command="-1">
          <span class="status-dot cancelled"></span> {{ $t('task.statusCancelled') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { ref } from 'vue'
import { CircleCheckFilled, Loading } from '@element-plus/icons-vue'
import { useTaskStore } from '@/stores/task'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  task: {
    type: Object,
    default: () => ({})
  },
  loadStatus: {
    type: Boolean,
    default: false
  },
  showLoad: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['on-update'])
const { t } = useI18n()
const taskStore = useTaskStore()
const loading = ref(false)

const handleCommand = (command) => {
  if (loading.value || props.loadStatus || command === props.task.status) {
    return
  }

  loading.value = true
  taskStore.updateTaskStatus({
    taskId: props.task.id,
    status: command
  }).then(() => {
    loading.value = false
    emit('on-update', { status: command })
  }).catch(() => {
    loading.value = false
  })
}
</script>

<style scoped lang="scss">
.task-menu-trigger {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.task-menu-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  width: 20px;
  height: 20px;

  .el-icon {
    font-size: 20px;
    transition: all 0.3s;

    &.completed {
      color: #67c23a;
    }
  }

  .uncomplete-circle {
    width: 18px;
    height: 18px;
    border: 2px solid #d9d9d9;
    border-radius: 50%;
    transition: all 0.3s;
    box-sizing: border-box;

    &:hover {
      border-color: #1890ff;
    }
  }
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  
  &.todo {
    background-color: #d9d9d9;
  }
  
  &.in-progress {
    background-color: #e6a23c;
  }
  
  &.done {
    background-color: #67c23a;
  }
  
  &.cancelled {
    background-color: #909399;
  }
}
</style>
