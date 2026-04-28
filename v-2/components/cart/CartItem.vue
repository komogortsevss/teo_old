<template>
  <div class="cart-item" :class="{ removing: item.isRemoving }">
    <!-- Undo bar -->
    <Transition name="undo-slide">
      <div v-if="item.isRemoving" class="undo-bar">
        <span>Товар удалён</span>
        <button @click="$emit('undo', item.id)" class="undo-btn">Отменить</button>
      </div>
    </Transition>

    <!-- Normal view -->
    <div v-if="!item.isRemoving" class="ci-content">
      <a :href="productUrl" class="ci-image-link">
        <div class="ci-image">
          <img
            v-if="item.imageHash"
            :src="`https://fs.chatium.ru/thumbnail/${getCleanHash(item.imageHash)}/s/120x160`"
            :srcset="`
              https://fs.chatium.ru/thumbnail/${getCleanHash(item.imageHash)}/s/56x75 56w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(item.imageHash)}/s/120x160 120w
            `"
            sizes="56px"
            :alt="item.name"
            loading="lazy"
            decoding="async"
            width="56"
            height="75"
          />
          <div v-else class="ci-image-placeholder">
            <i class="fa-solid fa-seedling"></i>
          </div>
        </div>
      </a>
      <div class="ci-info">
        <a :href="productUrl" class="ci-name-link">
          <div class="ci-name">{{ item.name }}</div>
        </a>
        <div class="ci-price">{{ itemPrice }}</div>
      </div>
      <div class="ci-controls">
        <button class="ci-btn" @click="$emit('decrement', item.id)">
          <i class="fa-solid fa-minus"></i>
        </button>
        <span class="ci-qty">{{ item.quantity }}</span>
        <button class="ci-btn" @click="$emit('increment', item.id)" :disabled="!canIncrement">
          <i class="fa-solid fa-plus"></i>
        </button>
        <button class="ci-remove" @click="$emit('remove', item.id)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { productSeoPageRoute } from '../../product-seo'

const props = defineProps({
  item: { type: Object, required: true },
  canIncrement: { type: Boolean, default: true },
})

defineEmits(['increment', 'decrement', 'remove', 'undo'])

function getCleanHash(hash) {
  return hash ? hash.replace(/\.[^/.]+$/, '') : ''
}

const productUrl = computed(() => {
  if (props.item.categorySlug && props.item.slug) {
    return productSeoPageRoute.query({
      category: props.item.categorySlug,
      slug: props.item.slug
    }).url()
  }
  // Fallback на старый формат
  return '/v-2/product?id=' + props.item.id
})

const itemPrice = computed(() => {
  let total
  if (props.item.step > 1) {
    const full = Math.floor(props.item.quantity / props.item.step)
    const extra = props.item.quantity % props.item.step
    total = props.item.priceAmount * full + extra * (props.item.priceAmount / props.item.step)
  } else {
    total = props.item.priceAmount * props.item.quantity
  }
  return total.toLocaleString('ru-RU') + ' ₽'
})
</script>

<style scoped>
.cart-item {
  position: relative;
  min-height: 48px;
}

.ci-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.cart-item:last-child .ci-content {
  border-bottom: none;
}

.cart-item.removing .ci-content {
  opacity: 0.3;
  pointer-events: none;
}

.ci-image-link {
  display: block;
  text-decoration: none;
  flex-shrink: 0;
}

.ci-image {
  width: 56px;
  height: 72px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--color-placeholder-bg);
  transition: transform 0.2s;
}

.ci-image-link:hover .ci-image {
  transform: scale(1.05);
}

.ci-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ci-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-placeholder-text);
  font-size: 22px;
}

.ci-info {
  flex: 1;
  min-width: 0;
}

.ci-name-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.ci-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  line-height: 19px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 4px;
  transition: color 0.2s;
}

.ci-name-link:hover .ci-name {
  color: var(--color-primary-dark);
}

.ci-price {
  font-size: 13px;
  font-weight: 400;
  color: #000;
}

.ci-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ci-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: none;
  color: #000;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.ci-btn:disabled {
  opacity: 0.35;
  cursor: default;
  background: none;
}

.ci-btn:hover:not(:disabled) {
  background: var(--color-border-light);
}

.ci-qty {
  font-size: 14px;
  font-weight: 700;
  color: #000;
  min-width: 24px;
  text-align: center;
}

.ci-remove {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: none;
  color: var(--color-surface);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  transition: color 0.15s, background 0.15s;
}

.ci-remove:hover {
  color: var(--color-error);
  background: var(--color-error-bg);
}

.undo-bar {
  background: var(--color-secondary);
  color: var(--color-white);
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
  margin: 12px 0;
}

.undo-bar span {
  font-size: 14px;
  font-weight: 500;
}

.undo-btn {
  padding: 6px 16px;
  background: var(--color-white);
  color: var(--color-secondary);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
}

.undo-btn:hover {
  background: var(--color-border-light);
}

.undo-slide-enter-active, .undo-slide-leave-active {
  transition: all 0.3s ease;
}
.undo-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.undo-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>