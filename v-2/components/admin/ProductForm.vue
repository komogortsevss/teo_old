<template>
  <div class="form-overlay" @click.self="$emit('close')">
    <div class="form-drawer">
      <div class="form-header">
        <div class="form-title">
          <i :class="isEdit ? 'fas fa-pen' : 'fas fa-plus'"></i>
          {{ isEdit ? 'Редактировать букет' : 'Новый букет' }}
        </div>
        <button class="form-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="form-body">
        <form @submit.prevent="submit">
          <!-- Фото -->
          <div class="form-section">
            <div class="section-label">Фотографии</div>
            <div class="photos-row">
              <div class="photo-slot main-photo" @click="triggerMainUpload">
                <img
                  v-if="form.imageHash"
                  :src="`https://fs.chatium.ru/thumbnail/${form.imageHash}/s/200x200`"
                  class="photo-preview"
                />
                <div v-else class="photo-placeholder">
                  <i class="fas fa-camera"></i>
                  <span>Главное</span>
                </div>
                <div v-if="form.imageHash" class="photo-overlay">
                  <i class="fas fa-camera"></i>
                </div>
                <span class="photo-badge">Гл.</span>
                <input ref="mainInput" type="file" accept="image/*" class="file-input" @change="uploadMain" />
              </div>

              <div
                v-for="(hash, idx) in additionalHashes"
                :key="idx"
                class="photo-slot extra-photo"
              >
                <img :src="`https://fs.chatium.ru/thumbnail/${hash}/s/200x200`" class="photo-preview" />
                <button type="button" class="photo-remove" @click.stop="removeExtra(idx)">
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="photo-slot add-photo" @click="triggerExtraUpload">
                <i class="fas fa-plus"></i>
                <span>Добавить</span>
                <input ref="extraInput" type="file" accept="image/*" class="file-input" @change="uploadExtra" />
              </div>
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
                <label>Название *</label>
                <input 
                  v-model="form.name" 
                  type="text" 
                  required 
                  placeholder="Например: Роза 11 стеблей"
                  @blur="generateSlugIfEmpty"
                />
              </div>
              <div class="field full-width">
                <label>
                  URL-адрес (slug) 
                  <span class="hint">— для ЧПУ ссылки</span>
                </label>
                <div class="slug-field">
                  <input 
                    v-model="form.slug" 
                    type="text" 
                    placeholder="roza-11-stebley"
                    pattern="[a-z0-9-]+"
                    title="Только маленькие латинские буквы, цифры и дефисы"
                  />
                  <button type="button" class="btn-generate-slug" @click="generateSlug" title="Сгенерировать из названия">
                    <i class="fas fa-magic"></i>
                  </button>
                </div>
                <div v-if="form.slug" class="slug-preview">
                  /catalog/{{ getCategorySlug() }}/{{ form.slug }}
                </div>
              </div>
              <div class="field full-width">
                <label>Описание</label>
                <textarea v-model="form.description" rows="2" placeholder="Краткое описание букета"></textarea>
              </div>
              <div class="field">
                <label>Категория *</label>
                <select v-model="form.categoryId" required @change="onCategoryChange">
                  <option value="">Выберите...</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="field">
                <label>Цена (₽) *</label>
                <input v-model.number="form.priceAmount" type="number" min="0" step="1" required placeholder="990" />
              </div>
              <div class="field">
                <label>Кол-во стеблей <span class="hint">(только для моно)</span></label>
                <input v-model.number="form.stemsCount" type="number" min="1" placeholder="11" />
              </div>
              <div class="field">
                <label>Порядок сортировки</label>
                <input v-model.number="form.sortOrder" type="number" min="0" step="1" placeholder="0" />
              </div>
            </div>
          </div>

          <!-- Состав букета -->
          <div class="form-section">
            <div class="section-label">Состав букета (количество)</div>
            <div class="composition-editor">
              <div v-for="(item, idx) in form.composition" :key="idx" class="composition-row">
                <select v-model="item.flowerId" class="flower-select">
                  <option value="">Выберите цветок...</option>
                  <option v-for="flower in availableFlowers" :key="flower.id" :value="flower.id">
                    {{ flower.name }}
                  </option>
                </select>
                <input 
                  v-model.number="item.quantity" 
                  type="number" 
                  min="1" 
                  placeholder="Количество"
                  class="quantity-input"
                />
                <button type="button" @click="removeCompositionItem(idx)" class="btn-remove-item">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <button type="button" @click="addCompositionItem" class="btn-add-item">
                <i class="fas fa-plus"></i>
                Добавить цветок
              </button>
            </div>
          </div>

          <!-- Доступные доп. товары -->
          <div class="form-section">
            <div class="section-label">Доступные доп. товары</div>
            <div v-if="allAddons.length === 0" class="no-addons-hint">
              Нет доп. товаров. Создайте их в разделе «Доп. товары».
            </div>
            <div v-else class="addons-checkboxes">
              <!-- Regular addons — simple checkboxes -->
              <template v-for="addon in regularAddons" :key="addon.id">
                <label
                  class="addon-checkbox-label"
                  :class="{ checked: isAddonSelected(addon.id) }"
                >
                  <input
                    type="checkbox"
                    :checked="isAddonSelected(addon.id)"
                    @change="toggleRegularAddon(addon.id)"
                    class="addon-checkbox-input"
                  />
                  <div class="addon-checkbox-img">
                    <img
                      v-if="addon.imageHash"
                      :src="`https://fs.chatium.ru/thumbnail/${addon.imageHash}/s/60x60`"
                      :alt="addon.name"
                    />
                    <i v-else :class="addon.icon" class="addon-checkbox-icon"></i>
                  </div>
                  <div class="addon-checkbox-info">
                    <span class="addon-checkbox-name">{{ addon.name }}</span>
                    <span class="addon-checkbox-meta">
                      {{ addon.priceAmount?.toLocaleString('ru-RU') }} ₽
                      <span class="addon-type-badge regular">Обычный</span>
                    </span>
                  </div>
                  <div class="addon-checkbox-mark">
                    <i v-if="isAddonSelected(addon.id)" class="fas fa-check-circle"></i>
                    <i v-else class="far fa-circle"></i>
                  </div>
                </label>
              </template>

              <!-- Vase addons — with rules -->
              <template v-for="addon in vaseAddons" :key="addon.id">
                <div class="vase-addon-block">
                  <label
                    class="addon-checkbox-label"
                    :class="{ checked: isAddonSelected(addon.id) }"
                  >
                    <input
                      type="checkbox"
                      :checked="isAddonSelected(addon.id)"
                      @change="toggleVaseAddon(addon.id)"
                      class="addon-checkbox-input"
                    />
                    <div class="addon-checkbox-img">
                      <img
                        v-if="addon.imageHash"
                        :src="`https://fs.chatium.ru/thumbnail/${addon.imageHash}/s/60x60`"
                        :alt="addon.name"
                      />
                      <i v-else :class="addon.icon" class="addon-checkbox-icon"></i>
                    </div>
                    <div class="addon-checkbox-info">
                      <span class="addon-checkbox-name">{{ addon.name }}</span>
                      <span class="addon-checkbox-meta">
                        {{ addon.priceAmount?.toLocaleString('ru-RU') }} ₽
                        <span class="addon-type-badge vase">Ваза</span>
                      </span>
                    </div>
                    <div class="addon-checkbox-mark">
                      <i v-if="isAddonSelected(addon.id)" class="fas fa-check-circle"></i>
                      <i v-else class="far fa-circle"></i>
                    </div>
                  </label>

                  <!-- Vase rules -->
                  <div v-if="isAddonSelected(addon.id)" class="vase-rules">
                    <div class="vase-rules-header">
                      <span class="vase-rules-title">Правила по количеству стеблей</span>
                    </div>
                    <div
                      v-for="(rule, rIdx) in getVaseRules(addon.id)"
                      :key="rIdx"
                      class="vase-rule-row"
                    >
                      <div class="rule-field">
                        <span class="rule-label">От</span>
                        <input
                          type="number"
                          min="1"
                          :value="rule.minStems"
                          @input="updateVaseRule(addon.id, rIdx, 'minStems', +$event.target.value)"
                          class="rule-input"
                          placeholder="1"
                        />
                      </div>
                      <div class="rule-field">
                        <span class="rule-label">До</span>
                        <input
                          type="number"
                          min="1"
                          :value="rule.maxStems"
                          @input="updateVaseRule(addon.id, rIdx, 'maxStems', $event.target.value ? +$event.target.value : null)"
                          class="rule-input"
                          placeholder="∞"
                        />
                      </div>
                      <div class="rule-field">
                        <span class="rule-label">Кол-во</span>
                        <input
                          type="number"
                          min="1"
                          :value="rule.quantity"
                          @input="updateVaseRule(addon.id, rIdx, 'quantity', +$event.target.value)"
                          class="rule-input"
                          placeholder="1"
                        />
                      </div>
                      <button type="button" class="btn-remove-rule" @click="removeVaseRule(addon.id, rIdx)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                    <button type="button" class="btn-add-rule" @click="addVaseRule(addon.id)">
                      <i class="fas fa-plus"></i> Добавить диапазон
                    </button>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Статус -->
          <div class="form-section">
            <div class="section-label">Статус</div>
            <label class="toggle-label">
              <div class="toggle" :class="{ on: form.isAvailable }" @click="form.isAvailable = !form.isAvailable">
                <div class="toggle-thumb"></div>
              </div>
              <span>{{ form.isAvailable ? 'В наличии' : 'Не в наличии' }}</span>
            </label>
          </div>

          <div v-if="error" class="form-error">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>

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
import { ref, computed, watch, onMounted } from 'vue'
import { apiAdminProductsCreateRoute } from '../../api/admin/products/create'
import { apiAdminProductsUpdateRoute } from '../../api/admin/products/update'
import { apiAdminFlowersListRoute } from '../../api/admin/flowers/list'
import { apiAdminAddonsListRoute } from '../../api/admin/addons/list'
import { apiAdminUploadUrlRoute } from '../../api/admin/upload-url'

const props = defineProps({
  product: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.product?.id)

const availableFlowers = ref([])
const allAddons = ref([])

const regularAddons = computed(() => allAddons.value.filter(a => a.type !== 'vase'))
const vaseAddons = computed(() => allAddons.value.filter(a => a.type === 'vase'))

const getDefaultForm = () => ({
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  priceAmount: 0,
  imageHash: '',
  imageHashes: [],
  stemsCount: null,
  isAvailable: true,
  sortOrder: 0,
  flowers: [],
  composition: [],
  availableAddons: [],
})

const form = ref(getDefaultForm())

onMounted(async () => {
  try {
    const [flowers, addons] = await Promise.all([
      apiAdminFlowersListRoute.run(ctx),
      apiAdminAddonsListRoute.run(ctx),
    ])
    availableFlowers.value = flowers
    allAddons.value = addons
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
})

watch(() => props.product, (p) => {
  if (p) {
    // Генерируем slug если пустой (для старых товаров)
    let slug = p.slug ?? ''
    if (!slug && p.name) {
      slug = transliterate(p.name)
    }
    form.value = {
      name: p.name ?? '',
      slug: slug,
      description: p.description ?? '',
      categoryId: p.categoryId ?? '',
      priceAmount: p.priceAmount ?? 0,
      imageHash: p.imageHash ?? '',
      imageHashes: [...(p.imageHashes ?? [])],
      stemsCount: p.stemsCount ?? null,
      isAvailable: p.isAvailable ?? true,
      sortOrder: p.sortOrder ?? 0,
      flowers: [...(p.flowers ?? [])],
      composition: [...(p.composition ?? [])],
      availableAddons: [...(p.availableAddons ?? [])],
    }
  } else {
    form.value = getDefaultForm()
  }
}, { immediate: true })

const additionalHashes = computed(() => {
  const all = form.value.imageHashes ?? []
  return all.filter(h => h && h !== form.value.imageHash)
})

const mainInput = ref(null)
const extraInput = ref(null)
const uploading = ref(false)
const uploadingStatus = ref('')
const saving = ref(false)
const error = ref('')

function addCompositionItem() {
  form.value.composition.push({ flowerId: '', quantity: 1 })
}

function removeCompositionItem(idx) {
  form.value.composition.splice(idx, 1)
}

// --- Addon helpers ---
function isAddonSelected(addonId) {
  return form.value.availableAddons.some(a => {
    if (typeof a === 'string') return a === addonId
    return a.addonId === addonId
  })
}

function toggleRegularAddon(addonId) {
  if (isAddonSelected(addonId)) {
    form.value.availableAddons = form.value.availableAddons.filter(a => {
      if (typeof a === 'string') return a !== addonId
      return a.addonId !== addonId
    })
  } else {
    form.value.availableAddons.push({ addonId })
  }
}

function toggleVaseAddon(addonId) {
  if (isAddonSelected(addonId)) {
    form.value.availableAddons = form.value.availableAddons.filter(a => {
      if (typeof a === 'string') return a !== addonId
      return a.addonId !== addonId
    })
  } else {
    form.value.availableAddons.push({ addonId, minStems: 1, maxStems: null, quantity: 1 })
  }
}

function getVaseRules(addonId) {
  return form.value.availableAddons.filter(a => {
    if (typeof a === 'string') return false
    return a.addonId === addonId
  })
}

function updateVaseRule(addonId, ruleIdx, field, value) {
  let count = 0
  for (let i = 0; i < form.value.availableAddons.length; i++) {
    const a = form.value.availableAddons[i]
    if (typeof a === 'object' && a.addonId === addonId) {
      if (count === ruleIdx) {
        form.value.availableAddons[i] = { ...a, [field]: value }
        return
      }
      count++
    }
  }
}

function addVaseRule(addonId) {
  const existing = getVaseRules(addonId)
  const lastMax = existing.length > 0 ? (existing[existing.length - 1].maxStems || 0) : 0
  form.value.availableAddons.push({
    addonId,
    minStems: lastMax + 1,
    maxStems: null,
    quantity: 1,
  })
}

function removeVaseRule(addonId, ruleIdx) {
  let count = 0
  for (let i = 0; i < form.value.availableAddons.length; i++) {
    const a = form.value.availableAddons[i]
    if (typeof a === 'object' && a.addonId === addonId) {
      if (count === ruleIdx) {
        form.value.availableAddons.splice(i, 1)
        if (!isAddonSelected(addonId)) {
          // Last rule removed — addon is now deselected
        }
        return
      }
      count++
    }
  }
}

function triggerMainUpload() { mainInput.value?.click() }
function triggerExtraUpload() { extraInput.value?.click() }

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

async function uploadMain(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  uploadingStatus.value = ''
  try {
    const hash = await uploadFile(file)
    form.value.imageHash = hash
    if (!form.value.imageHashes.includes(hash)) {
      form.value.imageHashes = [hash, ...form.value.imageHashes]
    }
  } catch (err) {
    console.error('Upload error:', err)
    error.value = 'Ошибка загрузки фото'
  } finally {
    uploading.value = false
    uploadingStatus.value = ''
  }
  e.target.value = ''
}

async function uploadExtra(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  uploadingStatus.value = ''
  try {
    const hash = await uploadFile(file)
    if (!form.value.imageHashes.includes(hash)) {
      form.value.imageHashes = [...form.value.imageHashes, hash]
    }
  } catch (err) {
    console.error('Upload error:', err)
    error.value = 'Ошибка загрузки фото'
  } finally {
    uploading.value = false
    uploadingStatus.value = ''
  }
  e.target.value = ''
}

function removeExtra(idx) {
  const toRemove = additionalHashes.value[idx]
  form.value.imageHashes = form.value.imageHashes.filter(h => h !== toRemove)
}

function transliterate(text) {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-', '_': '-', '/': '-', '\\': '-'
  }
  return text.toLowerCase()
    .split('')
    .map(char => map[char] || char)
    .join('')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateSlug() {
  if (form.value.name) {
    form.value.slug = transliterate(form.value.name)
  }
}

function generateSlugIfEmpty() {
  if (!form.value.slug && form.value.name) {
    form.value.slug = transliterate(form.value.name)
  }
}

function getCategorySlug() {
  const cat = props.categories.find(c => c.id === form.value.categoryId)
  return cat?.slug || 'category'
}

function onCategoryChange() {
  // Можно добавить логику при смене категории
}

async function submit() {
  error.value = ''
  saving.value = true
  try {
    // Генерируем slug если пустой
    if (!form.value.slug && form.value.name) {
      form.value.slug = transliterate(form.value.name)
    }
    
    const payload = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description,
      categoryId: form.value.categoryId,
      priceAmount: form.value.priceAmount,
      imageHash: form.value.imageHash,
      imageHashes: form.value.imageHashes,
      stemsCount: form.value.stemsCount || null,
      isAvailable: form.value.isAvailable,
      sortOrder: form.value.sortOrder ?? 0,
      flowers: form.value.flowers,
      composition: form.value.composition.filter(item => item.flowerId && item.quantity > 0),
      availableAddons: form.value.availableAddons,
    }
    if (isEdit.value) {
      await apiAdminProductsUpdateRoute.query({ id: props.product.id }).run(ctx, payload)
    } else {
      await apiAdminProductsCreateRoute.run(ctx, payload)
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
  width: 560px;
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
  transition: background 0.2s;
  font-size: 14px;
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
.photos-row { display: flex; gap: 10px; flex-wrap: wrap; }
.photo-slot { position: relative; width: 80px; height: 80px; border-radius: 12px; overflow: hidden; cursor: pointer; flex-shrink: 0; }
.main-photo { width: 90px; height: 90px; }
.photo-preview { width: 100%; height: 100%; object-fit: cover; }
.photo-placeholder {
  width: 100%; height: 100%;
  background: #f7f3fb; border: 2px dashed #DCCDEA; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  color: #A88BC8; font-size: 11px;
}
.photo-placeholder i { font-size: 18px; }
.photo-overlay {
  position: absolute; inset: 0; background: rgba(43,34,51,0.45);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s; color: #fff; font-size: 16px;
}
.photo-slot:hover .photo-overlay { opacity: 1; }
.photo-badge {
  position: absolute; bottom: 4px; left: 4px;
  background: rgba(168,139,200,0.9); color: #fff;
  font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 4px;
}
.photo-remove {
  position: absolute; top: 4px; right: 4px;
  width: 20px; height: 20px; border: none;
  background: rgba(220,38,38,0.85); color: #fff; border-radius: 50%;
  font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.add-photo {
  background: #f7f3fb; border: 2px dashed #DCCDEA; border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  color: #A88BC8; font-size: 11px; transition: border-color 0.2s, background 0.2s;
}
.add-photo:hover { background: #f0eaf7; border-color: #A88BC8; }
.add-photo i { font-size: 16px; }
.file-input { display: none; }
.upload-progress { font-size: 13px; color: #A88BC8; margin-top: 8px; display: flex; align-items: center; gap: 6px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full-width { grid-column: 1 / -1; }
.field label { font-size: 13px; font-weight: 600; color: #4b5563; }
.hint { font-weight: 400; color: #9ca3af; }
.field input, .field select, .field textarea {
  height: 40px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 10px;
  font-size: 14px; color: #2B2233; outline: none; background: #fff;
  transition: border-color 0.2s; font-family: inherit;
}
.field textarea { height: auto; padding: 10px 12px; resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #A88BC8; }
.composition-editor { display: flex; flex-direction: column; gap: 8px; }
.composition-row { display: flex; gap: 8px; align-items: center; }
.flower-select {
  flex: 2; height: 40px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 10px;
  font-size: 14px; color: #2B2233; outline: none; background: #fff; transition: border-color 0.2s;
}
.flower-select:focus { border-color: #A88BC8; }
.quantity-input {
  flex: 1; height: 40px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 10px;
  font-size: 14px; color: #2B2233; outline: none; background: #fff; transition: border-color 0.2s;
}
.quantity-input:focus { border-color: #A88BC8; }
.btn-remove-item {
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  border: none; background: #ffebee; color: #d32f2f; border-radius: 10px; cursor: pointer;
  transition: all 0.2s; flex-shrink: 0;
}
.btn-remove-item:hover { background: #ffcdd2; }
.btn-add-item {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 16px; border: 2px dashed #DCCDEA; background: #f7f3fb; color: #A88BC8;
  border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600;
  transition: all 0.2s; margin-top: 4px;
}
.btn-add-item:hover { background: #f0eaf7; border-color: #A88BC8; }

/* Addons checkboxes */
.no-addons-hint { font-size: 13px; color: #9ca3af; font-style: italic; }
.addons-checkboxes { display: flex; flex-direction: column; gap: 8px; }
.addon-checkbox-label {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 12px;
  cursor: pointer; transition: all 0.2s; background: #fff;
}
.addon-checkbox-label:hover { border-color: #A88BC8; background: #f7f3fb; }
.addon-checkbox-label.checked { border-color: #A88BC8; background: #f7f3fb; }
.addon-checkbox-input { position: absolute; opacity: 0; width: 0; height: 0; }
.addon-checkbox-img {
  width: 40px; height: 40px; border-radius: 10px; overflow: hidden; flex-shrink: 0;
  background: #f7f3fb; display: flex; align-items: center; justify-content: center;
}
.addon-checkbox-img img { width: 100%; height: 100%; object-fit: cover; }
.addon-checkbox-icon { font-size: 18px; color: #A88BC8; }
.addon-checkbox-info { flex: 1; min-width: 0; }
.addon-checkbox-name { display: block; font-size: 14px; font-weight: 600; color: #2B2233; }
.addon-checkbox-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #6b7280; margin-top: 2px; }
.addon-type-badge {
  padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.addon-type-badge.vase { background: #ede9fe; color: #7c3aed; }
.addon-type-badge.regular { background: #ecfdf5; color: #059669; }
.addon-checkbox-mark { font-size: 18px; color: #d1d5db; flex-shrink: 0; }
.addon-checkbox-label.checked .addon-checkbox-mark { color: #A88BC8; }

/* Vase rules */
.vase-addon-block { display: flex; flex-direction: column; gap: 0; }
.vase-rules {
  margin-top: -4px;
  margin-left: 16px;
  padding: 12px 14px;
  background: #f7f3fb;
  border: 1.5px solid #DCCDEA;
  border-top: none;
  border-radius: 0 0 12px 12px;
}
.vase-rules-header { margin-bottom: 8px; }
.vase-rules-title { font-size: 11px; font-weight: 700; color: #A88BC8; text-transform: uppercase; letter-spacing: 0.5px; }
.vase-rule-row {
  display: flex; gap: 6px; align-items: center; margin-bottom: 6px;
}
.rule-field { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.rule-label { font-size: 10px; font-weight: 600; color: #6b7280; }
.rule-input {
  height: 34px; padding: 0 8px; border: 1px solid #DCCDEA; border-radius: 8px;
  font-size: 13px; color: #2B2233; outline: none; background: #fff;
  transition: border-color 0.2s; width: 100%; font-family: inherit;
}
.rule-input:focus { border-color: #A88BC8; }
.btn-remove-rule {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  border: none; background: #ffebee; color: #d32f2f; border-radius: 8px; cursor: pointer;
  font-size: 12px; flex-shrink: 0; margin-top: 14px; transition: all 0.2s;
}
.btn-remove-rule:hover { background: #ffcdd2; }
.btn-add-rule {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 7px 12px; border: 1.5px dashed #DCCDEA; background: transparent; color: #A88BC8;
  border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
  transition: all 0.2s; margin-top: 4px;
}
.btn-add-rule:hover { background: #f0eaf7; border-color: #A88BC8; }

.toggle-label { display: flex; align-items: center; gap: 12px; cursor: pointer; }
.toggle {
  width: 44px; height: 24px; background: #e5e7eb; border-radius: 100px;
  position: relative; transition: background 0.2s; flex-shrink: 0;
}
.toggle.on { background: #A88BC8; }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
  background: #fff; border-radius: 50%; transition: transform 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.toggle.on .toggle-thumb { transform: translateX(20px); }
.toggle-label span { font-size: 14px; color: #374151; font-weight: 500; }

.form-error {
  padding: 12px 16px; background: #fee2e2; border-radius: 10px; color: #dc2626;
  font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
}
.form-actions { display: flex; gap: 10px; padding-top: 8px; }
.btn-cancel {
  flex: 1; height: 46px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;
  color: #6b7280; font-size: 15px; font-weight: 600; cursor: pointer;
}
.btn-cancel:hover { border-color: #A88BC8; color: #8E6FB2; }
.btn-save {
  flex: 2; height: 46px; border: none; border-radius: 12px; background: #A88BC8; color: #fff;
  font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center;
  justify-content: center; gap: 8px; transition: background 0.2s;
}
.btn-save:hover:not(:disabled) { background: #8E6FB2; }
.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

/* Slug field styles */
.slug-field {
  display: flex;
  gap: 8px;
}
.slug-field input {
  flex: 1;
}
.btn-generate-slug {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f7f3fb;
  color: #A88BC8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.btn-generate-slug:hover {
  background: #A88BC8;
  color: #fff;
  border-color: #A88BC8;
}
.slug-preview {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
  padding: 6px 10px;
  background: #f7f3fb;
  border-radius: 8px;
  font-family: monospace;
}

@media (max-width: 540px) {
  .form-drawer { width: 100%; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>