# 代码修改说明

## 任务1：更新获取待办列表接口 (/api/todo/list)

### 修改的文件：

1. **src/mock/index.js**
   - 更新 `getTodoList` 方法的参数处理
   - 将 `pageNum` 改为 `page`
   - 将 `todoStatus` 改为 `status`
   - 添加 `queryType`、`deadLine`、`finishTime`、`projectId`、`parentTodoId` 参数支持
   - 更新返回数据结构，移除分页相关的冗余字段，保留 `list`、`total`、`page`、`pageSize`、`pageCount`

2. **src/views/MyTasks.vue**
   - 将所有 `pageNum` 改为 `page`
   - 将 `todoStatus: '2'` 改为 `status: 2`

3. **src/views/Manage.vue**
   - 将所有 `pageNum` 改为 `page`
   - 将 `todoStatus: '2'` 改为 `status: 2`

4. **src/views/Project.vue**
   - 将所有 `pageNum` 改为 `page`
   - 将 `todoStatus: '2'` 改为 `status: 2`

5. **src/views/TeamTasks.vue**
   - 将所有 `pageNum` 改为 `page`
   - 将 `todoStatus: '2'` 改为 `status: 2`

6. **src/mock/todoData.js**
   - 更新第一个待办数据结构，添加新接口文档要求的字段：
     - `umId`、`name`、`title`
     - `priority`、`projectId`、`parentTodoId`、`tag`
     - `todoUsers` 数组（包含完整的用户信息）
     - `attachmentList` 中添加 `id`、`todoId` 字段
     - 将 `storageType` 从 'cloud' 改为 'iobs'

## 任务2：实现删除待办接口 (/api/todo/delete/{id})

### 修改的文件：

1. **src/api/index.js**
   - 修改 `deleteTodo` 方法，从 POST 改为 DELETE 请求
   - 使用路径参数形式：`/api/todo/delete/${id}`
   - 参数从对象改为直接传递 id

2. **src/api/request.js**
   - 在 `mockRequest` 方法中添加路径参数解析逻辑
   - 支持 `/api/todo/delete/{id}` 格式的URL
   - 更新 `delete` 方法，将参数从 `params` 改为 `data`

3. **src/mock/index.js**
   - 重写 `deleteTodo` 方法，实现完整的业务逻辑：
     - 检查待办是否存在
     - 检查待办状态（只有已完成的待办才能删除）
     - 从mock数据中删除对应的待办
     - 返回符合接口文档的响应格式

4. **src/components/business/TaskList.vue**
   - 导入 `ElMessageBox` 和 `todoApi`
   - 重写 `removeTask` 方法：
     - 添加状态检查（只有已完成的待办才能删除）
     - 添加删除确认对话框
     - 调用 `todoApi.deleteTodo(task.id)` 接口
     - 处理成功和失败的情况
     - 删除成功后刷新任务列表

5. **src/stores/task.js**
   - 添加 `fetchTasks` 方法，作为 `fetchTaskList` 的便捷封装
   - 默认参数：`{ page: 1, pageSize: 10000 }`

## 任务3：添加获取执行人列表接口 (/api/todo/user/list)

### 新增接口实现（按开发规范）：

1. **src/api/index.js** - 定义接口方法
   ```javascript
   getUserList() {
     return request.get('/api/todo/user/list')
   }
   ```

2. **src/mock/index.js** - 实现 Mock 逻辑
   ```javascript
   async getUserList() {
     await delay()
     // 从所有待办中提取执行人umId列表
     const allTasks = [...mockTodoList, ...mockTodoListPage2]
     const userSet = new Set()
     allTasks.forEach(task => {
       const todoUsers = task.todoUsers || []
       todoUsers.forEach(user => {
         if (user.umId) {
           userSet.add(user.umId)
         }
       })
     })
     return {
       code: '200',
       message: 'success',
       data: Array.from(userSet)
     }
   }
   ```

3. **src/api/request.js** - 添加路由映射
   ```javascript
   case '/api/todo/user/list':
     result = await this.mockApi.getUserList()
     break
   ```

4. **src/views/MyTasks.vue** - 调用接口
   - 添加 `assigneeOptions` 和 `assigneeLoading` 状态
   - 添加 `fetchAssigneeList` 方法调用接口
   - 添加 `handleAssigneeFocus` 方法，在下拉框获得焦点时加载数据
   - 更新执行人下拉框，添加 `loading` 和 `@focus` 事件

## 任务4：更新任务状态枚举值

### 新的状态枚举（0-待接收 1-待处理 2-已完成 3-进行中 4-已逾期 5-已取消）：

1. **src/constants/taskEnums.js**
   ```javascript
   export const TASK_STATUS = {
     TO_RECEIVE: 0,   // 待接收
     PENDING: 1,      // 待处理
     COMPLETED: 2,    // 已完成
     IN_PROGRESS: 3,  // 进行中
     OVERDUE: 4,      // 已逾期
     CANCELLED: 5     // 已取消
   }
   ```

2. **src/views/MyTasks.vue**
   - 更新状态下拉框选项，添加"待接收"选项
   - 更新 `getTaskStatusName` 方法，支持新的状态枚举
   - 更新 `getTaskStatusClass` 方法，支持新的状态枚举
   - 更新 `filteredTasks` 计算属性，使用新的状态值筛选
   - 更新删除逻辑，检查 `todoStatus === 2`（已完成）

3. **src/components/business/TaskList.vue**
   - 更新 `getTaskStatus` 方法，支持新的状态枚举
   - 更新 `removeTask` 方法，检查 `todoStatus === 2`（已完成）

4. **src/mock/index.js**
   - 更新 `deleteTodo` 方法，检查 `todoStatus === 2`（已完成）

5. **docs/接口名：获取待办列表.md**
   - 更新接口文档中的status字段描述

## 任务5：按状态筛选优化

### 修改的文件：

1. **src/views/MyTasks.vue**
   - 添加 `handleStatusFilterChange` 方法
   - 当选择"全部状态"时，不传 `status` 参数
   - 当选择具体状态时，传递对应的 `status` 值（0-5）
   - 调用 `taskStore.fetchTaskList` 重新获取数据

2. **所有视图文件**
   - 移除默认的 `status: 2` 参数
   - 改为不传 `status`，获取所有状态的任务

## 问题修复

### 问题1：任务列表不显示数据

**原因**：所有页面都在请求 `status: 2`（进行中）的待办，但mock数据中大部分待办的状态是 `todoStatus: 1`（已完成）或 `todoStatus: 0`（待处理），没有足够的 `todoStatus: 2` 的数据。

**解决方案**：修改了部分mock数据的状态为 `todoStatus: 3`（进行中），确保有足够的测试数据。

### 问题2：获取任务列表时应该显示所有状态的任务

**原因**：所有页面在调用 `fetchTaskList` 时都传递了 `status: 2`，导致只显示进行中的任务。

**解决方案**：移除所有 `fetchTaskList` 调用中的 `status` 参数，改为获取所有状态的任务。

### 问题3：删除任务后的提示信息

**原因**：删除成功后的提示信息不够明确。

**解决方案**：修改提示信息为"任务删除成功"。

## 接口变更总结

### 获取待办列表接口
- **请求参数变更**：
  - `pageNum` → `page`
  - `todoStatus` → `status`（类型从字符串改为整数）
  - 新增：`queryType`、`deadLine`、`finishTime`、`projectId`、`parentTodoId`

- **响应数据变更**：
  - 保留：`list`、`total`、`page`、`pageSize`、`pageCount`
  - 移除：`pages`、`isFirstPage`、`isLastPage`、`hasPreviousPage`、`hasNextPage`、`navigateFirstPage`、`navigateLastPage`、`navigatePages`、`prePage`、`nextPage`、`startRow`、`endRow`、`size`

### 删除待办接口
- **请求方式**：POST → DELETE
- **请求路径**：`/api/todo/delete` → `/api/todo/delete/{id}`
- **请求参数**：从请求体改为路径参数
- **响应数据**：`body` → `data`
- **业务逻辑**：
  - 只有已完成（status=2）的待办才能删除
  - 返回错误码：`TODO_NOT_FOUND`、`TEAM_TASK_OPERATE_STATUS_INVALID`

### 获取执行人列表接口（新增）
- **请求方式**：GET
- **请求路径**：`/api/todo/user/list`
- **请求参数**：无（从登录信息获取当前用户）
- **响应数据**：返回执行人umId数组

### 任务状态枚举变更
- **旧枚举**：0-待处理 1-已完成 2-进行中 3-已逾期 4-已取消
- **新枚举**：0-待接收 1-待处理 2-已完成 3-进行中 4-已逾期 5-已取消

## 测试建议

1. 测试获取待办列表：
   - 测试不同的 `status` 值（0-待接收、1-待处理、2-已完成、3-进行中、4-已逾期、5-已取消）
   - 测试 `queryType`（0-所有待办、1-我分配的、2-我执行的）
   - 测试分页功能
   - 测试不传 `status` 参数，应返回所有状态的任务

2. 测试删除待办：
   - 尝试删除未完成的待办（应该失败）
   - 尝试删除已完成的待办（应该成功）
   - 验证删除后列表自动刷新
   - 验证删除确认对话框
   - 验证"任务删除成功"提示

3. 测试获取执行人列表：
   - 点击执行人下拉框，验证是否发送接口请求
   - 验证下拉列表是否显示执行人数据
   - 验证loading状态

4. 测试状态筛选：
   - 选择"全部状态"，验证不传 `status` 参数
   - 选择具体状态，验证传递正确的 `status` 值
   - 验证筛选后的列表数据正确

## 最新修复（拖拽组件、样式优化、甘特图）

### 问题1：使用成熟的拖拽组件

**原因**：
- 原生HTML5拖拽API在不同浏览器中表现不一致
- 拖拽逻辑复杂，容易出现bug
- 缺少拖拽动画和视觉反馈

**解决方案**：
1. **安装 vuedraggable**
   ```bash
   npm install sortablejs vuedraggable@next --save
   ```

2. **重构看板拖拽逻辑** (`src/components/business/TaskList.vue`)
   - 使用 `<draggable>` 组件替代原生拖拽
   - 配置拖拽选项：
     ```javascript
     :group="{ name: 'tasks', pull: true, put: true }"
     :animation="200"
     ghost-class="ghost-card"
     ```
   - 使用 `@end` 事件处理拖拽完成
   - 自动处理跨列拖拽

3. **优化拖拽处理逻辑**
   ```javascript
   async function handleDragEnd(evt, targetStatusKey) {
     // 获取被拖拽的任务
     const task = columnTasks.value[targetStatusKey][newIndex]
     // 判断状态是否改变
     // 调用接口更新状态
     // 显示成功/失败提示
   }
   ```

**效果**：
- ✅ 拖拽流畅，有动画效果
- ✅ 支持跨列拖拽
- ✅ 拖拽时显示半透明效果
- ✅ 自动更新任务状态
- ✅ 兼容性好，支持所有现代浏览器

### 问题2：看板样式优化

**原因**：
- 进度条没有显示
- 时间显示有黑色阴影（taskfont图标问题）
- 卡片布局不够清晰

**解决方案**：
1. **优化进度条显示**
   ```vue
   <el-progress 
     v-if="task.percent !== undefined" 
     :percentage="task.percent || 0" 
     :stroke-width="6" 
     :show-text="false"
   />
   ```

2. **优化时间显示**
   - 移除 taskfont 图标，使用 Element Plus 的 Clock 图标
   - 简化时间显示逻辑
   ```vue
   <div class="task-deadline">
     <el-icon><Clock /></el-icon>
     <span :class="{ 'overdue': isOverdue(task.deadLine) }">
       {{ expiresFormat(task.deadLine) }}
     </span>
   </div>
   ```

3. **优化卡片样式** (遵循开发规范)
   - 使用 SCSS 变量：`$spacing-md`、`$text-primary`、`$border-light`
   - 优化间距和布局
   - 添加优先级颜色条
   - 改进hover效果

4. **添加拖拽视觉反馈**
   ```scss
   .ghost-card {
     opacity: 0.5;
     background: #f0f0f0;
   }
   ```

**效果**：
- ✅ 进度条正常显示
- ✅ 时间显示清晰，无黑色阴影
- ✅ 卡片布局美观，信息层次分明
- ✅ 拖拽时有视觉反馈

### 问题3：Mock数据任务标题错误

**原因**：
- Mock数据中 `name` 字段被错误设置为"刘庆红"
- 应该是任务标题，而不是人名

**解决方案**：
修改 `src/mock/todoData.js` 中所有任务的 `name` 字段：
- ✅ 待接收：新项目需求评审
- ✅ 待处理：完成API接口文档、数据库性能优化
- ✅ 已完成：完成登录模块开发、代码审查
- ✅ 进行中：开发订单管理功能、前端页面重构、单元测试编写
- ✅ 已逾期：修复生产环境Bug、更新系统文档
- ✅ 已取消：旧功能迁移

### 问题4：甘特图不显示

**原因**：
- 图表容器高度不够
- 网格布局参数不合理
- 缺少窗口resize监听

**解决方案**：
1. **增加容器高度**
   ```vue
   <div ref="ganttChart" style="width: 100%; height: 600px;"></div>
   ```

2. **优化图表配置**
   ```javascript
   grid: {
     left: '20%',    // 增加左侧空间
     right: '5%',
     bottom: '5%',
     top: 60,        // 为标题留出空间
     containLabel: false
   }
   ```

3. **优化Y轴标签**
   ```javascript
   yAxis: {
     axisLabel: {
       width: 120,
       overflow: 'truncate',
       ellipsis: '...'
     }
   }
   ```

4. **添加窗口resize监听**
   ```javascript
   window.addEventListener('resize', () => {
     if (ganttChartInstance.value) {
       ganttChartInstance.value.resize()
     }
   })
   ```

5. **优化柱状图样式**
   ```javascript
   series: [{
     type: 'bar',
     barWidth: 20  // 设置柱子宽度
   }]
   ```

**效果**：
- ✅ 甘特图正常显示
- ✅ 任务时间线清晰可见
- ✅ 任务名称完整显示（过长自动截断）
- ✅ 响应式布局，窗口大小改变时自动调整
- ✅ 不同状态的任务用不同颜色区分

## 最新修复（Mock数据和看板拖拽）

### 问题1：Mock数据优化

**原因**：
- Mock数据中各个状态的任务分布不均匀
- 日期跨度太大，不利于查看甘特图
- 缺少各个状态的代表性数据

**解决方案**：
1. **重新设计mock数据** (`src/mock/todoData.js`)
   - 添加各个状态的任务：
     - 状态0（待接收）：1个任务
     - 状态1（待处理）：2个任务
     - 状态2（已完成）：2个任务
     - 状态3（进行中）：3个任务
     - 状态4（已逾期）：2个任务
     - 状态5（已取消）：1个任务
   
2. **优化日期范围**
   - 使用 `getRecentDate()` 和 `getFutureDate()` 函数
   - 所有任务的日期都在最近两个月内
   - 便于在甘特图中查看任务时间线

3. **完善任务信息**
   - 每个任务都有完整的字段
   - 包含执行人、优先级、进度等信息
   - 便于测试各种功能

### 问题2：看板拖拽不生效

**原因**：
- `updateTaskStatus` 只更新了 `task.status`，没有更新 `task.todoStatus`
- Mock数据中的状态没有同步更新
- 导致拖拽后任务状态判断错误，无法移动到新看板

**解决方案**：
1. **更新 store 逻辑** (`src/stores/task.js`)
   ```javascript
   async function updateTaskStatus({ taskId, status }) {
     // ...
     if (task) {
       // 同时更新 status 和 todoStatus
       task.status = status
       task.todoStatus = status
     }
     // ...
   }
   ```

2. **更新 mock 逻辑** (`src/mock/index.js`)
   ```javascript
   async updateTaskStatus(taskId, status) {
     // 在mock数据中更新任务状态
     const task = allTasks.find(t => t.id === taskId)
     if (task) {
       task.status = status
       task.todoStatus = status
       task.updateTime = new Date().toISOString()
     }
     // ...
   }
   ```

3. **优化拖拽逻辑** (`src/components/business/TaskList.vue`)
   - 移除不必要的 `fetchTasks()` 调用
   - 利用 Vue 的响应式特性，自动更新视图
   - 只在失败时才刷新列表恢复状态
   - 提升用户体验，拖拽更流畅

**效果**：
- ✅ 拖拽任务后立即移动到新看板
- ✅ 显示"状态更新成功"提示
- ✅ 任务状态正确更新
- ✅ 无需刷新页面，响应式更新

## 最新修复（任务状态显示和看板/甘特图）

### 问题1：任务状态显示错误

**原因**：
- 任务前面的圆圈判断逻辑使用的是旧的状态值 `task.status === '1'`
- 任务标题的划线样式判断也使用的是旧的状态值

**解决方案**：
1. **src/components/business/TaskMenu.vue**
   - 添加 `isCompleted` 计算属性，判断 `todoStatus === 2` 或 `status === 2`
   - 只有已完成状态才显示勾选图标，其他状态显示空心圆圈

2. **src/views/MyTasks.vue**
   - 添加 `isTaskCompleted` 方法，判断任务是否已完成
   - 只有已完成的任务才添加 `complete` 类名（显示划线）

### 问题2：看板模式不显示待处理任务

**原因**：
- `getTaskStatus` 方法没有正确处理状态 0（待接收）和状态 1（待处理）
- 这两个状态都应该归类为 `pending`

**解决方案**：
- 更新 `getTaskStatus` 方法，将状态 0 和 1 都归类为 `pending`
- 看板模式现在可以正确显示所有待处理的任务

### 问题3：看板模式拖拽功能修复

**原因**：
- 拖拽后没有调用接口更新状态
- 状态映射使用的是旧的枚举值
- 没有处理接口调用失败的情况

**解决方案**：
1. **更新状态映射** (`mapStatusKeyToValue`)
   ```javascript
   const map = {
     pending: 1,      // 待处理
     in_progress: 3,  // 进行中
     completed: 2,    // 已完成
     overdue: 4       // 已逾期
   }
   ```

2. **优化拖拽处理逻辑** (`handleDrop`)
   - 先判断状态是否相同，相同则不处理
   - 调用 `taskStore.updateTaskStatus` 接口更新状态
   - 成功：显示"状态更新成功"提示，刷新任务列表
   - 失败：显示"状态更新失败"提示，刷新任务列表恢复原状态

### 问题4：甘特图模式不显示

**原因**：
- 数据获取逻辑有误，使用了不存在的 `task.raw` 属性
- 没有处理空数据的情况
- 时间数据获取不完整

**解决方案**：
1. **修复数据获取** (`initGanttChart`)
   - 直接使用 `task` 对象，不使用 `task.raw`
   - 使用 `task.content || task.name || task.title` 获取任务名称
   - 添加空数据处理，显示"暂无任务数据"

2. **优化时间数据获取** (`getTimeObj`)
   - 优先使用 `startTime`，其次 `createTime`
   - 优先使用 `deadLine`，其次 `end_at`
   - 添加默认值处理，避免数据缺失

3. **改进图表显示**
   - 调整网格布局，左侧留出更多空间显示任务名称
   - 优化tooltip显示，格式化日期
   - 任务名称过长时自动截断

### 问题5：全部状态时过滤已完成任务

**原因**：需要在状态为"全部"时，默认不显示已完成的任务，只有勾选"显示已完成"时才显示。

**解决方案**：
- 已在 `filteredTasks` 计算属性中实现
- 当 `showCompleted` 为 false 时，过滤掉 `todoStatus === 2` 的任务
- 用户勾选"显示已完成"复选框后，才会显示已完成的任务
