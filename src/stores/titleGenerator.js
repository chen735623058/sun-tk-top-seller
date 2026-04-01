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
