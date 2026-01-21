# Team Do Task Web 技术文档

## 项目架构

### 整体架构

项目采用前后端分离架构，前端使用 Vue3 + Vite 构建，支持 PC 和移动端双端访问。

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Vue Components + Element Plus/Vant) │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Business Logic Layer           │
│      (Pinia Stores + Utils)          │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│         Data Access Layer             │
│   (API Services + Mock Data)         │
└─────────────────────────────────────────┘
```

### 技术栈详解

#### 1. Vue 3.5.13
- 使用 Composition API 编写组件
- 使用 `<script setup>` 语法糖
- 响应式系统使用 `ref`、`computed`、`watch`

#### 2. Vite 7.3.1
- 快速的开发服务器
- 原生 ES 模块支持
- 优化的生产构建

#### 3. Element Plus / Vant
- PC 端使用 Element Plus 组件库
- 移动端使用 Vant 组件库
- 自动检测设备类型并切换

#### 4. Pinia
- 替代 Vuex 的状态管理方案
- 更简洁的 API
- TypeScript 支持

#### 5. Vue Router 4.5.0
- 基于文件的路由配置
- 动态路由支持
- 路由守卫

#### 6. ECharts 5.6.0
- 任务统计图表
- 甘特图视图
- 数据可视化

## 目录结构

```
src/
├── api/                    # API 接口层
│   ├── index.js           # API 入口，导出所有 API
│   └── request.js        # Axios 封装，请求拦截器
│
├── assets/               # 静态资源
│   └── images/          # 图片资源
│
├── components/          # 组件层
│   ├── business/        # 业务组件
│   │   ├── TaskList.vue           # 任务列表组件
│   │   └── TaskStatistics.vue     # 任务统计组件
│   ├── common/         # 通用组件
│   │   └── ResponsiveComponent.vue # 响应式组件
│   └── layout/         # 布局组件
│       └── Sidebar.vue            # 侧边栏组件
│
├── locales/            # 国际化配置
│   ├── index.js        # i18n 配置
│   ├── zh.js          # 中文语言包
│   └── en.js          # 英文语言包
│
├── mock/              # Mock 数据
│   ├── index.js       # Mock API 入口
│   ├── todoData.js    # 待办任务数据
│   └── taskData.js    # 任务统计数据
│
├── router/            # 路由配置
│   └── index.js       # 路由定义
│
├── stores/            # Pinia 状态管理
│   ├── app.js         # 应用状态
│   ├── task.js        # 任务状态
│   ├── team.js        # 团队状态
│   └── user.js       # 用户状态
│
├── styles/            # 样式文件
│   ├── index.scss     # 全局样式
│   └── variables.scss # 样式变量
│
├── utils/             # 工具函数
│   ├── common.js      # 通用工具函数
│   ├── date.js        # 日期处理
│   ├── device.js      # 设备检测
│   └── permission.js  # 权限控制
│
├── views/             # 页面组件
│   ├── Manage.vue     # 主布局页面
│   ├── MyTasks.vue    # 我的任务页面
│   ├── TeamTasks.vue  # 团队任务页面
│   └── Project.vue    # 项目详情页面
│
├── App.vue            # 根组件
└── main.js            # 入口文件
```

## 组件使用

### 1. 布局组件

#### Sidebar 组件
侧边栏导航组件，支持折叠和移动端适配。

**Props:**
- `executedCount`: 我执行的任务数量
- `assignedCount`: 我分配的任务数量
- `teams`: 团队列表
- `isCollapsed`: 是否折叠

**Events:**
- `tab-changed`: Tab 切换事件
- `team-selected`: 团队选择事件
- `create-space`: 创建空间事件

**使用示例:**
```vue
<Sidebar
  :executed-count="executedCount"
  :assigned-count="assignedCount"
  :teams="teams"
  :is-collapsed="isCollapsed"
  @tab-changed="handleTabChanged"
  @team-selected="handleTeamSelected"
  @create-space="handleCreateSpace"
/>
```

### 2. 业务组件

#### TaskStatistics 组件
任务统计组件，包含统计摘要和图表。

**Props:**
- `title`: 标题
- `taskType`: 任务类型（my/team）
- `teamId`: 团队 ID
- `showCreateButton`: 是否显示创建按钮
- `showList`: 是否显示任务列表
- `mode`: 模式（executed/assigned）

**Events:**
- `filter-changed`: 筛选条件变化
- `view-mode-changed`: 视图模式变化
- `create-task`: 创建任务

**使用示例:**
```vue
<TaskStatistics
  :title="statisticsTitle"
  task-type="my"
  :show-create-button="false"
  @filter-changed="handleFilterChange"
  @view-mode-changed="handleViewModeChange"
/>
```

#### TaskList 组件
任务列表组件，支持列表、看板、甘特图三种视图。

**Props:**
- `viewMode`: 视图模式（list/kanban/gantt）
- `statusFilter`: 状态筛选
- `taskType`: 任务类型（my/team）
- `teamId`: 团队 ID
- `mode`: 模式（executed/assigned）

**Events:**
- `view-mode-changed`: 视图模式变化
- `filter-changed`: 筛选条件变化
- `assignee-filter-changed`: 执行人筛选变化

**使用示例:**
```vue
<TaskList
  :view-mode="viewMode"
  :status-filter="statusFilter"
  task-type="my"
  :mode="activeTab"
  @view-mode-changed="handleViewModeChange"
  @filter-changed="handleFilterChange"
/>
```

### 3. 通用组件

#### ResponsiveComponent 组件
响应式组件，根据设备类型自动切换 PC/移动端组件。

**Props:**
- `pcComponent`: PC 端组件名
- `mobileComponent`: 移动端组件名
- `pcProps`: PC 端组件属性
- `mobileProps`: 移动端组件属性
- `isMobile`: 是否为移动端

**使用示例:**
```vue
<ResponsiveComponent
  pc-component="el-button"
  mobile-component="van-button"
  :pc-props="{ type: 'primary' }"
  :mobile-props="{ type: 'primary' }"
  :is-mobile="isMobile"
>
  点击按钮
</ResponsiveComponent>
```

## API 接口

### API 结构

API 接口位于 `src/api/` 目录，使用 Axios 进行 HTTP 请求。

### 请求封装

`src/api/request.js` 提供了统一的请求封装：

- 请求拦截器：添加 token、设置 Content-Type
- 响应拦截器：统一错误处理、数据格式化
- Mock 支持：开发环境使用 Mock 数据

### API 定义

#### 待办任务 API

```javascript
// 获取待办列表
api.todo.getTodoList(params)
// params: { todoStatus, pageNum, pageSize }
// 返回: { code, message, body: { list, pageNum, pageSize, total } }

// 获取任务统计
api.todo.getTodoStatistics()
// 返回: { code, message, body: { totalTasks, completedTasks, ... } }
```

#### 团队 API

```javascript
// 获取团队列表
api.team.getTeamList(params)
// params: { pageNum, pageSize }
// 返回: { code, message, body: { list, pageNum, pageSize, total } }
```

#### AI 分析 API

```javascript
// 获取 AI 分析
api.ai.getAnalysis()
// 返回: { code, message, body: { summary, insights, recommendations } }
```

### Mock 数据

Mock 数据位于 `src/mock/` 目录：

- `index.js`: Mock API 入口
- `todoData.js`: 待办任务 Mock 数据
- `taskData.js`: 任务统计 Mock 数据

## 状态管理

### Pinia Store 结构

#### user.js - 用户状态

```javascript
const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref(null)
  const userId = ref(null)
  const token = ref('')
  const permissions = ref([])

  // Getters
  const isLoggedIn = computed(() => !!userId.value && !!token.value)

  // Actions
  function setUserInfo(info) { ... }
  function setToken(token) { ... }
  function setPermissions(permissions) { ... }
  function logout() { ... }
  function loadFromStorage() { ... }

  return { userInfo, userId, token, permissions, isLoggedIn, ... }
})
```

#### task.js - 任务状态

```javascript
const useTaskStore = defineStore('task', () => {
  // State
  const taskList = ref([])
  const currentTask = ref(null)
  const taskStatistics = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchTaskList(params) { ... }
  async function fetchTaskStatistics() { ... }
  function addTask(task) { ... }
  function updateTask(task) { ... }
  function deleteTask(taskId) { ... }

  return { taskList, currentTask, taskStatistics, loading, error, ... }
})
```

#### team.js - 团队状态

```javascript
const useTeamStore = defineStore('team', () => {
  // State
  const teamList = ref([])
  const currentTeam = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  async function fetchTeamList(params) { ... }
  function setCurrentTeam(team) { ... }

  return { teamList, currentTeam, loading, error, ... }
})
```

#### app.js - 应用状态

```javascript
const useAppStore = defineStore('app', () => {
  // State
  const isMobile = ref(false)
  const isDesktop = ref(true)
  const sidebarCollapsed = ref(false)
  const language = ref('zh')
  const theme = ref('light')

  // Actions
  function setDeviceType(mobile) { ... }
  function setLanguage(lang) { ... }
  function setTheme(theme) { ... }
  function loadSettings() { ... }
  function saveSettings() { ... }

  return { isMobile, isDesktop, sidebarCollapsed, language, theme, ... }
})
```

### Store 使用

```javascript
import { useUserStore } from '@/stores/user'
import { useTaskStore } from '@/stores/task'

const userStore = useUserStore()
const taskStore = useTaskStore()

// 访问状态
console.log(userStore.userInfo)
console.log(taskStore.taskList)

// 调用方法
await taskStore.fetchTaskList({ pageNum: 1, pageSize: 20 })
userStore.logout()
```

## 权限控制

### 权限工具函数

位于 `src/utils/permission.js`：

```javascript
// 检查权限
hasPermission(permission)

// 检查角色
hasRole(role)

// 检查是否可编辑任务
canEditTask(task, project)

// 检查是否可删除任务
canDeleteTask(task, project)

// 检查是否可添加任务
canAddTask(project)

// 检查是否为项目所有者
isProjectOwner(project)

// 检查是否为项目成员
isProjectMember(project)

// 检查是否为任务所有者
isTaskOwner(task)

// 检查是否为任务执行人
isTaskAssignee(task)
```

### 权限指令

```javascript
// 权限指令
v-permission="'task.edit'"

// 角色指令
v-role="'admin'"
```

### 使用示例

```javascript
import { hasPermission, canEditTask } from '@/utils/permission'

// 在组件中使用
if (hasPermission('task.edit')) {
  // 有编辑权限
}

if (canEditTask(task, project)) {
  // 可以编辑任务
}
```

## 响应式适配

### 设备检测

```javascript
import { useDevice } from '@/utils/device'

const { isMobile, isDesktop } = useDevice()

console.log(isMobile.value)  // 是否为移动端
console.log(isDesktop.value)  // 是否为桌面端
```

### 响应式布局

使用 SCSS 变量和媒体查询：

```scss
// PC 端样式
.task-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

// 移动端样式
@media (max-width: 768px) {
  .task-list {
    grid-template-columns: 1fr;
  }
}
```

### 组件库切换

```vue
<template>
  <el-button v-if="!isMobile">PC 按钮</el-button>
  <van-button v-else>移动端按钮</van-button>
</template>

<script setup>
import { useDevice } from '@/utils/device'

const { isMobile } = useDevice()
</script>
```

## 国际化

### 语言配置

语言包位于 `src/locales/` 目录：

- `zh.js`: 中文语言包
- `en.js`: 英文语言包

### 使用翻译

```javascript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 使用翻译
const title = t('task.title')
const message = t('common.confirm')
```

### 切换语言

```javascript
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// 切换语言
locale.value = 'en'
```

## 开发指南

### 样式规范
为支持动态主题，**禁止**硬编码 Hex 颜色。
- **推荐**: 使用 SCSS 变量 (`$primary-color`) 或 CSS 变量 (`var(--el-color-primary)`)。

### 添加新页面

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.js` 添加路由配置
3. 在 `src/locales/` 添加翻译

### 添加新 API

1. 在 `src/api/` 添加 API 方法
2. 在 `src/mock/` 添加 Mock 数据
3. 在对应的 Store 中添加调用方法

### 添加新组件

1. 在 `src/components/` 创建组件
2. 导出组件
3. 在需要的页面中导入使用

### 调试技巧

1. 使用 Vue DevTools 调试组件和状态
2. 使用 console.log 输出调试信息
3. 使用浏览器开发者工具查看网络请求

## 性能优化

### 代码分割

使用动态导入进行代码分割：

```javascript
const MyTasks = () => import('@/views/MyTasks.vue')
```

### 懒加载

使用 Vue 的 `defineAsyncComponent`：

```javascript
import { defineAsyncComponent } from 'vue'

const TaskList = defineAsyncComponent(() =>
  import('@/components/business/TaskList.vue')
)
```

### 图片优化

使用 WebP 格式图片，压缩图片大小。

### 缓存策略

使用 localStorage 缓存用户设置和常用数据。

## 部署指南

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

### 部署到服务器

1. 将 `dist/` 目录上传到服务器
2. 配置 Nginx 或 Apache
3. 配置反向代理到后端 API

### Nginx 配置示例

```nginx
server {
  listen 80;
  server_name your-domain.com;

  root /path/to/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend-server;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 常见问题

### 1. 组件样式冲突

使用 scoped 样式或 CSS Modules 避免样式冲突。

### 2. 状态不更新

确保使用 Pinia 的 `ref` 和 `computed`，不要直接修改状态。

### 3. 路由不跳转

检查路由配置是否正确，确保组件路径正确。

### 4. API 请求失败

检查 Mock 数据是否正确配置，检查网络请求是否被拦截。

## 最佳实践

1. **组件设计**: 单一职责原则，组件功能尽量单一
2. **状态管理**: 合理使用 Pinia Store，避免过度使用
3. **代码规范**: 遵循 ESLint 规范，保持代码风格一致
4. **性能优化**: 合理使用懒加载和代码分割
5. **测试**: 编写单元测试和端到端测试
6. **文档**: 编写清晰的注释和文档

## 参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)
- [Element Plus 官方文档](https://element-plus.org/)
- [Vant 官方文档](https://vant-ui.github.io/vant/)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Vue Router 官方文档](https://router.vuejs.org/)
- [ECharts 官方文档](https://echarts.apache.org/)
