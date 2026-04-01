# Vue Project Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing single-file Vue application into a well-structured Vue 3 project with proper directory organization, routing, API layer, and state management for future scalability.

**Architecture:** Follow Vue 3 best practices with feature-based directory structure, separate API layer for service calls, Pinia for state management, and Vue Router for navigation. Maintain all existing functionality while improving code organization and maintainability.

**Tech Stack:** Vue 3 (Composition API), Vite, Vue Router, Pinia, Axios (optional)

---

## File Structure Mapping

### New Directory Structure:
```
src/
├── api/                    # API service layer
│   └── ai.js               # AI service calls (OpenAI, Doubao)
├── router/                 # Vue Router configuration
│   └── index.js            # Route definitions
├── stores/                 # Pinia state management
│   └── titleGenerator.js   # Title generation state
├── views/                  # Page components
│   ├── HomeView.vue        # Main title generation page
│   └── KeywordsView.vue    # Keywords management page
├── components/             # Reusable components
│   ├── TitleForm.vue       # Title generation form
│   ├── TitleResult.vue     # Generated titles display
│   └── KeywordsManager.vue # Keywords management component
├── composables/            # Vue composables
│   └── useTitleGenerator.js # Title generation logic
├── utils/                  # Utility functions
│   └── titleParser.js      # Title parsing utilities
├── data/                   # Static data
│   └── keywords.js         # Keywords library (existing)
├── App.vue                 # Root component (updated)
├── main.js                 # Application entry (updated)
└── style.css               # Global styles
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install required dependencies**
```bash
npm install vue-router@4 pinia
```

- [ ] **Step 2: Verify installation**
Run: `npm list vue-router pinia`
Expected: Both packages are listed with version 4.x

- [ ] **Step 3: Commit**
```bash
git add package.json package-lock.json
git commit -m "feat: add vue-router and pinia dependencies"
```

---

## Task 2: Create API Layer

**Files:**
- Create: `src/api/ai.js`

- [ ] **Step 1: Create API service file**
```javascript
// AI API service layer
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Call Doubao AI to generate titles
 * @param {string} prompt - The prompt to send
 * @param {string} apiKey - API key for authentication
 * @returns {Promise<Object>} AI response
 */
export const generateWithDoubao = async (prompt, apiKey) => {
  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'doubao-seed-2.0-pro',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      stream: false
    })
  })

  if (!response.ok) {
    throw new Error('Doubao API request failed')
  }

  return await response.json()
}

/**
 * Call OpenAI to generate titles
 * @param {string} prompt - The prompt to send
 * @param {string} apiKey - API key for authentication
 * @returns {Promise<Object>} AI response
 */
export const generateWithOpenAI = async (prompt, apiKey) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error('OpenAI API request failed')
  }

  return await response.json()
}
```

- [ ] **Step 2: Commit**
```bash
git add src/api/ai.js
git commit -m "feat: create API layer for AI services"
```

---

## Task 3: Create Utility Functions

**Files:**
- Create: `src/utils/titleParser.js`

- [ ] **Step 1: Create title parsing utility**
```javascript
/**
 * Parse AI response into structured title objects
 * @param {string} content - Raw AI response content
 * @returns {Array<Object>} Array of title objects with type, title, translation, length
 */
export const parseTitlesFromAI = (content) => {
  const lines = content.split('\n').filter(line => line.trim())
  const titles = []
  const typeMap = {
    '基础': '基础标准款',
    '标准': '基础标准款',
    '长尾': '长尾精准款',
    '精准': '长尾精准款',
    '营销': '营销吸引款',
    '吸引': '营销吸引款',
    '点击': '营销吸引款'
  }

  lines.forEach(line => {
    let match = line.match(/\[(.*?)\]\s*(.*)/) || line.match(/-\s*\**(.*?):\**\s*(.*)/) || line.match(/-\s*(.*?)\s*-\s*(.*)/)
    if (match) {
      let type = match[1].trim()
      let content = match[2].trim()
      let title = content
      let translation = ''

      // 分离英文标题和中文翻译
      if (content.includes('|')) {
        const parts = content.split('|').map(part => part.trim())
        title = parts[0]
        translation = parts[1] || ''
      }

      // 匹配类型别名
      for (const key in typeMap) {
        if (type.toLowerCase().includes(key)) {
          type = typeMap[key]
          break
        }
      }
      titles.push({
        type: type,
        title: title,
        translation: translation,
        length: title.length
      })
    } else if (line.startsWith('- ')) {
      // 如果只是 - 开头，推测顺序
      const order = titles.length + 1
      let type = order === 1 ? '基础标准款' :
                 order <= 3 ? '长尾精准款' : '营销吸引款'
      let content = line.substring(2).trim()
      let title = content
      let translation = ''

      // 分离英文标题和中文翻译
      if (content.includes('|')) {
        const parts = content.split('|').map(part => part.trim())
        title = parts[0]
        translation = parts[1] || ''
      }

      titles.push({
        type: type,
        title: title,
        translation: translation,
        length: title.length
      })
    }
  })

  return titles.slice(0, 5)
}

/**
 * Build prompt for AI title generation
 * @param {string} product - Product name
 * @param {string} description - Product description
 * @param {Object} keywordsData - Keywords library
 * @returns {string} Complete prompt
 */
export const buildTitlePrompt = (product, description, keywordsData) => {
  // 整理关键词库文本
  let keywordsText = ''
  for (const category in keywordsData) {
    const words = keywordsData[category].join(', ')
    keywordsText += `${category.toUpperCase()}: ${words}\n`
  }

  return `你是一位 TikTok Shop 美区宠物品类的标题优化专家。
我会给你我的商品基础信息，请你结合 2026 年最新美区热门搜索关键词，帮我生成 5 个不同风格的商品标题。

### 规则：
1. 必须尽可能多的包含下面给出的美区热门搜索关键词，提高搜索曝光
2. 标题长度控制在 60-150 字符（符合TK搜索排名规则），核心关键词前置
3. 核心大词放前面，长尾词放后面，符合美区消费者搜索习惯
4. 可以加上热门属性词：like "durable", "easy clean", "non toxic", "premium" 这些转化好的词
5. 生成5个标题：1个基础标准款，2个长尾精准款，2个吸引点击款（带一点营销感）
6. **重要：每个英文标题后面必须跟中文翻译，用 | 分隔**
7. 输出格式：每个标题包含类型、英文标题和中文翻译，例如：
- [基础标准款] Premium Automatic Cat Litter Box | 高端智能自动猫砂盆

### 2026 美区宠物热门关键词库：
${keywordsText}

### 我的商品：
商品名称：${product}
${description ? `额外描述：${description}` : ''}

请直接输出5个标题，不要多余内容。`
}
```

- [ ] **Step 2: Commit**
```bash
git add src/utils/titleParser.js
git commit -m "feat: create title parsing utilities"
```

---

## Task 4: Create Composable for Title Generation Logic

**Files:**
- Create: `src/composables/useTitleGenerator.js`

- [ ] **Step 1: Create composable with title generation logic**
```javascript
import { ref } from 'vue'
import { generateWithDoubao, generateWithOpenAI } from '../api/ai'
import { buildTitlePrompt, parseTitlesFromAI } from '../utils/titleParser'
import { keywordsData } from '../data/keywords'

export const useTitleGenerator = () => {
  const loading = ref(false)
  const matchedKeywords = ref([])
  const generatedTitles = ref([])

  /**
   * Match keywords from product name and description
   * @param {string} product - Product name
   * @param {string} description - Product description
   * @returns {Array<string>} Matched keywords
   */
  const matchKeywords = (product, description) => {
    const productLower = product.toLowerCase()
    const descriptionLower = description.toLowerCase()
    const matched = []

    for (const category in keywordsData) {
      keywordsData[category].forEach(kw => {
        const kwLower = kw.toLowerCase()
        if (kwLower.includes(productLower) || productLower.includes(kwLower) ||
            (descriptionLower && kwLower.includes(descriptionLower)) ||
            (descriptionLower && descriptionLower.includes(kwLower)) ||
            productLower.split(' ').some(word => kwLower.includes(word))) {
          if (!matched.includes(kw)) {
            matched.push(kw)
          }
        }
      })
    }

    return matched
  }

  /**
   * Generate titles locally without AI
   * @param {string} product - Product name
   * @param {Array<string>} matchedKeywords - Matched keywords
   * @returns {Array<Object>} Generated titles
   */
  const generateLocalTitles = (product, matchedKeywords) => {
    const titles = []
    const marketing = keywordsData.marketing || []

    const productClean = product.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    // 随机采样函数
    const randomSample = (array, count) => {
      const shuffled = [...array].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    }

    // 1. 基础款
    let core = matchedKeywords.slice(0, 5).filter(
      kw => kw.toLowerCase() !== product.toLowerCase()
    )
    if (!core.some(kw => kw.toLowerCase() === product.toLowerCase())) {
      core.unshift(productClean)
    } else {
      core = [productClean, ...core]
    }
    const title1 = core.slice(0, 6).join(' - ')
    titles.push({
      type: "基础标准款",
      title: title1,
      translation: '',
      length: title1.length
    })

    // 2. 长尾精准款1
    if (matchedKeywords.length > 5) {
      let sample1 = randomSample(matchedKeywords, Math.min(8, matchedKeywords.length))
      if (!sample1.some(kw => kw.toLowerCase() === product.toLowerCase())) {
        sample1.unshift(productClean)
      } else {
        sample1 = [productClean, ...sample1.filter(
          kw => kw.toLowerCase() !== product.toLowerCase()
        )]
      }
      const title2 = sample1.slice(0, 7).join(', ')
      titles.push({
        type: "长尾精准款",
        title: title2,
        translation: '',
        length: title2.length
      })
    }

    // 3. 长尾精准款2
    if (matchedKeywords.length > 8) {
      let sample2 = randomSample(matchedKeywords, Math.min(10, matchedKeywords.length))
      if (!sample2.some(kw => kw.toLowerCase() === product.toLowerCase())) {
        sample2.unshift(productClean)
      } else {
        sample2 = [productClean, ...sample2.filter(
          kw => kw.toLowerCase() !== product.toLowerCase()
        )]
      }
      if (marketing.length > 0) {
        const mark = randomSample(marketing, 1)[0]
        sample2.push(mark)
      }
      const title3 = sample2.slice(0, 8).join(' | ')
      titles.push({
        type: "长尾精准款",
        title: title3,
        translation: '',
        length: title3.length
      })
    }

    // 4. 营销吸引款1
    if (marketing.length > 0) {
      const marketingSample = randomSample(marketing, Math.min(2, marketing.length))
      const marketingText = marketingSample.map(m =>
        m.charAt(0).toUpperCase() + m.slice(1)
      ).join(' ')
      let matchedMarketing = matchedKeywords.filter(
        kw => kw.toLowerCase() !== product.toLowerCase()
      ).slice(0, 5)
      const title4 = `${marketingText} ${productClean}${
        matchedMarketing.length > 0 ? ' - ' + matchedMarketing.join(' - ') : ''
      }`
      titles.push({
        type: "营销吸引款",
        title: title4,
        translation: '',
        length: title4.length
      })
    }

    // 5. 营销吸引款2
    if (matchedKeywords.length > 5) {
      let allWords = [productClean, ...matchedKeywords.slice(0, 6)]
      if (marketing.length > 0) {
        allWords.push(randomSample(marketing, 1)[0])
      }
      const title5 = allWords.join(' ')
      titles.push({
        type: "营销吸引款",
        title: title5,
        translation: '',
        length: title5.length
      })
    }

    return titles
  }

  /**
   * Generate titles using AI
   * @param {Object} options - Generation options
   * @param {string} options.product - Product name
   * @param {string} options.description - Product description
   * @param {string} options.aiProvider - AI provider (openai/doubao)
   * @param {string} options.openaiApiKey - OpenAI API key
   * @param {string} options.doubaoApiKey - Doubao API key
   * @returns {Promise<Array<Object>>} Generated titles
   */
  const generateTitles = async (options) => {
    const { product, description, aiProvider, openaiApiKey, doubaoApiKey } = options

    if (!product.trim()) {
      throw new Error('Please enter product name')
    }

    loading.value = true
    try {
      // 匹配关键词
      const matched = matchKeywords(product, description)
      matchedKeywords.value = matched

      let titles
      if ((aiProvider === 'openai' && openaiApiKey) || (aiProvider === 'doubao' && doubaoApiKey)) {
        // 使用AI生成
        const prompt = buildTitlePrompt(product, description, keywordsData)

        try {
          let response
          if (aiProvider === 'openai') {
            response = await generateWithOpenAI(prompt, openaiApiKey)
          } else {
            response = await generateWithDoubao(prompt, doubaoApiKey)
          }

          const content = response.choices[0].message.content
          titles = parseTitlesFromAI(content)
        } catch (error) {
          console.error('AI generation failed, falling back to local:', error)
          titles = generateLocalTitles(product, matched)
        }
      } else {
        // 使用本地生成
        titles = generateLocalTitles(product, matched)
      }

      generatedTitles.value = titles
      return titles
    } finally {
      loading.value = false
    }
  }

  /**
   * Copy title to clipboard
   * @param {string} title - Title to copy
   * @returns {Promise<boolean>} Success status
   */
  const copyTitle = async (title) => {
    try {
      await navigator.clipboard.writeText(title)
      return true
    } catch (e) {
      console.error('Copy failed:', e)
      return false
    }
  }

  return {
    loading,
    matchedKeywords,
    generatedTitles,
    generateTitles,
    copyTitle,
    matchKeywords,
    generateLocalTitles
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/composables/useTitleGenerator.js
git commit -m "feat: create title generator composable"
```

---

## Task 5: Create Pinia Store for State Management

**Files:**
- Create: `src/stores/titleGenerator.js`

- [ ] **Step 1: Create Pinia store**
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { keywordsData } from '../data/keywords'

export const useTitleGeneratorStore = defineStore('titleGenerator', () => {
  // Form state
  const form = ref({
    product: '',
    description: '',
    aiProvider: 'doubao',
    apiKey: '',
    doubaoApiKey: 'da03c0aa-c7c8-4318-a204-72624f91df0b'
  })

  // Keywords state
  const keywordsDataRef = ref(keywordsData)

  // Toast state
  const toast = ref({
    show: false,
    message: ''
  })

  // Category names mapping
  const categoryNames = {
    cat: '🐱 猫咪用品',
    dog: '🐶 狗狗用品',
    cleaning: '🧼 清洁护理',
    travel_home: '🏠 居家出行',
    nutrition: '🦴 零食营养',
    smart: '🤖 智能设备',
    other: '🐹 其他宠物',
    marketing: '🔥 营销词'
  }

  // Computed total keywords count
  const totalKeywords = computed(() => {
    let total = 0
    for (const cat in keywordsDataRef.value) {
      total += keywordsDataRef.value[cat].length
    }
    return total
  })

  /**
   * Load saved keywords from localStorage
   */
  const loadSavedKeywords = () => {
    const saved = localStorage.getItem('tkKeywords')
    if (saved) {
      try {
        keywordsDataRef.value = JSON.parse(saved)
      } catch (e) {
        console.log('Using default keywords')
      }
    }
  }

  /**
   * Save keywords to localStorage
   */
  const saveKeywords = () => {
    localStorage.setItem('tkKeywords', JSON.stringify(keywordsDataRef.value))
  }

  /**
   * Add new keyword to library
   * @param {string} category - Keyword category
   * @param {string} keyword - Keyword to add
   * @returns {boolean} Success status
   */
  const addKeyword = (category, keyword) => {
    const keywordTrimmed = keyword.trim()

    if (!keywordTrimmed) {
      showToast('Please enter a keyword')
      return false
    }

    if (!keywordsDataRef.value[category]) {
      keywordsDataRef.value[category] = []
    }

    if (!keywordsDataRef.value[category].includes(keywordTrimmed)) {
      keywordsDataRef.value[category].push(keywordTrimmed)
      saveKeywords()
      showToast('Keyword added successfully!')
      return true
    } else {
      showToast('Keyword already exists')
      return false
    }
  }

  /**
   * Show toast message
   * @param {string} message - Message to show
   * @param {number} duration - Display duration in ms
   */
  const showToast = (message, duration = 2000) => {
    toast.value.message = message
    toast.value.show = true
    setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  /**
   * Clear form data
   */
  const clearForm = () => {
    form.value.product = ''
    form.value.description = ''
    form.value.aiProvider = 'doubao'
    form.value.apiKey = ''
    form.value.doubaoApiKey = 'da03c0aa-c7c8-4318-a204-72624f91df0b'
  }

  return {
    // State
    form,
    keywordsData: keywordsDataRef,
    toast,
    categoryNames,

    // Computed
    totalKeywords,

    // Methods
    loadSavedKeywords,
    saveKeywords,
    addKeyword,
    showToast,
    clearForm
  }
})
```

- [ ] **Step 2: Commit**
```bash
git add src/stores/titleGenerator.js
git commit -m "feat: create Pinia store for state management"
```

---

## Task 6: Create Vue Router Configuration

**Files:**
- Create: `src/router/index.js`

- [ ] **Step 1: Create router configuration**
```javascript
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import KeywordsView from '../views/KeywordsView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '标题生成'
      }
    },
    {
      path: '/keywords',
      name: 'keywords',
      component: KeywordsView,
      meta: {
        title: '关键词管理'
      }
    }
  ]
})

// Page title update
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'TikTok Shop Title Optimizer'}`
  next()
})

export default router
```

- [ ] **Step 2: Commit**
```bash
git add src/router/index.js
git commit -m "feat: create Vue Router configuration"
```

---

## Task 7: Create View Components

**Files:**
- Create: `src/views/HomeView.vue`
- Create: `src/views/KeywordsView.vue`

- [ ] **Step 1: Create HomeView component**
```vue
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
```

- [ ] **Step 2: Create KeywordsView component**
```vue
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
```

- [ ] **Step 3: Commit**
```bash
git add src/views/HomeView.vue src/views/KeywordsView.vue
git commit -m "feat: create view components"
```

---

## Task 8: Create Reusable Components

**Files:**
- Create: `src/components/TitleForm.vue`
- Create: `src/components/TitleResult.vue`
- Create: `src/components/KeywordsManager.vue`

- [ ] **Step 1: Create TitleForm component**
```vue
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
    <button @click="handleGenerate" :disabled="loading">
      {{ loading ? 'Generating...' : '生成优化标题 Generate Titles' }}
    </button>
    <button class="btn-secondary" @click="handleClear">清空 Clear</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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
```

- [ ] **Step 2: Create TitleResult component**
```vue
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
```

- [ ] **Step 3: Create KeywordsManager component**
```vue
<template>
  <div class="keywords-manager">
    <div class="category-container">
      <div v-for="(keywords, category) in keywordsData" :key="category" class="category-box">
        <h3>{{ categoryNames[category] }} ({{ keywords.length }})</h3>
        <div class="keyword-list">
          <span
            v-for="kw in keywords"
            :key="kw"
            class="keyword-item"
          >{{ kw }}</span>
        </div>
      </div>
    </div>

    <h3 style="margin-top: 20px;">➕ 添加新关键词</h3>
    <div class="add-keyword-form">
      <select v-model="newKeyword.category">
        <option value="cat">猫咪用品 Cat Products</option>
        <option value="dog">狗狗用品 Dog Products</option>
        <option value="cleaning">清洁护理 Cleaning</option>
        <option value="travel_home">居家出行 Travel & Home</option>
        <option value="nutrition">零食营养 Nutrition</option>
        <option value="smart">智能设备 Smart Tech</option>
        <option value="other">其他宠物 Other Pets</option>
        <option value="marketing">营销词 Marketing</option>
      </select>
      <input
        v-model="newKeyword.keyword"
        type="text"
        placeholder="Enter new keyword..."
      >
      <button @click="handleAdd">Add</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  keywordsData: {
    type: Object,
    required: true
  },
  categoryNames: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-keyword'])

const newKeyword = ref({
  category: 'cat',
  keyword: ''
})

const handleAdd = () => {
  emit('add-keyword', newKeyword.value.category, newKeyword.value.keyword)
  newKeyword.value.keyword = ''
}
</script>

<style scoped>
.category-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.category-box {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
}

.category-box h3 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1em;
}

.keyword-list {
  max-height: 150px;
  overflow-y: auto;
}

.keyword-item {
  display: inline-block;
  background: #f0f0f0;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  margin: 2px;
}

.add-keyword-form {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.add-keyword-form input {
  flex: 1;
  min-width: 200px;
}

.add-keyword-form select {
  min-width: 150px;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 1em;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .add-keyword-form {
    flex-direction: column;
  }
}
</style>
```

- [ ] **Step 4: Commit**
```bash
git add src/components/TitleForm.vue src/components/TitleResult.vue src/components/KeywordsManager.vue
git commit -m "feat: create reusable components"
```

---

## Task 9: Update Root App Component

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Replace App.vue content with new structure**
```vue
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
```

- [ ] **Step 2: Commit**
```bash
git add src/App.vue
git commit -m "feat: update root App component with new structure"
```

---

## Task 10: Update Main Entry File

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Update main.js to include router and pinia**
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
```

- [ ] **Step 2: Commit**
```bash
git add src/main.js
git commit -m "feat: update main entry with router and pinia"
```

---

## Task 11: Update Vite Configuration

**Files:**
- Modify: `vite.config.js`

- [ ] **Step 1: Ensure proxy configuration is correct**
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/sun-tk-top-seller/',  // 匹配GitHub Pages的仓库名
  server: {
    proxy: {
      '/api': {
        target: 'https://ark.cn-beijing.volces.com/api/coding/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

- [ ] **Step 2: Commit**
```bash
git add vite.config.js
git commit -m "feat: ensure vite config is correct"
```

---

## Task 12: Clean Up Old Code

**Files:**
- Remove: Old unused code from original App.vue (already done in Task 9)

- [ ] **Step 1: Verify all functionality works**
Run: `npm run dev`
Test:
- Navigation between tabs works
- Title generation works with local and AI modes
- Keywords management works
- Copy to clipboard works
- Toast notifications work

- [ ] **Step 2: Final commit**
```bash
git add .
git commit -m "refactor: complete project restructuring"
```

---

## Plan Complete

Plan complete and saved to `docs/superpowers/plans/2026-04-01-vue-project-refactoring.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
