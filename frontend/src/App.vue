<template>
  <div class="app-shell">
    <section class="hero">
      <div class="hero-content">
        <p class="eyebrow">Skill Market</p>
        <h1>代码助手的 Skill 集市</h1>
        <p class="tagline">浏览、搜索、上传，一键打包可复用的 Agent 能力。保持轻量，也保持可靠。</p>
        <div class="hero-meta">
          <span class="pill">已发布 {{ total }} 个 Skill</span>
          <span class="pill alt">一键下载 · 随时更新</span>
        </div>
      </div>
      <div class="hero-visual">
        <div class="orb orb-primary"></div>
        <div class="orb orb-accent"></div>
        <div class="hero-card">
          <p class="hero-card-title">快速上架</p>
          <p class="hero-card-desc">上传整个文件夹，自动保持目录结构</p>
        </div>
      </div>
    </section>

    <main class="app-container">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="searchText"
                    placeholder="搜索 Skill 名称或关键词"
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
        <div class="toolbar-right">
          <el-button class="btn-add"
                     @click="dialogVisible = true">
            <el-icon>
              <Plus />
            </el-icon>
            新增 Skill
          </el-button>
        </div>
      </div>

      <div v-loading="loading"
           class="card-grid">
        <div v-if="skills.length === 0 && !loading"
             class="empty-state">
          <el-empty description="暂无Skill，点击右上角新增" />
        </div>
        <div v-for="skill in skills"
             :key="skill.id"
             class="card-item">
          <SkillCard :skill="skill"
                     @update="handleUpdate"
                     @download="handleDownload" />
        </div>
      </div>

      <div class="pagination-wrap">
        <el-pagination :current-page="currentPage"
                       :page-size="pageSize"
                       :total="total"
                       :pager-count="5"
                       :hide-on-single-page="false"
                       layout="prev, pager, next"
                       background
                       @current-change="handlePageChange" />
        <span class="pagination-total">共 {{ total }} 条数据</span>
      </div>
    </main>

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
const currentPage = ref(1)
const pageSize = 27
const total = ref(0)
let searchTimer: ReturnType<typeof setTimeout> | null = null

async function fetchSkills() {
  loading.value = true
  try {
    const result = await getSkills(
      searchText.value || undefined,
      currentPage.value,
      pageSize
    )
    skills.value = result.items
    total.value = result.total
  } catch {
    ElMessage.error('获取Skill列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchSkills()
  }, 300)
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchSkills()
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

:root {
  --bg-100: #f7f9ff;
  --bg-200: #eef3ff;
  --surface: #ffffff;
  --border: #e5e7eb;
  --shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
  --text: #111827;
  --muted: #4b5563;
  --primary: #2563eb;
  --primary-strong: #1d4ed8;
  --accent: #f59e0b;
}

body {
  min-height: 100vh;
  background: radial-gradient(
      circle at 18% 16%,
      rgba(37, 99, 235, 0.18),
      transparent 30%
    ),
    radial-gradient(circle at 82% 0%, rgba(245, 158, 11, 0.18), transparent 28%),
    linear-gradient(145deg, var(--bg-100) 0%, var(--bg-200) 50%, #ffffff 100%);
  color: var(--text);
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 40px 32px 64px;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 22px 28px;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.hero {
  max-width: 1200px;
  margin: 0 auto 28px;
  padding: 28px 28px 26px;
  border-radius: 20px;
  background: linear-gradient(140deg, #f0f4ff, #e3edff 50%, #ffffff 100%);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
  position: relative;
  overflow: hidden;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 20% 20%,
    rgba(37, 99, 235, 0.12),
    transparent 35%
  );
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: #e8edff;
  border: 1px solid #dbe3ff;
  color: #1d4ed8;
  font-weight: 700;
  letter-spacing: 0.4px;
  margin-bottom: 12px;
}

.eyebrow::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
}

.hero h1 {
  font-size: 32px;
  line-height: 1.25;
  color: var(--text);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.tagline {
  color: var(--muted);
  font-size: 16px;
  line-height: 1.6;
  max-width: 640px;
  margin-bottom: 16px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #d6e2fd;
  /* border: 1px solid #dbe3ff; */
  border: 1px solid var(--border);
  color: #111827;
  font-weight: 700;
}

.pill::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--primary);
}

.pill.alt::before {
  background: var(--accent);
}

.hero-visual {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 200px;
  z-index: 1;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(28px);
  opacity: 0.8;
}

.orb-primary {
  width: 180px;
  height: 180px;
  background: rgba(37, 99, 235, 0.24);
  top: 10px;
  right: 18px;
}

.orb-accent {
  width: 140px;
  height: 140px;
  background: rgba(245, 158, 11, 0.22);
  bottom: 12px;
  left: 10px;
}

.hero-card {
  position: relative;
  width: 100%;
  max-width: 320px;
  padding: 16px 18px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  color: #111827;
}

.hero-card-title {
  font-weight: 800;
  margin-bottom: 6px;
}

.hero-card-desc {
  color: var(--muted);
  line-height: 1.5;
  font-size: 14px;
}

.toolbar {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  /* padding: 12px 14px; */
  border-radius: 14px;
  /* background: #f8fbff; */
  /* border: 1px solid var(--border); */
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.search-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.search-input :deep(.el-input__wrapper) {
  background: #f8fbff;
  border-radius: 12px;
  border-color: var(--border);
  box-shadow: none;
  color: var(--text);
}

.search-input :deep(.el-input__inner) {
  color: var(--text);
}

.btn-add {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-strong) 100%
  );
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 700;
  letter-spacing: 0.2px;
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-add:hover,
.btn-add:focus {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(29, 78, 216, 0.36);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
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

.pagination-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eef2f7;
}

.pagination-total {
  color: #6b7280;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
}

.pagination-wrap :deep(.el-pagination) {
  flex-wrap: wrap;
  gap: 8px;
}

.pagination-wrap :deep(.btn-prev),
.pagination-wrap :deep(.btn-next),
.pagination-wrap :deep(.el-pager li) {
  min-width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  box-shadow: none;
}

.pagination-wrap :deep(.el-pager li.is-active) {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.pagination-wrap :deep(.btn-prev:disabled),
.pagination-wrap :deep(.btn-next:disabled) {
  border-color: #e5e7eb;
  background: #f9fafb;
  color: #c0c4cc;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .toolbar {
    grid-template-columns: 1fr;
  }

  .toolbar-right {
    justify-content: flex-start;
  }
}

@media (max-width: 600px) {
  .app-shell {
    padding: 18px 14px 38px;
  }

  .hero,
  .app-container {
    padding: 16px;
  }

  .hero h1 {
    font-size: 24px;
  }

  .tagline {
    font-size: 14px;
  }

  .pagination-wrap {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-total {
    text-align: right;
  }
}
</style>
