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
