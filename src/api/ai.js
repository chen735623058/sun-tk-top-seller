// AI API service layer
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Call Doubao AI to generate titles
 * @param {string} prompt - The prompt to send
 * @param {string} apiKey - API key for authentication
 * @param {boolean} stream - Whether to use streaming response
 * @returns {Promise<Object|ReadableStream>} AI response or stream
 */
export const generateWithDoubao = async (prompt, apiKey, stream = false) => {
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
      stream: stream
    })
  })

  if (!response.ok) {
    throw new Error('Doubao API request failed')
  }

  if (stream) {
    return response.body
  }

  return await response.json()
}

/**
 * Call OpenAI to generate titles
 * @param {string} prompt - The prompt to send
 * @param {string} apiKey - API key for authentication
 * @param {boolean} stream - Whether to use streaming response
 * @returns {Promise<Object|ReadableStream>} AI response or stream
 */
export const generateWithOpenAI = async (prompt, apiKey, stream = false) => {
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
      temperature: 0.7,
      stream: stream
    })
  })

  if (!response.ok) {
    throw new Error('OpenAI API request failed')
  }

  if (stream) {
    return response.body
  }

  return await response.json()
}
