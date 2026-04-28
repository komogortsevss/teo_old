<template>
  <div>
    <div class="list-toolbar">
      <button class="btn-add" @click="$emit('add')">
        <i class="fas fa-plus"></i>
        Новая сторис
      </button>
    </div>

    <div v-if="stories.length === 0" class="empty-state">
      <i class="fas fa-images"></i>
      <p>Сторис пока нет</p>
      <button class="btn-add-empty" @click="$emit('add')">Создать первую</button>
    </div>

    <div v-else class="stories-grid">
      <div v-for="story in stories" :key="story.id" class="story-card">
        <div class="story-cover">
          <img
            v-if="story.coverHash"
            :src="`https://fs.chatium.ru/thumbnail/${story.coverHash}/s/200x200`"
            :alt="story.label"
          />
          <div v-else class="cover-placeholder">
            <i class="fas fa-image"></i>
          </div>
          <div class="story-badge" :class="story.isActive ? 'badge-active' : 'badge-inactive'">
            {{ story.isActive ? 'Активна' : 'Скрыта' }}
          </div>
        </div>
        <div class="story-info">
          <div class="story-label">{{ story.label }}</div>
          <div class="story-meta">
            <span><i class="fas fa-film"></i> {{ (story.slides ?? []).length }} слайдов</span>
            <span><i class="fas fa-sort"></i> {{ story.sortOrder ?? 0 }}</span>
          </div>
        </div>
        <div class="story-actions">
          <button class="btn-icon" title="Редактировать" @click="$emit('edit', story)">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn-icon btn-delete" title="Удалить" @click="deleteStory(story)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { apiAdminStoriesDeleteRoute } from '../../api/admin/stories/delete'

const props = defineProps({
  stories: { type: Array, default: () => [] },
})

const emit = defineEmits(['add', 'edit', 'deleted'])

async function deleteStory(story) {
  if (!confirm(`Удалить сторис «${story.label}»?`)) return
  try {
    await apiAdminStoriesDeleteRoute.query({ id: story.id }).run(ctx, {})
    emit('deleted', story.id)
  } catch (e) {
    alert('Ошибка удаления: ' + (e?.message ?? String(e)))
  }
}
</script>

<style scoped>
.list-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
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

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--admin-text-soft);
}
.empty-state i { font-size: 48px; color: var(--admin-accent-light); margin-bottom: 16px; }
.empty-state p { font-size: 16px; margin-bottom: 20px; color: var(--admin-text-medium); }
.btn-add-empty {
  display: inline-flex;
  align-items: center;
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
.btn-add-empty:hover {
  background: var(--admin-primary-dark);
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.story-card {
  background: var(--color-white);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--admin-bg-medium);
  box-shadow: 0 2px 8px rgba(43,34,51,0.06);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}
.story-card:hover { 
  box-shadow: 0 4px 20px rgba(43,34,51,0.12);
  transform: translateY(-2px);
}

.story-cover {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
  background: var(--admin-bg-light);
}
.story-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--admin-accent-light);
  font-size: 36px;
}
.story-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}
.badge-active { background: rgba(22, 163, 74, 0.1); color: var(--admin-success); }
.badge-inactive { background: rgba(107, 114, 128, 0.1); color: var(--admin-text-soft); }

.story-info {
  padding: 12px 14px 8px;
  flex: 1;
}
.story-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--admin-text-dark);
  margin-bottom: 6px;
}
.story-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--admin-text-soft);
}
.story-meta span { display: flex; align-items: center; gap: 4px; }

.story-actions {
  display: flex;
  gap: 6px;
  padding: 8px 14px 12px;
}
.btn-icon {
  flex: 1;
  height: 36px;
  border: 1px solid var(--admin-bg-medium);
  border-radius: 8px;
  background: var(--admin-bg-light);
  color: var(--admin-text-soft);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
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
</style>