<template>
  <div class="home-view">
    <div class="section">
      <h2>✨ 生成优化标题</h2>
      <TitleForm @generate="handleGenerate" @clear="handleClear" />
    </div>

    <div class="section" v-if="matchedKeywords.length > 0">
      <h2>🎯 匹配到的关键词</h2>
      <div class="keywords-stats">
        <span
          v-for="kw in matchedKeywords"
          :key="kw"
          class="keyword-tag"
        >{{ kw }}</span>
      </div>

      <TitleResult
        :titles="generatedTitles"
        @copy="handleCopy"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTitleGeneratorStore } from '../stores/titleGenerator'
import { useTitleGenerator } from '../composables/useTitleGenerator'
import TitleForm from '../components/TitleForm.vue'
import TitleResult from '../components/TitleResult.vue'

const store = useTitleGeneratorStore()
const {
  loading,
  matchedKeywords,
  generatedTitles,
  generateTitles,
  copyTitle
} = useTitleGenerator()

const handleGenerate = async (formData) => {
  try {
    await generateTitles(formData)
    store.showToast('标题生成完成！')
  } catch (error) {
    store.showToast(error.message)
  }
}

const handleClear = () => {
  store.clearForm()
  matchedKeywords.value = []
  generatedTitles.value = []
}

const handleCopy = async (title) => {
  const success = await copyTitle(title)
  if (success) {
    store.showToast('Title copied to clipboard!')
  } else {
    store.showToast('Copy failed')
  }
}
</script>

<style scoped>
.home-view {
  max-width: 800px;
  margin: 0 auto;
}

.keywords-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.keyword-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9em;
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
