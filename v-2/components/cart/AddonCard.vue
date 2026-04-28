<template>
  <div class="addon-card" :class="{ selected }">
    <div class="addon-img" @click="toggleSelect">
      <img
        v-if="imageHash"
        :src="getThumbnailUrl(imageHash, 96, undefined)"
        :srcset="`
          https://fs.chatium.ru/thumbnail/${getCleanHash(imageHash)}/s/48x64 48w,
          https://fs.chatium.ru/thumbnail/${getCleanHash(imageHash)}/s/96x128 96w
        `"
        sizes="48px"
        :alt="name"
        loading="lazy"
        decoding="async"
        width="48"
        height="64"
      />
      <i v-else :class="icon"></i>
    </div>
    <div class="addon-info" @click="toggleSelect">
      <div class="addon-name">{{ name }}</div>
      <div class="addon-price">{{ price.toLocaleString('ru-RU') }} ₽</div>
    </div>

    <!-- Counter when selected -->
    <div v-if="selected" class="addon-counter">
      <button class="addon-btn" @click="$emit('decrement')">
        <i class="fa-solid fa-minus"></i>
      </button>
      <span class="addon-qty">{{ quantity }}</span>
      <button class="addon-btn" @click="$emit('increment')">
        <i class="fa-solid fa-plus"></i>
      </button>
    </div>

    <!-- Checkbox when not selected -->
    <div v-else class="addon-check" @click="toggleSelect">
      <i class="fa-regular fa-circle"></i>
    </div>
  </div>
</template>

<script setup>
import { getThumbnailUrl } from '@app/storage'

const props = defineProps({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageHash: { type: String, default: null },
  icon: { type: String, default: 'fa-solid fa-box' },
  selected: { type: Boolean, default: false },
  quantity: { type: Number, default: 1 },
})

const emit = defineEmits(['toggle', 'increment', 'decrement'])

function toggleSelect() {
  emit('toggle')
}

function getCleanHash(hash) {
  return hash ? hash.replace(/\.[^/.]+$/, '') : ''
}
</script>

<style scoped>
.addon-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--color-border-medium);
  background: var(--color-white);
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  user-select: none;
}

.addon-card:hover {
  border-color: var(--color-primary-bg-addon-hover);
  box-shadow: 0 2px 10px var(--color-primary-hover-bg-medium);
}

.addon-card.selected {
  border-color: var(--color-primary);
  background: var(--color-footer-gradient-start);
  box-shadow: 0 2px 12px var(--color-primary-bg-addon-shadow);
}

.addon-img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--color-text-soft);
  flex-shrink: 0;
  transition: background 0.2s;
  overflow: hidden;
  cursor: pointer;
}

.addon-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.addon-card.selected .addon-img {
  background: var(--color-primary-bg-addon-selected);
  color: var(--color-primary-dark);
}

.addon-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.addon-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin-bottom: 2px;
}

.addon-price {
  font-size: 13px;
  color: var(--color-text-soft);
  font-weight: 500;
}

.addon-check {
  font-size: 20px;
  color: var(--color-surface);
  flex-shrink: 0;
  transition: color 0.2s;
  cursor: pointer;
}

.addon-card.selected .addon-check {
  color: var(--color-primary);
}

.addon-counter {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.addon-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-white);
  color: #000;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.addon-btn:hover {
  background: var(--color-border-light);
}

.addon-qty {
  font-size: 14px;
  font-weight: 700;
  color: #000;
  min-width: 24px;
  text-align: center;
}
</style>