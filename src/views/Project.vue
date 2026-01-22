<template>
  <div class="project-page">
    <div class="project-header">
      <el-page-header @back="goBack">
        <template #content>
          <span class="project-title">{{ project?.name || $t('task.project') }}</span>
        </template>
        <template #extra>
          <el-button type="primary" :icon="Plus" @click="createTask">
            {{ $t('task.createTask') }}
          </el-button>
        </template>
      </el-page-header>
    </div>
    <TaskStatistics
      :title="project?.name || $t('task.project')"
      task-type="team"
      :team-id="projectId"
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
import { Plus } from '@element-plus/icons-vue'
import TaskStatistics from '@/components/business/TaskStatistics.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const teamStore = useTeamStore()
const taskStore = useTaskStore()

const projectId = computed(() => parseInt(route.params.projectId))
const statusFilter = ref('all')
const viewMode = ref('list')

const project = computed(() => {
  return teamStore.teamList.find(p => p.id === projectId.value)
})

function goBack() {
  router.back()
}

function createTask() {
  console.log('Create task in project:', projectId.value)
}

function handleFilterChange(status) {
  statusFilter.value = status
}

function handleViewModeChange(mode) {
  viewMode.value = mode
}

onMounted(() => {
  taskStore.fetchTaskList({ page: 1, pageSize: 10000 })
  taskStore.fetchTaskStatistics()
  teamStore.fetchTeamList()
})

watch(projectId, () => {
  console.log('Project ID changed:', projectId.value)
})
</script>

<style scoped lang="scss">
.project-page {
  padding: 16px;
}

.project-header {
  margin-bottom: 16px;

  .project-title {
    font-size: 18px;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .project-page {
    padding: 8px;
  }
}
</style>
