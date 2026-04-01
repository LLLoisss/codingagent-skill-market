<template>
  <el-card shadow="hover"
           class="skill-card">
    <template #header>
      <div class="card-header">
        <span class="skill-name">{{ skill.name }}</span>
      </div>
    </template>
    <p class="skill-desc">{{ skill.description }}</p>
    <div class="card-footer">
      <span class="skill-author">
        <el-icon>
          <User />
        </el-icon>
        {{ skill.author }}
      </span>
      <span class="skill-time">
        <el-icon>
          <Clock />
        </el-icon>
        {{ formatTime(skill.createdAt) }}
      </span>
    </div>
    <div class="card-actions">
      <el-button class="btn-update"
                 @click="$emit('update', skill)">
        <el-icon>
          <RefreshRight />
        </el-icon>
        更新
      </el-button>
      <el-button class="btn-download"
                 @click="$emit('download', skill.id)">
        <el-icon>
          <Download />
        </el-icon>
        下载
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { User, Clock, RefreshRight, Download } from '@element-plus/icons-vue'
import type { Skill } from '../types'

defineProps<{ skill: Skill }>()
defineEmits<{
  (e: 'update', skill: Skill): void
  (e: 'download', id: string): void
}>()

function formatTime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.skill-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  border-radius: 14px;
}

.skill-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #1f2937;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* padding-bottom: 8px; */
  /* border-bottom: 1px solid #e5e7eb; */
}

.skill-name {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-desc {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.7;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  margin: 6px 0 10px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
  font-size: 13px;
  margin-top: auto;
}

.skill-author,
.skill-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.btn-update {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 8px 18px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.28);
}

.btn-update:hover,
.btn-update:focus {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(29, 78, 216, 0.36);
}

.btn-download {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 8px 18px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 26px rgba(245, 158, 11, 0.28);
}

.btn-download:hover,
.btn-download:focus {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(217, 119, 6, 0.34);
}
</style>
