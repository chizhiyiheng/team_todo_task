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
   - 默认参数：`{ status: 2, page: 1, pageSize: 10000 }`

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
  - 只有已完成（status=1）的待办才能删除
  - 返回错误码：`TODO_NOT_FOUND`、`TEAM_TASK_OPERATE_STATUS_INVALID`

## 测试建议

1. 测试获取待办列表：
   - 测试不同的 `status` 值（0-待处理、1-已完成、2-进行中、3-已逾期）
   - 测试 `queryType`（0-所有待办、1-我分配的、2-我执行的）
   - 测试分页功能

2. 测试删除待办：
   - 尝试删除未完成的待办（应该失败）
   - 尝试删除已完成的待办（应该成功）
   - 验证删除后列表自动刷新
   - 验证删除确认对话框

## 问题修复

### 问题1：任务列表不显示数据

**原因**：所有页面都在请求 `status: 2`（进行中）的待办，但mock数据中大部分待办的状态是 `todoStatus: 1`（已完成）或 `todoStatus: 0`（待处理），没有足够的 `todoStatus: 2` 的数据。

**解决方案**：修改了部分mock数据的状态为 `todoStatus: 2`（进行中），确保有足够的测试数据：

1. **mockTodoList** 中修改为进行中的待办：
   - 完成系统测试用例编写 (A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6) - 45%
   - 更新用户文档 (9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4) - 60%
   - 性能优化任务 (1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6) - 30%
   - 安全漏洞修复 (0F1E2D3C4B5A69788695A4B3C2D1E0F9) - 75%
   - 用户反馈处理 (1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6) - 50%

2. **mockTodoListPage2** 中修改为进行中的待办：
   - 代码重构 (5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0) - 40%
   - 缓存优化 (9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4) - 35%

3. 为这些待办添加了必要的字段：
   - `priority`：优先级
   - `projectId`：项目ID
   - `parentTodoId`：父待办ID
   - `percent`：进度百分比

现在任务列表应该能正常显示进行中的待办数据了。

### 问题2：获取任务列表时应该显示所有状态的任务

**原因**：所有页面在调用 `fetchTaskList` 时都传递了 `status: 2`，导致只显示进行中的任务。

**解决方案**：移除所有 `fetchTaskList` 调用中的 `status` 参数，改为获取所有状态的任务：

修改的文件：
- `src/views/MyTasks.vue`：移除 `status: 2` 参数
- `src/views/Manage.vue`：移除 `status: 2` 参数
- `src/views/Project.vue`：移除 `status: 2` 参数
- `src/views/TeamTasks.vue`：移除 `status: 2` 参数
- `src/stores/task.js`：`fetchTasks` 方法移除默认的 `status: 2` 参数

现在获取任务列表时，不传 `status` 参数就会拉取所有状态的任务列表。

### 问题3：删除任务后的提示信息

**原因**：删除成功后的提示信息不够明确。

**解决方案**：修改 `src/components/business/TaskList.vue` 中的 `removeTask` 方法，将删除成功的提示从"删除成功"改为"任务删除成功"。

```javascript
ElMessage.success('任务删除成功')
```
