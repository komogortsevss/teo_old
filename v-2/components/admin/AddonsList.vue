<template>
  <div class="addons-list">
    <div class="list-header">
      <button class="btn-add" @click="$emit('add')">
        <i class="fas fa-plus"></i>
        Добавить товар
      </button>
    </div>

    <div class="addons-grid">
      <div
        v-for="addon in addons"
        :key="addon.id"
        class="addon-card"
        :class="{ inactive: !addon.isActive }"
      >
        <div class="addon-image">
          <img
            v-if="addon.imageHash"
            :src="getThumbnailUrl(addon.imageHash, 200, 200)"
            :alt="addon.name"
          />
          <div v-else class="addon-icon">
            <i :class="addon.icon"></i>
          </div>
        </div>

        <div class="addon-info">
          <div class="addon-name">{{ addon.name }}</div>
          <div class="addon-price">{{ addon.priceAmount.toLocaleString('ru-RU') }} ₽</div>
          <div class="addon-meta">
            <span class="addon-type-badge" :class="addon.type || 'regular'">{{ (addon.type || 'regular') === 'vase' ? 'Ваза' : 'Обычный' }}</span>
            <span class="addon-icon-name"><i :class="addon.icon"></i> {{ addon.icon }}</span>
          </div>
        </div>

        <div class="addon-actions">
          <button class="btn-edit" @click="$emit('edit', addon)" title="Редактировать">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn-delete" @click="handleDelete(addon)" title="Удалить">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>

        <div v-if="!addon.isActive" class="addon-badge">Неактивен</div>
      </div>
    </div>

    <div v-if="addons.length === 0" class="empty-state">
      <i class="fas fa-box-open"></i>
      <p>Нет дополнительных товаров</p>
      <button class="btn-primary" @click="$emit('add')">
        <i class="fas fa-plus"></i>
        Добавить первый товар
      </button>
    </div>
  </div>
</template>

<script setup>
import { getThumbnailUrl } from '@app/storage'
import { apiAdminAddonsDeleteRoute } from '../../api/admin/addons/delete'

defineProps({
  addons: { type: Array, default: () => [] }
})

const emit = defineEmits(['add', 'edit', 'deleted'])

async function handleDelete(addon) {
  if (!confirm(`Удалить "${addon.name}"?`)) return
  
  try {
    await apiAdminAddonsDeleteRoute.query({ id: addon.id }).run(ctx)
    emit('deleted', addon.id)
  } catch (e) {
    alert('Ошибка удаления')
  }
}
</script>

<style scoped>
.addons-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-header {
  display: flex;
  justify-content: flex-end;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  background: var(--admin-primary);
  color: var(--color-white);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-add:hover {
  background: var(--admin-primary-dark);
  transform: translateY(-1px);
}

.addons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.addon-card {
  position: relative;
  background: var(--color-white);
  border: 1px solid var(--admin-bg-medium);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.addon-card.inactive {
  opacity: 0.6;
}

.addon-card:hover {
  box-shadow: 0 4px 20px rgba(43, 34, 51, 0.08);
  transform: translateY(-2px);
}

.addon-image {
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--admin-bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.addon-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.addon-icon {
  font-size: 48px;
  color: var(--admin-accent-light);
}

.addon-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.addon-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--admin-text-dark);
}

.addon-price {
  font-size: 18px;
  font-weight: 700;
  color: var(--admin-primary);
}

.addon-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.addon-type-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.addon-type-badge.vase {
  background: #ede9fe;
  color: #7c3aed;
}

.addon-type-badge.regular {
  background: #ecfdf5;
  color: #059669;
}

.addon-icon-name {
  font-size: 12px;
  color: var(--admin-text-soft);
  display: flex;
  align-items: center;
  gap: 6px;
}

.addon-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--admin-bg-light);
}

.btn-edit,
.btn-delete {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
}

.btn-edit {
  background: var(--admin-bg-light);
  color: var(--admin-primary);
}

.btn-edit:hover {
  background: var(--admin-primary);
  color: var(--color-white);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.1);
  color: var(--admin-danger);
}

.btn-delete:hover {
  background: var(--admin-danger);
  color: var(--color-white);
}

.addon-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.75);
  color: var(--color-white);
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: var(--admin-accent-light);
}

.empty-state p {
  font-size: 16px;
  color: var(--admin-text-medium);
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--admin-primary);
  color: var(--color-white);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-primary:hover {
  background: var(--admin-primary-dark);
}

@media (max-width: 768px) {
  .addons-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
}
</style>