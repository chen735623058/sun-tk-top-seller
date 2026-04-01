<template>
  <div class="title-result">
    <h2 style="margin-top: 20px;">📝 优化后的标题</h2>

    <!-- 流式生成进度条 -->
    <div v-if="streaming" class="stream-progress-container">
      <div class="stream-progress-bar" :style="{ width: `${streamProgress * 100}%` }"></div>
      <span class="stream-progress-text">AI 正在思考并生成标题... {{ Math.round(streamProgress * 100) }}%</span>
    </div>

    <div class="result-box">
      <div
        v-for="(item, index) in titles"
        :key="index"
        class="title-item"
        :class="{ 'streaming-item': streaming && index === titles.length - 1 }"
      >
        <div class="title-type">{{ item.type }} {{ item.length ? `(${item.length} chars)` : '' }}</div>
        <div class="title-text">
          {{ item.title }}
          <span v-if="streaming && index === titles.length - 1" class="typing-cursor"></span>
          <button v-if="!streaming || index < titles.length - 1" class="copy-btn" @click="handleCopy(item.title)">Copy</button>
        </div>
        <div class="title-translation" v-if="item.translation">
          🇨🇳 {{ item.translation }}
        </div>
      </div>

      <!-- 流式生成中的占位符 -->
      <div v-if="streaming && titles.length === 0" class="title-item streaming-placeholder">
        <div class="title-type">正在生成标题...</div>
        <div class="title-text shimmer"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  titles: {
    type: Array,
    required: true
  },
  streaming: {
    type: Boolean,
    default: false
  },
  streamProgress: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['copy'])

const handleCopy = (title) => {
  emit('copy', title)
}
</script>

<style scoped>
.result-box {
  margin-top: 20px;
}

.title-item {
  background: white;
  padding: 15px;
  margin-bottom: 12px;
  border-radius: 8px;
  border-left: 5px solid #4facfe;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.title-type {
  font-size: 0.85em;
  color: #667eea;
  font-weight: 700;
  margin-bottom: 5px;
}

.title-text {
  font-size: 1em;
  word-break: break-all;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  margin: 8px 0;
  position: relative;
}

.title-translation {
  font-size: 0.9em;
  color: #666;
  background: #f0f9ff;
  padding: 8px 10px;
  border-radius: 4px;
  margin-top: 8px;
  border-left: 3px solid #4facfe;
}

.copy-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #667eea;
  color: white;
  border: none;
  padding: 4px 10px;
  font-size: 0.8em;
  border-radius: 4px;
  cursor: pointer;
}

.copy-btn:hover {
  background: #5568d3;
}

/* 流式输出样式 */
.stream-progress-container {
  height: 8px;
  background: #e1e5e9;
  border-radius: 4px;
  margin: 10px 0 20px 0;
  overflow: hidden;
  position: relative;
}

.stream-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stream-progress-text {
  position: absolute;
  top: -25px;
  right: 0;
  font-size: 0.85em;
  color: #667eea;
  font-weight: 500;
}

.streaming-item .title-text {
  border-right: 3px solid transparent;
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #667eea;
  margin-left: 4px;
  animation: blink 1s infinite;
  vertical-align: middle;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.streaming-placeholder .shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  height: 20px;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
