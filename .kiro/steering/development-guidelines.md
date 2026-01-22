---
inclusion: always
---

# 项目开发规范

## 样式规范

### 颜色和间距
**严禁硬编码颜色值**，必须使用 SCSS 变量或 CSS 变量以支持主题切换。

```scss
// ❌ 错误
.button {
  color: #409eff;
  padding: 12px;
}

// ✅ 正确（SCSS 变量已全局引入，无需 import）
.button {
  color: $primary-color;
  padding: $spacing-md;
}
```

**常用变量：**
- 颜色：`$primary-color`、`$text-primary`、`$text-regular`、`$border-light`
- 间距：`$spacing-xs(4px)`、`$spacing-sm(8px)`、`$spacing-md(12px)`、`$spacing-lg(16px)`、`$spacing-xl(20px)`、`$spacing-xxl(24px)`
- 字体：`$font-size-small(12px)`、`$font-size-base(14px)`、`$font-size-large(16px)`

## 组件规范

### 组件结构
- 使用 Composition API 和 `<script setup>` 语法
- 组件职责单一，功能清晰
- Props 和 Emits 必须明确定义类型

### 国际化
所有用户可见文本必须使用 i18n：
```javascript
const { t } = useI18n()
const title = t('task.title')
```

## 代码规范

### 命名规范
- 组件文件：PascalCase（如 `TaskList.vue`）
- 工具函数：camelCase（如 `formatDate`）
- 常量：UPPER_SNAKE_CASE（如 `TASK_STATUS`）
- CSS 类名：kebab-case（如 `.task-list`）

### 导入顺序
1. Vue 相关
2. 第三方库
3. 项目内部模块（@/ 开头）
4. 相对路径导入
5. 样式文件

## 性能优化

- 大组件使用动态导入：`const MyComponent = () => import('@/components/MyComponent.vue')`
- 合理使用 `computed` 缓存计算结果
- 避免在模板中使用复杂表达式

## 新增接口开发流程

新增接口需要修改 3 个文件（按顺序）：

1. **src/api/index.js** - 定义接口方法
```javascript
// 在对应的 API 对象中添加方法
markImportant(id) {
  return request.post(`/api/todo/markImportant/${id}`)
}
```

2. **src/mock/index.js** - 实现 Mock 逻辑
```javascript
// 在 mockApi 对象中添加方法
async markImportant(id) {
  await delay()
  // 实现 mock 逻辑
  return { code: '200', message: 'success', body: {...} }
}
```

3. **src/api/request.js** - 添加路由映射
```javascript
// 如果是路径参数，在 switch 前添加解析
const markImportantMatch = url.match(/^\/api\/todo\/markImportant\/(.+)$/)
if (markImportantMatch) {
  url = '/api/todo/markImportant'
  data = { id: markImportantMatch[1] }
}

// 在 switch 中添加 case
case '/api/todo/markImportant':
  result = await this.mockApi.markImportant(data?.id)
  break
```

## 提交前检查

- [ ] 无硬编码颜色、间距、字体大小
- [ ] 所有文本已国际化
- [ ] 组件支持响应式（PC/移动端）
- [ ] 代码通过 ESLint 检查
