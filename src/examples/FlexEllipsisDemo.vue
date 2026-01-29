<template>
  <div class="demo-container">
    <h2>Flex 布局中 text-overflow: ellipsis 的问题演示</h2>
    
    <!-- 错误示例：在 flex 容器上设置 ellipsis -->
    <div class="example">
      <h3>❌ 错误做法：在 Flex 容器上设置 ellipsis</h3>
      <div class="flex-container-wrong">
        <span class="icon">⭐</span>
        这是一段很长很长很长很长很长很长很长很长的文本内容，应该显示省略号但是不会显示
      </div>
      <p class="note">结果：不会显示省略号，文本会溢出或换行</p>
    </div>

    <!-- 正确示例1：将文本包装在单独元素中 -->
    <div class="example">
      <h3>✅ 正确做法1：文本包装在单独元素中</h3>
      <div class="flex-container-right1">
        <span class="icon">⭐</span>
        <span class="text-content">这是一段很长很长很长很长很长很长很长很长的文本内容，现在会正确显示省略号</span>
      </div>
      <p class="note">结果：正确显示省略号</p>
    </div>

    <!-- 正确示例2：使用 min-width: 0 -->
    <div class="example">
      <h3>✅ 正确做法2：使用 min-width: 0</h3>
      <div class="flex-container-right2">
        <span class="icon">⭐</span>
        <span class="text-content">这是一段很长很长很长很长很长很长很长很长的文本内容，使用 min-width: 0 解决</span>
      </div>
      <p class="note">结果：正确显示省略号，并且响应式更好</p>
    </div>

    <!-- 对比：普通块级元素 -->
    <div class="example">
      <h3>📝 对比：普通块级元素</h3>
      <div class="block-element">
        这是一段很长很长很长很长很长很长很长很长的文本内容，在普通块级元素中可以正常显示省略号
      </div>
      <p class="note">结果：普通块级元素可以直接使用 ellipsis</p>
    </div>

    <!-- 技术解释 -->
    <div class="explanation">
      <h3>🔍 技术原理解释</h3>
      <div class="principle">
        <h4>1. text-overflow 的工作机制</h4>
        <ul>
          <li><code>text-overflow</code> 只对文本节点生效</li>
          <li>需要在直接包含文本的元素上设置</li>
          <li>必须配合 <code>overflow: hidden</code> 和 <code>white-space: nowrap</code></li>
        </ul>

        <h4>2. Flex 布局的特殊性</h4>
        <ul>
          <li>Flex 容器管理子元素的布局，不直接处理文本</li>
          <li>子元素默认不会收缩到内容宽度以下</li>
          <li>需要 <code>min-width: 0</code> 允许子元素收缩</li>
        </ul>

        <h4>3. 解决方案的核心</h4>
        <ul>
          <li>将文本包装在独立的元素中</li>
          <li>在文本元素上设置省略号样式</li>
          <li>使用 <code>flex: 1</code> 和 <code>min-width: 0</code> 控制空间分配</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这个组件纯粹用于演示，不需要逻辑
</script>

<style scoped lang="scss">
.demo-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.example {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;

  h3 {
    margin-top: 0;
    color: #333;
  }

  .note {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
    font-style: italic;
  }
}

/* ❌ 错误做法：在 flex 容器上设置 ellipsis */
.flex-container-wrong {
  display: flex;
  align-items: center;
  width: 300px;
  padding: 10px;
  border: 2px solid #ff4757;
  background: #fff;
  
  /* 这些设置不会生效！ */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  .icon {
    margin-right: 8px;
    flex-shrink: 0;
  }
}

/* ✅ 正确做法1：文本包装在单独元素中 */
.flex-container-right1 {
  display: flex;
  align-items: center;
  width: 300px;
  padding: 10px;
  border: 2px solid #2ed573;
  background: #fff;

  .icon {
    margin-right: 8px;
    flex-shrink: 0;
  }

  .text-content {
    /* 在文本元素上设置省略号 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
}

/* ✅ 正确做法2：使用 min-width: 0 */
.flex-container-right2 {
  display: flex;
  align-items: center;
  width: 300px;
  padding: 10px;
  border: 2px solid #3742fa;
  background: #fff;
  min-width: 0; /* 关键属性 */

  .icon {
    margin-right: 8px;
    flex-shrink: 0;
  }

  .text-content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0; /* 允许收缩 */
    flex: 1;
  }
}

/* 📝 对比：普通块级元素 */
.block-element {
  width: 300px;
  padding: 10px;
  border: 2px solid #ffa502;
  background: #fff;
  
  /* 在普通块级元素中可以直接使用 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.explanation {
  margin-top: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;

  h3 {
    color: #2c3e50;
    margin-top: 0;
  }

  h4 {
    color: #34495e;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  ul {
    margin: 10px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 5px;
    line-height: 1.5;
  }

  code {
    background: #e9ecef;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.9em;
  }
}

.principle {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}
</style>