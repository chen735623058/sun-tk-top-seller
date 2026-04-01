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
