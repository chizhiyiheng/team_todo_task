<template>
  <div class="tag-select" ref="tagSelectRef">
    <div
      class="tag-trigger"
      :class="{ 'is-active': isDropdownVisible, 'is-disabled': disabled }"
      @click="toggleDropdown"
    >
      <el-tag
        :type="selectedOption?.type || 'info'"
        :color="selectedOption?.color"
        :style="selectedOption?.color ? { color: '#fff', borderColor: selectedOption.color } : {}"
        class="tag-inner"
      >
        <span v-if="selectedOption?.dot" class="priority-dot"></span>
        <span class="tag-text">{{ selectedOption?.label || placeholder }}</span>
        <el-icon class="tag-arrow" :class="{ 'is-reverse': isDropdownVisible }">
          <ArrowDown />
        </el-icon>
      </el-tag>
    </div>

    <transition name="el-zoom-in-top">
      <div v-show="isDropdownVisible" class="tag-dropdown">
        <div
          v-for="option in options"
          :key="option.value"
          class="dropdown-item"
          :class="{ 
            'is-selected': modelValue === option.value,
            'is-disabled': disabledValues.includes(option.value)
          }"
          @click="handleSelect(option)"
        >
          <el-tag
            :type="option.type"
            :color="option.color"
            :style="option.color ? { color: '#fff', borderColor: option.color } : {}"
            size="small"
            class="option-tag"
          >
            <span v-if="option.dot" class="priority-dot"></span>
            <span>{{ option.label }}</span>
          </el-tag>
          <el-icon v-if="modelValue === option.value" class="check-icon">
            <Check />
          </el-icon>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ArrowDown, Check } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  options: {
    type: Array,
    required: true,
    // options format: [{ value, label, type?, color?, dot? }]
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disabledValues: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const tagSelectRef = ref(null)
const isDropdownVisible = ref(false)

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

function toggleDropdown() {
  if (props.loading || props.disabled) return
  isDropdownVisible.value = !isDropdownVisible.value
}

function handleSelect(option) {
  // Prevent selecting disabled options
  if (props.disabledValues.includes(option.value)) {
    return
  }
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isDropdownVisible.value = false
}

function handleClickOutside(event) {
  if (tagSelectRef.value && !tagSelectRef.value.contains(event.target)) {
    isDropdownVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.tag-select {
  position: relative;
  display: inline-flex;
  align-items: center;

  .tag-trigger {
    cursor: pointer;
    user-select: none;
    transition: all 0.3s;

    &:hover:not(.is-disabled) {
      opacity: 0.8;
      transform: translateY(-1px);
    }

    &.is-disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &.is-active {
      .tag-inner {
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }

    .tag-inner {
      height: 32px;
      padding: 0 24px 0 12px;
      display: inline-flex !important;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      white-space: nowrap;
      transition: all 0.3s;
      position: relative;

      // 使用 :deep() 修改 el-tag 内部样式
      :deep(.el-tag__content) {
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }

      .priority-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
        background-color: rgba(255, 255, 255, 0.9) !important;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .tag-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tag-arrow {
        font-size: 12px;
        transition: transform 0.3s;
        flex-shrink: 0;
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);

        &.is-reverse {
          transform: translateY(-50%) rotate(180deg);
        }
      }
    }
  }

  .tag-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 2000;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 6px 0;
    min-width: 140px;

    .dropdown-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      cursor: pointer;
      transition: background-color 0.3s;
      gap: 8px;

      &:hover {
        background-color: #f5f7fa;
      }

      &.is-selected {
        background-color: #ecf5ff;
      }

      &.is-disabled {
        cursor: not-allowed;
        opacity: 0.5;
        
        &:hover {
          background-color: transparent;
        }
      }

      .option-tag {
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;

        :deep(.el-tag__content) {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .priority-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          background-color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      }

      .check-icon {
        color: #409eff;
        font-size: 14px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
