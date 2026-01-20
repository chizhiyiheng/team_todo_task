import { useUserStore } from '@/stores/user'

export const hasPermission = (permission) => {
  const userStore = useUserStore()
  const permissions = userStore.permissions || []

  if (!permission) return true

  if (Array.isArray(permission)) {
    return permission.some(p => permissions.includes(p))
  }

  return permissions.includes(permission)
}

export const checkPermission = (permission) => {
  return hasPermission(permission)
}

export const hasRole = (role) => {
  const userStore = useUserStore()
  const userInfo = userStore.userInfo || {}

  if (!role) return true

  if (Array.isArray(role)) {
    return role.some(r => userInfo.role === r)
  }

  return userInfo.role === role
}

export const checkRole = (role) => {
  return hasRole(role)
}

export const isProjectOwner = (project) => {
  const userStore = useUserStore()
  const userId = userStore.userId

  if (!project || !project.ownerId) return false
  return project.ownerId === userId
}

export const isProjectMember = (project) => {
  const userStore = useUserStore()
  const userId = userStore.userId

  if (!project || !project.members) return false
  return project.members.some(m => m.id === userId)
}

export const isTaskOwner = (task) => {
  const userStore = useUserStore()
  const userId = userStore.userId

  if (!task || !task.ownerId) return false
  return task.ownerId === userId
}

export const isTaskAssignee = (task) => {
  const userStore = useUserStore()
  const userId = userStore.userId

  if (!task || !task.attendeeList) return false
  return task.attendeeList.some(a => a.umId === userId)
}

export const canEditTask = (task, project) => {
  if (!task) return false

  const userStore = useUserStore()
  const userId = userStore.userId
  const userInfo = userStore.userInfo || {}

  if (userInfo.role === 'admin') return true

  if (isTaskOwner(task)) return true
  if (isTaskAssignee(task)) return true
  if (project && isProjectOwner(project)) return true
  if (project && isProjectMember(project)) {
    return hasPermission('task.update')
  }

  return false
}

export const canDeleteTask = (task, project) => {
  if (!task) return false

  const userStore = useUserStore()
  const userInfo = userStore.userInfo || {}

  if (userInfo.role === 'admin') return true

  if (isTaskOwner(task)) return true
  if (project && isProjectOwner(project)) return true
  if (project && isProjectMember(project)) {
    return hasPermission('task.remove')
  }

  return false
}

export const canAddTask = (project) => {
  if (!project) return false

  const userStore = useUserStore()
  const userInfo = userStore.userInfo || {}

  if (userInfo.role === 'admin') return true

  if (isProjectOwner(project)) return true
  if (isProjectMember(project)) {
    return hasPermission('task.add')
  }

  return false
}

export const canEditProject = (project) => {
  if (!project) return false

  const userStore = useUserStore()
  const userInfo = userStore.userInfo || {}

  if (userInfo.role === 'admin') return true

  return isProjectOwner(project)
}

export const canDeleteProject = (project) => {
  if (!project) return false

  const userStore = useUserStore()
  const userInfo = userStore.userInfo || {}

  if (userInfo.role === 'admin') return true

  return isProjectOwner(project)
}

export const canManageMembers = (project) => {
  if (!project) return false

  const userStore = useUserStore()
  const userInfo = userStore.userInfo || {}

  if (userInfo.role === 'admin') return true

  return isProjectOwner(project)
}

export const permissionDirective = {
  mounted(el, binding) {
    const { value } = binding

    if (value && !hasPermission(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

export const roleDirective = {
  mounted(el, binding) {
    const { value } = binding

    if (value && !hasRole(value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}
