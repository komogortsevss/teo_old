<template>
  <div class="hero-form-overlay" @click.self="$emit('close')">
    <div class="hero-form-panel">
      <div class="hero-form-header">
        <h2 class="hero-form-title">{{ hero ? 'Редактирование Hero блока' : 'Создание Hero блока' }}</h2>
        <button class="hero-form-close" @click="$emit('close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form class="hero-form-content" @submit.prevent="saveHero">
        <div class="form-group">
          <label class="form-label">Заголовок (необязательно)</label>
          <input
            v-model="form.title"
            type="text"
            class="form-input"
            placeholder="Например: Свежие цветы из Эквадора"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Подзаголовок (необязательно)</label>
          <textarea
            v-model="form.subtitle"
            class="form-textarea"
            placeholder="Краткое описание..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group form-group-half">
            <label class="form-label">Текст кнопки</label>
            <input
              v-model="form.buttonText"
              type="text"
              class="form-input"
              placeholder="Например: Перейти в каталог"
            />
          </div>
          <div class="form-group form-group-half">
            <label class="form-label">Ссылка кнопки</label>
            <input
              v-model="form.buttonLink"
              type="text"
              class="form-input"
              placeholder="/catalog"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group form-group-half">
            <label class="form-label">Позиция кнопки</label>
            <select v-model="form.buttonPosition" class="form-select">
              <option value="top-left">Верх — Лево</option>
              <option value="top-center">Верх — Центр</option>
              <option value="top-right">Верх — Право</option>
              <option value="center-left">Середина — Лево</option>
              <option value="center-center">Середина — Центр</option>
              <option value="center-right">Середина — Право</option>
              <option value="bottom-left">Низ — Лево</option>
              <option value="bottom-center">Низ — Центр</option>
              <option value="bottom-right">Низ — Право</option>
            </select>
          </div>
          <div class="form-group form-group-half">
            <label class="form-label">Порядок сортировки</label>
            <input
              v-model.number="form.sortOrder"
              type="number"
              class="form-input"
              placeholder="0"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Изображение (Desktop)</label>
          <div class="image-upload">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="image-input"
              @change="handleFileUpload"
            />
            <div v-if="form.imageHash" class="image-preview">
              <img
                :src="`https://fs.chatium.ru/thumbnail/${form.imageHash}/s/400x`"
                alt="Desktop Preview"
              />
              <button type="button" class="image-remove" @click="removeImage">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <div
              v-else
              class="image-upload-btn"
              @click="triggerFileUpload"
            >
              <i v-if="uploading" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-cloud-arrow-up"></i>
              <span>{{ uploadingStatus || (uploading ? 'Загрузка...' : 'Загрузить изображение') }}</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Изображение (Mobile)</label>
          <div class="image-upload">
            <input
              ref="mobileFileInput"
              type="file"
              accept="image/*"
              class="image-input"
              @change="handleMobileFileUpload"
            />
            <div v-if="form.mobileImageHash" class="image-preview">
              <img
                :src="`https://fs.chatium.ru/thumbnail/${form.mobileImageHash}/s/400x`"
                alt="Mobile Preview"
              />
              <button type="button" class="image-remove" @click="removeMobileImage">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <div
              v-else
              class="image-upload-btn"
              @click="triggerMobileFileUpload"
            >
              <i v-if="uploadingMobile" class="fa-solid fa-spinner fa-spin"></i>
              <i v-else class="fa-solid fa-cloud-arrow-up"></i>
              <span>{{ uploadingMobileStatus || (uploadingMobile ? 'Загрузка...' : 'Загрузить изображение') }}</span>
            </div>
          </div>
        </div>

        <div class="form-group form-group-checkbox">
          <label class="checkbox-label">
            <input v-model="form.isActive" type="checkbox" />
            <span>Активен</span>
          </label>
        </div>

        <div class="hero-form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            Отмена
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ saving ? 'Сохранение...' : 'Сохранить' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiAdminHeroCreateRoute } from '../../api/admin/hero/create'
import { apiAdminHeroUpdateRoute } from '../../api/admin/hero/update'
import { apiAdminUploadUrlRoute } from '../../api/admin/upload-url'

const props = defineProps({
  hero: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const form = ref({
  title: '',
  subtitle: '',
  buttonText: '',
  buttonLink: '',
  buttonPosition: 'center-center',
  imageHash: '',
  mobileImageHash: '',
  sortOrder: 0,
  isActive: true
})

const saving = ref(false)
const uploading = ref(false)
const uploadingStatus = ref('')
const uploadingMobile = ref(false)
const uploadingMobileStatus = ref('')
const fileInput = ref(null)
const mobileFileInput = ref(null)

onMounted(() => {
  if (props.hero) {
    form.value = {
      title: props.hero.title || '',
      subtitle: props.hero.subtitle || '',
      buttonText: props.hero.buttonText || '',
      buttonLink: props.hero.buttonLink || '',
      buttonPosition: props.hero.buttonPosition || 'center-center',
      imageHash: props.hero.imageHash || '',
      mobileImageHash: props.hero.mobileImageHash || '',
      sortOrder: props.hero.sortOrder ?? 0,
      isActive: props.hero.isActive ?? true
    }
  }
})

function triggerFileUpload() {
  if (uploading.value) return
  fileInput.value?.click()
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    alert('Файл слишком большой. Максимальный размер: 5 МБ')
    if (fileInput.value) fileInput.value.value = ''
    return
  }

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
      xhr.onerror = () => reject(new Error('Upload network error'))
      xhr.send(data)
    })
    form.value.imageHash = hash
  } catch (error) {
    console.error('Upload error:', error)
    alert('Ошибка загрузки изображения')
  } finally {
    uploading.value = false
    uploadingStatus.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

function removeImage() {
  form.value.imageHash = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function triggerMobileFileUpload() {
  if (uploadingMobile.value) return
  mobileFileInput.value?.click()
}

async function handleMobileFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const maxSize = 3 * 1024 * 1024
  if (file.size > maxSize) {
    alert('Файл слишком большой. Максимальный размер: 3 МБ')
    if (mobileFileInput.value) mobileFileInput.value.value = ''
    return
  }

  uploadingMobile.value = true
  uploadingMobileStatus.value = 'Загрузка...'
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
      xhr.onerror = () => reject(new Error('Upload network error'))
      xhr.send(data)
    })
    form.value.mobileImageHash = hash
  } catch (error) {
    console.error('Upload error:', error)
    alert('Ошибка загрузки изображения')
  } finally {
    uploadingMobile.value = false
    uploadingMobileStatus.value = ''
    if (mobileFileInput.value) {
      mobileFileInput.value.value = ''
    }
  }
}

function removeMobileImage() {
  form.value.mobileImageHash = ''
  if (mobileFileInput.value) {
    mobileFileInput.value.value = ''
  }
}

async function saveHero() {
  saving.value = true
  try {
    if (props.hero) {
      // Редактирование
      await apiAdminHeroUpdateRoute.query({ id: props.hero.id }).run(ctx, form.value)
    } else {
      // Создание
      await apiAdminHeroCreateRoute.run(ctx, form.value)
    }
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('Save error:', error)
    alert('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.hero-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(43, 34, 51, 0.5);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 10000;
}

.hero-form-panel {
  width: 100%;
  max-width: 480px;
  height: 100%;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.hero-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(43, 34, 51, 0.08);
}

.hero-form-title {
  font-size: 20px;
  font-weight: 600;
  color: #2B2233;
  margin: 0;
}

.hero-form-close {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(43, 34, 51, 0.06);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.hero-form-close:hover {
  background: rgba(43, 34, 51, 0.1);
}

.hero-form-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #2B2233;
}

.form-input,
.form-textarea,
.form-select {
  padding: 12px 16px;
  border: 1px solid rgba(43, 34, 51, 0.12);
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #A88BC8;
  box-shadow: 0 0 0 3px rgba(168, 139, 200, 0.15);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  cursor: pointer;
  background: #FFFFFF;
}

.image-upload {
  position: relative;
}

.image-input {
  display: none;
}

.image-upload-btn {
  width: 100%;
  padding: 32px;
  border: 2px dashed rgba(43, 34, 51, 0.15);
  border-radius: 12px;
  background: #FAFAFA;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.image-upload-btn:hover {
  border-color: #A88BC8;
  background: #F7F3FB;
}

.image-upload-btn i {
  font-size: 32px;
  color: #A88BC8;
}

.image-upload-btn span {
  font-size: 14px;
  color: #5F5568;
}

.image-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-remove {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #EF4444;
  transition: all 0.2s ease;
}

.image-remove:hover {
  background: #EF4444;
  color: #FFFFFF;
}

.form-group-checkbox {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 15px;
  color: #2B2233;
}

.checkbox-label input {
  width: 20px;
  height: 20px;
  accent-color: #A88BC8;
  cursor: pointer;
}

.hero-form-actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(43, 34, 51, 0.08);
  margin-top: auto;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secondary {
  background: rgba(43, 34, 51, 0.06);
  color: #2B2233;
}

.btn-secondary:hover {
  background: rgba(43, 34, 51, 0.1);
}

.btn-primary {
  background: #A88BC8;
  color: #FFFFFF;
}

.btn-primary:hover:not(:disabled) {
  background: #8E6FB2;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .hero-form-panel {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    height: 90%;
    margin-top: auto;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>