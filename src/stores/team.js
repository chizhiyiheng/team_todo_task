import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useTeamStore = defineStore('team', () => {
  const teamList = ref([])
  const currentTeam = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const teamCount = computed(() => teamList.value.length)

  async function fetchTeamList(params) {
    loading.value = true
    error.value = null
    try {
      const response = await api.team.getTeamList(params)
      if (response.code === '200') {
        teamList.value = response.body.list || []
        return response.body
      } else {
        throw new Error(response.message || '获取团队列表失败')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function setCurrentTeam(team) {
    currentTeam.value = team
  }

  function clearTeamList() {
    teamList.value = []
    currentTeam.value = null
  }

  return {
    teamList,
    currentTeam,
    loading,
    error,
    teamCount,
    fetchTeamList,
    setCurrentTeam,
    clearTeamList
  }
})
