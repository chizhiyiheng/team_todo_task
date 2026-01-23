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
       const attendees = task.attendeeList || []
       attendees.forEach(attendee => {
         if (attendee.umId) {
           userSet.add(attendee.umId)
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
