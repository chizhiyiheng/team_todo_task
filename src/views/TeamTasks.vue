<template>
  <div class="team-tasks-page">
    <TaskStatistics
      :title="currentTeamName"
      task-type="team"
      :team-id="selectedTeam"
      :show-create-button="false"
      @filter-changed="handleFilterChange"
      @view-mode-changed="handleViewModeChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTeamStore } from '@/stores/team'
import { useTaskStore } from '@/stores/task'
import TaskStatistics from '@/components/business/TaskStatistics.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const teamStore = useTeamStore()
const taskStore = useTaskStore()

const selectedTeam = ref(null)
const statusFilter = ref('all')
const viewMode = ref('list')

const currentTeam = computed(() => {
  if (!selectedTeam.value) return null
  return teamStore.teamList.find(p => p.id === selectedTeam.value)
})

const currentTeamName = computed(() => {
  if (!currentTeam.value) return t('menu.teamTasks')
  return currentTeam.value.name || t('menu.teamTasks')
})

onMounted(() => {
  if (route.params && route.params.teamId) {
    selectedTeam.value = parseInt(route.params.teamId)
  }
  taskStore.fetchTaskList({ page: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
  teamStore.fetchTeamList()
})

watch(() => route.params.teamId, (newTeamId) => {
  if (newTeamId) {
    selectedTeam.value = parseInt(newTeamId)
  }
})

function handleFilterChange(status) {
  statusFilter.value = status
}

function handleViewModeChange(mode) {
  viewMode.value = mode
}
</script>

<style scoped lang="scss">
.team-tasks-page {
  padding: 16px;
}

@media (max-width: 768px) {
  .team-tasks-page {
    padding: 8px;
  }
}
</style>
