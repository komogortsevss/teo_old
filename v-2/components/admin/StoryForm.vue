<template>
  <div class="form-overlay" @click.self="$emit('close')">
    <div class="form-drawer">
      <div class="form-header">
        <div class="form-title">
          <i :class="isEdit ? 'fas fa-pen' : 'fas fa-plus'"></i>
          {{ isEdit ? 'Редактировать сторис' : 'Новая сторис' }}
        </div>
        <button class="form-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="form-body">
        <form @submit.prevent="submit">
          <!-- Обложка -->
          <div class="form-section">
            <div class="section-label">Обложка</div>
            <div class="cover-upload" @click="triggerCoverUpload">
              <img
                v-if="form.coverHash"
                :src="`https://fs.chatium.ru/thumbnail/${form.coverHash}/s/300x400`"
                class="cover-preview"
              />
              <div v-else class="cover-placeholder">
                <i class="fas fa-image"></i>
                <span>Загрузить обложку</span>
              </div>
              <div v-if="form.coverHash" class="cover-overlay">
                <i class="fas fa-camera"></i>
              </div>
              <input ref="coverInput" type="file" accept="image/*" class="file-input" @change="uploadCover" />
            </div>
            <div v-if="uploading" class="upload-progress">
              <i class="fas fa-spinner fa-spin"></i> {{ uploadingStatus || 'Загрузка...' }}
            </div>
          </div>

          <!-- Основные поля -->
          <div class="form-section">
            <div class="section-label">Основная информация</div>
            <div class="form-grid">
              <div class="field full-width">
                <label>Название</label>
                <input v-model="form.label" type="text" placeholder="Например: Розы" />
              </div>
              <div class="field">
                <label>Порядок</label>
                <input v-model.number="form.sortOrder" type="number" min="0" step="1" placeholder="0" />
              </div>
            </div>
          </div>

          <!-- Статус -->
          <div class="form-section">
            <div class="section-label">Статус</div>
            <label class="toggle-label">
              <div class="toggle" :class="{ on: form.isActive }" @click="form.isActive = !form.isActive">
                <div class="toggle-thumb"></div>
              </div>
              <span>{{ form.isActive ? 'Активна' : 'Скрыта' }}</span>
            </label>
          </div>

          <!-- Слайды -->
          <div class="form-section">
            <div class="section-label-row">
              <div class="section-label">Слайды ({{ form.slides.length }})</div>
              <button type="button" class="btn-add-slide" @click="addSlide">
                <i class="fas fa-plus"></i> Добавить слайд
              </button>
            </div>

            <div class="slides-list">
              <div
                v-for="(slide, idx) in form.slides"
                :key="idx"
                class="slide-item"
              >
                <div class="slide-num">{{ idx + 1 }}</div>
                <div class="slide-photo" @click="triggerSlideUpload(idx)">
                  <img
                    v-if="slide.imageHash"
                    :src="`https://fs.chatium.ru/thumbnail/${slide.imageHash}/s/120x160`"
                    class="slide-img"
                  />
                  <div v-else class="slide-placeholder">
                    <i class="fas fa-camera"></i>
                  </div>
                  <input
                    :ref="el => setSlideRef(idx, el)"
                    type="file"
                    accept="image/*"
                    class="file-input"
                    @change="e => uploadSlideImage(e, idx)"
                  />
                </div>
                <div class="slide-fields">
                  <input
                    v-model="slide.text"
                    type="text"
                    placeholder="Текст слайда"
                    class="slide-input"
                  />
                  <input
                    v-model="slide.price"
                    type="text"
                    placeholder="Цена (например: от 3 900 ₽)"
                    class="slide-input"
                  />
                  <input
                    v-model="slide.buttonText"
                    type="text"
                    placeholder="Текст кнопки (необязательно)"
                    class="slide-input"
                  />
                  <input
                    v-model="slide.buttonUrl"
                    type="text"
                    placeholder="Ссылка кнопки (например: /v-2/catalog)"
                    class="slide-input"
                  />
                </div>
                <button type="button" class="btn-remove-slide" @click="removeSlide(idx)">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div v-if="form.slides.length === 0" class="no-slides">
                Слайды ещё не добавлены
              </div>
            </div>
          </div>

          <!-- Ошибка -->
          <div v-if="error" class="form-error">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>

          <!-- Кнопки -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">Отмена</button>
            <button type="submit" class="btn-save" :disabled="saving">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ saving ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Создать') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { apiAdminStoriesCreateRoute } from '../../api/admin/stories/create'
import { apiAdminStoriesUpdateRoute } from '../../api/admin/stories/update'
import { apiAdminUploadUrlRoute } from '../../api/admin/upload-url'

const props = defineProps({
  story: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.story?.id)

const getDefaultForm = () => ({
  label: '',
  coverHash: '',
  slides: [],
  sortOrder: 0,
  isActive: true,
})

const form = ref(getDefaultForm())

watch(() => props.story, (s) => {
  if (s) {
    form.value = {
      label: s.label ?? '',
      coverHash: s.coverHash ?? '',
      slides: (s.slides ?? []).map(sl => ({ ...sl })),
      sortOrder: s.sortOrder ?? 0,
      isActive: s.isActive ?? true,
    }
  } else {
    form.value = getDefaultForm()
  }
}, { immediate: true })

const coverInput = ref(null)
const slideInputRefs = ref({})
const uploading = ref(false)
const uploadingStatus = ref('')
const saving = ref(false)
const error = ref('')

function triggerCoverUpload() {
  coverInput.value?.click()
}

function setSlideRef(idx, el) {
  if (el) slideInputRefs.value[idx] = el
}

function triggerSlideUpload(idx) {
  slideInputRefs.value[idx]?.click()
}

async function uploadFile(file) {
  uploadingStatus.value = 'Загрузка...'
  
  const { uploadUrl } = await apiAdminUploadUrlRoute.run(ctx)
  
  return new Promise((resolve, reject) => {
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
}

async function uploadCover(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  uploadingStatus.value = ''
  try {
    const hash = await uploadFile(file)
    form.value.coverHash = hash
  } catch (err) {
    console.error('Upload error:', err)
    error.value = 'Ошибка загрузки обложки'
  } finally {
    uploading.value = false
    uploadingStatus.value = ''
  }
  e.target.value = ''
}

async function uploadSlideImage(e, idx) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  uploadingStatus.value = ''
  try {
    const hash = await uploadFile(file)
    form.value.slides[idx].imageHash = hash
  } catch (err) {
    console.error('Upload error:', err)
    error.value = 'Ошибка загрузки изображения'
  } finally {
    uploading.value = false
    uploadingStatus.value = ''
  }
  e.target.value = ''
}

function addSlide() {
  form.value.slides.push({ imageHash: '', text: '', price: '', buttonText: '', buttonUrl: '' })
}

function removeSlide(idx) {
  form.value.slides.splice(idx, 1)
}

async function submit() {
  error.value = ''
  saving.value = true
  try {
    const payload = {
      label: form.value.label,
      coverHash: form.value.coverHash,
      slides: form.value.slides,
      sortOrder: form.value.sortOrder ?? 0,
      isActive: form.value.isActive,
    }
    if (isEdit.value) {
      await apiAdminStoriesUpdateRoute.query({ id: props.story.id }).run(ctx, payload)
    } else {
      await apiAdminStoriesCreateRoute.run(ctx, payload)
    }
    emit('saved')
  } catch (e) {
    error.value = e.message || 'Произошла ошибка'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(43,34,51,0.45);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}

.form-drawer {
  width: 520px;
  max-width: 100%;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(43,34,51,0.18);
  animation: slideIn 0.25s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0eaf7;
  flex-shrink: 0;
}
.form-title {
  font-size: 18px;
  font-weight: 700;
  color: #2B2233;
  display: flex;
  align-items: center;
  gap: 10px;
}
.form-title i { color: #A88BC8; }
.form-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f7f3fb;
  border-radius: 10px;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.form-close:hover { background: #DCCDEA; color: #8E6FB2; }

.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.form-section { margin-bottom: 24px; }

.section-label {
  font-size: 11px;
  font-weight: 700;
  color: #A88BC8;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
}

.section-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-label-row .section-label { margin-bottom: 0; }

.btn-add-slide {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 12px;
  background: #f0eaf7;
  color: #8E6FB2;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-add-slide:hover { background: #DCCDEA; }

/* Cover upload */
.cover-upload {
  position: relative;
  width: 120px;
  height: 160px;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
}
.cover-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-placeholder {
  width: 100%;
  height: 100%;
  background: #f7f3fb;
  border: 2px dashed #DCCDEA;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #A88BC8;
  font-size: 12px;
}
.cover-placeholder i { font-size: 28px; }
.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(43,34,51,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
  font-size: 20px;
}
.cover-upload:hover .cover-overlay { opacity: 1; }

.file-input { display: none; }
.upload-progress { font-size: 13px; color: #A88BC8; margin-top: 8px; display: flex; align-items: center; gap: 6px; }

/* Form grid */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full-width { grid-column: 1 / -1; }
.field label { font-size: 13px; font-weight: 600; color: #4b5563; }
.field input {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #2B2233;
  outline: none;
  background: #fff;
  transition: border-color 0.2s;
  font-family: inherit;
}
.field input:focus { border-color: #A88BC8; }

/* Toggle */
.toggle-label { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.toggle {
  width: 44px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 100px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle.on { background: #A88BC8; }
.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.toggle.on .toggle-thumb { transform: translateX(20px); }
.toggle-label span { font-size: 14px; color: #374151; font-weight: 500; }

/* Slides */
.slides-list { display: flex; flex-direction: column; gap: 10px; }

.slide-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: #f7f3fb;
  border-radius: 12px;
  border: 1px solid #f0eaf7;
}

.slide-num {
  width: 22px;
  height: 22px;
  background: #A88BC8;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.slide-photo {
  position: relative;
  width: 52px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}
.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.slide-placeholder {
  width: 100%;
  height: 100%;
  background: #fff;
  border: 1.5px dashed #DCCDEA;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #A88BC8;
  font-size: 16px;
}
.slide-photo:hover .slide-placeholder { background: #f0eaf7; }

.slide-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.slide-input {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #2B2233;
  background: #fff;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}
.slide-input:focus { border-color: #A88BC8; }

.btn-remove-slide {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  font-size: 12px;
  flex-shrink: 0;
  transition: all 0.15s;
}
.btn-remove-slide:hover { background: #fee2e2; color: #dc2626; }

.no-slides {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 13px;
  border: 1.5px dashed #e5e7eb;
  border-radius: 12px;
}

.form-error {
  padding: 12px 16px;
  background: #fee2e2;
  border-radius: 10px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  gap: 10px;
  padding-top: 8px;
}
.btn-cancel {
  flex: 1;
  height: 46px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  color: #6b7280;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.btn-cancel:hover { border-color: #A88BC8; color: #8E6FB2; }
.btn-save {
  flex: 2;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: #A88BC8;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
}
.btn-save:hover:not(:disabled) { background: #8E6FB2; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

@media (max-width: 540px) {
  .form-drawer { width: 100%; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>