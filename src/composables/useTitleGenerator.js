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
