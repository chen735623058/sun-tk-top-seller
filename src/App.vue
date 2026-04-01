<template>
  <div class="container">
    <div class="header">
      <h1>🐾 TikTok Shop Pet Title Optimizer</h1>
      <p>TK美区宠物用品标题智能优化工具 - 2026最新热门关键词</p>
    </div>
    <div class="content">
      <!-- 标题生成区域 -->
      <div class="section">
        <h2>✨ 生成优化标题</h2>
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
          <label for="apiKey">OpenAI API Key (Optional, leave empty to use local matching)</label>
          <input
            v-model="form.apiKey"
            type="password"
            id="apiKey"
            placeholder="sk-..."
          >
          <small style="color: #666;">API Key 保存在你的浏览器本地，不会上传到服务器</small>
        </div>
        <button @click="generateTitles" :disabled="loading">{{ loading ? 'Generating...' : '生成优化标题 Generate Titles' }}</button>
        <button class="btn-secondary" @click="clearForm">清空 Clear</button>
      </div>

      <!-- 结果区域 -->
      <div class="section" v-if="result.matchedKeywords.length > 0">
        <h2>🎯 匹配到的关键词</h2>
        <div class="keywords-stats">
          <span
            v-for="kw in result.matchedKeywords"
            :key="kw"
            class="keyword-tag"
          >{{ kw }}</span>
        </div>
        <h2 style="margin-top: 20px;">📝 优化后的标题</h2>
        <div class="result-box">
          <div
            v-for="(item, index) in result.titles"
            :key="index"
            class="title-item"
          >
            <div class="title-type">{{ item.type }} ({{ item.length }} chars)</div>
            <div class="title-text">
              {{ item.title }}
              <button class="copy-btn" @click="copyTitle(item.title)">Copy</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 关键词库管理区域 -->
      <div class="section">
        <h2>📚 关键词库管理 (Keywords Library)</h2>
        <div class="count-info">Total keywords: {{ totalKeywords }}</div>
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
          <button @click="addKeyword">Add</button>
        </div>
      </div>
    </div>
  </div>

  <div class="toast" :class="{ show: toast.show }">{{ toast.message }}</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { keywordsData } from './data/keywords'

export default {
  setup() {
    const form = ref({
      product: '',
      description: '',
      apiKey: ''
    })

    const keywordsDataRef = ref(keywordsData)
    const loading = ref(false)
    const newKeyword = ref({
      category: 'cat',
      keyword: ''
    })

    const result = ref({
      matchedKeywords: [],
      titles: []
    })

    const toast = ref({
      show: false,
      message: ''
    })

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

    const totalKeywords = computed(() => {
      let total = 0
      for (const cat in keywordsDataRef.value) {
        total += keywordsDataRef.value[cat].length
      }
      return total
    })

    // 从localStorage加载
    onMounted(() => {
      const saved = localStorage.getItem('tkKeywords')
      if (saved) {
        try {
          keywordsDataRef.value = JSON.parse(saved)
        } catch (e) {
          console.log('Using default keywords')
        }
      }
    })

    const saveKeywords = () => {
      localStorage.setItem('tkKeywords', JSON.stringify(keywordsDataRef.value))
    }

    const randomSample = (array, count) => {
      const shuffled = [...array].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    }

    const generateLocalTitles = (product, matchedKeywords, marketingWords) => {
      const titles = []
      
      const productClean = product.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')

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
        if (marketingWords.length > 0) {
          const mark = randomSample(marketingWords, 1)[0]
          sample2.push(mark)
        }
        const title3 = sample2.slice(0, 8).join(' | ')
        titles.push({
          type: "长尾精准款",
          title: title3,
          length: title3.length
        })
      }
      
      // 4. 营销吸引款1
      if (marketingWords.length > 0) {
        const marketingSample = randomSample(marketingWords, Math.min(2, marketingWords.length))
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
          length: title4.length
        })
      }
      
      // 5. 营销吸引款2
      if (matchedKeywords.length > 5) {
        let allWords = [productClean, ...matchedKeywords.slice(0, 6)]
        if (marketingWords.length > 0) {
          allWords.push(randomSample(marketingWords, 1)[0])
        }
        const title5 = allWords.join(' ')
        titles.push({
          type: "营销吸引款",
          title: title5,
          length: title5.length
        })
      }
      
      return titles
    }

    const generateWithAI = async (product, description, matchedKeywords, apiKey) => {
      // 整理关键词库文本
      let keywordsText = ''
      for (const category in keywordsDataRef.value) {
        const words = keywordsDataRef.value[category].join(', ')
        keywordsText += `${category.toUpperCase()}: ${words}\n`
      }

      const prompt = `你是一位 TikTok Shop 美区宠物品类的标题优化专家。
我会给你我的商品基础信息，请你结合 2026 年最新美区热门搜索关键词，帮我生成 5 个不同风格的商品标题。

### 规则：
1. 必须尽可能多的包含下面给出的美区热门搜索关键词，提高搜索曝光
2. 标题长度控制在 60-150 字符（符合TK搜索排名规则），核心关键词前置
3. 核心大词放前面，长尾词放后面，符合美区消费者搜索习惯
4. 可以加上热门属性词：like "durable", "easy clean", "non toxic", "premium" 这些转化好的词
5. 生成5个标题：1个基础标准款，2个长尾精准款，2个吸引点击款（带一点营销感）
6. 输出格式：每个标题包含类型和标题，例如：
- [基础标准款] Title here

### 2026 美区宠物热门关键词库：
${keywordsText}

### 我的商品：
商品名称：${product}
${description ? `额外描述：${description}` : ''}

请直接输出5个标题，不要多余内容。`

      try {
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
          throw new Error('API request failed')
        }

        const data = await response.json()
        const content = data.choices[0].message.content
        
        // 解析AI输出
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
            let title = match[2].trim()
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
              length: title.length
            })
          } else if (line.startsWith('- ')) {
            // 如果只是 - 开头，推测顺序
            const order = titles.length + 1
            let type = order === 1 ? '基础标准款' : 
                       order <= 3 ? '长尾精准款' : '营销吸引款'
            titles.push({
              type: type,
              title: line.substring(2).trim(),
              length: line.substring(2).trim().length
            })
          }
        })

        return titles.slice(0, 5)
      } catch (error) {
        console.error('AI generation error:', error)
        throw error
      }
    }

    const generateTitles = async () => {
      const product = form.value.product.trim().toLowerCase()
      const description = form.value.description.trim().toLowerCase()
      const apiKey = form.value.apiKey.trim()
      
      if (!product) {
        showToast('Please enter product name')
        return
      }

      // 收集匹配的关键词
      let matched = []
      
      for (const category in keywordsDataRef.value) {
        keywordsDataRef.value[category].forEach(kw => {
          const kwLower = kw.toLowerCase()
          if (kwLower.includes(product) || product.includes(kwLower) || 
              (description && kwLower.includes(description)) || 
              (description && description.includes(kwLower)) ||
              product.split(' ').some(word => kwLower.includes(word))) {
            if (!matched.includes(kw)) {
              matched.push(kw)
            }
          }
        })
      }
      
      const marketing = keywordsDataRef.value.marketing || []
      
      // 如果有API Key，使用AI生成
      if (apiKey) {
        loading.value = true
        try {
          const titles = await generateWithAI(product, description, matched, apiKey)
          result.value = {
            matchedKeywords: matched,
            titles: titles
          }
          showToast('AI generation complete!')
        } catch (error) {
          showToast('AI generation failed, using local generation instead')
          const titles = generateLocalTitles(product, matched, marketing)
          result.value = {
            matchedKeywords: matched,
            titles: titles
          }
        } finally {
          loading.value = false
        }
      } else {
        // 没有API Key，使用本地生成
        const titles = generateLocalTitles(product, matched, marketing)
        result.value = {
          matchedKeywords: matched,
          titles: titles
        }
      }
    }

    const addKeyword = () => {
      const category = newKeyword.value.category
      const keyword = newKeyword.value.keyword.trim()
      
      if (!keyword) {
        showToast('Please enter a keyword')
        return
      }

      if (!keywordsDataRef.value[category]) {
        keywordsDataRef.value[category] = []
      }

      if (!keywordsDataRef.value[category].includes(keyword)) {
        keywordsDataRef.value[category].push(keyword)
        saveKeywords()
        showToast('Keyword added successfully!')
        newKeyword.value.keyword = ''
      } else {
        showToast('Keyword already exists')
      }
    }

    const copyTitle = async (title) => {
      try {
        await navigator.clipboard.writeText(title)
        showToast('Title copied to clipboard!')
      } catch (e) {
        showToast('Copy failed')
      }
    }

    const clearForm = () => {
      form.value.product = ''
      form.value.description = ''
      result.value = {
        matchedKeywords: [],
        titles: []
      }
    }

    const showToast = (message) => {
      toast.value.message = message
      toast.value.show = true
      setTimeout(() => {
        toast.value.show = false
      }, 2000)
    }

    return {
      form,
      keywordsData: keywordsDataRef,
      newKeyword,
      result,
      toast,
      categoryNames,
      totalKeywords,
      generateTitles,
      addKeyword,
      copyTitle,
      clearForm
    }
  }
}
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
}

.content {
  padding: 30px;
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

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

input, textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
}

input:focus, textarea:focus {
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

.title-length {
  font-size: 0.8em;
  color: #999;
  text-align: right;
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

.count-info {
  text-align: right;
  color: #666;
  font-size: 0.9em;
  margin-top: 10px;
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
  .add-keyword-form {
    flex-direction: column;
  }
  button {
    width: 100%;
    margin: 5px 0;
  }
  .btn-secondary {
    margin-left: 0;
  }
}
</style>
