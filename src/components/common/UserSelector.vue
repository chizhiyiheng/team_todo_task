<template>
  <el-dialog
    v-model="visible"
    title="选择执行人"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="user-selector">
      <!-- 搜索框 -->
      <el-input
        v-model="searchText"
        placeholder="搜索用户名或 umId"
        clearable
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <!-- 用户列表 -->
      <div class="user-list">
        <div
          v-for="user in filteredUsers"
          :key="user.umId"
          class="user-item"
          :class="{ selected: isSelected(user.umId) }"
          @click="toggleUser(user.umId)"
        >
          <el-checkbox :model-value="isSelected(user.umId)" @click.stop />
          <el-avatar :size="32" class="user-avatar">
            {{ user.name.charAt(0) }}
          </el-avatar>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-umid">{{ user.umId }}</div>
          </div>
        </div>
        
        <el-empty
          v-if="filteredUsers.length === 0"
          description="没有找到匹配的用户"
          :image-size="80"
        />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">
          确定 ({{ selectedUmIds.length }})
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array,
    default: () => []
  },
  selectedUsers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const searchText = ref('')
const selectedUmIds = ref([])

// 初始化选中的用户
watch(() => props.selectedUsers, (newVal) => {
  selectedUmIds.value = [...newVal]
}, { immediate: true })

// 过滤用户列表
const filteredUsers = computed(() => {
  if (!searchText.value) return props.users
  
  const search = searchText.value.toLowerCase()
  return props.users.filter(user => 
    user.name.toLowerCase().includes(search) ||
    user.umId.toLowerCase().includes(search)
  )
})

function isSelected(umId) {
  return selectedUmIds.value.includes(umId)
}

function toggleUser(umId) {
  const index = selectedUmIds.value.indexOf(umId)
  if (index > -1) {
    selectedUmIds.value.splice(index, 1)
  } else {
    selectedUmIds.value.push(umId)
  }
}

function handleCancel() {
  visible.value = false
  searchText.value = ''
}

function handleConfirm() {
  emit('confirm', selectedUmIds.value)
  visible.value = false
  searchText.value = ''
}
</script>

<style scoped lang="scss">
.user-selector {
  .search-input {
    margin-bottom: 16px;
  }

  .user-list {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #e4e7ed;
    border-radius: 4px;

    .user-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid #f5f7fa;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #f5f7fa;
      }

      &.selected {
        background-color: #ecf5ff;
      }

      .user-avatar {
        flex-shrink: 0;
        background-color: #409eff;
        color: white;
        font-size: 14px;
      }

      .user-info {
        flex: 1;
        min-width: 0;

        .user-name {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-umid {
          font-size: 12px;
          color: #909399;
          margin-top: 2px;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
