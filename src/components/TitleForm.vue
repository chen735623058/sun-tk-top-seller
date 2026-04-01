<template>
  <div class="title-form">
    <div class="form-group">
      <label for="product">商品名称 (Product Name)</label>
      <input
        v-model="form.product"
        type="text"
        id="product"
        placeholder="e.g. Automatic Cat Litter Box"
      >
    </div>
    <div class="form-group">
      <label for="description">商品描述 (Description - Optional)</label>
      <textarea
        v-model="form.description"
        id="description"
        placeholder="Add more details about your product, like features, size, material..."
      ></textarea>
    </div>
    <div class="form-group">
      <label for="aiProvider">AI 模型提供商</label>
      <select v-model="form.aiProvider" id="aiProvider">
        <option value="openai">OpenAI GPT</option>
        <option value="doubao">火山引擎豆包</option>
      </select>
    </div>
    <div class="form-group" v-if="form.aiProvider === 'openai'">
      <label for="apiKey">OpenAI API Key (Optional, leave empty to use local matching)</label>
      <input
        v-model="form.apiKey"
        type="password"
        id="apiKey"
        placeholder="sk-..."
      >
      <small style="color: #666;">API Key 保存在你的浏览器本地，不会上传到服务器</small>
    </div>
    <div class="form-group" v-if="form.aiProvider === 'doubao'">
      <label for="doubaoApiKey">火山引擎 API Key (Optional, leave empty to use local matching)</label>
      <input
        v-model="form.doubaoApiKey"
        type="password"
        id="doubaoApiKey"
        placeholder="your-volcengine-api-key..."
      >
      <small style="color: #666;">API Key 保存在你的浏览器本地，不会上传到服务器</small>
    </div>
    <button @click="handleGenerate" :disabled="loading" class="generate-btn">
      <span v-if="loading" class="loading-spinner"></span>
      {{ loading ? 'AI 正在生成中...' : '生成优化标题 Generate Titles' }}
    </button>
    <button class="btn-secondary" @click="handleClear">清空 Clear</button>
  </div>
</template>

<script setup>
import { useTitleGeneratorStore } from '../stores/titleGenerator'
import { useTitleGenerator } from '../composables/useTitleGenerator'

const emit = defineEmits(['generate', 'clear'])

const store = useTitleGeneratorStore()
const { loading } = useTitleGenerator()

// Use form from store
const form = store.form

const handleGenerate = () => {
  emit('generate', {
    product: form.product,
    description: form.description,
    aiProvider: form.aiProvider,
    openaiApiKey: form.apiKey,
    doubaoApiKey: form.doubaoApiKey
  })
}

const handleClear = () => {
  emit('clear')
}
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

input, textarea, select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #4facfe;
}

textarea {
  min-height: 80px;
  resize: vertical;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 30px;
  font-size: 1.1em;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

button:active {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  margin-left: 10px;
}

@media (max-width: 768px) {
  button {
    width: 100%;
    margin: 5px 0;
  }
  .btn-secondary {
    margin-left: 0;
  }
}
</style>
