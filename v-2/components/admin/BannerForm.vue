<template>
  <div class="form-overlay" @click.self="$emit('close')">
    <div class="form-panel">
      <div class="form-header">
        <h2>{{ banner ? 'Редактировать баннер' : 'Новый баннер' }}</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="form-body">
        <div class="form-group">
          <label>Название</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Название баннера"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Изображение</label>
          <div class="image-upload">
            <div v-if="form.imageHash" class="image-preview">
              <img :src="`https://fs.chatium.ru/thumbnail/${form.imageHash}/s/400x`" alt="Preview" />
              <button class="btn-remove-image" @click="form.imageHash = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <label v-else class="upload-zone">
              <input type="file" accept="image/*" @change="handleImageUpload" hidden />
              <i v-if="uploading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-cloud-upload-alt"></i>
              <span>{{ uploadingStatus || 'Загрузить изображение' }}</span>
              <small v-if="!uploading">Рекомендуемый размер: 1280×320 px</small>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Ссылка</label>
          <input
            v-model="form.link"
            type="text"
            placeholder="https://example.com или /catalog"
            class="form-input"
          />
          <small class="form-hint">URL страницы, которая откроется при клике</small>
        </div>

        <div class="form-group">
          <label>Порядок сортировки</label>
          <input
            v-model.number="form.sortOrder"
            type="number"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="form.isActive" type="checkbox" />
            <span>Активен</span>
          </label>
        </div>
      </div>

      <div class="form-footer">
        <button class="btn btn-cancel" @click="$emit('close')">Отмена</button>
        <button class="btn btn-save" @click="save" :disabled="saving">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <span v-else>Сохранить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiAdminBannersCreateRoute } from '../../api/admin/banners/create'
import { apiAdminBannersUpdateRoute } from '../../api/admin/banners/update'
import { apiAdminUploadUrlRoute } from '../../api/admin/upload-url'

const props = defineProps({
  banner: { type: Object, default: null }
})

const emit = defineEmits(['close', 'saved'])

const form = ref({
  title: '',
  imageHash: '',
  link: '',
  sortOrder: 0,
  isActive: true
})

const saving = ref(false)
const uploading = ref(false)
const uploadingStatus = ref('')

onMounted(() => {
  if (props.banner) {
    form.value = {
      title: props.banner.title || '',
      imageHash: props.banner.imageHash || '',
      link: props.banner.link || '',
      sortOrder: props.banner.sortOrder ?? 0,
      isActive: props.banner.isActive ?? true
    }
  }
})

async function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  
  uploading.value = true
  uploadingStatus.value = 'Загрузка...'
  try {
    const { uploadUrl } = await apiAdminUploadUrlRoute.run(ctx)
    
    const hash = await new Promise((resolve, reject) => {
      const data = new FormData()
      data.append('Filedata', file)
      
      const xhr = new XMLHttpRequest()
      xhr.open('POST', uploadUrl)
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response)
        } else {
          reject(new Error('Upload failed: ' + xhr.status))
        }
      }
      xhr.onerror = () => reject(new Error('Upload error'))
      xhr.send(data)
    })
    form.value.imageHash = hash
  } catch (err) {
    console.error('Upload error:', err)
    alert('Ошибка загрузки изображения')
  } finally {
    uploading.value = false
    uploadingStatus.value = ''
  }
}

async function save() {
  if (!form.value.imageHash) {
    alert('Загрузите изображение')
    return
  }
  
  saving.value = true
  try {
    if (props.banner) {
      await apiAdminBannersUpdateRoute.query({ id: props.banner.id }).run(ctx, form.value)
    } else {
      await apiAdminBannersCreateRoute.run(ctx, form.value)
    }
    emit('saved')
  } catch (e) {
    alert('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
  backdrop-filter: blur(2px);
}

.form-panel {
  width: 100%;
  max-width: 520px;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #f0eaf7;
}

.form-header h2 {
  font-size: 20px;
  font-weight: 800;
  color: #2B2233;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-bg-light);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: var(--admin-text-soft);
  transition: all 0.2s;
}
.btn-close:hover { 
  background: var(--admin-accent);
  color: var(--admin-primary);
}

.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2B2233;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: var(--admin-primary);
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.image-upload {
  position: relative;
}

.image-preview {
  position: relative;
  aspect-ratio: 4 / 1;
  border-radius: 10px;
  overflow: hidden;
  background: var(--admin-bg-light);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-remove-image:hover { background: rgba(0, 0, 0, 0.8); }

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 1;
  border: 2px dashed var(--admin-accent);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 6px;
  color: var(--admin-text-light);
  background: var(--admin-bg-light);
}
.upload-zone:hover {
  border-color: var(--admin-primary);
  background: var(--admin-bg-medium);
  color: var(--admin-primary-dark);
}
.upload-zone i { font-size: 32px; }
.upload-zone span { font-size: 14px; font-weight: 600; }
.upload-zone small { font-size: 12px; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label span {
  font-size: 14px;
  font-weight: 500;
  color: #2B2233;
}

.form-footer {
  display: flex;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid #f0eaf7;
}

.btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-cancel {
  background: var(--color-white);
  color: var(--admin-text-soft);
  border: 1.5px solid var(--admin-accent);
}
.btn-cancel:hover { 
  background: var(--admin-bg-light);
  border-color: var(--admin-primary);
  color: var(--admin-primary);
}

.btn-save {
  background: var(--admin-primary);
  color: #fff;
}
.btn-save:hover { background: var(--admin-primary-dark); }
.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-panel { max-width: 100%; }
}
</style>