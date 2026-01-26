<template>
  <div class="task-sidebar" :class="{ 'sidebar-collapsed': isCollapsed, 'sidebar-mobile-open': isMobileOpen }">
    <div class="sidebar-section">
      <div class="sidebar-section-header">
        <h4>{{ $t('menu.myTasks') }}</h4>
        <span class="collapse-toggle" @click="toggleSection('my')">
          <el-icon v-if="!collapsedSections.my"><ArrowUp /></el-icon>
          <el-icon v-else><ArrowDown /></el-icon>
        </span>
      </div>
      <ul class="sidebar-menu" v-show="!collapsedSections.my">
        <li @click="toggleMyTasks('executed')" :class="{ active: activeTab === 'executed' }">
          <el-icon><List /></el-icon>
          <span>{{ $t('task.myExecutedTasks') }}</span>
          <!-- <el-badge v-if="executedCount > 0" :value="executedCount" class="menu-badge" /> -->
        </li>
        <li @click="toggleMyTasks('assigned')" :class="{ active: activeTab === 'assigned' }">
          <el-icon><User /></el-icon>
          <span>{{ $t('task.myAssignedTasks') }}</span>
          <!-- <el-badge v-if="assignedCount > 0" :value="assignedCount" class="menu-badge" /> -->
        </li>
      </ul>
    </div>

    <div class="sidebar-section" v-if="showTeamTasks">
      <div class="sidebar-section-header">
        <h4>{{ $t('menu.teamTasks') }}</h4>
        <span class="collapse-toggle" @click="toggleSection('team')">
          <el-icon v-if="!collapsedSections.team"><ArrowUp /></el-icon>
          <el-icon v-else><ArrowDown /></el-icon>
        </span>
      </div>
      <ul class="sidebar-menu" v-show="!collapsedSections.team">
        <li
          v-for="team in realTeams"
          :key="team.id"
          @click="selectTeam(team.id)"
          :class="{ active: selectedTeam === team.id }"
        >
          <el-icon><OfficeBuilding /></el-icon>
          <span class="team-name">{{ team.name }}</span>
          <!-- <el-badge v-if="team.taskCount > 0" :value="team.taskCount" class="menu-badge" /> -->
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUp, ArrowDown, List, User, OfficeBuilding } from '@element-plus/icons-vue'

const props = defineProps({
  executedCount: {
    type: Number,
    default: 0
  },
  assignedCount: {
    type: Number,
    default: 0
  },
  teams: {
    type: Array,
    default: () => []
  },
  isCollapsed: {
    type: Boolean,
    default: false
  },
  showTeamTasks: {
    type: Boolean,
    default: false
  },
  isMobileOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['tab-changed', 'team-selected', 'close-sidebar'])

const { t } = useI18n()

const activeTab = ref('executed')
const selectedTeam = ref(null)
const collapsedSections = ref({
  my: false,
  team: false
})

const realTeams = computed(() => {
  if (props.teams && props.teams.length > 0) {
    return props.teams
  }
  return []
})

function toggleSection(section) {
  collapsedSections.value[section] = !collapsedSections.value[section]
}

function toggleMyTasks(type) {
  activeTab.value = type
  selectedTeam.value = null
  emit('tab-changed', type)
  emit('close-sidebar')
}

function selectTeam(teamId) {
  selectedTeam.value = teamId
  activeTab.value = null
  emit('team-selected', teamId)
  emit('close-sidebar')
}
</script>

<style scoped lang="scss">

.task-sidebar {
  width: 200px;
  height: 100%;
  background: #f8f8f8;
  border-right: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;

  &.sidebar-collapsed {
    width: 64px;

    .sidebar-section-header h4,
    .sidebar-menu span,
    .sidebar-footer .el-button span {
      display: none;
    }

    .sidebar-menu {
      justify-content: center;
    }
  }
}

.sidebar-section {
  padding: 12px;
  border-bottom: 1px solid #eaeaea;

  &:last-child {
    border-bottom: none;
  }
}

.sidebar-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #eaeaea;
  margin-bottom: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s;

  h4 {
    font-size: 14px;
    font-weight: 500;
    color: #666;
    margin: 0;
  }

  .collapse-toggle {
    color: #999;
    transition: all 0.3s;

    &:hover {
      color: $primary-color;
    }
  }
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    margin: 0 0 4px 0;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 4px;
    position: relative;
    font-size: 14px;

    .el-icon {
      margin-right: 8px;
      font-size: 14px;
      color: #666;
      transition: all 0.3s;
    }

    .team-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
      color: #333;
    }

    &:hover {
      background: #f0f0f0;

      .el-icon {
        color: $primary-color;
      }
    }

    &.active {
      background: var(--el-color-primary-light-9);
      color: $primary-color;

      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 0;
        bottom: 0;
        width: 3px;
        background: $primary-color;
        border-radius: 0 2px 2px 0;
      }

      .el-icon {
        color: $primary-color;
      }

      .team-name {
        color: $primary-color;
      }
    }
  }
}

.menu-badge {
  margin-left: auto;
  flex-shrink: 0;

  :deep(.el-badge__content) {
    background-color: $primary-color;
    border: none;
  }
}

@media (max-width: 768px) {
  .task-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    width: 200px;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

    &.sidebar-mobile-open {
      transform: translateX(0);
    }
  }
}

@media (min-width: 769px) {
  .task-sidebar {
    position: relative;
    transform: none !important;
  }
}
</style>
