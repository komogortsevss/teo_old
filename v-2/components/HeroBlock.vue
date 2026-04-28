<template>
  <section v-if="heroData && heroData.isActive" class="hero-block">
    <div class="hero-container">
      <div v-if="heroImage" class="hero-background">
        <picture>
          <source
            v-if="heroData.mobileImageHash"
            media="(max-width: 767px)"
            :srcset="`
              ${getImageUrl(heroData.mobileImageHash, 414)} 414w,
              ${getImageUrl(heroData.mobileImageHash, 640)} 640w,
              ${getImageUrl(heroData.mobileImageHash, 768)} 768w,
              ${getImageUrl(heroData.mobileImageHash, 828)} 828w,
              ${getImageUrl(heroData.mobileImageHash, 1170)} 1170w,
              ${getImageUrl(heroData.mobileImageHash, 1290)} 1290w,
              ${getImageUrl(heroData.mobileImageHash, 1536)} 1536w
            `"
            sizes="100vw"
          />
          <source
            v-if="heroData.imageHash"
            media="(min-width: 768px)"
            :srcset="`
              ${getImageUrl(heroData.imageHash, 800)} 800w,
              ${getImageUrl(heroData.imageHash, 1280)} 1280w,
              ${getImageUrl(heroData.imageHash, 1600)} 1600w,
              ${getImageUrl(heroData.imageHash, 1920)} 1920w,
              ${getImageUrl(heroData.imageHash, 2560)} 2560w
            `"
            sizes="(min-width: 1344px) 1280px, calc(100vw - 64px)"
          />
          <img
            :src="getImageUrl(heroData.imageHash || heroData.mobileImageHash, 1280)"
            :srcset="heroData.imageHash ? `
              ${getImageUrl(heroData.imageHash, 800)} 800w,
              ${getImageUrl(heroData.imageHash, 1280)} 1280w,
              ${getImageUrl(heroData.imageHash, 1600)} 1600w,
              ${getImageUrl(heroData.imageHash, 1920)} 1920w,
              ${getImageUrl(heroData.imageHash, 2560)} 2560w
            ` : `
              ${getImageUrl(heroData.mobileImageHash, 414)} 414w,
              ${getImageUrl(heroData.mobileImageHash, 640)} 640w,
              ${getImageUrl(heroData.mobileImageHash, 768)} 768w,
              ${getImageUrl(heroData.mobileImageHash, 828)} 828w,
              ${getImageUrl(heroData.mobileImageHash, 1170)} 1170w,
              ${getImageUrl(heroData.mobileImageHash, 1290)} 1290w,
              ${getImageUrl(heroData.mobileImageHash, 1536)} 1536w
            `"
            sizes="(min-width: 1344px) 1280px, (min-width: 768px) calc(100vw - 64px), 100vw"
            :alt="heroData.title || 'Hero'"
            class="hero-image"
            loading="eager"
            :fetchpriority="isFirst ? 'high' : 'auto'"
            decoding="async"
          />
        </picture>
      </div>
      
      <div class="hero-content-wrapper">
        <div v-if="heroData.title || heroData.subtitle" class="hero-text">
          <h2 v-if="heroData.title" class="hero-title">{{ heroData.title }}</h2>
          <p v-if="heroData.subtitle" class="hero-subtitle">{{ heroData.subtitle }}</p>
        </div>
        
        <a
          v-if="heroData.buttonText && heroData.buttonLink"
          :href="heroData.buttonLink"
          class="hero-button"
          :class="`position-${heroData.buttonPosition || 'center-center'}`"
        >
          {{ heroData.buttonText }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getThumbnailUrl } from '@app/storage'

const emit = defineEmits<{}>()
defineExpose<{}>({})

const props = defineProps({
  heroData: {
    type: Object,
    required: true
  },
  isFirst: {
    type: Boolean,
    default: false
  }
})

const heroImage = computed(() => {
  return props.heroData?.imageHash || props.heroData?.mobileImageHash
})

function getImageUrl(hash, width) {
  return getThumbnailUrl(hash, width, undefined)
}
</script>

<style scoped>
.hero-block {
  width: 100%;
  position: relative;
  contain: layout style;
}

.hero-container {
  position: relative;
  width: calc(100% - 32px);
  max-width: 1280px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 20px;
  /* Fixed height to prevent CLS - LCP critical */
  height: 450px;
}

@media (min-width: 768px) {
  .hero-container {
    width: calc(100% - 64px);
    height: 500px;
  }
}

@media (min-width: 1025px) {
  .hero-container {
    height: 600px;
  }
}

@media (min-width: 1344px) {
  .hero-container {
    width: 1280px;
  }
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

 .hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Убран content-visibility для LCP - критичное изображение должно загружаться сразу */
}

.hero-content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  padding: 48px;
  display: flex;
  flex-direction: column;
}

.hero-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-white);
  margin: 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 20px;
  line-height: 1.6;
  color: var(--color-white);
  margin: 0;
  max-width: 600px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.hero-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 18px 36px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;
  position: absolute;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(155, 103, 68, 0.4);
}

.hero-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(155, 103, 68, 0.5);
}

.hero-button:active {
  transform: translateY(0);
}

/* Позиции кнопки */
.hero-button.position-top-left {
  top: 48px;
  left: 48px;
}

.hero-button.position-top-center {
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
}

.hero-button.position-top-center:hover {
  transform: translateX(-50%) translateY(-2px);
}

.hero-button.position-top-right {
  top: 48px;
  right: 48px;
}

.hero-button.position-center-left {
  top: 50%;
  left: 48px;
  transform: translateY(-50%);
}

.hero-button.position-center-left:hover {
  transform: translateY(-50%) translateY(-2px);
}

.hero-button.position-center-center {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hero-button.position-center-center:hover {
  transform: translate(-50%, -50%) translateY(-2px);
}

.hero-button.position-center-right {
  top: 50%;
  right: 48px;
  transform: translateY(-50%);
}

.hero-button.position-center-right:hover {
  transform: translateY(-50%) translateY(-2px);
}

.hero-button.position-bottom-left {
  bottom: 48px;
  left: 48px;
}

.hero-button.position-bottom-center {
  bottom: 48px;
  left: 50%;
  transform: translateX(-50%);
}

.hero-button.position-bottom-center:hover {
  transform: translateX(-50%) translateY(-2px);
}

.hero-button.position-bottom-right {
  bottom: 48px;
  right: 48px;
}

@media (max-width: 767px) {
  .hero-container {
    height: 450px;
    border-radius: 0;
    width: 100%;
  }

  .hero-content-wrapper {
    padding: 32px 24px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-button {
    padding: 16px 28px;
    font-size: 15px;
  }

  .hero-button.position-top-left,
  .hero-button.position-center-left,
  .hero-button.position-bottom-left {
    left: 24px;
  }

  .hero-button.position-top-right,
  .hero-button.position-center-right,
  .hero-button.position-bottom-right {
    right: 24px;
  }

  .hero-button.position-top-left,
  .hero-button.position-top-center,
  .hero-button.position-top-right {
    top: 32px;
  }

  .hero-button.position-bottom-left,
  .hero-button.position-bottom-center,
  .hero-button.position-bottom-right {
    bottom: 32px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .hero-container {
    height: 500px;
  }

  .hero-title {
    font-size: 40px;
  }

  .hero-subtitle {
    font-size: 18px;
  }
}
</style>