<template>
  <div class="table-action" :style="actionStyle">
    <el-dropdown @command="handleCommand" trigger="click" :teleported="false">
      <div class="action-icon">
        <i class="taskfont">&#xe6ec;</i>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="item in menu"
            :key="item.action"
            :command="item.action"
            :divided="item.divided"
            :disabled="item.disabled">
            <i v-if="isAliIcon(item.icon)" class="taskfont" v-html="item.icon"></i>
            <el-icon v-else-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  menu: {
    type: Array,
    default: () => []
  },
  align: {
    type: String,
    default: 'right'
  }
})

const emit = defineEmits(['action'])

const actionStyle = computed(() => {
  const style = {}
  switch (props.align) {
    case 'left':
      style.justifyContent = 'flex-start'
      break
    case 'center':
      style.justifyContent = 'center'
      break
    case 'right':
      style.justifyContent = 'flex-end'
      break
  }
  return style
})

function isAliIcon(icon) {
  return icon && (icon.includes('&#') || icon.startsWith('&#'))
}

function handleCommand(command) {
  emit('action', command)
}
</script>

<style scoped lang="scss">
.table-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;

  .action-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    cursor: pointer;
    color: #999;
    font-size: 18px;
    transition: all 0.3s;
    border-radius: 4px;

    &:hover {
      background: #f5f5f5;
      color: #1890ff;
    }

    .taskfont {
      font-size: 18px;
    }
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;

  .taskfont {
    font-size: 16px;
  }

  .el-icon {
    font-size: 16px;
  }
}
</style>