<template>
  <!-- Fixed height container to prevent CLS - always reserve space -->
  <div class="stories-bar">
    <!-- SSR content is already rendered by server, Vue hydrates it -->
    <!-- Real content - rendered immediately if SSR data available -->
    <div v-if="highlights.length > 0" class="stories-scroll" data-stories-vue="true">
      <div
        v-for="(highlight, idx) in highlights"
        :key="idx"
        class="story-item"
        :class="{ 'story-seen': highlight.seen }"
        @click="openStory(idx)"
      >
        <div class="story-ring">
          <div class="story-avatar">
            <img 
              :src="getCoverUrl(highlight.coverHash)" 
              :alt="highlight.label" 
              width="80" 
              height="107"
              loading="lazy"
              fetchpriority="low"
              decoding="async"
            />
            <div class="story-label">{{ highlight.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Stories viewer -->
  <Teleport to="body">
    <div v-if="activeStory !== null" class="stories-viewer" @click.self="closeStory">
      <!-- Progress bars -->
      <div class="stories-progress">
        <div
          v-for="(slide, i) in highlights[activeStory].slides"
          :key="i"
          class="progress-track"
        >
          <div
            class="progress-fill"
            :style="getProgressStyle(i)"
          ></div>
        </div>
      </div>

      <!-- Header -->
      <div class="stories-header">
        <button class="stories-close" @click="closeStory">
          <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
        </button>
      </div>

      <!-- Slide image -->
      <div class="stories-media" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <div v-if="imageLoading" class="stories-loading">
          <div class="stories-spinner"></div>
        </div>
        <img
          :src="getSlideUrl(currentSlide.imageHash)"
          :srcset="`
            https://fs.chatium.ru/thumbnail/${getCleanHash(currentSlide.imageHash)}/s/320x427 320w,
            https://fs.chatium.ru/thumbnail/${getCleanHash(currentSlide.imageHash)}/s/600x800 600w
          `"
          sizes="100vw"
          :alt="currentSlide.text"
          class="stories-img"
          @load="onImageLoad"
          @error="onImageLoad"
          decoding="async"
        />
        <div v-if="currentSlide.text || currentSlide.buttonText" class="stories-caption">
          <p v-if="currentSlide.text">{{ currentSlide.text }}</p>
          <div v-if="currentSlide.price" class="stories-price">{{ currentSlide.price }}</div>
          <a
            v-if="currentSlide.buttonText"
            :href="currentSlide.buttonUrl || '#'"
            class="stories-btn"
            @click.stop
          >{{ currentSlide.buttonText }}</a>
        </div>
      </div>

      <!-- Tap zones -->
      <div class="tap-prev" @click="prevSlide"></div>
      <div class="tap-next" @click="nextSlide"></div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getThumbnailUrl } from '@app/storage'
import { apiStoriesListRoute } from '../api/stories/list'

const props = defineProps({
  initialStories: {
    type: Array,
    default: () => []
  }
})

const highlights = ref([])
const hydrated = ref(false)

// Always maintain stable height - no dynamic style changes

onMounted(async () => {
  // Use SSR data immediately if available
  if (props.initialStories && props.initialStories.length > 0) {
    const seenStories = getSeenStories()
    highlights.value = props.initialStories.map(s => {
      let slides = Array.isArray(s.slides) ? s.slides : []
      if (slides.length === 0 && s.coverHash) {
        slides = [{ imageHash: s.coverHash, text: s.label || '', price: '' }]
      }
      return { ...s, slides, seen: seenStories.includes(s.id) }
    }).filter(s => s.slides.length > 0)
    hydrated.value = true
  } else {
    // Fallback to API if no SSR data
    try {
      const data = await apiStoriesListRoute.run(ctx)
      const seenStories = getSeenStories()
      highlights.value = (data ?? []).map(s => {
        let slides = Array.isArray(s.slides) ? s.slides : []
        if (slides.length === 0 && s.coverHash) {
          slides = [{ imageHash: s.coverHash, text: s.label || '', price: '' }]
        }
        return { ...s, slides, seen: seenStories.includes(s.id) }
      }).filter(s => s.slides.length > 0)
    } catch (e) {
      highlights.value = []
    }
    hydrated.value = true
  }
})

function getSeenStories() {
  try {
    const stored = localStorage.getItem('teo_seen_stories')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function markStorySeen(storyId) {
  try {
    const seen = getSeenStories()
    if (!seen.includes(storyId)) {
      seen.push(storyId)
      localStorage.setItem('teo_seen_stories', JSON.stringify(seen))
    }
  } catch {}
}

function getCoverUrl(hash) {
  if (!hash) return ''
  return getThumbnailUrl(hash, 80, 107)
}

function getCleanHash(hash) {
  if (!hash) return ''
  return hash.replace(/\.[^/.]+$/, '')
}

function getSlideUrl(hash) {
  if (!hash) return ''
  return getThumbnailUrl(hash, 600, undefined)
}

function preloadSlide(hash) {
  if (!hash) return
  const img = new Image()
  img.src = getSlideUrl(hash)
}

const activeStory = ref(null)
const activeSlide = ref(0)
const progress = ref(0)
const imageLoading = ref(false)
let timer = null
const SLIDE_DURATION = 10000

const currentSlide = computed(() => {
  if (activeStory.value === null) return {}
  const story = highlights.value[activeStory.value]
  if (!story || !story.slides || story.slides.length === 0) return {}
  const slide = story.slides[activeSlide.value]
  if (!slide) return {}
  if (!slide.imageHash && story.coverHash) {
    return { ...slide, imageHash: story.coverHash }
  }
  return slide
})

function openStory(idx) {
  const story = highlights.value[idx]
  if (!story || !story.slides || story.slides.length === 0) return
  activeStory.value = idx
  activeSlide.value = 0
  progress.value = 0
  imageLoading.value = true
  stopTimer()
  document.body.style.overflow = 'hidden'
  preloadNextSlides(idx, 0)
}

function closeStory() {
  if (activeStory.value !== null) {
    const story = highlights.value[activeStory.value]
    story.seen = true
    markStorySeen(story.id)
  }
  activeStory.value = null
  activeSlide.value = 0
  stopTimer()
  document.body.style.overflow = ''
}

function nextSlide() {
  const slides = highlights.value[activeStory.value].slides
  if (activeSlide.value < slides.length - 1) {
    activeSlide.value++
    progress.value = 0
    imageLoading.value = true
    stopTimer()
    preloadNextSlides(activeStory.value, activeSlide.value)
  } else {
    const nextStory = activeStory.value + 1
    if (nextStory < highlights.value.length) {
      const story = highlights.value[activeStory.value]
      story.seen = true
      markStorySeen(story.id)
      activeStory.value = nextStory
      activeSlide.value = 0
      progress.value = 0
      imageLoading.value = true
      stopTimer()
      preloadNextSlides(nextStory, 0)
    } else {
      closeStory()
    }
  }
}

function prevSlide() {
  if (activeSlide.value > 0) {
    activeSlide.value--
    progress.value = 0
    imageLoading.value = true
    stopTimer()
  } else if (activeStory.value > 0) {
    activeStory.value--
    activeSlide.value = highlights.value[activeStory.value].slides.length - 1
    progress.value = 0
    imageLoading.value = true
    stopTimer()
  }
}

function onImageLoad() {
  imageLoading.value = false
  startTimer()
}

function preloadNextSlides(storyIdx, slideIdx) {
  const story = highlights.value[storyIdx]
  if (!story) return
  const slides = story.slides
  if (slideIdx + 1 < slides.length) {
    preloadSlide(slides[slideIdx + 1]?.imageHash)
  } else if (storyIdx + 1 < highlights.value.length) {
    const nextStory = highlights.value[storyIdx + 1]
    if (nextStory?.slides?.[0]?.imageHash) {
      preloadSlide(nextStory.slides[0].imageHash)
    }
  }
}

function startTimer() {
  stopTimer()
  const interval = 200
  timer = setInterval(() => {
    progress.value += (interval / SLIDE_DURATION) * 100
    if (progress.value >= 100) {
      progress.value = 100
      nextSlide()
    }
  }, interval)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function getProgressStyle(i) {
  if (i < activeSlide.value) return { width: '100%' }
  if (i === activeSlide.value) return { width: progress.value + '%' }
  return { width: '0%' }
}

let touchStartX = 0
function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
}
function onTouchEnd(e) {
  const diff = touchStartX - e.changedTouches[0].clientX
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextSlide()
    else prevSlide()
  }
}

onUnmounted(() => {
  stopTimer()
  document.body.style.overflow = ''
})
</script>

<style scoped>
.stories-bar {
  position: relative;
  left: 0;
  right: 0;
  padding: 4px 0 8px;
  z-index: 20;
  min-height: 115px;
}

@media (min-width: 768px) {
  .stories-bar {
    display: none;
  }
}

.stories-scroll {
  display: flex;
  gap: 8px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.stories-scroll::-webkit-scrollbar { display: none; }

.story-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  flex-shrink: 0;
  width: calc((100vw - 32px - 24px) / 4);
  max-width: 80px;
}

.story-ring {
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  overflow: hidden;
  transition: opacity 0.2s;
}

.story-seen .story-ring {
  opacity: 0.5;
}

.story-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: var(--color-placeholder-light);
}
.story-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


/* Viewer */
.stories-viewer {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: var(--color-viewer-bg);
}

.stories-progress {
  display: flex;
  gap: 4px;
  padding: 10px 12px 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.progress-track {
  flex: 1;
  height: 2.5px;
  background: var(--color-progress-track);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-white);
  border-radius: 2px;
  transition: width 0.18s linear;
}

.stories-header {
  position: absolute;
  top: 22px;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
}

.story-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 4px 4px;
  color: var(--color-white);
  font-size: 10px;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  pointer-events: none;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
}

.stories-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-white);
  font-size: 18px;
  cursor: pointer;
  text-shadow: 0 1px 4px var(--color-stories-text-shadow);
}

.stories-media {
  position: absolute;
  inset: 0;
}

.stories-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.stories-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 20px 32px;
  background: linear-gradient(to top, var(--gradient-caption-bg) 0%, transparent 100%);
  z-index: 9;
}

.stories-caption p {
  color: var(--color-white);
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 6px;
  text-shadow: 0 1px 6px var(--color-stories-text-shadow);
}

.stories-price {
  color: var(--color-white);
  font-size: 22px;
  font-weight: 700;
  text-shadow: 0 1px 6px var(--color-stories-text-shadow);
}

.stories-btn {
  display: inline-block;
  margin-top: 12px;
  padding: 12px 28px;
  background: var(--color-stories-btn-bg);
  color: var(--color-text-dark);
  font-size: 15px;
  font-weight: 700;
  border-radius: 100px;
  text-decoration: none;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 12px var(--color-stories-btn-shadow);
  transition: transform 0.12s ease, background 0.15s ease, box-shadow 0.12s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.stories-btn:hover { background: var(--color-white); }
.stories-btn:active {
  transform: scale(0.93);
  background: var(--color-stories-btn-active-bg);
  box-shadow: 0 1px 5px var(--color-stories-btn-active-shadow);
}

.stories-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  background: var(--color-loading-bg);
}

.stories-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-spinner-border);
  border-top-color: var(--color-white);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Tap zones */
.tap-prev, .tap-next {
  position: absolute;
  top: 60px;
  bottom: 0;
  width: 35%;
  z-index: 8;
  cursor: pointer;
}
.tap-prev { left: 0; }
.tap-next { right: 0; }

.story-skeleton {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background: #f0f0f0;
  animation: skeleton-fade 1.5s ease-in-out infinite;
}

@keyframes skeleton-fade {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}
</style>