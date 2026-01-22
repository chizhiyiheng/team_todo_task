# 设计文档：任务详情弹窗

## 1. 概述

本文档描述任务详情弹窗（TaskDetailDialog）的技术设计方案。该组件是一个全功能的任务详情查看和编辑界面，支持查看任务完整信息、编辑任务、管理子任务、查看操作日志等功能。

### 1.1 设计目标

- 提供直观的任务详情展示界面
- 支持任务的查看、编辑、删除等操作
- 实现响应式布局，适配桌面端和移动端
- 确保良好的用户体验和性能表现

### 1.2 技术栈

- **框架**: Vue 3 (Composition API)
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **日期处理**: Day.js
- **国际化**: vue-i18n

## 2. 架构设计

### 2.1 组件结构

```
TaskDetailDialog.vue (主组件)
├── TaskDetailHeader (头部区域)
│   ├── 任务标题
│   ├── 重要标记图标
│   └── 关闭按钮
├── TaskDetailContent (内容区域)
│   ├── BasicInfoSection (基本信息)
│   ├── DescriptionSection (任务描述)
│   ├── AttachmentSection (附件列表)
│   ├── ProgressSection (进展管理)
│   ├── SubTaskSection (子任务)
│   └── ActivityLogSection (操作日志)
└── TaskDetailFooter (底部操作区)
    ├── 标记重要按钮
    ├── 标记完成按钮
    ├── 编辑按钮
    └── 删除按钮
```

**设计决策**: 采用单文件组件设计，将所有功能模块集成在一个组件中，通过内部区块（sections）划分功能。这样做的原因是：
1. 弹窗组件相对独立，不需要过度拆分
2. 减少组件间通信复杂度
3. 便于状态管理和数据流控制


### 2.2 数据流设计

```
用户操作 → TaskDetailDialog → API 调用 → 后端接口
                ↓                    ↓
            本地状态更新 ← 响应数据处理 ← 后端响应
                ↓
            UI 更新 + 消息提示
```

**设计决策**: 采用单向数据流模式，所有数据变更通过 API 调用完成，成功后更新本地状态并刷新 UI。这确保了数据的一致性和可追溯性。

### 2.3 状态管理

组件内部使用 Vue 3 Composition API 的 `ref` 和 `reactive` 管理本地状态：

- `taskDetail`: 任务详情数据（响应式对象）
- `isLoading`: 加载状态
- `editingTitle`: 标题编辑状态
- `editingDescription`: 描述编辑状态
- `editTitleValue`: 标题编辑临时值
- `editDescriptionValue`: 描述编辑临时值

**设计决策**: 不使用 Pinia store 管理弹窗状态，因为：
1. 弹窗是临时性 UI，状态不需要全局共享
2. 减少状态管理复杂度
3. 弹窗关闭时自动清理状态

## 3. 接口设计

### 3.1 API 封装

在 `src/api/index.js` 中扩展 `todoApi` 对象：

```javascript
export const todoApi = {
  // 现有方法...
  
  getTodoDetail(todoId) {
    return request.post('/api/todo/detail', { id: todoId })
  },
  
  updateTodo(data) {
    return request.post('/api/todo/update', data)
  },
  
  addTodo(data) {
    return request.post('/api/todo/add', data)
  },
  
  deleteTodo(todoId) {
    return request.post('/api/todo/delete', { id: todoId })
  }
}
```

**注意**: 删除接口 `/api/todo/delete` 在当前 API 文档中未定义，需要后端补充。


### 3.2 接口调用时序

#### 3.2.1 打开弹窗

```
用户点击任务 → 打开弹窗 → 调用 getTodoDetail(id) → 渲染详情
```

#### 3.2.2 标记重要

```
用户点击标记重要 → 调用 updateTodo({ id, isTop: 1/0 }) → 更新 UI
```

#### 3.2.3 标记完成

```
用户点击标记完成 → 调用 updateTodo({ id, status: 1, finishTime }) → 更新 UI
```

#### 3.2.4 编辑字段

```
用户点击字段 → 进入编辑状态 → 修改 → 保存 → 调用 updateTodo(data) → 更新 UI
```

#### 3.2.5 删除任务

```
用户点击删除 → 显示确认对话框 → 确认 → 调用 deleteTodo(id) → 关闭弹窗 → 刷新列表
```

#### 3.2.6 新增子任务

```
用户点击新增子任务 → 填写表单 → 提交 → 调用 addTodo({ ...data, parentTodoId }) → 刷新子任务列表
```

## 4. 组件详细设计

### 4.1 组件属性（Props）

```typescript
interface Props {
  modelValue: boolean        // 弹窗显示状态（v-model）
  taskId: string            // 任务 ID
}
```

### 4.2 组件事件（Emits）

```typescript
interface Emits {
  'update:modelValue': (visible: boolean) => void  // 更新弹窗显示状态
  'task-updated': (task: TaskDetail) => void       // 任务更新后触发
  'task-deleted': (taskId: string) => void         // 任务删除后触发
}
```

### 4.3 数据模型

#### 4.3.1 TaskDetail 接口

```typescript
interface TaskDetail {
  id: string
  umId: string
  name: string
  title: string
  content: string
  status: 0 | 1 | 2 | 3  // 0-待处理，1-已完成，2-进行中，3-已逾期
  progress: number        // 0-100
  priority: number
  isTop: 0 | 1           // 0-否，1-是
  deadLine: string
  startTime: string
  finishTime: string
  remindOption: number
  remindTime: string
  source: number
  sourceId: string
  attachmentList: Attachment[]
  todoUsers: TodoUser[]
  subTodoList: SubTodo[]
  activityLogList: ActivityLog[]
}
```


#### 4.3.2 相关类型定义

```typescript
interface Attachment {
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  storageType: string
}

interface TodoUser {
  umId: string
  name: string
  status: number
}

interface SubTodo {
  id: string
  content: string
  isFinished: boolean
}

interface ActivityLog {
  id: string
  action: string
  desc: string
  operator: string
  time: string
}
```

### 4.4 核心方法设计

#### 4.4.1 数据加载

```javascript
async function loadTaskDetail() {
  isLoading.value = true
  try {
    const response = await todoApi.getTodoDetail(props.taskId)
    if (response.code === '200') {
      taskDetail.value = response.body
    } else {
      ElMessage.error(response.message || '加载任务详情失败')
    }
  } catch (error) {
    ElMessage.error('加载任务详情失败')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}
```

#### 4.4.2 标记重要

```javascript
async function toggleImportant() {
  const newIsTop = taskDetail.value.isTop === 1 ? 0 : 1
  try {
    const response = await todoApi.updateTodo({
      id: taskDetail.value.id,
      umId: taskDetail.value.umId,
      name: taskDetail.value.name,
      title: taskDetail.value.title,
      isTop: newIsTop
    })
    if (response.code === '200') {
      taskDetail.value.isTop = newIsTop
      ElMessage.success(newIsTop === 1 ? '已标记为重要' : '已取消重要标记')
      emit('task-updated', taskDetail.value)
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}
```


#### 4.4.3 标记完成

```javascript
async function markAsComplete() {
  try {
    const response = await todoApi.updateTodo({
      id: taskDetail.value.id,
      umId: taskDetail.value.umId,
      name: taskDetail.value.name,
      title: taskDetail.value.title,
      todoStatus: 1,
      finishTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    })
    if (response.code === '200') {
      taskDetail.value.status = 1
      taskDetail.value.finishTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      ElMessage.success('任务已完成')
      emit('task-updated', taskDetail.value)
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}
```

#### 4.4.4 编辑标题

```javascript
const editingTitle = ref(false)
const editTitleValue = ref('')

function startEditTitle() {
  editingTitle.value = true
  editTitleValue.value = taskDetail.value.title
  nextTick(() => {
    titleInputRef.value?.focus()
    titleInputRef.value?.select()
  })
}

async function saveTitle() {
  const trimmedValue = editTitleValue.value.trim()
  
  if (trimmedValue === '') {
    ElMessage.warning('标题不能为空')
    return
  }
  
  if (trimmedValue === taskDetail.value.title) {
    editingTitle.value = false
    return
  }
  
  await updateField('title', trimmedValue)
  editingTitle.value = false
}

function cancelEditTitle() {
  editingTitle.value = false
}

// 通用字段更新
async function updateField(field, value) {
  try {
    const response = await todoApi.updateTodo({
      id: taskDetail.value.id,
      umId: taskDetail.value.umId,
      name: taskDetail.value.name,
      title: taskDetail.value.title,
      [field]: value
    })
    if (response.code === '200') {
      taskDetail.value[field] = value
      ElMessage.success('更新成功')
      emit('task-updated', taskDetail.value)
    }
  } catch (error) {
    ElMessage.error('更新失败')
  }
}
```


#### 4.4.5 删除任务

```javascript
async function deleteTask() {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个任务吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await todoApi.deleteTodo(taskDetail.value.id)
    if (response.code === '200') {
      ElMessage.success('删除成功')
      emit('task-deleted', taskDetail.value.id)
      emit('update:modelValue', false)
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }
}
```

#### 4.4.6 新增子任务

```javascript
async function addSubTask(content) {
  try {
    const response = await todoApi.addTodo({
      umId: taskDetail.value.umId,
      name: taskDetail.value.name,
      title: content,
      content: content,
      parentTodoId: taskDetail.value.id,
      status: 0
    })
    if (response.code === '200') {
      await loadTaskDetail()
      ElMessage.success('子任务创建成功')
    } else {
      ElMessage.error(response.message || '创建失败')
    }
  } catch (error) {
    ElMessage.error('创建失败')
    console.error(error)
  }
}
```

## 5. UI 设计

### 5.1 布局结构

弹窗采用 Element Plus 的 `el-dialog` 组件，宽度设置为 800px（桌面端），移动端自适应全屏。


#### 5.1.1 头部区域

```
┌─────────────────────────────────────────────────┐
│ [★] 任务标题 ✏️(hover)                     [×]  │
└─────────────────────────────────────────────────┘

编辑状态：
┌─────────────────────────────────────────────────┐
│ [★] [input___________] ✓ ✗                 [×]  │
└─────────────────────────────────────────────────┘
```

- 左侧：重要标记图标（实心/空心星标）
- 中间：任务标题（点击编辑，显示输入框 + 勾叉图标）
- 右侧：关闭按钮

#### 5.1.2 内容区域

内容区域采用垂直布局，分为多个功能模块：

```
┌─────────────────────────────────────────────────┐
│ 基本信息                                        │
│ ├─ 执行人：[下拉选择 ▼]                        │
│ ├─ 创建人：张三 (UMID: 123456)                 │
│ ├─ 截止时间：[日期选择 ▼]                      │
│ ├─ 状态：[下拉菜单 ▼]                          │
│ ├─ 优先级：[下拉菜单 ▼]                        │
│ └─ 来源：手动创建                               │
├─────────────────────────────────────────────────┤
│ 任务描述                                        │
│ [点击编辑描述...]                               │
├─────────────────────────────────────────────────┤
│ 附件 (2)                                        │
│ [📄] 需求文档.pdf (1.2 MB) [下载]              │
├─────────────────────────────────────────────────┤
│ 进展                                            │
│ ████████████░░░░░░░░ 60%                        │
│ ┌─────────────────────────────────────────────┐ │
│ │ 输入进展说明...                             │ │
│ └─────────────────────────────────────────────┘ │
│ [提交进展]                                      │
│                                                 │
│ 历史进展：                                      │
│ • 2026-01-21 14:00 李四：完成了第一阶段        │
├─────────────────────────────────────────────────┤
│ 子任务 (3)                                      │
│ ☑ 编写第一章                                    │
│ ☐ 编写第二章                                    │
│ [+ 新增子任务]                                  │
├─────────────────────────────────────────────────┤
│ 操作日志                                        │
│ 2026-01-21 14:00 李四 更新了进度                │
└─────────────────────────────────────────────────┘
```

#### 5.1.3 底部操作区

```
┌─────────────────────────────────────────────────┐
│ [标记重要] [标记完成] [删除]                    │
└─────────────────────────────────────────────────┘
```

**设计决策**: 移除"编辑"按钮，因为所有字段都支持内联编辑。


### 5.2 样式设计

#### 5.2.1 状态颜色映射

```javascript
const statusConfig = {
  0: { text: '待处理', color: '#E6A23C', type: 'warning' },
  1: { text: '已完成', color: '#67C23A', type: 'success' },
  2: { text: '进行中', color: '#409EFF', type: 'primary' },
  3: { text: '已逾期', color: '#F56C6C', type: 'danger' }
}
```

#### 5.2.2 优先级映射（待确认）

```javascript
const priorityConfig = {
  1: { text: '低', color: '#909399' },
  2: { text: '中', color: '#E6A23C' },
  3: { text: '高', color: '#F56C6C' }
}
```

**注意**: 优先级的取值范围需要后端确认。

#### 5.2.3 来源映射（待确认）

```javascript
const sourceConfig = {
  '-1': '老数据同步',
  '0': '手动创建',
  '1': '会议纪要',
  '8': 'i平安',
  '9': 'i平安',
  '10': 'i平安'
}
```

**注意**: 来源字段的完整映射需要后端确认。

### 5.3 响应式设计

#### 5.3.1 桌面端（>768px）

- 弹窗宽度：800px
- 内容区域：双列布局（基本信息部分）
- 字体大小：14px（正文）、16px（标题）

#### 5.3.2 移动端（≤768px）

- 弹窗宽度：100%（全屏）
- 内容区域：单列布局
- 字体大小：14px（正文）、15px（标题）
- 底部操作按钮：堆叠布局


## 6. 功能模块详细设计

### 6.1 基本信息模块

**显示内容**:
- 执行人列表（todoUsers）：显示头像和姓名，最多显示 5 个，超出显示 "+N"
- 创建人：姓名 + UMID
- 截止时间：格式化为 "YYYY-MM-DD HH:mm:ss"
- 状态：使用 el-tag 显示，根据状态值应用不同颜色
- 优先级：显示文本和颜色标识
- 来源：根据 source 字段映射显示文本

**逾期标识**: 当 status 为 3 时，使用红色高亮显示状态标签。

### 6.2 任务描述模块

**显示逻辑**:
- 如果 content 字段有值，显示内容
- 如果 content 为空，显示 "点击添加描述..."
- 点击后显示 textarea + 保存/取消按钮

**设计决策**: 描述为纯文本格式，不支持富文本。

**交互实现**:

```javascript
const editingDescription = ref(false)
const editDescriptionValue = ref('')

function startEditDescription() {
  editingDescription.value = true
  editDescriptionValue.value = taskDetail.value.content || ''
}

async function saveDescription() {
  await updateField('content', editDescriptionValue.value)
  editingDescription.value = false
}

function cancelEditDescription() {
  editingDescription.value = false
}
```

### 6.3 附件列表模块

**显示内容**:
- 文件图标（根据 fileType 显示不同图标）
- 文件名（fileName）
- 文件大小（fileSize，转换为可读格式）
- 下载/预览按钮

**文件大小格式化**:

```javascript
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
```

**文件类型图标映射**:

```javascript
const fileIconMap = {
  'application/pdf': 'document',
  'image/jpeg': 'picture',
  'image/png': 'picture',
  'application/zip': 'folder-opened',
  'default': 'document'
}
```


### 6.4 进展管理模块

**显示内容**:
- 进度条（el-progress）：显示 progress 字段值（0-100）
- 进展说明输入框（el-input type="textarea"）
- 提交按钮
- 历史进展列表

**设计决策**: 由于当前接口文档中没有明确的进展说明字段，建议后端补充 `progressHistory` 字段（数组类型），用于存储进展历史记录。

**数据结构建议**:

```typescript
interface ProgressHistory {
  id: string
  content: string
  operator: string
  time: string
  progress: number
}
```

**提交逻辑**:

```javascript
async function submitProgress(note) {
  try {
    const response = await todoApi.updateTodo({
      id: taskDetail.value.id,
      umId: taskDetail.value.umId,
      name: taskDetail.value.name,
      title: taskDetail.value.title,
      progressNote: note  // 需要后端支持
    })
    if (response.code === '200') {
      await loadTaskDetail()
      ElMessage.success('进展提交成功')
    }
  } catch (error) {
    ElMessage.error('提交失败')
  }
}
```

### 6.5 子任务模块

**显示内容**:
- 子任务列表（subTodoList）
- 每个子任务显示：复选框（isFinished）+ 内容（content）
- 新增子任务按钮

**交互逻辑**:
- 点击子任务：打开该子任务的详情弹窗（递归调用 TaskDetailDialog）
- 点击新增：显示输入框，输入内容后调用 addTodo 接口

**设计决策**: 子任务点击后打开新的详情弹窗，支持多层级任务管理。使用 `parentTodoId` 字段关联父任务。

**注意**: 子任务的完整数据结构在接口文档中标注为"待定"，实现时需要根据实际接口调整。


### 6.6 操作日志模块

**显示内容**:
- 日志列表（activityLogList）
- 每条日志显示：操作时间 + 操作人 + 操作描述
- 按时间倒序排列（最新的在最上方）

**显示格式**:

```
2026-01-21 14:00  李四  更新了进度
2026-01-21 09:00  张三  创建了任务
```

**操作类型映射（待确认）**:

```javascript
const actionTextMap = {
  'create': '创建了任务',
  'update': '更新了任务',
  'complete': '完成了任务',
  'delete': '删除了任务',
  'comment': '添加了评论'
}
```

**注意**: 操作日志的完整数据结构和 action 字段的取值范围在接口文档中标注为"待定"，实现时需要根据实际接口调整。

**滚动处理**: 当日志条目超过 10 条时，显示滚动条，最大高度 300px。

## 7. 内联编辑设计

### 7.1 编辑交互方案

**设计决策**: 采用内联编辑模式，符合主流项目管理系统的交互习惯（Jira、Linear、Asana）。

**字段分类**:

1. **点击切换为表单项（纯文本字段）**
   - 标题: 点击 → 显示 input + 勾叉图标 → 保存/取消
   - 描述: 点击 → 显示 textarea + 保存/取消按钮

2. **直接交互（选择类字段）**
   - 状态: 下拉菜单直接切换并保存
   - 优先级: 下拉菜单直接切换并保存
   - 分配人: 选择器直接修改并保存
   - 截止时间: 日期选择器直接修改并保存

3. **只读字段**
   - 创建人、来源: 不可编辑

4. **特殊模块**
   - 进展: 独立输入框 + 提交按钮

### 7.2 标题编辑

**交互流程**:
```
默认: [★] 完成项目文档编写 ✏️(hover)
点击: [★] [input___________] ✓ ✗
保存: Enter 键 或 点击 ✓
取消: Esc 键 或 点击 ✗
```

**实现要点**:
- 点击后输入框获得焦点并全选文本
- 标题不能为空，空值时提示并保持编辑状态
- 内容未改变时直接退出，不调用接口
- 提供快捷键支持（Enter 保存，Esc 取消）

### 7.3 描述编辑

**交互流程**:
```
默认: 显示描述内容（或"点击添加描述..."）
点击: 显示 textarea + [保存] [取消] 按钮
保存: 点击保存按钮
取消: 点击取消按钮
```

**实现要点**:
- 描述为纯文本，不支持富文本
- 允许为空
- 使用 textarea，支持多行输入

### 7.4 选择类字段

**实现方式**:
```javascript
// 状态更新
async function updateStatus(newStatus) {
  await updateField('todoStatus', newStatus)
}

// 通用字段更新
async function updateField(field, value) {
  try {
    const response = await todoApi.updateTodo({
      id: taskDetail.value.id,
      umId: taskDetail.value.umId,
      name: taskDetail.value.name,
      title: taskDetail.value.title,
      [field]: value
    })
    if (response.code === '200') {
      taskDetail.value[field] = value
      ElMessage.success('更新成功')
      emit('task-updated', taskDetail.value)
    }
  } catch (error) {
    ElMessage.error('更新失败')
  }
}
```

**特点**:
- 选择后立即保存，无需额外确认
- 每个字段独立更新，减少接口调用复杂度


## 8. 错误处理

### 8.1 接口错误处理

所有 API 调用都需要进行错误处理：

```javascript
try {
  const response = await todoApi.someMethod(params)
  if (response.code === '200') {
    // 成功处理
  } else {
    ElMessage.error(response.message || '操作失败')
  }
} catch (error) {
  ElMessage.error('网络错误，请稍后重试')
  console.error(error)
}
```

### 8.2 数据验证

- 加载详情失败：显示错误提示，关闭弹窗
- 字段缺失：使用默认值或空值，不阻断渲染
- 数组字段为空：显示"暂无数据"提示

### 8.3 用户操作确认

- 删除任务：显示确认对话框
- 取消编辑：如果有未保存的修改，显示确认对话框

## 9. 性能优化

### 9.1 数据加载优化

- 使用 loading 状态显示加载动画
- 避免重复加载：弹窗打开时加载一次，操作成功后刷新

### 9.2 渲染优化

- 使用 v-if 控制大块内容的渲染
- 长列表（如操作日志）使用虚拟滚动（如果条目超过 100 条）
- 图片懒加载（附件预览图）

### 9.3 内存管理

- 弹窗关闭时清理状态
- 取消未完成的 API 请求（使用 AbortController）

## 10. 国际化支持

### 10.1 文本资源

在 `src/locales/zh.js` 和 `src/locales/en.js` 中添加翻译资源：

```javascript
// zh.js
export default {
  taskDetail: {
    title: '任务详情',
    basicInfo: '基本信息',
    executor: '执行人',
    creator: '创建人',
    deadline: '截止时间',
    status: '状态',
    priority: '优先级',
    source: '来源',
    description: '任务描述',
    attachments: '附件',
    progress: '进展',
    subTasks: '子任务',
    activityLog: '操作日志',
    markImportant: '标记重要',
    markComplete: '标记完成',
    edit: '编辑',
    delete: '删除',
    save: '保存',
    cancel: '取消',
    noDescription: '暂无描述',
    noAttachments: '暂无附件',
    noSubTasks: '暂无子任务',
    noActivityLog: '暂无操作记录',
    deleteConfirm: '确定要删除这个任务吗？删除后无法恢复。',
    deleteSuccess: '删除成功',
    saveSuccess: '保存成功',
    operationFailed: '操作失败'
  }
}
```


### 10.2 使用方式

```javascript
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 在模板中使用
<el-button>{{ t('taskDetail.edit') }}</el-button>
```

## 11. 测试策略

### 11.1 单元测试

测试核心方法：
- `loadTaskDetail()`: 数据加载
- `toggleImportant()`: 标记重要
- `markAsComplete()`: 标记完成
- `saveEdit()`: 保存编辑
- `deleteTask()`: 删除任务
- `addSubTask()`: 新增子任务

### 11.2 集成测试

测试用户流程：
- 打开弹窗 → 加载数据 → 显示详情
- 编辑任务 → 保存 → 刷新显示
- 删除任务 → 确认 → 关闭弹窗

### 11.3 UI 测试

- 响应式布局测试（桌面端、移动端）
- 加载状态显示
- 错误提示显示
- 交互反馈（按钮点击、表单验证）

## 12. 待确认事项

以下事项需要与后端或产品确认：

### 12.1 接口相关

1. **删除接口**: `/api/todo/delete` 接口地址和参数格式
2. **进展历史字段**: 需要新增 `progressHistory` 字段（数组类型），用于存储进展历史记录
3. **子任务数据结构**: `subTodoList` 的完整字段定义
4. **操作日志数据结构**: `activityLogList` 的完整字段定义和 `action` 枚举值

### 12.2 业务逻辑

1. **优先级枚举**: `priority` 字段的取值范围和显示文案（建议：1-低，2-中，3-高）
2. **来源枚举**: `source` 字段的完整映射表
3. **操作类型枚举**: `activityLogList[].action` 的取值范围和显示文案
4. **标记完成时进度**: 是否需要同时将 `progress` 更新为 100

### 12.3 UI/UX

1. **附件预览**: 是否需要支持在线预览（图片、PDF）
2. **子任务层级**: 是否限制子任务的嵌套层级
3. **操作日志分页**: 日志条目过多时是否需要分页加载
4. **进展历史展示**: 进展历史的显示方式和数量限制


## 13. 实现计划

### 13.1 第一阶段：基础框架

- 创建组件文件 `TaskDetailDialog.vue`
- 实现弹窗基础结构（头部、内容、底部）
- 实现数据加载逻辑
- 实现基本信息展示

### 13.2 第二阶段：内联编辑

- 实现标题内联编辑（点击 → input + 勾叉图标）
- 实现描述内联编辑（点击 → textarea + 保存/取消）
- 实现选择类字段直接编辑（状态、优先级、分配人、日期）
- 实现字段更新接口调用

### 13.3 第三阶段：核心功能

- 实现附件列表展示
- 实现标记重要功能
- 实现标记完成功能
- 实现删除功能

### 13.4 第四阶段：高级功能

- 实现进展管理（输入框 + 历史记录）
- 实现子任务管理
- 实现操作日志展示

### 13.5 第五阶段：完善优化

- 实现响应式布局
- 实现国际化
- 性能优化和错误处理
- 测试和调试

## 14. 依赖关系

### 14.1 外部依赖

- Element Plus: UI 组件库
- Day.js: 日期处理
- vue-i18n: 国际化

### 14.2 内部依赖

- `src/api/index.js`: API 封装
- `src/utils/date.js`: 日期工具函数
- `src/locales/*`: 国际化资源

### 14.3 组件依赖

- 无外部组件依赖（自包含组件）
- 可被 TaskList.vue 等组件调用

## 15. 文件结构

```
src/components/business/task-detail/
├── TaskDetailDialog.vue          # 主组件
└── index.js                      # 导出文件（可选）
```

**设计决策**: 采用单文件组件设计，所有功能集成在一个文件中。如果未来组件变得过于复杂（超过 1000 行），可以考虑拆分为多个子组件。

## 16. 总结

本设计文档详细描述了任务详情弹窗的技术实现方案，涵盖了架构设计、接口设计、UI 设计、功能模块设计等各个方面。主要设计决策包括：

1. **内联编辑模式**: 符合主流项目管理系统的交互习惯，减少操作步骤
2. **字段分类编辑**: 纯文本字段点击切换表单，选择类字段直接交互
3. **标题编辑保护**: 提供勾叉图标和快捷键，防止误操作
4. **单向数据流**: 确保数据一致性和可追溯性
5. **响应式布局**: 支持桌面端和移动端，提供良好的跨设备体验
6. **完善的错误处理**: 所有 API 调用都有错误处理和用户提示

实现过程中需要注意待确认事项，特别是进展历史字段（progressHistory）需要后端支持，以及其他接口相关的字段定义和枚举值映射。
