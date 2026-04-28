<template>
  <div class="flowers-list">
    <div class="flowers-header">
      <h2>Справочник цветов</h2>
      <button @click="openCreateForm" class="btn-create">
        <i class="fas fa-plus"></i>
        Добавить цветок
      </button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    
    <div v-else class="flowers-grid">
      <div v-for="flower in flowers" :key="flower.id" class="flower-card">
        <div class="flower-info">
          <h3>{{ flower.name }}</h3>
          <p class="flower-slug">{{ flower.slug }}</p>
        </div>
        <div class="flower-actions">
          <button @click="editFlower(flower)" class="btn-edit" title="Редактировать">
            <i class="fas fa-edit"></i>
          </button>
          <button @click="deleteFlower(flower)" class="btn-delete" title="Удалить">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading && flowers.length === 0" class="empty-state">
      <p>Цветов пока нет. Добавьте первый цветок.</p>
    </div>

    <!-- Drawer с формой -->
    <div v-if="showForm" class="drawer-overlay" @click="closeForm">
      <div class="drawer" @click.stop>
        <div class="drawer-header">
          <h3>{{ editingFlower ? 'Редактировать цветок' : 'Новый цветок' }}</h3>
          <button @click="closeForm" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="drawer-content">
          <div class="form-group">
            <label>Название цветка *</label>
            <input v-model="form.name" type="text" placeholder="Например: Роза" />
          </div>

          <div class="form-group">
            <label>Slug (идентификатор) *</label>
            <input v-model="form.slug" type="text" placeholder="Например: rose" />
            <small>Латиницей, без пробелов</small>
          </div>

          <div class="form-group">
            <label>Порядок сортировки</label>
            <input v-model.number="form.sortOrder" type="number" placeholder="0" />
          </div>
        </div>

        <div class="drawer-footer">
          <button @click="closeForm" class="btn-cancel">Отмена</button>
          <button @click="saveFlower" class="btn-save" :disabled="!form.name || !form.slug">
            {{ editingFlower ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiAdminFlowersListRoute } from '../../api/admin/flowers/list'
import { apiAdminFlowersCreateRoute } from '../../api/admin/flowers/create'
import { apiAdminFlowersUpdateRoute } from '../../api/admin/flowers/update'
import { apiAdminFlowersDeleteRoute } from '../../api/admin/flowers/delete'

const flowers = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingFlower = ref(null)
const form = ref({
  name: '',
  slug: '',
  sortOrder: 0
})

onMounted(async () => {
  await loadFlowers()
})

async function loadFlowers() {
  loading.value = true
  try {
    flowers.value = await apiAdminFlowersListRoute.run(ctx)
  } catch (error) {
    console.error('Ошибка загрузки цветов:', error)
  }
  loading.value = false
}

function openCreateForm() {
  editingFlower.value = null
  form.value = {
    name: '',
    slug: '',
    sortOrder: flowers.value.length
  }
  showForm.value = true
}

function editFlower(flower) {
  editingFlower.value = flower
  form.value = {
    name: flower.name,
    slug: flower.slug,
    sortOrder: flower.sortOrder || 0
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingFlower.value = null
}

async function saveFlower() {
  if (!form.value.name || !form.value.slug) return

  try {
    if (editingFlower.value) {
      await apiAdminFlowersUpdateRoute.query({ id: editingFlower.value.id }).run(ctx, form.value)
    } else {
      await apiAdminFlowersCreateRoute.run(ctx, form.value)
    }
    await loadFlowers()
    closeForm()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    alert('Ошибка сохранения цветка')
  }
}

async function deleteFlower(flower) {
  if (!confirm(`Удалить цветок "${flower.name}"?`)) return

  try {
    await apiAdminFlowersDeleteRoute.query({ id: flower.id }).run(ctx)
    await loadFlowers()
  } catch (error) {
    console.error('Ошибка удаления:', error)
    alert('Ошибка удаления цветка. Возможно, он используется в букетах.')
  }
}
</script>

<style scoped>
.flowers-list {
  padding: 24px;
}

.flowers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.flowers-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--admin-primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-create:hover {
  background: var(--admin-primary-dark);
  transform: translateY(-1px);
}

.loading, .empty-state {
  text-align: center;
  padding: 48px;
  color: #666;
}

.flowers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.flower-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all 0.2s;
}

.flower-card:hover {
  border-color: var(--admin-primary);
  box-shadow: 0 4px 16px rgba(168, 139, 200, 0.12);
}

.flower-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.flower-slug {
  margin: 0;
  font-size: 13px;
  color: #666;
  font-family: monospace;
}

.flower-actions {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: var(--admin-bg-light);
  color: var(--admin-primary);
  border: 1px solid var(--admin-accent);
}

.btn-edit:hover {
  background: var(--admin-primary);
  color: var(--color-white);
  border-color: var(--admin-primary);
}

.btn-delete {
  background: #ffebee;
  color: #d32f2f;
}

.btn-delete:hover {
  background: #ffcdd2;
}

/* Drawer */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
}

.drawer {
  width: 480px;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.1);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
}

.drawer-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--admin-bg-light);
  color: var(--admin-primary);
}

.drawer-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--admin-primary);
}

.form-group small {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.drawer-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--color-border);
}

.btn-cancel, .btn-save {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--color-white);
  color: var(--admin-text-dark);
  border: 1.5px solid var(--admin-accent);
}

.btn-cancel:hover {
  background: var(--admin-bg-light);
  border-color: var(--admin-primary);
}

.btn-save {
  background: var(--admin-primary);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: var(--admin-primary-dark);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>