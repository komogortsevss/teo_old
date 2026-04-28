<template>
  <div class="form-overlay" @click.self="$emit('close')">
    <div class="form-panel">
      <div class="form-header">
        <h2>{{ addon ? 'Редактирование' : 'Новый товар' }}</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-xmark"></i>
        </button>
      </div>

      <div class="form-body">
        <div class="form-field">
          <label class="form-label">
            Название <span class="req">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ error: v.name }"
            placeholder="Например: Ваза"
          />
          <span v-if="v.name" class="form-error">Введите название</span>
        </div>

        <div class="form-field">
          <label class="form-label">
            Тип товара <span class="req">*</span>
          </label>
          <div class="type-selector">
            <button
              type="button"
              class="type-btn"
              :class="{ active: form.type === 'regular' }"
              @click="form.type = 'regular'"
            >
              <i class="fas fa-box"></i>
              Обычный
            </button>
            <button
              type="button"
              class="type-btn"
              :class="{ active: form.type === 'vase' }"
              @click="form.type = 'vase'"
            >
              <i class="fas fa-wine-glass"></i>
              Ваза
            </button>
          </div>
          <span class="type-hint" v-if="form.type === 'vase'">
            Вазы привязываются к конкретному букету в корзине
          </span>
        </div>

        <div class="form-field">
          <label class="form-label">
            Цена <span class="req">*</span>
          </label>
          <input
            v-model.number="form.priceAmount"
            type="number"
            class="form-input"
            :class="{ error: v.priceAmount }"
            placeholder="890"
          />
          <span v-if="v.priceAmount" class="form-error">Введите цену</span>
        </div>

        <div class="form-field">
          <label class="form-label">
            Иконка FontAwesome <span class="req">*</span>
          </label>
          <input
            v-model="form.icon"
            type="text"
            class="form-input"
            :class="{ error: v.icon }"
            placeholder="fa-solid fa-wine-glass"
          />
          <span v-if="v.icon" class="form-error">Введите класс иконки</span>
          <div class="icon-preview">
            <i :class="form.icon || 'fa-solid fa-gift'"></i>
          </div>
        </div>

        <div class="form-field">
          <label class="form-label">Изображение</label>
          <div class="upload-area">
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              @change="handleFileUpload"
              style="display: none"
            />
            <button type="button" class="btn-upload" @click="$refs.fileInput.click()" :disabled="uploading">
              <i v-if="uploading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-cloud-upload-alt"></i>
              {{ uploadingStatus || (uploading ? 'Загрузка...' : 'Загрузить изображение') }}
            </button>
            <div v-if="form.imageHash" class="uploaded-preview">
              <img :src="`https://fs.chatium.ru/thumbnail/${form.imageHash}/s/200x200`" alt="Preview" />
              <button type="button" class="btn-remove-image" @click="form.imageHash = ''">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="form-field">
          <label class="form-label">Порядок сортировки</label>
          <input
            v-model.number="form.sortOrder"
            type="number"
            class="form-input"
            placeholder="0"
          />
        </div>

        <div class="form-field">
          <label class="toggle-label">
            <input type="checkbox" v-model="form.isActive" class="toggle-input" />
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
            Активен
          </label>
        </div>
      </div>

      <div class="form-footer">
        <button class="btn-cancel" @click="$emit('close')">
          Отмена
        </button>
        <button class="btn-save" @click="handleSave" :disabled="saving">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-check"></i>
          {{ saving ? 'Сохранение...' : 'Сохранить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { apiAdminAddonsCreateRoute } from '../../api/admin/addons/create'
import { apiAdminAddonsUpdateRoute } from '../../api/admin/addons/update'
import { apiAdminUploadUrlRoute } from '../../api/admin/upload-url'

const props = defineProps({
  addon: { type: Object, default: null }
})

const emit = defineEmits(['close', 'saved'])

const form = reactive({
  name: '',
  imageHash: '',
  priceAmount: 0,
  icon: 'fa-solid fa-gift',
  type: 'regular',
  sortOrder: 0,
  isActive: true
})

const v = reactive({
  name: false,
  priceAmount: false,
  icon: false
})

if (props.addon) {
  Object.assign(form, {
    name: props.addon.name,
    imageHash: props.addon.imageHash || '',
    priceAmount: props.addon.priceAmount,
    icon: props.addon.icon,
    type: props.addon.type || 'regular',
    sortOrder: props.addon.sortOrder || 0,
    isActive: props.addon.isActive !== false
  })
}

const saving = ref(false)
const uploading = ref(false)
const uploadingStatus = ref('')
const fileInput = ref(null)

function validate() {
  v.name = !form.name.trim()
  v.priceAmount = !form.priceAmount || form.priceAmount <= 0
  v.icon = !form.icon.trim()
  return !Object.values(v).some(Boolean)
}

async function handleSave() {
  if (!validate()) return

  saving.value = true
  try {
    if (props.addon) {
      await apiAdminAddonsUpdateRoute
        .query({ id: props.addon.id })
        .run(ctx, form)
    } else {
      await apiAdminAddonsCreateRoute.run(ctx, form)
    }
    emit('saved')
  } catch (e) {
    alert('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

async function handleFileUpload(event) {
  const file = event.target.files?.[0]
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
      xhr.onerror = () => reject(new Error('Upload network error'))
      xhr.send(data)
    })
    
    form.imageHash = hash
  } catch (e) {
    console.error('Upload error:', e)
    alert('Ошибка загрузки файла')
  } finally {
    uploading.value = false
    uploadingStatus.value = ''
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
  z-index: 10000;
}

.form-panel {
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  background: var(--color-white);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.15);
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--admin-bg-medium);
  flex-shrink: 0;
}

.form-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--admin-text-dark);
  margin: 0;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: var(--admin-bg-light);
  color: var(--admin-text-soft);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--admin-bg-medium);
  color: var(--admin-text-dark);
}

.form-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--admin-text-dark);
}

.req { color: var(--admin-danger); }

.form-input {
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1.5px solid var(--admin-bg-medium);
  font-size: 14px;
  color: var(--admin-text-dark);
  background: var(--color-white);
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus {
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.form-input.error { border-color: var(--admin-danger); }
.form-error { font-size: 12px; color: var(--admin-danger); }

.type-selector {
  display: flex;
  gap: 8px;
}

.type-btn {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  border: 1.5px solid var(--admin-bg-medium);
  background: var(--color-white);
  color: var(--admin-text-dark);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
}

.type-btn:hover {
  border-color: var(--admin-primary);
  background: var(--admin-bg-light);
}

.type-btn.active {
  border-color: var(--admin-primary);
  background: var(--admin-primary);
  color: var(--color-white);
}

.type-hint {
  font-size: 12px;
  color: var(--admin-text-soft);
  font-style: italic;
}

.icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--admin-bg-light);
  border-radius: 10px;
  font-size: 32px;
  color: var(--admin-primary);
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-upload {
  height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1.5px dashed var(--admin-bg-medium);
  background: var(--admin-bg-light);
  color: var(--admin-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
}

.btn-upload:hover:not(:disabled) {
  border-color: var(--admin-primary);
  background: rgba(0, 0, 0, 0.02);
}

.btn-upload:disabled { opacity: 0.6; cursor: not-allowed; }

.uploaded-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid var(--admin-bg-medium);
}

.uploaded-preview img { width: 100%; height: 100%; object-fit: cover; }

.btn-remove-image {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: rgba(0, 0, 0, 0.75);
  color: var(--color-white);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-image:hover { background: var(--admin-danger); }

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-text-dark);
  cursor: pointer;
  user-select: none;
  padding: 8px 0;
}

.toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }

.toggle-track {
  display: block;
  width: 48px;
  height: 26px;
  border-radius: 13px;
  background: var(--admin-bg-medium);
  transition: background 0.25s;
  position: relative;
}

.toggle-input:checked + .toggle-track { background: var(--admin-primary); }

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s;
}

.toggle-input:checked + .toggle-track .toggle-thumb {
  transform: translateX(22px);
}

.form-footer {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--admin-bg-medium);
  flex-shrink: 0;
}

.btn-cancel, .btn-save {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
}

.btn-cancel { background: var(--admin-bg-light); color: var(--admin-text-dark); }
.btn-cancel:hover { background: var(--admin-bg-medium); }
.btn-save { background: var(--admin-primary); color: var(--color-white); }
.btn-save:hover:not(:disabled) { background: var(--admin-primary-dark); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

@media (max-width: 600px) {
  .form-panel { width: 100vw; }
}
</style>