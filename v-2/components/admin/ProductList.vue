<template>
  <div class="product-list">
    <!-- Табы категорий -->
    <div class="category-tabs">
      <button
        class="cat-tab"
        :class="{ active: selectedCategory === '' }"
        @click="selectedCategory = ''"
      >Все</button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="cat-tab"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectedCategory = cat.id"
      >{{ cat.name }}</button>
    </div>

    <!-- Фильтры и поиск -->
    <div class="list-toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по названию..."
            class="search-input"
          />
        </div>
        <select v-model="availabilityFilter" class="availability-filter">
          <option value="">Все</option>
          <option value="available">В наличии</option>
          <option value="unavailable">Не в наличии</option>
        </select>
      </div>
      <div class="toolbar-right">
        <span class="products-count">{{ filteredProducts.length }} букетов</span>
        <button class="btn-add" @click="$emit('add')">
          <i class="fas fa-plus"></i>
          Добавить букет
        </button>
      </div>
    </div>

    <!-- Таблица -->
    <div class="table-wrapper">
      <table class="products-table">
        <thead>
          <tr>
            <th class="col-photo">Фото</th>
            <th class="col-name">Название</th>
            <th class="col-slug">URL (slug)</th>
            <th class="col-category">Категория</th>
            <th class="col-price">Цена</th>
            <th class="col-stems">Стеблей</th>
            <th class="col-sort">Порядок</th>
            <th class="col-status">Наличие</th>
            <th class="col-actions">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-row"
            :class="{ unavailable: !product.isAvailable }"
          >
            <!-- Фото -->
            <td class="col-photo">
              <div class="product-thumb">
                <img
                  v-if="product.imageHash"
                  :src="`https://fs.chatium.ru/thumbnail/${product.imageHash}/s/120x120`"
                  :alt="product.name"
                  class="thumb-img"
                />
                <div v-else class="thumb-placeholder">
                  <i class="fas fa-image"></i>
                </div>
              </div>
            </td>

            <!-- Название -->
            <td class="col-name">
              <div class="product-name">{{ product.name }}</div>
              <div v-if="product.description" class="product-desc">{{ truncate(product.description, 60) }}</div>
            </td>

            <!-- Slug -->
            <td class="col-slug">
              <div v-if="product.slug" class="product-slug">
                <code>/{{ product.categorySlug }}/{{ product.slug }}</code>
                <button 
                  class="btn-copy-link" 
                  @click="copyProductLink(product)"
                  :title="copiedId === product.id ? 'Скопировано!' : 'Копировать ссылку'"
                >
                  <i :class="copiedId === product.id ? 'fas fa-check' : 'fas fa-link'"></i>
                </button>
              </div>
              <div v-else class="slug-empty">—</div>
            </td>

            <!-- Категория — инлайн select -->
            <td class="col-category">
              <select
                class="inline-select"
                :value="product.categoryId"
                @change="e => quickUpdate(product, { categoryId: e.target.value })"
                :disabled="savingId === product.id"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </td>

            <!-- Цена — инлайн input -->
            <td class="col-price">
              <div v-if="editingCell?.id === product.id && editingCell?.field === 'price'" class="inline-edit-wrap">
                <input
                  type="number"
                  class="inline-input"
                  v-model="editValue"
                  @blur="saveEdit(product)"
                  @keyup.enter="saveEdit(product)"
                  @keyup.escape="cancelEdit"
                  ref="editInputRef"
                  min="0"
                />
              </div>
              <div v-else class="editable-cell" @click="startEdit(product, 'price', product.priceAmount)" title="Нажмите для редактирования">
                <span class="price-value">{{ product.price }}</span>
                <i class="fas fa-pen edit-hint"></i>
              </div>
            </td>

            <!-- Стеблей — инлайн input -->
            <td class="col-stems">
              <div v-if="editingCell?.id === product.id && editingCell?.field === 'stemsCount'" class="inline-edit-wrap">
                <input
                  type="number"
                  class="inline-input inline-input-sm"
                  v-model="editValue"
                  @blur="saveEdit(product)"
                  @keyup.enter="saveEdit(product)"
                  @keyup.escape="cancelEdit"
                  ref="editInputRef"
                  min="0"
                />
              </div>
              <div v-else class="editable-cell" @click="startEdit(product, 'stemsCount', product.stemsCount ?? '')" title="Нажмите для редактирования">
                <span v-if="product.stemsCount" class="stems-value">{{ product.stemsCount }}</span>
                <span v-else class="stems-empty">—</span>
                <i class="fas fa-pen edit-hint"></i>
              </div>
            </td>

            <!-- Порядок — инлайн input -->
            <td class="col-sort">
              <div v-if="editingCell?.id === product.id && editingCell?.field === 'sortOrder'" class="inline-edit-wrap">
                <input
                  type="number"
                  class="inline-input inline-input-sm"
                  v-model="editValue"
                  @blur="saveEdit(product)"
                  @keyup.enter="saveEdit(product)"
                  @keyup.escape="cancelEdit"
                  ref="editInputRef"
                />
              </div>
              <div v-else class="editable-cell" @click="startEdit(product, 'sortOrder', product.sortOrder)" title="Нажмите для редактирования">
                <span class="sort-value">{{ product.sortOrder }}</span>
                <i class="fas fa-pen edit-hint"></i>
              </div>
            </td>

            <!-- Наличие — toggle -->
            <td class="col-status">
              <label class="toggle-switch" :class="{ saving: savingId === product.id }">
                <input
                  type="checkbox"
                  :checked="product.isAvailable"
                  :disabled="savingId === product.id"
                  @change="e => quickUpdate(product, { isAvailable: e.target.checked })"
                />
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                <span class="toggle-label">{{ product.isAvailable ? 'В наличии' : 'Нет' }}</span>
              </label>
            </td>

            <!-- Действия -->
            <td class="col-actions">
              <div v-if="savingId === product.id" class="saving-spinner">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
              <template v-else>
                <button class="btn-edit" @click="$emit('edit', product)" title="Редактировать">
                  <i class="fas fa-pen"></i>
                </button>
                <button class="btn-delete" @click="confirmDelete(product)" title="Удалить">
                  <i class="fas fa-trash"></i>
                </button>
              </template>
            </td>
          </tr>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="9" class="empty-state">
              <i class="fas fa-seedling"></i>
              <p>Букеты не найдены</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Подтверждение удаления -->
    <div v-if="deleteTarget" class="delete-modal-overlay" @click.self="deleteTarget = null">
      <div class="delete-modal">
        <div class="delete-modal-icon">
          <i class="fas fa-trash"></i>
        </div>
        <h3>Удалить букет?</h3>
        <p>«{{ deleteTarget.name }}» будет удалён без возможности восстановления.</p>
        <div class="delete-modal-actions">
          <button class="btn-cancel" @click="deleteTarget = null">Отмена</button>
          <button class="btn-confirm-delete" @click="doDelete" :disabled="deleting">
            <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
            {{ deleting ? 'Удаление...' : 'Удалить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { apiAdminProductsDeleteRoute } from '../../api/admin/products/delete'
import { apiAdminProductsUpdateRoute } from '../../api/admin/products/update'
import { productSeoPageRoute } from '../../product-seo'

const props = defineProps({
  products: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
})

const emit = defineEmits(['add', 'edit', 'deleted', 'updated'])

const searchQuery = ref('')
const selectedCategory = ref('')
const availabilityFilter = ref('')
const deleteTarget = ref(null)
const deleting = ref(false)

const editingCell = ref(null) // { id, field }
const editValue = ref('')
const editInputRef = ref(null)
const savingId = ref(null)
const copiedId = ref(null)

const filteredProducts = computed(() => {
  let list = props.products
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  }
  if (selectedCategory.value) {
    list = list.filter(p => p.categoryId === selectedCategory.value)
  }
  if (availabilityFilter.value === 'available') {
    list = list.filter(p => p.isAvailable)
  } else if (availabilityFilter.value === 'unavailable') {
    list = list.filter(p => !p.isAvailable)
  }
  return list
})

function getCategoryName(categoryId) {
  const cat = props.categories.find(c => c.id === categoryId)
  return cat ? cat.name : '—'
}

function truncate(str, len) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

function startEdit(product, field, value) {
  editingCell.value = { id: product.id, field }
  editValue.value = value
  nextTick(() => {
    if (editInputRef.value) editInputRef.value.focus()
  })
}

function cancelEdit() {
  editingCell.value = null
  editValue.value = ''
}

async function saveEdit(product) {
  if (!editingCell.value) return
  const field = editingCell.value.field
  const changes = { [field]: editValue.value }
  editingCell.value = null
  await quickUpdate(product, changes)
}

async function quickUpdate(product, changes) {
  savingId.value = product.id
  try {
    const body = {
      name: product.name,
      description: product.description ?? '',
      categoryId: changes.categoryId ?? product.categoryId,
      priceAmount: changes.price !== undefined ? changes.price : product.priceAmount,
      imageHash: product.imageHash ?? '',
      imageHashes: product.imageHashes ?? [],
      stemsCount: changes.stemsCount !== undefined ? (changes.stemsCount || null) : product.stemsCount,
      isAvailable: changes.isAvailable !== undefined ? changes.isAvailable : product.isAvailable,
      sortOrder: changes.sortOrder !== undefined ? changes.sortOrder : product.sortOrder,
      flowers: product.flowers ?? [],
      composition: product.composition ?? [],
    }
    await apiAdminProductsUpdateRoute.query({ id: product.id }).run(ctx, body)
    emit('updated', {
      id: product.id,
      categoryId: body.categoryId,
      priceAmount: Number(body.priceAmount) || 0,
      price: new Intl.NumberFormat('ru-RU').format(Number(body.priceAmount) || 0) + ' ₽',
      stemsCount: body.stemsCount ? Number(body.stemsCount) : null,
      isAvailable: body.isAvailable,
      sortOrder: Number(body.sortOrder) || 0,
    })
  } catch (e) {
    alert('Ошибка сохранения: ' + e.message)
  } finally {
    savingId.value = null
  }
}

function confirmDelete(product) {
  deleteTarget.value = product
}

async function copyProductLink(product) {
  if (!product.slug || !product.categorySlug) {
    alert('У товара нет slug. Сохраните товар с заполненным URL.')
    return
  }
  
  const url = 'https://teo2you.chatium.ru' + productSeoPageRoute.query({ 
    category: product.categorySlug, 
    slug: product.slug 
  }).url()
  
  try {
    await navigator.clipboard.writeText(url)
    copiedId.value = product.id
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  } catch (err) {
    // Fallback для старых браузеров
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copiedId.value = product.id
    setTimeout(() => {
      copiedId.value = null
    }, 2000)
  }
}

async function doDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await apiAdminProductsDeleteRoute.query({ id: deleteTarget.value.id }).run(ctx, {})
    emit('deleted', deleteTarget.value.id)
    deleteTarget.value = null
  } catch (e) {
    alert('Ошибка удаления: ' + e.message)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.product-list { display: flex; flex-direction: column; gap: 16px; }

/* Category tabs */
.category-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.cat-tab {
  height: 36px;
  padding: 0 16px;
  border: 1.5px solid var(--admin-border);
  border-radius: 999px;
  background: var(--color-white);
  color: var(--admin-text-medium);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, color 0.18s;
  white-space: nowrap;
}
.cat-tab:hover { border-color: var(--admin-primary); color: var(--admin-primary); }
.cat-tab.active {
  border-color: var(--admin-primary);
  background: var(--admin-primary);
  color: var(--color-white);
  font-weight: 600;
}

.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; gap: 12px; }

.search-box { position: relative; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--admin-text-light); font-size: 13px; }
.search-input {
  height: 38px;
  padding: 0 12px 0 34px;
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  font-size: 14px;
  background: var(--color-white);
  color: var(--admin-text-dark);
  outline: none;
  width: 220px;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: var(--admin-primary); }

.category-filter, .availability-filter {
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  font-size: 14px;
  background: var(--color-white);
  color: var(--admin-text-dark);
  outline: none;
  cursor: pointer;
}

.products-count { font-size: 13px; color: var(--admin-text-soft); }

.btn-add {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 38px;
  padding: 0 18px;
  background: var(--admin-primary);
  color: var(--color-white);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-add:hover { background: var(--admin-primary-dark); }

.table-wrapper {
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid var(--admin-bg-medium);
  overflow-x: auto;
  box-shadow: 0 2px 12px rgba(43,34,51,0.06);
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}
.products-table thead tr {
  border-bottom: 2px solid var(--admin-bg-light);
}
.products-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--admin-text-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
.products-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--admin-bg-light);
  vertical-align: middle;
}
.product-row:last-child td { border-bottom: none; }
.product-row.unavailable { opacity: 0.55; }
.product-row:hover td { background: #faf7fd; }

.col-photo { width: 70px; }
.product-thumb { width: 56px; height: 56px; border-radius: 10px; overflow: hidden; background: var(--admin-bg-light); flex-shrink: 0; }
.thumb-img { width: 100%; height: 100%; object-fit: cover; }
.thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #c4b5d9; font-size: 18px; }

.product-name { font-size: 14px; font-weight: 600; color: var(--admin-text-dark); line-height: 1.3; }
.product-desc { font-size: 12px; color: var(--admin-text-light); margin-top: 2px; line-height: 1.3; }

/* Slug column */
.col-slug { min-width: 140px; }
.product-slug {
  display: flex;
  align-items: center;
  gap: 8px;
}
.product-slug code {
  font-size: 12px;
  color: var(--admin-text-soft);
  background: var(--admin-bg-light);
  padding: 4px 8px;
  border-radius: 6px;
  font-family: monospace;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.slug-empty { color: var(--admin-text-light); font-size: 13px; }
.btn-copy-link {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: var(--admin-bg-light);
  color: var(--admin-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}
.btn-copy-link:hover { background: var(--admin-primary); color: var(--color-white); }
.btn-copy-link .fa-check { color: var(--admin-success); }

/* Inline select (category) */
.inline-select {
  height: 32px;
  padding: 0 8px;
  border: 1.5px solid var(--admin-primary);
  border-radius: 8px;
  font-size: 13px;
  color: var(--admin-text-dark);
  background: #faf7fd;
  outline: none;
  cursor: pointer;
  max-width: 140px;
}
.inline-select:focus { border-color: var(--admin-primary-dark); }
.inline-select:disabled { opacity: 0.5; cursor: not-allowed; }

/* Editable cells */
.editable-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  border-radius: 6px;
  padding: 2px 4px;
  transition: background 0.15s;
  width: fit-content;
}
.editable-cell:hover { background: var(--admin-bg-medium); }
.edit-hint {
  font-size: 10px;
  color: #c4b5d9;
  opacity: 0;
  transition: opacity 0.15s;
}
.editable-cell:hover .edit-hint { opacity: 1; }

.inline-edit-wrap { display: flex; align-items: center; }
.inline-input {
  width: 90px;
  height: 32px;
  padding: 0 8px;
  border: 1.5px solid var(--admin-primary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-dark);
  background: #faf7fd;
  outline: none;
}
.inline-input-sm { width: 64px; }
.inline-input:focus { border-color: var(--admin-primary-dark); }

.price-value { font-size: 14px; font-weight: 600; color: var(--admin-text-dark); white-space: nowrap; }
.stems-value { font-size: 14px; color: var(--admin-text-dark); }
.stems-empty { color: #d1d5db; }
.sort-value { font-size: 13px; color: var(--admin-text-soft); }

/* Toggle switch */
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.toggle-switch.saving { opacity: 0.5; pointer-events: none; }
.toggle-switch input { display: none; }

.toggle-track {
  position: relative;
  width: 36px;
  height: 20px;
  background: var(--admin-border);
  border-radius: 999px;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-switch input:checked + .toggle-track { background: var(--admin-primary); }

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: var(--color-white);
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  transition: left 0.2s;
}
.toggle-switch input:checked + .toggle-track .toggle-thumb { left: 18px; }

.toggle-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--admin-text-soft);
  white-space: nowrap;
}
.toggle-switch input:checked ~ .toggle-label { color: var(--admin-success); }

/* Actions */
.col-actions { width: 90px; }
.saving-spinner { width: 70px; display: flex; align-items: center; justify-content: center; color: var(--admin-primary); font-size: 16px; }

.btn-edit, .btn-delete {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  font-size: 13px;
}
.btn-edit { background: var(--admin-bg-medium); color: var(--admin-primary-dark); margin-right: 4px; }
.btn-edit:hover { background: var(--admin-primary); color: var(--color-white); }
.btn-delete { background: #fee2e2; color: var(--admin-danger); }
.btn-delete:hover { background: var(--admin-danger); color: var(--color-white); }

.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: var(--admin-text-light);
}
.empty-state i { font-size: 32px; margin-bottom: 12px; display: block; }
.empty-state p { font-size: 14px; margin: 0; }

/* Delete modal */
.delete-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(43,34,51,0.4);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.delete-modal {
  background: var(--color-white);
  border-radius: 20px;
  padding: 32px;
  max-width: 380px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(43,34,51,0.2);
}
.delete-modal-icon {
  width: 56px;
  height: 56px;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 22px;
  color: var(--admin-danger);
}
.delete-modal h3 { font-size: 18px; font-weight: 700; color: var(--admin-text-dark); margin: 0 0 8px; }
.delete-modal p { font-size: 14px; color: var(--admin-text-soft); margin: 0 0 24px; }
.delete-modal-actions { display: flex; gap: 10px; }
.btn-cancel {
  flex: 1;
  height: 44px;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--color-white);
  color: var(--admin-text-soft);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s;
}
.btn-cancel:hover { border-color: var(--admin-primary); color: var(--admin-primary); }
.btn-confirm-delete {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 12px;
  background: var(--admin-danger);
  color: var(--color-white);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.btn-confirm-delete:hover:not(:disabled) { background: #b91c1c; }
.btn-confirm-delete:disabled { opacity: 0.7; cursor: not-allowed; }
</style>