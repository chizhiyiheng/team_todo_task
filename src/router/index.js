import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/manage/my-tasks'
  },
  {
    path: '/manage',
    name: 'manage',
    component: () => import('@/views/Manage.vue'),
    children: [
      {
        path: 'my-tasks',
        name: 'my-tasks',
        component: () => import('@/views/MyTasks.vue'),
        meta: { title: '我的任务' }
      },
      {
        path: 'team-tasks',
        name: 'team-tasks',
        component: () => import('@/views/TeamTasks.vue'),
        meta: { title: '团队任务' }
      },
      {
        path: 'project/:projectId',
        name: 'project',
        component: () => import('@/views/TeamTasks.vue'),
        meta: { title: '团队任务' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Team Do Task'
  next()
})

export default router
