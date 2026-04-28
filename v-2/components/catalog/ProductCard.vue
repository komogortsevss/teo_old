<template>
  <!-- Horizontal layout -->
  <div v-if="variant === 'horizontal'" class="product-card product-card--horizontal" :class="{ 'out-of-stock': !product.isAvailable }" :data-product-slug="product.slug" :data-category-slug="product.categorySlug">
    <div
      class="h-image-wrap"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
      @click="onImageClick"
      style="cursor: pointer"
    >
      <div class="slides-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="(hash, idx) in images" :key="hash" class="slide">
          <img
            v-if="hash"
            :src="`https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/400x533`"
            :srcset="`
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/200x267 200w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/320x427 320w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/400x533 400w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/640x853 640w
            `"
            sizes="(max-width: 360px) 50vw, (max-width: 767px) 50vw, 25vw"
            :alt="product.name"
            class="product-image"
            :loading="eager && idx === 0 ? 'eager' : 'lazy'"
            decoding="async"
            width="400"
            height="533"
          />
          <div v-else class="product-image-placeholder">
            <i class="fa-solid fa-seedling"></i>
          </div>
        </div>
      </div>
      <template v-if="images.length > 1">
        <div class="dots">
          <span v-for="(_, idx) in images" :key="idx" class="dot" :class="{ active: idx === currentIndex }" @click.stop="currentIndex = idx"></span>
        </div>
      </template>
      <button class="fav-btn" :class="{ active: isFavorite(product.id) }" @click.stop="toggle(product.id)" :aria-label="isFavorite(product.id) ? 'Убрать из избранного' : 'В избранное'">
        <i :class="isFavorite(product.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
      </button>
      <div class="product-overlay h-overlay">
        <h3 class="product-name">{{ product.name }}</h3>
        <p v-if="product.description" class="product-desc">{{ product.description }}</p>
      </div>
    </div>

    <div class="h-content">
      <div class="h-info">
        <h3 class="product-name h-name">{{ product.name }}</h3>
        <p v-if="product.description" class="product-desc h-desc">{{ product.description }}</p>
      </div>
      <div class="product-footer h-footer">
        <template v-if="product.isAvailable">
          <div class="product-counter">
          <button class="counter-btn" @click="decrement" :disabled="count <= step">
              <i class="fa-solid fa-minus"></i>
            </button>
            <span class="counter-value">{{ displayCount }}</span>
            <button class="counter-btn" @click="increment" :disabled="!canIncrement">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <button class="add-to-cart-btn" @click="addToCart">
            {{ totalPrice }}
          </button>
        </template>
        <button v-else class="add-to-cart-btn oos-btn" disabled>
          Закончился
        </button>
      </div>
    </div>
  </div>

  <!-- Default / Large layout -->
  <div v-else class="product-card" :class="{ 'out-of-stock': !product.isAvailable }">
    <div
      class="product-image-wrap"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
      @click="onImageClick"
      style="cursor: pointer"
    >
      <div class="slides-track" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
        <div v-for="(hash, idx) in images" :key="hash" class="slide">
          <img
            v-if="hash"
            :src="`https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/400x533`"
            :srcset="`
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/200x267 200w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/320x427 320w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/400x533 400w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/640x853 640w
            `"
            sizes="(max-width: 360px) 50vw, (max-width: 767px) 50vw, 25vw"
            :alt="product.name"
            class="product-image"
            :loading="eager && idx === 0 ? 'eager' : 'lazy'"
            decoding="async"
            width="400"
            height="533"
          />
          <div v-else class="product-image-placeholder">
            <i class="fa-solid fa-seedling"></i>
          </div>
        </div>
      </div>

      <template v-if="images.length > 1">
        <div class="dots">
          <span v-for="(_, idx) in images" :key="idx" class="dot" :class="{ active: idx === currentIndex }" @click.stop="currentIndex = idx"></span>
        </div>
      </template>

      <button class="fav-btn" :class="{ active: isFavorite(product.id) }" @click.stop="toggle(product.id)" :aria-label="isFavorite(product.id) ? 'Убрать из избранного' : 'В избранное'">
        <i :class="isFavorite(product.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
      </button>

      <div v-if="!product.isAvailable" class="oos-badge">Закончился</div>

      <div class="product-overlay">
        <h3 class="product-name">{{ product.name }}</h3>
        <p v-if="product.description" class="product-desc">{{ product.description }}</p>
      </div>
    </div>

    <div class="product-footer">
      <template v-if="product.isAvailable">
        <div v-if="!hideCounter" class="product-counter">
          <button class="counter-btn" @click="decrement" :disabled="count <= step">
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="counter-value">{{ displayCount }}</span>
          <button class="counter-btn" @click="increment" :disabled="!canIncrement">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
        <button class="add-to-cart-btn" :class="{ 'full-width': hideCounter }" @click="addToCart">
          {{ totalPrice }}
        </button>
      </template>
      <button v-else class="add-to-cart-btn oos-btn" disabled>
        Закончился
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFavorites } from '../../shared/useFavorites'
import { useCart } from '../../shared/useCart'
import { useProductCounter } from '../../shared/useProductCounter'
import { productSeoPageRoute } from '../../product-seo'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  variant: {
    type: String,
    default: 'default',
  },
  hideCounter: {
    type: Boolean,
    default: false,
  },
  eager: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['add-to-cart', 'open-product'])

const { toggle, isFavorite } = useFavorites()
const { addToCart: addToCartStore } = useCart()

const { step, count, displayCount, totalPrice, increment, decrement, canIncrement } = useProductCounter(() => props.product)

function resetCounter() {
  count.value = step.value
}

onMounted(() => {
  window.addEventListener('cart-cleared', resetCounter)
})

onUnmounted(() => {
  window.removeEventListener('cart-cleared', resetCounter)
})

const images = computed(() => {
  const arr = props.product.imageHashes
  if (Array.isArray(arr) && arr.length > 0) return arr
  if (props.product.imageHash) return [props.product.imageHash]
  return ['']
})

const currentIndex = ref(0)

let touchStartX = 0
let wasSwiping = false

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
  wasSwiping = false
}
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 40) {
    wasSwiping = true
    dx < 0 ? next() : prev()
  }
}
function onImageClick() {
  if (wasSwiping) {
    wasSwiping = false
    return
  }
  emit('open-product', props.product)
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}
function next() {
  if (currentIndex.value < images.value.length - 1) currentIndex.value++
}

function getCleanHash(hash) {
  return hash ? hash.replace(/\.[^/.]+$/, '') : ''
}

function addToCart() {
  addToCartStore(props.product, displayCount.value)
  emit('add-to-cart', { product: props.product, quantity: displayCount.value })
}

// Функция для получения URL товара (ЧПУ или старый формат)
function getProductUrl(product) {
  if (product.categorySlug && product.slug) {
    return productSeoPageRoute.query({ 
      category: product.categorySlug, 
      slug: product.slug 
    }).url()
  }
  // Fallback на старый формат
  return '/v-2/product?id=' + product.id
}
</script>

<style scoped>
/* ── Base card ─────────────────────────────────────────── */
.product-card {
  background: var(--color-white);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--color-card-border);
  box-shadow: 0 4px 16px var(--color-shadow-card);
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  transform: translateZ(0);
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  contain: layout style paint;
  content-visibility: auto;
  contain-intrinsic-size: 0 400px;
}

.product-card:hover {
  box-shadow: 0 6px 24px var(--color-shadow-hover);
  border-color: var(--color-shadow-card-hover-border);
}

/* ── Image wrap ────────────────────────────────────────── */
.product-image-wrap {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--color-placeholder-bg);
  flex-shrink: 0;
}

.slides-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-placeholder-text);
  font-size: 48px;
}

.dots {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  gap: 5px;
  z-index: 3;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-progress-track);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.dot.active {
  background: var(--color-white);
  transform: scale(1.3);
}

/* ── Favourite button ──────────────────────────────────── */
.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 4;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-white);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.18s ease, transform 0.18s ease;
  padding: 0;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35));
}

.fav-btn:hover {
  color: var(--color-white);
  transform: scale(1.15);
}

.fav-btn.active {
  color: var(--color-favorite-active);
}

.fav-btn.active:hover {
  color: var(--color-favorite-hover);
}

.product-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 14px 14px;
  background: linear-gradient(to top, var(--gradient-overlay-dark) 0%, var(--gradient-overlay-transparent) 100%);
  z-index: 2;
}

.product-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-white);
  line-height: 21px;
  margin: 0 0 4px;
}

.product-desc {
  font-size: 12px;
  color: var(--color-desc-white);
  line-height: 17px;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Footer ────────────────────────────────────────────── */
.product-footer {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-counter {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.counter-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--color-text-dark);
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.counter-btn:hover:not(:disabled) {
  background: var(--color-primary-hover-bg-medium);
  border-color: var(--color-primary);
}

.counter-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.counter-value {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  min-width: 26px;
  text-align: center;
}

.add-to-cart-btn.full-width {
  flex: 1;
}

.add-to-cart-btn {
  flex: 1;
  padding: 9px 8px;
  border-radius: 12px;
  border: none;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.add-to-cart-btn:hover {
  background: var(--color-primary-dark);
}

.out-of-stock {
  opacity: 0.72;
}

.oos-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 5;
  background: var(--color-oos-bg);
  color: var(--color-white);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  letter-spacing: 0.02em;
  backdrop-filter: blur(4px);
}

.oos-btn {
  background: var(--color-primary-light-bg) !important;
  color: var(--color-text-soft) !important;
  cursor: default !important;
  flex: 1;
}

/* ── Horizontal card ───────────────────────────────────── */
.product-card--horizontal {
  flex-direction: row;
  height: 160px;
  border-radius: 18px;
}

.h-image-wrap {
  position: relative;
  width: 42%;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--color-placeholder-bg);
}

.h-image-wrap .slides-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.h-image-wrap .slide {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.h-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 12px 10px;
  min-width: 0;
}

.h-info {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.h-name {
  color: #000 !important;
  font-size: 14px !important;
  line-height: 19px !important;
  margin: 0 0 4px !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.h-desc {
  color: #000 !important;
  font-size: 11px !important;
  line-height: 15px !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.h-footer {
  padding: 0 !important;
  gap: 6px !important;
}

.h-footer .counter-btn {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  font-size: 10px;
}

.h-footer .counter-value {
  font-size: 12px;
  min-width: 18px;
}

.h-footer .add-to-cart-btn {
  font-size: 12px;
  padding: 6px 6px;
  border-radius: 10px;
}

/* ── Mobile tweaks for default layout ─────────────────── */
@media (max-width: 767px) {
  .product-footer {
    padding: 8px 10px;
    gap: 6px;
  }

  .counter-btn {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }

  .counter-value {
    font-size: 12px;
    min-width: 20px;
  }

  .add-to-cart-btn {
    font-size: 12px;
    padding: 7px 4px;
  }

  .product-desc {
    line-height: 14px;
  }
}

/* ── Overlay hidden on mobile for horizontal card ──── */
.h-overlay {
  display: none;
}

/* ── Desktop: horizontal card → normal column layout ──── */
@media (min-width: 768px) {
  .product-card--horizontal {
    flex-direction: column;
    height: auto;
    border-radius: 20px;
  }

  .h-image-wrap {
    width: 100%;
    aspect-ratio: 3 / 4;
  }

  .h-overlay {
    display: block;
  }

  .h-info {
    display: none;
  }

  .h-content {
    padding: 12px 14px;
  }

  .h-name {
    font-size: 15px !important;
    line-height: 21px !important;
  }

  .h-desc {
    font-size: 12px !important;
    line-height: 17px !important;
  }

  .h-footer {
    padding: 0 !important;
    gap: 10px !important;
  }

  .h-footer .counter-btn {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    font-size: 12px;
  }

  .h-footer .counter-value {
    font-size: 14px;
    min-width: 26px;
  }

  .h-footer .add-to-cart-btn {
    font-size: 14px;
    padding: 9px 8px;
    border-radius: 12px;
  }
}

</style>