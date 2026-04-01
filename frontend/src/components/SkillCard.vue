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
}

.skill-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-desc {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  margin: 0 0 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #909399;
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
  border-top: 1px solid #ebeef5;
}

.btn-update {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-update:hover,
.btn-update:focus {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-download {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-download:hover,
.btn-download:focus {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}
</style>
