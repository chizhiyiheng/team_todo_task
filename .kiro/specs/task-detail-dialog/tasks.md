# 任务列表：任务详情弹窗

## 1. 基础设施

- [x] 创建组件目录和基础文件
  - 创建 TaskDetailDialog.vue 主组件
  - 创建 hooks 和 components 子目录

- [x] 扩展 API 接口
  - 在 src/api/index.js 添加 getTodoDetail、updateTodo、deleteTodo 方法
  - 参考：docs/接口名：待办详情.md、docs/接口名：修改待办.md

- [x] 添加国际化资源
  - 在 src/locales/zh.js 和 en.js 添加任务详情相关翻译

## 2. 核心组件开发

- [x] 实现 TaskDetailDialog 主组件
  - 实现弹窗基础结构（el-dialog）
  - 实现数据加载逻辑（loadTaskDetail）
  - 实现弹窗头部（标题编辑、重要标记、关闭按钮）
  - 添加 loading 状态显示

- [x] 实现基本信息模块
  - 执行人选择（el-select 多选，立即保存）
  - 创建人展示（只读）
  - 截止时间选择（el-date-picker，立即保存）
  - 状态选择（el-select + el-tag，立即保存）
  - 优先级选择（el-select，立即保存）
  - 来源展示（只读）

- [x] 实现任务描述模块
  - 描述内联编辑（点击切换 textarea）
  - 空值提示
  - 保存后调用 updateTodo 接口

- [x] 实现附件列表模块
  - 附件列表展示（文件名、大小、类型图标）
  - 文件大小格式化（formatFileSize）
  - 附件下载功能
  - 空状态显示

## 3. 高级功能

- [x] 实现进展管理模块
  - 进度条展示（el-progress）
  - 进展说明输入和提交（submitProgress）
  - 进展历史展示
  - 空状态处理

- [x] 实现子任务模块
  - 子任务列表展示（复选框 + 内容）
  - 新增子任务功能（addSubTask）
  - 点击子任务打开详情（递归）
  - 空状态显示

- [x] 实现操作日志模块
  - 操作日志列表展示（时间、操作人、描述）
  - 空状态显示

## 4. 操作功能

- [x] 实现底部操作按钮
  - 标记重要按钮（toggleImportant）
  - 标记完成按钮（markAsComplete）
  - 删除按钮（deleteTask + 确认对话框）

## 5. 样式和优化

- [ ] 实现响应式布局和样式
  - 桌面端布局（800px 宽度，双列布局）
  - 移动端布局（全屏，单列布局）
  - 状态和优先级颜色映射
  - 交互样式（hover、过渡动画）

- [ ] 实现错误处理和性能优化
  - 统一错误处理和提示
  - 防抖处理
  - 避免重复请求
  - 加载状态提示

## 6. 集成和测试

- [x] 集成到任务列表
  - 在 TaskList.vue 引入 TaskDetailDialog
  - 实现点击任务打开弹窗
  - 处理弹窗关闭后的列表刷新

- [ ] 功能测试和代码优化
  - 测试所有功能（编辑、标记、删除等）
  - 测试响应式布局
  - 测试边界情况（空数据、接口失败）
  - 添加代码注释
  - 代码审查和优化
