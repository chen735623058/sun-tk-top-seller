<template>
  <div class="title-result">
    <h2 style="margin-top: 20px;">📝 优化后的标题</h2>
    <div class="result-box">
      <div
        v-for="(item, index) in titles"
        :key="index"
        class="title-item"
      >
        <div class="title-type">{{ item.type }} ({{ item.length }} chars)</div>
        <div class="title-text">
          {{ item.title }}
          <button class="copy-btn" @click="handleCopy(item.title)">Copy</button>
        </div>
        <div class="title-translation" v-if="item.translation">
          🇨🇳 {{ item.translation }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  titles: {
    type: Array,
    required: true
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
</style>
