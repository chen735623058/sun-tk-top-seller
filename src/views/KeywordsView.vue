<template>
  <div class="keywords-view">
    <div class="section">
      <h2>📚 关键词库管理</h2>
      <div class="count-info">Total keywords: {{ store.totalKeywords }}</div>

      <KeywordsManager
        :keywords-data="store.keywordsData"
        :category-names="store.categoryNames"
        @add-keyword="handleAddKeyword"
      />
    </div>
  </div>
</template>

<script setup>
import { useTitleGeneratorStore } from '../stores/titleGenerator'
import KeywordsManager from '../components/KeywordsManager.vue'

const store = useTitleGeneratorStore()

const handleAddKeyword = (category, keyword) => {
  store.addKeyword(category, keyword)
}
</script>

<style scoped>
.keywords-view {
  max-width: 1000px;
  margin: 0 auto;
}

.count-info {
  text-align: right;
  color: #666;
  font-size: 0.9em;
  margin-top: 10px;
}

.section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.section h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.4em;
  border-bottom: 2px solid #4facfe;
  padding-bottom: 10px;
}
</style>
