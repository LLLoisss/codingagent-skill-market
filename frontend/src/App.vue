<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">Skill Market</h1>
    </header>

    <div class="toolbar">
      <el-button class="btn-add"
                 @click="dialogVisible = true">
        <el-icon>
          <Plus />
        </el-icon>
        新增 Skill
      </el-button>
      <el-input v-model="searchText"
                placeholder="按名称搜索..."
                clearable
                class="search-input"
                @input="handleSearch">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <div v-loading="loading"
         class="card-grid">
      <div v-if="skills.length === 0 && !loading"
           class="empty-state">
        <el-empty description="暂无Skill，点击上方按钮新增" />
      </div>
      <div v-for="skill in skills"
           :key="skill.id"
           class="card-item">
        <SkillCard :skill="skill"
                   @update="handleUpdate"
                   @download="handleDownload" />
      </div>
    </div>

    <AddSkillDialog v-model="dialogVisible"
                    @success="fetchSkills" />

    <AddSkillDialog v-model="updateDialogVisible"
                    :editing-skill="editingSkill"
                    @success="fetchSkills" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SkillCard from './components/SkillCard.vue'
import AddSkillDialog from './components/AddSkillDialog.vue'
import { getSkills, getDownloadUrl } from './api'
import type { Skill } from './types'

const skills = ref<Skill[]>([])
const searchText = ref('')
const dialogVisible = ref(false)
const loading = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchSkills() {
  loading.value = true
  try {
    skills.value = await getSkills(searchText.value || undefined)
  } catch {
    ElMessage.error('获取Skill列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchSkills()
  }, 300)
}

const editingSkill = ref<Skill | null>(null)
const updateDialogVisible = ref(false)

function handleUpdate(skill: Skill) {
  editingSkill.value = skill
  updateDialogVisible.value = true
}

function handleDownload(id: string) {
  const url = getDownloadUrl(id)
  const link = document.createElement('a')
  link.href = url
  link.download = ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchSkills()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.app-header {
  margin-bottom: 24px;
}

.app-title {
  font-size: 28px;
  color: #303133;
  font-weight: 700;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.btn-add {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-add:hover,
.btn-add:focus {
  background: linear-gradient(135deg, #2825e3 0%, #02bbf9 100%);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(2, 233, 246, 0.4);
}

.search-input {
  width: 300px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.card-item {
  min-height: 180px;
}
</style>
