# TaskList 组件重构指南

## 需求总结

### 1. 看板视图优化
- 显示：任务标题、执行人、任务状态、截止时间（三行布局）
- 任务状态和截止时间显示在第三行
- 添加"已取消"状态列（共5列）
- 独立的分页加载逻辑，滚动加载更多
- 默认显示已完成任务
- 拖拽优化：拖过去就停留，不回弹

### 2. 列表视图优化
- 在"负责人"和"状态"列添加filter按钮
- 点击filter弹出多选框
- 支持多选执行人和状态
- 筛选后重新请求API，不使用前端过滤
- 移除顶部的筛选框和"显示已完成"按钮

## 实现方案

### 已创建的Hooks

1. **useKanban.js** - 看板数据管理
   - 管理5个状态列的数据
   - 分页加载逻辑
   - 滚动加载更多
   - 拖拽状态更新

2. **useListFilter.js** - 列表筛选管理
   - 执行人多选筛选
   - 状态多选筛选
   - API请求筛选

### 修改步骤

#### 步骤1：更新imports
```javascript
import { Filter, Loading } from '@element-plus/icons-vue'
import { useKanban } from '@/hooks/useKanban'
import { useListFilter } from '@/hooks/useListFilter'
```

#### 步骤2：在script setup中使用hooks
```javascript
// 列表模式
const {
  listTasks,
  selectedAssignees,
  selectedStatuses,
  assigneeList,
  fetchListTasks,
  fetchAssigneeList,
  handleAssigneeFilterChange,
  handleStatusFilterChange
} = useListFilter(props)

// 看板模式
const {
  kanbanStatusList,
  kanbanColumns,
  initKanbanData,
  handleKanbanScroll,
  handleDragChange
} = useKanban(props)
```

#### 步骤3：更新template - 移除顶部筛选
删除header中的el-select筛选框，只保留视图切换按钮

#### 步骤4：更新template - 列表视图添加filter
在"负责人"和"状态"列标题添加filter按钮和popover

#### 步骤5：更新template - 看板视图
- 使用kanbanStatusList（5个状态）
- 添加滚动容器和@scroll事件
- 优化卡片布局（三行）
- 添加loading状态

#### 步骤6：更新onMounted
```javascript
onMounted(() => {
  if (viewMode.value === 'list') {
    fetchListTasks()
    fetchAssigneeList()
  } else if (viewMode.value === 'kanban') {
    initKanbanData()
  } else if (viewMode.value === 'gantt') {
    setTimeout(() => initGanttChart(), 100)
  }
})
```

#### 步骤7：更新switchView方法
```javascript
function switchView(mode) {
  viewMode.value = mode
  emit('view-mode-changed', mode)
  if (mode === 'list') {
    fetchListTasks()
    fetchAssigneeList()
  } else if (mode === 'kanban') {
    initKanbanData()
  } else if (mode === 'gantt') {
    nextTick(() => initGanttChart())
  }
}
```

### 样式更新

#### 看板卡片样式
```scss
.task-card {
  .task-title {
    // 第一行：标题
  }
  
  .task-users {
    // 第二行：执行人头像
  }
  
  .task-footer {
    // 第三行：状态标签 + 截止时间
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.kanban-tasks-wrapper {
  height: calc(100vh - 300px);
  overflow-y: auto;
}
```

#### 列表filter样式
```scss
.filter-col {
  display: flex;
  align-items: center;
  gap: 4px;
  
  .filter-btn {
    padding: 0;
    min-width: auto;
  }
}

.filter-content {
  max-height: 300px;
  overflow-y: auto;
  
  .el-checkbox {
    display: block;
    margin: 8px 0;
  }
}
```

## 测试要点

### 看板视图
1. 5个状态列都能正常显示
2. 滚动到底部自动加载更多
3. 拖拽卡片到新列，卡片立即停留不回弹
4. 拖拽后状态正确更新
5. 卡片显示：标题、执行人、状态、截止时间

### 列表视图
1. filter按钮点击弹出选择框
2. 多选执行人后列表正确筛选
3. 多选状态后列表正确筛选
4. 筛选条件组合正确
5. 顶部筛选框已移除

## API参数说明

### /api/todo/list
```javascript
{
  page: 1,
  pageSize: 20,
  status: 1,  // 单个状态值
  statuses: [1, 2, 3],  // 多个状态值（如果API支持）
  assigneeIds: ['UM123', 'UM456'],  // 多个执行人ID
  queryType: 0,  // 0-所有 1-我分配的 2-我执行的
  projectId: '123'
}
```

注意：如果API不支持statuses数组，需要修改为多次请求或后端支持。
