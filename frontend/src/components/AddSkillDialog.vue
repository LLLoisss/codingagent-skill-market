<template>
  <el-dialog v-model="visible"
             :title="isEditing ? '更新 Skill' : '新增 Skill'"
             width="560px"
             @close="handleClose">
    <el-form :model="form"
             :rules="rules"
             ref="formRef"
             label-width="100px">
      <el-form-item label="名称"
                    prop="name">
        <el-input v-model="form.name"
                  placeholder="请输入Skill名称" />
      </el-form-item>
      <el-form-item label="描述"
                    prop="description">
        <el-input v-model="form.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入Skill描述" />
      </el-form-item>
      <el-form-item label="作者"
                    prop="author">
        <el-input v-model="form.author"
                  placeholder="请输入作者名称" />
      </el-form-item>
      <el-form-item label="Skill文件夹"
                    prop="files">
        <div class="upload-area"
             :class="{ 'drag-over': isDragOver }"
             @click="openFilePicker"
             @dragover.prevent="isDragOver = true"
             @dragleave.prevent="isDragOver = false"
             @drop.prevent="handleDrop">
          <el-icon :size="40"
                   color="#909399">
            <UploadFilled />
          </el-icon>
          <div class="upload-text">
            <p>点击选择文件夹 或 拖拽文件夹到此处</p>
            <p class="upload-hint"
               v-if="fileList.length === 0 && !isEditing">支持上传整个Skill文件夹</p>
            <p class="upload-hint"
               v-else-if="fileList.length === 0 && isEditing">可选：上传新文件夹替换原有文件</p>
            <p class="upload-hint"
               v-else>已选择 {{ fileList.length }} 个文件</p>
          </div>
        </div>
        <input ref="fileInput"
               type="file"
               webkitdirectory
               multiple
               style="display: none"
               @change="handleFileChange" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary"
                 :loading="loading"
                 @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createSkill, updateSkill } from '../api'

const props = defineProps<{
  modelValue: boolean
  editingSkill?: import('../types').Skill | null
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success'): void
}>()

const isEditing = ref(false)

const visible = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.editingSkill) {
      isEditing.value = true
      form.name = props.editingSkill.name
      form.description = props.editingSkill.description
      form.author = props.editingSkill.author
    } else if (val) {
      isEditing.value = false
    }
  }
)
watch(visible, (val) => {
  emit('update:modelValue', val)
})

const formRef = ref<FormInstance>()
const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const loading = ref(false)
const fileList = ref<File[]>([])
const relativePaths = ref<string[]>([])

const form = reactive({
  name: '',
  description: '',
  author: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入Skill名称', trigger: 'blur' }],
  description: [
    { required: true, message: '请输入Skill描述', trigger: 'blur' },
  ],
  author: [{ required: true, message: '请输入作者名称', trigger: 'blur' }],
}

function openFilePicker() {
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    processFiles(input.files)
  }
}

function handleDrop(e: DragEvent) {
  isDragOver.value = false
  const items = e.dataTransfer?.items
  if (items) {
    const entries: FileSystemEntry[] = []
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry()
      if (entry) entries.push(entry)
    }
    readEntries(entries)
  }
}

async function readEntries(entries: FileSystemEntry[]) {
  const files: File[] = []
  const paths: string[] = []

  async function traverse(entry: FileSystemEntry, basePath: string) {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve) => {
        ;(entry as FileSystemFileEntry).file(resolve)
      })
      files.push(file)
      paths.push(basePath + entry.name)
    } else if (entry.isDirectory) {
      const dirReader = (entry as FileSystemDirectoryEntry).createReader()
      const subEntries = await new Promise<FileSystemEntry[]>((resolve) => {
        dirReader.readEntries(resolve)
      })
      for (const sub of subEntries) {
        await traverse(sub, basePath + entry.name + '/')
      }
    }
  }

  for (const entry of entries) {
    await traverse(entry, '')
  }

  fileList.value = files
  relativePaths.value = paths
}

function processFiles(files: FileList) {
  fileList.value = Array.from(files)
  relativePaths.value = fileList.value.map(
    (f) => (f as any).webkitRelativePath || f.name
  )
}

async function handleSubmit() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (fileList.value.length === 0 && !isEditing.value) {
    ElMessage.warning('请上传Skill文件夹')
    return
  }

  loading.value = true
  try {
    if (isEditing.value && props.editingSkill) {
      await updateSkill(
        props.editingSkill.id,
        form,
        fileList.value.length > 0 ? fileList.value : undefined,
        fileList.value.length > 0 ? relativePaths.value : undefined
      )
      ElMessage.success('更新Skill成功')
    } else {
      await createSkill(form, fileList.value, relativePaths.value)
      ElMessage.success('新增Skill成功')
    }
    emit('success')
    visible.value = false
  } catch {
    ElMessage.error('新增Skill失败，请重试')
  } finally {
    loading.value = false
  }
}

function handleClose() {
  isEditing.value = false
  form.name = ''
  form.description = ''
  form.author = ''
  fileList.value = []
  relativePaths.value = []
  formRef.value?.resetFields()
}
</script>

<style scoped>
.upload-area {
  width: 100%;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
  background: #f8fbff;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #2563eb;
  background: #eef3ff;
}

.upload-text p {
  margin: 8px 0 0;
  color: #4b5563;
  font-size: 14px;
}

.upload-hint {
  color: #6b7280 !important;
  font-size: 12px !important;
}
</style>
