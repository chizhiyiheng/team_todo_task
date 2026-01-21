# 需求文档

## 介绍

本文档定义了任务详情弹窗功能的需求规范。该功能允许用户在弹窗中查看任务的完整信息，包括基本信息、描述、附件、进展、子任务和操作日志，并支持对任务进行标记重要、标记完成、编辑和删除等操作。

## 术语表

- **Task_Detail_Dialog**: 任务详情弹窗组件
- **Todo_API**: 待办任务相关的后端接口服务
- **Task**: 待办任务实体
- **SubTask**: 子任务实体
- **ActivityLog**: 活动日志实体
- **Attachment**: 附件实体
- **User**: 用户实体

## 需求

### 需求 1: 弹窗显示与关闭

**用户故事:** 作为用户，我想要通过点击任务项打开详情弹窗，并能够关闭弹窗，以便查看任务的完整信息。

#### 验收标准

1. WHEN 用户点击任务列表中的任务项 THEN THE Task_Detail_Dialog SHALL 显示并加载该任务的详细信息
2. WHEN 用户点击弹窗的关闭按钮或遮罩层 THEN THE Task_Detail_Dialog SHALL 关闭并返回任务列表
3. WHEN 弹窗打开时 THEN THE Task_Detail_Dialog SHALL 调用 `/api/todo/detail` 接口获取最新数据
4. WHEN 接口请求失败 THEN THE Task_Detail_Dialog SHALL 显示错误提示信息

### 需求 2: 任务主题显示

**用户故事:** 作为用户，我想要在弹窗顶部看到任务的标题，以便快速了解任务内容。

#### 验收标准

1. WHEN 弹窗打开时 THEN THE Task_Detail_Dialog SHALL 在顶部显著位置显示任务标题（title 字段）
2. WHEN 任务标题过长时 THEN THE Task_Detail_Dialog SHALL 支持换行显示或提供滚动功能
3. THE Task_Detail_Dialog SHALL 在标题旁显示任务的重要标记状态（isTop 字段）

### 需求 3: 基本信息展示

**用户故事:** 作为用户，我想要查看任务的基本信息，以便了解任务的执行人、创建人、截止时间、状态、优先级和来源。

#### 验收标准

1. WHEN 弹窗显示基本信息时 THEN THE Task_Detail_Dialog SHALL 显示执行人列表（todoUsers 数组）
2. WHEN 弹窗显示基本信息时 THEN THE Task_Detail_Dialog SHALL 显示创建人姓名（name 字段）和创建人 UMID（umId 字段）
3. WHEN 弹窗显示基本信息时 THEN THE Task_Detail_Dialog SHALL 显示截止时间（deadLine 字段），格式为 "YYYY-MM-DD HH:mm:ss"
4. WHEN 弹窗显示基本信息时 THEN THE Task_Detail_Dialog SHALL 显示任务状态（status 字段），并使用不同颜色或图标区分：0-待处理，1-已完成，2-进行中，3-已逾期
5. WHEN 弹窗显示基本信息时 THEN THE Task_Detail_Dialog SHALL 显示优先级（priority 字段）
6. WHEN 弹窗显示基本信息时 THEN THE Task_Detail_Dialog SHALL 显示来源（source 字段）
7. WHEN 任务已逾期（status 为 3）THEN THE Task_Detail_Dialog SHALL 以醒目方式标识逾期状态

**TODO**: 需要确认 priority 字段的取值范围和显示规则（如：1-低，2-中，3-高）
**TODO**: 需要确认 source 字段的取值范围和显示文案映射（如：0-手动创建，8-i平安等）

### 需求 4: 任务描述展示

**用户故事:** 作为用户，我想要查看任务的详细描述，以便了解任务的具体要求和背景信息。

#### 验收标准

1. WHEN 弹窗显示任务描述时 THEN THE Task_Detail_Dialog SHALL 显示 content 字段的内容
2. WHEN content 字段包含富文本内容 THEN THE Task_Detail_Dialog SHALL 正确渲染富文本格式（如加粗、斜体、列表等）
3. WHEN content 字段为空 THEN THE Task_Detail_Dialog SHALL 显示 "暂无描述" 或类似提示文案
4. WHEN 描述内容过长时 THEN THE Task_Detail_Dialog SHALL 提供滚动功能

**TODO**: 需要确认 content 字段支持的富文本格式（HTML、Markdown 或其他格式）

### 需求 5: 附件列表展示

**用户故事:** 作为用户，我想要查看和下载任务的附件，以便获取相关文档和资料。

#### 验收标准

1. WHEN 弹窗显示附件列表时 THEN THE Task_Detail_Dialog SHALL 显示 attachmentList 数组中的所有附件
2. WHEN 显示单个附件时 THEN THE Task_Detail_Dialog SHALL 显示文件名（fileName）、文件大小（fileSize）和文件类型图标（根据 fileType）
3. WHEN 用户点击附件时 THEN THE Task_Detail_Dialog SHALL 触发文件下载或预览（使用 filePath）
4. WHEN attachmentList 为空时 THEN THE Task_Detail_Dialog SHALL 显示 "暂无附件" 提示
5. WHEN 文件大小显示时 THEN THE Task_Detail_Dialog SHALL 将 fileSize（字节）转换为可读格式（如 KB、MB）

### 需求 6: 进展管理

**用户故事:** 作为用户，我想要查看任务进度并提交进展说明，以便跟踪任务完成情况。

#### 验收标准

1. WHEN 弹窗显示进展模块时 THEN THE Task_Detail_Dialog SHALL 显示进度条，展示 progress 字段的值（0-100）
2. WHEN 弹窗显示进展模块时 THEN THE Task_Detail_Dialog SHALL 提供进展说明输入表单
3. WHEN 用户提交进展说明时 THEN THE Task_Detail_Dialog SHALL 调用 `/api/todo/update` 接口更新任务信息
4. WHEN 进展说明提交成功时 THEN THE Task_Detail_Dialog SHALL 刷新任务详情并显示成功提示
5. WHEN 进展说明提交失败时 THEN THE Task_Detail_Dialog SHALL 显示错误提示信息

**TODO**: 需要确认进展说明是否需要新增字段（如 progressNote 或 progressHistory），当前接口文档中未明确定义

### 需求 7: 子任务管理

**用户故事:** 作为用户，我想要查看、新增和管理子任务，以便将大任务分解为可管理的小任务。

#### 验收标准

1. WHEN 弹窗显示子任务列表时 THEN THE Task_Detail_Dialog SHALL 显示 subTodoList 数组中的所有子任务
2. WHEN 显示单个子任务时 THEN THE Task_Detail_Dialog SHALL 显示子任务内容（content）和完成状态（isFinished）
3. WHEN 用户点击子任务时 THEN THE Task_Detail_Dialog SHALL 打开该子任务的详情弹窗
4. WHEN 用户点击新增子任务按钮时 THEN THE Task_Detail_Dialog SHALL 显示子任务创建表单
5. WHEN 用户提交新子任务时 THEN THE Task_Detail_Dialog SHALL 调用 `/api/todo/add` 接口创建子任务
6. WHEN 子任务创建成功时 THEN THE Task_Detail_Dialog SHALL 刷新子任务列表并显示成功提示
7. WHEN subTodoList 为空时 THEN THE Task_Detail_Dialog SHALL 显示 "暂无子任务" 提示

**TODO**: 需要确认子任务的完整数据结构，当前接口文档标注为 "待定"
**TODO**: 需要确认子任务创建时是否需要传递父任务 ID（如 parentId 字段）

### 需求 8: 操作日志展示

**用户故事:** 作为用户，我想要查看任务的操作历史，以便了解任务的变更记录和协作情况。

#### 验收标准

1. WHEN 弹窗显示操作日志时 THEN THE Task_Detail_Dialog SHALL 显示 activityLogList 数组中的所有日志记录
2. WHEN 显示单条日志时 THEN THE Task_Detail_Dialog SHALL 显示操作类型（action）、描述（desc）、操作人（operator）和操作时间（time）
3. WHEN 日志列表过长时 THEN THE Task_Detail_Dialog SHALL 提供滚动功能或分页加载
4. WHEN activityLogList 为空时 THEN THE Task_Detail_Dialog SHALL 显示 "暂无操作记录" 提示
5. THE Task_Detail_Dialog SHALL 按时间倒序显示日志（最新的在最上方）

**TODO**: 需要确认操作日志的完整数据结构，当前接口文档标注为 "待定"
**TODO**: 需要确认 action 字段的取值范围和显示文案映射（如：create-创建，update-更新，delete-删除等）

### 需求 9: 标记重要功能

**用户故事:** 作为用户，我想要标记或取消标记任务为重要，以便突出显示关键任务。

#### 验收标准

1. WHEN 用户点击标记重要按钮时 THEN THE Task_Detail_Dialog SHALL 调用 `/api/todo/update` 接口，将 isTop 字段更新为 1
2. WHEN 用户点击取消重要按钮时 THEN THE Task_Detail_Dialog SHALL 调用 `/api/todo/update` 接口，将 isTop 字段更新为 0
3. WHEN 标记操作成功时 THEN THE Task_Detail_Dialog SHALL 更新按钮状态并显示成功提示
4. WHEN 标记操作失败时 THEN THE Task_Detail_Dialog SHALL 显示错误提示信息
5. THE Task_Detail_Dialog SHALL 根据当前 isTop 值显示不同的按钮文案和图标

### 需求 10: 标记完成功能

**用户故事:** 作为用户，我想要标记任务为已完成，以便更新任务状态。

#### 验收标准

1. WHEN 用户点击标记完成按钮时 THEN THE Task_Detail_Dialog SHALL 调用 `/api/todo/update` 接口，将 status 字段更新为 1
2. WHEN 标记完成成功时 THEN THE Task_Detail_Dialog SHALL 更新任务状态显示并显示成功提示
3. WHEN 标记完成失败时 THEN THE Task_Detail_Dialog SHALL 显示错误提示信息
4. WHEN 任务已完成（status 为 1）时 THEN THE Task_Detail_Dialog SHALL 禁用或隐藏标记完成按钮
5. WHEN 任务标记完成时 THEN THE Task_Detail_Dialog SHALL 自动记录完成时间（finishTime 字段）

**TODO**: 需要确认标记完成时是否需要同时更新 progress 字段为 100

### 需求 11: 编辑任务功能

**用户故事:** 作为用户，我想要编辑任务信息，以便修正错误或更新任务内容。

#### 验收标准

1. WHEN 用户点击编辑按钮时 THEN THE Task_Detail_Dialog SHALL 进入编辑模式或打开编辑表单
2. WHEN 在编辑模式下 THEN THE Task_Detail_Dialog SHALL 允许用户修改任务标题（title）、描述（content）、执行人、截止时间、优先级等字段
3. WHEN 用户提交编辑时 THEN THE Task_Detail_Dialog SHALL 调用 `/api/todo/update` 接口保存修改
4. WHEN 编辑保存成功时 THEN THE Task_Detail_Dialog SHALL 刷新任务详情并显示成功提示
5. WHEN 编辑保存失败时 THEN THE Task_Detail_Dialog SHALL 显示错误提示信息
6. WHEN 用户取消编辑时 THEN THE Task_Detail_Dialog SHALL 恢复到查看模式并放弃所有未保存的修改

**设计决策**: 编辑模式将在当前弹窗内切换实现，使用 `isEditing` 状态控制查看/编辑模式的切换，提供更流畅的用户体验

### 需求 12: 删除任务功能

**用户故事:** 作为用户，我想要删除不需要的任务，以便保持任务列表的整洁。

#### 验收标准

1. WHEN 用户点击删除按钮时 THEN THE Task_Detail_Dialog SHALL 显示确认对话框
2. WHEN 用户确认删除时 THEN THE Task_Detail_Dialog SHALL 调用删除接口（接口地址待确认）
3. WHEN 删除成功时 THEN THE Task_Detail_Dialog SHALL 关闭弹窗、刷新任务列表并显示成功提示
4. WHEN 删除失败时 THEN THE Task_Detail_Dialog SHALL 显示错误提示信息
5. WHEN 用户取消删除时 THEN THE Task_Detail_Dialog SHALL 关闭确认对话框并保持弹窗打开

**TODO**: 需要确认删除任务的接口地址和请求参数（当前接口文档中未定义删除接口）

### 需求 13: 响应式布局

**用户故事:** 作为用户，我想要在不同设备上都能正常使用任务详情弹窗，以便在移动端和桌面端都有良好的体验。

#### 验收标准

1. WHEN 在桌面端显示时 THEN THE Task_Detail_Dialog SHALL 使用合适的宽度（如 800px）并居中显示
2. WHEN 在移动端显示时 THEN THE Task_Detail_Dialog SHALL 适配屏幕宽度并调整布局
3. WHEN 屏幕尺寸变化时 THEN THE Task_Detail_Dialog SHALL 自动调整布局和元素大小
4. THE Task_Detail_Dialog SHALL 确保所有交互元素在触摸屏上易于点击

### 需求 14: 数据加载状态

**用户故事:** 作为用户，我想要在数据加载时看到加载提示，以便了解系统正在处理我的请求。

#### 验收标准

1. WHEN 弹窗打开并加载数据时 THEN THE Task_Detail_Dialog SHALL 显示加载动画或骨架屏
2. WHEN 数据加载完成时 THEN THE Task_Detail_Dialog SHALL 隐藏加载状态并显示内容
3. WHEN 执行操作（如标记完成、编辑）时 THEN THE Task_Detail_Dialog SHALL 显示操作进行中的状态
4. WHEN 操作完成时 THEN THE Task_Detail_Dialog SHALL 恢复正常状态

## 数据字段映射

### 任务详情接口 (`/api/todo/detail`) 响应字段

| 字段名 | 类型 | 说明 | 使用位置 | 状态 |
|--------|------|------|----------|------|
| id | string | 任务ID | 所有操作的标识 | ✅ 已定义 |
| umId | string | 创建人UMID | 基本信息-创建人 | ✅ 已定义 |
| name | string | 创建人姓名 | 基本信息-创建人 | ✅ 已定义 |
| title | string | 任务标题 | 主题显示 | ✅ 已定义 |
| content | string | 任务描述（富文本） | 任务描述模块 | ✅ 已定义 |
| status | integer | 任务状态（0-待处理，1-已完成，2-进行中，3-已逾期） | 基本信息-状态 | ✅ 已定义 |
| progress | integer | 进度百分比（0-100） | 进展模块-进度条 | ✅ 已定义 |
| priority | long | 优先级 | 基本信息-优先级 | ⚠️ 取值范围待确认 |
| isTop | integer | 是否重要（0-否，1-是） | 标记重要功能 | ✅ 已定义 |
| deadLine | string | 截止时间 | 基本信息-截止时间 | ✅ 已定义 |
| startTime | string | 开始时间 | 可选显示 | ✅ 已定义 |
| finishTime | string | 完成时间 | 可选显示 | ✅ 已定义 |
| remindOption | integer | 提醒选项 | 暂不使用 | ✅ 已定义 |
| remindTime | string | 提醒时间 | 暂不使用 | ✅ 已定义 |
| source | integer | 来源 | 基本信息-来源 | ⚠️ 取值范围待确认 |
| sourceId | string | 来源ID | 暂不使用 | ✅ 已定义 |
| attachmentList | array | 附件列表 | 附件模块 | ✅ 已定义 |
| attachmentList[].fileName | string | 文件名 | 附件显示 | ✅ 已定义 |
| attachmentList[].filePath | string | 文件路径 | 附件下载/预览 | ✅ 已定义 |
| attachmentList[].fileSize | long | 文件大小（字节） | 附件显示 | ✅ 已定义 |
| attachmentList[].fileType | string | 文件类型 | 附件图标 | ✅ 已定义 |
| attachmentList[].storageType | string | 存储类型 | 暂不使用 | ✅ 已定义 |
| todoUsers | array | 执行人列表 | 基本信息-执行人 | ✅ 已定义 |
| todoUsers[].umId | string | 执行人UMID | 执行人显示 | ✅ 已定义 |
| todoUsers[].name | string | 执行人姓名 | 执行人显示 | ✅ 已定义 |
| todoUsers[].status | integer | 执行人状态 | 执行人状态显示 | ✅ 已定义 |
| subTodoList | array | 子任务列表 | 子任务模块 | ⚠️ 结构待定 |
| subTodoList[].id | string | 子任务ID | 子任务操作 | ⚠️ 结构待定 |
| subTodoList[].content | string | 子任务内容 | 子任务显示 | ⚠️ 结构待定 |
| subTodoList[].isFinished | boolean | 是否完成 | 子任务状态 | ⚠️ 结构待定 |
| activityLogList | array | 操作日志列表 | 操作日志模块 | ⚠️ 结构待定 |
| activityLogList[].id | string | 日志ID | 日志标识 | ⚠️ 结构待定 |
| activityLogList[].action | string | 操作类型 | 日志显示 | ⚠️ 结构待定 |
| activityLogList[].desc | string | 操作描述 | 日志显示 | ⚠️ 结构待定 |
| activityLogList[].operator | string | 操作人 | 日志显示 | ⚠️ 结构待定 |
| activityLogList[].time | string | 操作时间 | 日志显示 | ⚠️ 结构待定 |

### 缺失字段汇总

以下字段在当前接口文档中缺失或未明确定义，需要后端补充：

1. **进展说明字段** (需求 6)
   - 建议字段名：`progressNote` 或 `progressHistory`
   - 类型：string 或 array
   - 说明：用于存储用户提交的进展说明

2. **删除接口** (需求 12)
   - 接口地址：待定（建议：`/api/todo/delete`）
   - 请求参数：`{ id: string }`
   - 说明：用于删除任务

3. **子任务父任务关联字段** (需求 7)
   - 建议字段名：`parentId`
   - 类型：string
   - 说明：创建子任务时需要关联父任务ID

4. **优先级枚举值** (需求 3)
   - 需要明确 priority 字段的取值范围和对应文案
   - 建议：1-低，2-中，3-高

5. **来源枚举值** (需求 3)
   - 需要明确 source 字段的取值范围和对应文案
   - 已知：8/9/10 为 i平安，需要完整映射表

6. **操作类型枚举值** (需求 8)
   - 需要明确 activityLogList[].action 字段的取值范围和对应文案
   - 建议：create-创建，update-更新，delete-删除，complete-完成等

## 技术约束

1. **前端框架**: Vue 3 (Composition API)
2. **UI 框架**: Element Plus
3. **状态管理**: Pinia
4. **HTTP 客户端**: Axios
5. **日期处理**: Day.js
6. **组件位置**: `src/components/business/TaskDetailDialog.vue`
7. **接口封装**: 使用 `src/api/index.js` 中的统一请求方法
8. **国际化**: 支持中英文切换（使用 vue-i18n）
9. **响应式设计**: 支持桌面端和移动端
10. **浏览器兼容性**: 支持现代浏览器（Chrome、Firefox、Safari、Edge 最新版本）

## 非功能性需求

1. **性能**: 弹窗打开时间应在 500ms 内完成数据加载和渲染
2. **可用性**: 所有交互元素应提供清晰的视觉反馈
3. **可访问性**: 支持键盘导航（Tab、Enter、Esc 键）
4. **错误处理**: 所有接口调用失败时应显示友好的错误提示
5. **数据一致性**: 操作成功后应及时刷新相关数据，确保显示最新状态
