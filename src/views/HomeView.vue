<template>
  <div class="home-view">
    <div class="home-layout">
      <!-- 左侧输入区域 -->
      <div class="left-panel">
        <div class="section">
          <h2>✨ 生成优化标题</h2>
          <TitleForm @generate="handleGenerate" @clear="handleClear" />
        </div>

        <div class="section keywords-section" v-if="matchedKeywords.length > 0">
          <h2>🎯 匹配到的关键词</h2>
          <div class="keywords-stats">
            <span
              v-for="kw in matchedKeywords"
              :key="kw"
              class="keyword-tag"
            >{{ kw }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧结果区域 -->
      <div class="right-panel">
        <div class="section result-section" v-if="matchedKeywords.length > 0 || streaming || generatedTitles.length > 0">
          <TitleResult
            :titles="generatedTitles"
            :streaming="streaming"
            :stream-progress="streamProgress"
            @copy="handleCopy"
          />
        </div>

        <!-- 空状态 -->
        <div class="section empty-state" v-else>
          <div class="empty-content">
            <div class="empty-icon">📝</div>
            <h3>请输入商品信息</h3>
            <p>输入商品名称和描述，点击生成按钮即可获得优化后的标题</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTitleGeneratorStore } from '../stores/titleGenerator'
import { useTitleGenerator } from '../composables/useTitleGenerator'
import TitleForm from '../components/TitleForm.vue'
import TitleResult from '../components/TitleResult.vue'

const store = useTitleGeneratorStore()
const {
  loading,
  streaming,
  streamProgress,
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
  height: 100%;
}

.home-layout {
  display: flex;
  gap: 20px;
  height: 100%;
}

.left-panel {
  flex: 0 0 450px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.section {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.section h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.3em;
  border-bottom: 2px solid #4facfe;
  padding-bottom: 10px;
}

.keywords-section {
  flex: 0 0 auto;
}

.result-section {
  flex: 1;
  overflow-y: auto;
  min-height: 400px;
}

.keywords-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.keyword-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.85em;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2px dashed #e1e5e9;
}

.empty-content {
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-content h3 {
  font-size: 1.3em;
  margin-bottom: 10px;
  color: #444;
}

.empty-content p {
  font-size: 0.95em;
  color: #666;
}

@media (max-width: 1024px) {
  .home-layout {
    flex-direction: column;
  }

  .left-panel {
    flex: none;
    width: 100%;
  }

  .right-panel {
    min-height: 400px;
  }
}
</style>
