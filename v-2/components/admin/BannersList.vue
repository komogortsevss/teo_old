<template>
  <div class="banners-page">
    <div class="controls-bar">
      <button class="btn-add" @click="$emit('add')">
        <i class="fas fa-plus"></i>
        Добавить баннер
      </button>
    </div>

    <div v-if="banners.length === 0" class="empty-state">
      <i class="fas fa-image"></i>
      <p>Баннеры не добавлены</p>
      <button class="btn-add-large" @click="$emit('add')">
        <i class="fas fa-plus"></i>
        Создать первый баннер
      </button>
    </div>

    <div v-else class="banners-grid">
      <div
        v-for="banner in banners"
        :key="banner.id"
        class="banner-card"
        :class="{ inactive: !banner.isActive }"
      >
        <div class="banner-preview" @click="$emit('edit', banner)">
          <img
            v-if="banner.imageHash"
            :src="getThumbnailUrl(banner.imageHash, 400, undefined)"
            :alt="banner.title"
          />
          <div v-else class="banner-placeholder">
            <i class="fas fa-image"></i>
          </div>
          <div v-if="!banner.isActive" class="banner-badge inactive-badge">
            <i class="fas fa-eye-slash"></i> Скрыт
          </div>
        </div>
        
        <div class="banner-info">
          <div class="banner-title">{{ banner.title || 'Без названия' }}</div>
          <div class="banner-link">
            <i class="fas fa-link"></i>
            {{ banner.link || 'Нет ссылки' }}
          </div>
        </div>
        
        <div class="banner-actions">
          <button class="btn-action" @click="$emit('edit', banner)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action btn-danger" @click="deleteBanner(banner.id)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getThumbnailUrl } from '@app/storage'
import { apiAdminBannersDeleteRoute } from '../../api/admin/banners/delete'

defineProps({
  banners: { type: Array, required: true }
})

const emit = defineEmits(['add', 'edit', 'deleted'])

async function deleteBanner(id) {
  if (!confirm('Удалить баннер?')) return
  
  try {
    await apiAdminBannersDeleteRoute.query({ id }).run(ctx)
    emit('deleted', id)
  } catch (e) {
    alert('Ошибка удаления')
  }
}
</script>

<style scoped>
.banners-page {
  padding: 0;
}

.controls-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--admin-primary);
  color: var(--color-white);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}
.btn-add:hover { background: var(--admin-primary-dark); }

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--admin-text-light);
}
.empty-state i { font-size: 56px; margin-bottom: 16px; }
.empty-state p { font-size: 16px; margin-bottom: 24px; }

.btn-add-large {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: var(--admin-primary);
  color: var(--color-white);
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}
.btn-add-large:hover { background: var(--admin-primary-dark); }

.banners-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

.banner-card {
  background: var(--color-white);
  border-radius: 16px;
  border: 1px solid var(--admin-bg-medium);
  overflow: hidden;
  display: flex;
  gap: 16px;
  padding: 16px;
  transition: box-shadow 0.2s;
}
.banner-card:hover { box-shadow: 0 4px 16px rgba(168, 139, 200, 0.12); }
.banner-card.inactive { opacity: 0.6; }

.banner-preview {
  position: relative;
  width: 200px;
  aspect-ratio: 4 / 1;
  border-radius: 10px;
  overflow: hidden;
  background: var(--admin-bg-light);
  flex-shrink: 0;
  cursor: pointer;
}

.banner-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--admin-accent-light);
  font-size: 32px;
}

.banner-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.inactive-badge {
  background: rgba(220, 38, 38, 0.9);
  color: var(--color-white);
}

.banner-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.banner-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--admin-text-dark);
}

.banner-link {
  font-size: 13px;
  color: var(--admin-text-light);
  display: flex;
  align-items: center;
  gap: 6px;
}

.banner-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-bg-medium);
  color: var(--admin-primary-dark);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}
.btn-action:hover { background: var(--admin-accent-light); }
.btn-action.btn-danger { background: #fee; color: var(--admin-danger); }
.btn-action.btn-danger:hover { background: #fdd; }

@media (max-width: 768px) {
  .banner-card {
    flex-direction: column;
    gap: 12px;
  }
  
  .banner-preview {
    width: 100%;
  }
  
  .banner-actions {
    justify-content: flex-end;
  }
}
</style>