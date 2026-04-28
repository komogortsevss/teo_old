<template>
  <div ref="containerRef" :style="{ minHeight: minHeight + 'px' }" class="lazy-container">
    <div v-if="isVisible" class="lazy-content">
      <slot />
    </div>
    <div v-else class="lazy-placeholder" :style="{ height: minHeight + 'px' }">
      <!-- Placeholder content while loading -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  /**
   * Minimum height to reserve space and prevent CLS
   */
  minHeight: {
    type: Number,
    default: 400
  },
  /**
   * Root margin for intersection observer (pixels before entering viewport)
   */
  rootMargin: {
    type: Number,
    default: 200
  },
  /**
   * Load immediately (disable lazy loading)
   */
  eager: {
    type: Boolean,
    default: false
  }
})

const containerRef = ref(null)
const isVisible = ref(props.eager)

let observer = null

onMounted(() => {
  if (props.eager) {
    isVisible.value = true
    return
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isVisible.value = true
            // Disconnect after first visibility
            if (observer) {
              observer.disconnect()
            }
          }
        })
      },
      {
        rootMargin: `${props.rootMargin}px`,
        threshold: 0
      }
    )

    if (containerRef.value) {
      observer.observe(containerRef.value)
    }
  } else {
    // Fallback for browsers without IntersectionObserver
    isVisible.value = true
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.lazy-container {
  width: 100%;
}

.lazy-placeholder {
  background: #f0f0f0;
  animation: lazy-fade 1.5s ease-in-out infinite;
  border-radius: 12px;
}

@keyframes lazy-fade {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

.lazy-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>