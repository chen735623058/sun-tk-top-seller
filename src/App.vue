<template>
  <div class="container">
    <div class="header">
      <h1>🐾 TikTok Shop Pet Title Optimizer</h1>
      <p>TK美区宠物用品标题智能优化工具 - 2026最新热门关键词</p>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs">
        <router-link
          to="/"
          class="nav-tab"
          :class="{ active: $route.name === 'home' }"
        >
          🏠 标题生成
        </router-link>
        <router-link
          to="/keywords"
          class="nav-tab"
          :class="{ active: $route.name === 'keywords' }"
        >
          📚 关键词管理
        </router-link>
      </nav>
    </div>

    <div class="content">
      <router-view />
    </div>
  </div>

  <div class="toast" :class="{ show: store.toast.show }">{{ store.toast.message }}</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTitleGeneratorStore } from './stores/titleGenerator'

const store = useTitleGeneratorStore()

// Load saved keywords on mount
onMounted(() => {
  store.loadSavedKeywords()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.header h1 {
  font-size: 2em;
  margin-bottom: 10px;
}

.header p {
  opacity: 0.9;
  font-size: 1.05em;
  margin-bottom: 20px;
}

.nav-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.nav-tab {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 500;
}

.nav-tab:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.nav-tab.active {
  background: white;
  color: #4facfe;
}

.content {
  padding: 30px;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #333;
  color: white;
  padding: 15px 25px;
  border-radius: 8px;
  display: none;
  animation: slideIn 0.3s;
  z-index: 1000;
}

.toast.show {
  display: block;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .content {
    padding: 15px;
  }
  .header h1 {
    font-size: 1.5em;
  }
  .nav-tabs {
    flex-direction: column;
    align-items: center;
  }
  .nav-tab {
    width: 200px;
  }
}
</style>
