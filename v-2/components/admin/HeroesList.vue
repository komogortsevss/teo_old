<template>
  <div class="heroes-admin">
    <div class="heroes-header">
      <button class="btn-add" @click="$emit('add')">
        <i class="fas fa-plus"></i>
        Добавить Hero блок
      </button>
    </div>

    <div v-if="heroes.length === 0" class="empty-state">
      <i class="fas fa-star"></i>
      <p>Нет Hero блоков</p>
    </div>

    <div v-else class="heroes-grid">
      <div
        v-for="hero in heroes"
        :key="hero.id"
        class="hero-card"
      >
        <div class="hero-card-header">
          <span class="hero-status" :class="{ active: hero.isActive }">
            {{ hero.isActive ? 'Активен' : 'Неактивен' }}
          </span>
          <div class="hero-actions">
            <button class="btn-icon" @click="$emit('edit', hero)" title="Редактировать">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" @click="deleteHero(hero)" title="Удалить">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div v-if="hero.imageHash" class="hero-card-image">
          <img :src="getThumbnailUrl(hero.imageHash, 400, undefined)" :alt="hero.title || 'Hero'" />
        </div>

        <div class="hero-card-content">
          <h3 class="hero-card-title">{{ hero.title || 'Без заголовка' }}</h3>
          <p class="hero-card-subtitle">{{ hero.subtitle || 'Без подзаголовка' }}</p>
          <div v-if="hero.buttonText" class="hero-card-button">
            <strong>{{ hero.buttonText }}</strong>
            <span v-if="hero.buttonLink">→ {{ hero.buttonLink }}</span>
          </div>
          <div class="hero-card-meta">
            <span><i class="fas fa-sort"></i> Порядок: {{ hero.sortOrder }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getThumbnailUrl } from '@app/storage'
import { apiAdminHeroDeleteRoute } from '../../api/admin/hero/delete'

defineProps({
  heroes: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['add', 'edit', 'deleted'])

async function deleteHero(hero) {
  if (!confirm(`Удалить Hero блок "${hero.title || 'Без названия'}"?`)) return
  
  try {
    await apiAdminHeroDeleteRoute.query({ id: hero.id }).run(ctx)
    emit('deleted', hero.id)
  } catch (e) {
    console.error('Delete error:', e)
    alert('Ошибка удаления')
  }
}
</script>

<style scoped>
.heroes-admin {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.heroes-header {
  display: flex;
  justify-content: flex-end;
}

.btn-add {
  display: inline-flex;
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
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-add:hover {
  background: var(--admin-primary-dark);
  transform: translateY(-1px);
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

.heroes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.hero-card {
  background: var(--color-white);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--admin-bg-medium);
  box-shadow: 0 2px 8px rgba(43,34,51,0.06);
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
}

.hero-card:hover {
  box-shadow: 0 4px 20px rgba(43, 34, 51, 0.12);
  transform: translateY(-2px);
}

.hero-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--admin-bg-medium);
}

.hero-status {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(239, 68, 68, 0.1);
  color: var(--admin-danger);
}

.hero-status.active {
  background: rgba(22, 163, 74, 0.1);
  color: var(--admin-success);
}

.hero-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border: 1px solid var(--admin-bg-medium);
  background: var(--admin-bg-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--admin-text-soft);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--admin-primary);
  color: var(--color-white);
  border-color: var(--admin-primary);
}

.btn-delete:hover {
  background: var(--admin-danger);
  color: var(--color-white);
  border-color: var(--admin-danger);
}

.hero-card-image {
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--admin-bg-light);
}

.hero-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-dark);
  margin: 0;
}

.hero-card-subtitle {
  font-size: 14px;
  color: var(--admin-text-medium);
  line-height: 1.5;
  margin: 0;
}

.hero-card-button {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 14px;
  background: var(--admin-bg-light);
  border-radius: 8px;
  font-size: 13px;
}

.hero-card-button strong {
  color: var(--admin-text-dark);
  font-weight: 600;
}

.hero-card-button span {
  color: var(--admin-primary);
  font-size: 12px;
}

.hero-card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--admin-bg-medium);
  font-size: 13px;
  color: var(--admin-text-soft);
}

.hero-card-meta i {
  font-size: 12px;
}

@media (max-width: 768px) {
  .heroes-grid {
    grid-template-columns: 1fr;
  }
}
</style>