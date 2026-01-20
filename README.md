# Team Do Task Web

## 项目简介

Team Do Task Web 是一个基于 Vue3 + Vite + Element Plus 的任务管理系统前端项目，支持 PC 和移动端双端访问。项目从原有的 Vue2 项目（dootask-web-main）迁移而来，实现了任务管理、团队协作、项目追踪等核心功能。

## 技术栈

- **框架**: Vue 3.5.13 (Composition API)
- **构建工具**: Vite 7.3.1
- **UI 组件库**:
  - PC 端: Element Plus
  - 移动端: Vant
- **状态管理**: Pinia
- **路由**: Vue Router 4.5.0
- **图表库**: ECharts 5.6.0
- **HTTP 客户端**: Axios
- **日期处理**: Day.js
- **国际化**: Vue I18n
- **样式预处理**: SCSS

## 核心功能

### 1. 我的任务
- 我执行的任务
- 我分配的任务
- 任务列表视图
- 看板视图
- 甘特图视图
- 任务状态筛选
- 任务统计

### 2. 团队任务
- 团队任务列表
- 项目管理
- 团队成员管理
- 任务分配
- 进度追踪

### 3. 任务管理
- 任务创建
- 任务编辑
- 任务删除
- 任务状态更新
- 任务时间管理
- 任务附件管理
- 任务评论

### 4. 统计分析
- 任务统计图表
- AI 动态分析
- 人员任务分布
- 完成率分析
- 工作负载分析

### 5. 权限控制
- 项目权限管理
- 任务权限管理
- 角色权限控制
- 操作权限验证

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
team_do_task_web/
├── public/                 # 静态资源
├── src/
│   ├── api/              # API 接口
│   │   ├── index.js      # API 入口
│   │   └── request.js   # 请求封装
│   ├── assets/           # 资源文件
│   ├── components/       # 公共组件
│   │   ├── business/    # 业务组件
│   │   │   ├── TaskList.vue
│   │   │   └── TaskStatistics.vue
│   │   ├── common/      # 通用组件
│   │   │   └── ResponsiveComponent.vue
│   │   └── layout/      # 布局组件
│   │       └── Sidebar.vue
│   ├── locales/         # 国际化
│   │   ├── index.js
│   │   ├── zh.js
│   │   └── en.js
│   ├── mock/           # Mock 数据
│   │   ├── index.js
│   │   ├── todoData.js
│   │   └── taskData.js
│   ├── router/         # 路由配置
│   │   └── index.js
│   ├── stores/         # Pinia 状态管理
│   │   ├── app.js
│   │   ├── task.js
│   │   ├── team.js
│   │   └── user.js
│   ├── styles/         # 样式文件
│   │   ├── index.scss
│   │   └── variables.scss
│   ├── utils/          # 工具函数
│   │   ├── common.js
│   │   ├── date.js
│   │   ├── device.js
│   │   └── permission.js
│   ├── views/          # 页面组件
│   │   ├── Manage.vue
│   │   ├── MyTasks.vue
│   │   ├── TeamTasks.vue
│   │   └── Project.vue
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .env.development   # 开发环境变量
├── .env.production    # 生产环境变量
├── index.html         # HTML 模板
├── package.json       # 项目配置
└── vite.config.js    # Vite 配置
```

## 开发指南

### 状态管理

项目使用 Pinia 进行状态管理，主要包含以下 Store：

- **user.js**: 用户信息、权限、认证状态
- **task.js**: 任务列表、任务统计、任务操作
- **team.js**: 团队列表、团队信息
- **app.js**: 应用配置、设备类型、主题、语言

### 路由配置

路由配置位于 `src/router/index.js`，主要路由：

- `/`: 重定向到 `/manage/my-tasks`
- `/manage/my-tasks`: 我的任务
- `/manage/team-tasks`: 团队任务
- `/manage/project/:projectId`: 项目详情

### API 接口

API 接口位于 `src/api/` 目录，当前使用 Mock 数据。接口定义：

- `api.todo.getTodoList()`: 获取待办列表
- `api.todo.getTodoStatistics()`: 获取任务统计
- `api.team.getTeamList()`: 获取团队列表
- `api.ai.getAnalysis()`: 获取 AI 分析

### 权限控制

权限控制工具位于 `src/utils/permission.js`，主要函数：

- `hasPermission(permission)`: 检查权限
- `hasRole(role)`: 检查角色
- `canEditTask(task, project)`: 检查是否可编辑任务
- `canDeleteTask(task, project)`: 检查是否可删除任务
- `canAddTask(project)`: 检查是否可添加任务

### 响应式适配

项目支持 PC 和移动端双端适配：

- PC 端使用 Element Plus 组件
- 移动端使用 Vant 组件
- 自动检测设备类型并切换 UI 组件库
- 响应式布局适配不同屏幕尺寸

### 国际化

项目支持中文和英文双语切换：

- 语言配置位于 `src/locales/` 目录
- 使用 `$t()` 函数进行翻译
- 语言存储在 localStorage 中

## 注意事项

1. **Mock 数据**: 当前项目使用 Mock 数据，实际部署时需要替换为真实 API 接口
2. **移动端适配**: 部分功能在移动端进行了简化，但核心功能完整保留
3. **权限控制**: 权限逻辑已实现，但需要根据实际业务需求进行调整
4. **ECharts**: 甘特图功能依赖 ECharts，确保已正确安装
5. **环境变量**: 开发和生产环境使用不同的配置，注意修改 `.env` 文件

## 常见问题

### 1. 启动失败

检查 Node.js 版本是否 >= 16.0.0，重新安装依赖：

```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. 样式不生效

确保已安装 sass 依赖：

```bash
npm install -D sass
```

### 3. 图表不显示

检查 ECharts 是否正确安装：

```bash
npm install echarts
```

### 4. 路由跳转失败

检查路由配置是否正确，确保组件路径正确

## 技术文档

详细的技术文档请参考项目根目录下的 `TECHNICAL.md` 文件。

## 许可证

MIT License
