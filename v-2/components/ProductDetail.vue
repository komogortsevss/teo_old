<template>
  <div class="pd-wrap">
    <!-- Gallery -->
    <div class="pd-gallery">
      <div
        class="pd-slides-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <div v-for="(hash, idx) in images" :key="hash + idx" class="pd-slide">
          <img
            v-if="hash"
            class="pd-image"
            :src="`https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/460x613`"
            :srcset="`
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/320x427 320w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/460x613 460w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/640x853 640w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/800x1067 800w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/960x1280 960w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(hash)}/s/1280x1707 1280w
            `"
            sizes="(max-width: 360px) calc(100vw - 16px), (max-width: 767px) calc(100vw - 16px), 460px"
            :alt="product.name"
            :loading="idx === 0 ? 'eager' : 'lazy'"
            decoding="async"
            width="460"
            height="613"
          />
          <div v-else class="pd-image-placeholder">
            <i class="fa-solid fa-seedling"></i>
          </div>
        </div>
      </div>

      <div v-if="images.length > 1" class="pd-dots">
        <span
          v-for="(_, idx) in images"
          :key="idx"
          class="pd-dot"
          :class="{ active: idx === currentIndex }"
          @click.stop="currentIndex = idx"
        ></span>
      </div>

      <button
        class="pd-fav-btn"
        :class="{ active: isFavorite(product.id) }"
        @click.stop="toggle(product.id)"
        :aria-label="isFavorite(product.id) ? 'Убрать из избранного' : 'В избранное'"
      >
        <i :class="isFavorite(product.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
      </button>
    </div>

    <!-- Info -->
    <div class="pd-info">
      <h1 class="pd-name">{{ product.name }}</h1>

      <div v-if="!product.isAvailable" class="pd-oos-badge">
        <i class="fa-solid fa-clock"></i> Закончился
      </div>

      <p v-if="product.description" class="pd-desc">{{ product.description }}</p>

      <!-- Vase selector block -->
      <div v-if="vaseRules.length > 0" class="pd-vase-section">
        <VaseSelector
          :all-vase-addons="allVaseAddons"
          :vase-rules="vaseRules"
          :bouquet-name="product.name"
          :total-stems="totalStems"
          :selected-addon-id="selectedVaseId"
          @select="onSelectVase"
        />
      </div>

      <div class="pd-actions">
        <div class="pd-counter">
          <button class="pd-counter-btn" @click="decrement" :disabled="count <= step">
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="pd-counter-value">{{ displayCount }}</span>
          <button class="pd-counter-btn" @click="increment" :disabled="!canIncrement">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>

        <button class="pd-cart-btn" @click="addToCart" :disabled="!product.isAvailable">
          {{ product.isAvailable ? totalPrice : 'Закончился' }}
        </button>
        <div v-if="product.stemsCount && product.stemsCount > 1" class="pd-per-unit">
          за {{ displayCount }} {{ stemWord(displayCount) }}
        </div>
      </div>
    </div>
  </div>

  <RelatedProducts
    v-if="product.id"
    :product-id="product.id"
    :current-flowers="product.flowers || []"
    @open-product="$emit('open-product', $event)"
    @add-to-cart="$emit('add-to-cart', $event)"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFavorites } from '../shared/useFavorites'
import { useCart, calcTotalStems } from '../shared/useCart'
import { useProductCounter, stemWord, bouquetWord } from '../shared/useProductCounter'
import RelatedProducts from './RelatedProducts.vue'
import VaseSelector from './cart/VaseSelector.vue'
import { apiAddonsListRoute } from '../api/addons/list'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['add-to-cart', 'open-product'])

const { toggle, isFavorite } = useFavorites()
const { addToCart: addToCartStore, selectVaseForItem } = useCart()

// Vase selection state
const allAddonsCacheArr = ref([])
const selectedVaseId = ref(null)
const selectedVaseQty = ref(1)

onMounted(async () => {
  try {
    const loaded = await apiAddonsListRoute.run(ctx)
    allAddonsCacheArr.value = loaded
  } catch (e) {
    console.error('Failed to load addons', e)
  }
})

const allVaseAddons = computed(() => allAddonsCacheArr.value.filter(a => a.type === 'vase'))

const vaseRules = computed(() => {
  if (!props.product.availableAddons || props.product.availableAddons.length === 0) return []
  return props.product.availableAddons.filter(a => {
    if (!a || !a.addonId) return false
    const addon = allAddonsCacheArr.value.find(ad => ad.id === a.addonId)
    if (!addon || addon.type !== 'vase') return false
    return a.minStems != null
  })
})

const totalStems = computed(() => {
  const item = {
    isMono: props.product.stemsCount && props.product.stemsCount > 1,
    stemsCount: props.product.stemsCount,
    quantity: displayCount.value,
    composition: props.product.composition || []
  }
  return calcTotalStems(item)
})

function onSelectVase(addonId, qty) {
  if (selectedVaseId.value === addonId) {
    selectedVaseId.value = null
    selectedVaseQty.value = 1
  } else {
    selectedVaseId.value = addonId
    selectedVaseQty.value = qty || 1
  }
}

const { step, count, displayCount, totalPrice, increment, decrement, canIncrement } = useProductCounter(() => props.product)

const images = computed(() => {
  const arr = props.product.imageHashes
  if (Array.isArray(arr) && arr.length > 0) return arr
  if (props.product.imageHash) return [props.product.imageHash]
  return ['']
})

const currentIndex = ref(0)

let touchStartX = 0
function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
}
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchStartX
  if (Math.abs(dx) > 40) {
    dx < 0 ? next() : prev()
  }
}

function prev() {
  if (currentIndex.value > 0) currentIndex.value--
}
function next() {
  if (currentIndex.value < images.value.length - 1) currentIndex.value++
}

watch(() => props.product, () => {
  count.value = step.value
  currentIndex.value = 0
})

function getCleanHash(hash) {
  return hash ? hash.replace(/\.[^/.]+$/, '') : ''
}

function addToCart() {
  // Add to cart first
  addToCartStore(props.product, displayCount.value)
  
  // Then set the vase if selected
  if (selectedVaseId.value) {
    selectVaseForItem(props.product.id, selectedVaseId.value, selectedVaseQty.value)
  }
  
  emit('add-to-cart', { product: props.product, quantity: displayCount.value })
  
  // Reset vase selection after adding to cart
  selectedVaseId.value = null
  selectedVaseQty.value = 1
}
</script>

<style scoped>
.pd-wrap {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  max-width: 460px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .pd-wrap {
    flex-direction: row;
    align-items: stretch;
    max-width: none;
    margin: 0;
    padding-left: 8px;
    padding-top: 8px;
    gap: 32px;
  }
}

/* Gallery */
.pd-gallery {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 3 / 4;
  background: var(--color-placeholder-bg);
}

@media (min-width: 768px) {
  .pd-gallery {
    width: 460px;
    flex-shrink: 0;
  }
}

.pd-slides-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.pd-slide {
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.pd-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pd-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: var(--color-placeholder-text);
}

.pd-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: var(--color-arrow-bg);
  color: var(--color-text-dark);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  box-shadow: 0 2px 12px var(--color-arrow-shadow);
  transition: background 0.2s, transform 0.2s;
}

.pd-arrow:hover {
  background: var(--color-white);
  transform: translateY(-50%) scale(1.08);
}

.pd-arrow--left { left: 14px; }
.pd-arrow--right { right: 14px; }

.pd-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 3;
}

.pd-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-progress-track);
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}

.pd-dot.active {
  background: var(--color-white);
  transform: scale(1.4);
}

.pd-fav-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 4;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-white);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
}

.pd-fav-btn:hover { transform: scale(1.12); }
.pd-fav-btn.active { color: var(--color-favorite-active); }

@media (max-width: 767px) {
  .pd-fav-btn {
    top: 10px;
    right: auto;
    left: 10px;
    background: transparent;
    box-shadow: none;
    color: var(--color-fav-mobile-color);
    filter: drop-shadow(0 1px 2px var(--color-close-btn-shadow));
    font-size: 18px;
  }

  .pd-fav-btn:hover {
    background: transparent;
    transform: scale(1.15);
    color: var(--color-white);
  }

  .pd-fav-btn.active {
    color: var(--color-favorite-active);
  }
}

/* Info */
.pd-info {
  width: 100%;
}

.pd-name {
  font-size: 24px;
  font-weight: 700;
  color: #000;
  line-height: 32px;
  margin: 0 0 8px;
}

.pd-desc {
  font-size: 16px;
  color: #000;
  line-height: 26px;
  margin: 0 0 24px;
}

@media (min-width: 768px) {
  .pd-info {
    flex: 1;
    padding-right: 8px;
    padding-top: 48px;
    display: flex;
    flex-direction: column;
  }

  .pd-name {
    margin-top: 0;
    margin-bottom: 12px;
  }

  .pd-desc {
    margin-bottom: 24px;
  }

  .pd-oos-badge {
    margin-bottom: 16px;
  }

  .pd-actions {
    margin-top: 0;
    grid-template-rows: auto auto;
  }

  .pd-per-unit {
    grid-column: 2;
    justify-self: center;
    margin-top: 4px;
  }
}

.pd-oos-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-border);
  color: var(--color-text-soft);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.pd-actions {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto;
  gap: 12px;
  width: 100%;
}

.pd-counter {
  grid-column: 1;
  align-self: center;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pd-cart-btn {
  grid-column: 2;
}

.pd-per-unit {
  font-size: 14px;
  color: #000;
  text-align: center;
  margin-top: 8px;
}

.pd-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pd-counter-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.pd-counter-btn:hover:not(:disabled) {
  background: var(--color-primary-active-bg);
  border-color: var(--color-primary);
}

.pd-counter-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.pd-counter-value {
  font-size: 16px;
  font-weight: 700;
  color: #000;
  min-width: 36px;
  text-align: center;
}

.pd-cart-btn {
  flex: none;
  height: 56px;
  width: 100%;
  border-radius: 16px;
  border: none;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.pd-cart-btn:hover:not(:disabled) { background: var(--color-primary-dark); }
.pd-cart-btn:disabled { opacity: 0.5; cursor: default; }

  /* Mobile */
@media (max-width: 767px) {
  .pd-wrap {
    max-width: none;
    padding: 0;
  }

  .pd-info {
    padding: 0 24px;
    display: flex;
    flex-direction: column;
  }

  .pd-oos-badge {
    order: 0;
  }

  .pd-actions {
    order: 1;
    margin-top: 12px;
    margin-bottom: 0;
    grid-template-rows: auto auto;
  }

  .pd-per-unit {
    order: 2;
    text-align: center;
    margin: 4px 0 0;
    width: auto;
    grid-column: 2;
    justify-self: center;
  }

  .pd-name {
    margin-top: 16px;
    order: 3;
  }

  .pd-desc {
    order: 4;
  }

  .pd-cart-btn {
    height: 52px;
    font-size: 16px;
  }

  .pd-counter-btn {
    width: 40px;
    height: 40px;
  }

  .pd-vase-section {
    order: 5;
    margin-top: 16px;
  }
}

/* Vase section styles */
.pd-vase-section {
  margin-top: 20px;
  margin-bottom: 8px;
}

.pd-vase-hint {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 8px;
  line-height: 1.4;
}

@media (min-width: 768px) {
  .pd-vase-section {
    margin-top: 16px;
    margin-bottom: 16px;
  }
}
</style>