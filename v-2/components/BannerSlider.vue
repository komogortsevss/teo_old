<template>
  <!-- Fixed height container to prevent CLS -->
  <div class="banner-container">
    <!-- Real content - rendered immediately if SSR data available -->
    <template v-if="banners.length > 0" data-banners-vue="true">
      <div class="banner-viewport">
        <div 
          class="banner-track"
          :style="trackStyle"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <div
            v-for="(banner, idx) in extendedBanners"
            :key="`${banner.id}-${idx}`"
            class="banner-item"
          >
            <a
              :href="banner.link || '#'"
              class="banner-slide"
              :class="{ 'has-link': banner.link && banner.link !== '#' }"
              @click="handleBannerClick($event, banner)"
            >
              <img
                :src="getBannerUrl(banner.imageHash)"
                :srcset="`
                  https://fs.chatium.ru/thumbnail/${getCleanHash(banner.imageHash)}/s/320x120 320w,
                  https://fs.chatium.ru/thumbnail/${getCleanHash(banner.imageHash)}/s/640x240 640w
                `"
                sizes="85vw"
                :alt="banner.title"
                fetchpriority="low"
                loading="lazy"
                decoding="async"
                width="320"
                height="120"
              />
            </a>
          </div>
        </div>
      </div>
      
      <!-- Dots -->
      <div v-if="banners.length > 1" class="banner-dots">
        <button
          v-for="(banner, idx) in banners"
          :key="idx"
          class="banner-dot"
          :class="{ active: realIndex === idx }"
          @click="goToSlide(idx)"
        ></button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getThumbnailUrl } from '@app/storage'
import { apiBannersListRoute } from '../api/banners/list'

const props = defineProps({
  initialBanners: {
    type: Array,
    default: () => []
  }
})

const banners = ref([])
const hydrated = ref(false)
const currentIndex = ref(0)
const isTransitioning = ref(false)
let autoplayTimer = null
let transitionTimer = null

// Always maintain stable height - no dynamic style changes

const extendedBanners = computed(() => {
  if (banners.value.length === 0) return []
  return [
    banners.value[banners.value.length - 1],
    ...banners.value,
    banners.value[0]
  ]
})

const realIndex = computed(() => {
  if (banners.value.length === 0) return 0
  if (currentIndex.value === 0) return banners.value.length - 1
  if (currentIndex.value === extendedBanners.value.length - 1) return 0
  return currentIndex.value - 1
})

let touchStartX = 0
let touchCurrentX = 0
let isDragging = false
const dragOffset = ref(0)

const trackStyle = computed(() => {
  const bannerWidth = 85
  const gap = 4
  const centeringOffset = (100 - bannerWidth) / 2
  const baseOffset = -currentIndex.value * (bannerWidth + gap) + centeringOffset
  const offset = baseOffset + dragOffset.value
  const transition = isDragging || !isTransitioning.value ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  return {
    transform: `translateX(${offset}%)`,
    transition
  }
})

onMounted(async () => {
  // Use SSR data immediately if available
  if (props.initialBanners && props.initialBanners.length > 0) {
    banners.value = props.initialBanners
    currentIndex.value = 1
    hydrated.value = true
    if (banners.value.length > 1) {
      startAutoplay()
    }
  } else {
    // Fallback to API if no SSR data
    try {
      const data = await apiBannersListRoute.run(ctx)
      banners.value = data ?? []
      currentIndex.value = 1
      if (banners.value.length > 1) {
        startAutoplay()
      }
    } catch (e) {
      banners.value = []
    }
    hydrated.value = true
  }
})

function getCleanHash(hash) {
  if (!hash) return ''
  return hash.replace(/\.[^/.]+$/, '')
}

function getBannerUrl(hash) {
  if (!hash) return ''
  return getThumbnailUrl(hash, 320, undefined)
}


function goToSlide(idx) {
  isTransitioning.value = true
  currentIndex.value = idx + 1
  resetAutoplay()
  clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => {
    isTransitioning.value = false
  }, 400)
}

function nextSlide() {
  if (banners.value.length === 0) return
  isTransitioning.value = true
  currentIndex.value++
  
  clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => {
    if (currentIndex.value === extendedBanners.value.length - 1) {
      isTransitioning.value = false
      currentIndex.value = 1
    }
    isTransitioning.value = false
  }, 400)
}

function prevSlide() {
  if (banners.value.length === 0) return
  isTransitioning.value = true
  currentIndex.value--
  
  clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => {
    if (currentIndex.value === 0) {
      isTransitioning.value = false
      currentIndex.value = extendedBanners.value.length - 2
    }
    isTransitioning.value = false
  }, 400)
}

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX
  touchCurrentX = touchStartX
  isDragging = true
  dragOffset.value = 0
  stopAutoplay()
}

function handleTouchMove(e) {
  if (!isDragging) return
  touchCurrentX = e.touches[0].clientX
  const diff = touchCurrentX - touchStartX
  const viewportWidth = e.currentTarget.parentElement.offsetWidth
  const dragPercent = (diff / viewportWidth) * 100
  dragOffset.value = dragPercent
}

function handleTouchEnd() {
  if (!isDragging) return
  isDragging = false
  
  const diff = touchStartX - touchCurrentX
  const threshold = 50
  
  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
  
  dragOffset.value = 0
  resetAutoplay()
}

function startAutoplay() {
  stopAutoplay()
  autoplayTimer = setInterval(nextSlide, 10000)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function resetAutoplay() {
  if (banners.value.length > 1) {
    startAutoplay()
  }
}

function handleBannerClick(e, banner) {
  if (Math.abs(dragOffset.value) > 2) {
    e.preventDefault()
    return
  }
  if (!banner.link || banner.link === '#') {
    e.preventDefault()
  }
}

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
.banner-container {
  position: relative;
  left: 0;
  right: 0;
  z-index: 19;
  margin-top: 8px;
  min-height: 80px;
}

@media (min-width: 768px) {
  .banner-container {
    display: none;
  }
}

.banner-viewport {
  position: relative;
  overflow: hidden;
  padding: 0 16px;
}

.banner-track {
  display: flex;
  gap: 16px;
  will-change: transform;
  touch-action: pan-y;
}

.banner-item {
  flex-shrink: 0;
  width: 85%;
  aspect-ratio: 4 / 1.5;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-placeholder-light);
}

.banner-slide {
  width: 100%;
  height: 100%;
  display: block;
  position: relative;
  transition: filter 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.banner-slide.has-link {
  cursor: pointer;
}

.banner-slide.has-link:active {
  filter: brightness(0.92);
}

.banner-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
}

.banner-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}

.banner-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-dot-inactive);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.25s;
}

.banner-dot.active {
  background: var(--color-primary);
  width: 18px;
  border-radius: 3px;
}

.banner-skeleton {
  width: 85%;
  margin: 0 auto;
  aspect-ratio: 4 / 1.5;
  border-radius: 12px;
  background: #f0f0f0;
  animation: banner-fade 1.5s ease-in-out infinite;
}

@keyframes banner-fade {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
</style>