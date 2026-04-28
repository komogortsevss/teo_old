<template>
  <div class="page-root">
    <Header :initial-user="initialUser" />
    <!-- Карточка активного заказа (заменяет приветствие) -->
    <ActiveOrderCard v-if="activeOrder" :order="activeOrder" />

    <!-- Skeleton loader для активного заказа -->
    <div v-else-if="loadingActiveOrder" class="active-order-skeleton">
      <div class="skeleton-card">
        <div class="skeleton-header">
          <div class="skeleton-title"></div>
          <div class="skeleton-badge"></div>
        </div>
        <div class="skeleton-body">
          <div class="skeleton-info"></div>
          <div class="skeleton-stepper"></div>
        </div>
      </div>
    </div>

    <!-- Приветствие (показываем только если нет активного заказа) -->
    <Greeting v-else :initial-count="initialAvailableCount" />

    <StoriesHighlights :initial-stories="initialStories" />
    <BannerSlider :initial-banners="initialBanners" />

    <!-- Hero блоки всегда отображаются под баннерами -->
    <HeroBlocksList :initial-heroes="initialHeroes" />
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Header from '../components/Header.vue'
import Greeting from '../components/Greeting.vue'
import StoriesHighlights from '../components/StoriesHighlights.vue'
import BannerSlider from '../components/BannerSlider.vue'
import HeroBlocksList from '../components/HeroBlocksList.vue'
import ActiveOrderCard from '../components/ActiveOrderCard.vue'
import Footer from '../components/Footer.vue'
import { measureCoreWebVitals } from '../shared/performance.ts'
import { apiProfileActiveOrderRoute } from '../api/profile/active-order.ts'

const props = defineProps({
  initialHeroes: { type: Array, default: () => [] },
  initialStories: { type: Array, default: () => [] },
  initialBanners: { type: Array, default: () => [] },
  initialUser: { type: Object, default: null },
  initialAvailableCount: { type: Number, default: 0 }
})

const activeOrder = ref(null)
const loadingActiveOrder = ref(false)
let pollingInterval = null

// Загрузка активного заказа
const loadActiveOrder = async () => {
  if (!props.initialUser) {
    console.log('[ActiveOrder] No initialUser, skipping')
    return
  }
  
  console.log('[ActiveOrder] Loading for user:', props.initialUser.id, props.initialUser.displayName)
  
  try {
    const response = await apiProfileActiveOrderRoute.run(ctx)
    console.log('[ActiveOrder] Response:', JSON.stringify(response, null, 2))
    // Проверяем, что order существует и имеет id (не пустой объект)
    if (response.order && response.order.id) {
      const oldStatus = activeOrder.value?.status
      const newStatus = response.order.status
      
      // Показываем заказ даже если доставлен (до следующего дня)
      activeOrder.value = response.order
      console.log(`[ActiveOrder] Order updated: ${oldStatus} → ${newStatus}`)
    } else {
      activeOrder.value = null
      console.log('[ActiveOrder] No active order')
    }
  } catch (error) {
    console.log('[ActiveOrder] Error loading order:', error)
  }
}

onMounted(async () => {
  // Загружаем активный заказ только для авторизованных пользователей
  if (props.initialUser) {
    loadingActiveOrder.value = true
    try {
      await loadActiveOrder()
    } finally {
      loadingActiveOrder.value = false
    }
    
    // Polling для обновления статуса каждые 5 секунд
    pollingInterval = setInterval(() => {
      console.log('[ActiveOrder] Polling...')
      loadActiveOrder()
    }, 5000)
    console.log('[ActiveOrder] Polling started, interval:', pollingInterval)
  } else {
    // Если пользователь не авторизован, сразу сбрасываем loading
    loadingActiveOrder.value = false
    console.log('[ActiveOrder] No user, loading skipped')
  }

  measureCoreWebVitals((metric) => {
    console.log('[Web Vitals]', metric.name + ':', metric.value + 'ms (' + metric.rating + ')')
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.rating,
        non_interaction: true,
      })
    }
  })
})

// Очищаем интервал при размонтировании (должен быть на верхнем уровне!)
onUnmounted(() => {
  console.log('[ActiveOrder] Component unmounted, clearing interval:', pollingInterval)
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
})
</script>

<style scoped>
.page-root {
  min-height: 100vh;
  background: #FFFFFF;
  padding-top: 64px;
}

@media (max-width: 767px) {
  .page-root {
    padding-top: 60px;
  }
}

/* Skeleton loader styles */
.active-order-skeleton {
  margin: 20px auto 28px;
  max-width: 1280px;
  padding: 0;
}

@media (max-width: 767px) {
  .active-order-skeleton {
    margin: 12px 16px 20px;
    padding: 0;
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .active-order-skeleton {
    margin: 16px 32px 24px;
  }
}

.skeleton-card {
  background: var(--color-white, #FFFFFF);
  border-radius: 20px;
  box-shadow: 0 4px 24px var(--color-shadow, rgba(0, 0, 0, 0.10));
  overflow: hidden;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@media (max-width: 767px) {
  .skeleton-card {
    border-radius: 16px;
  }
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.06));
}

@media (max-width: 767px) {
  .skeleton-header {
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.skeleton-title {
  width: 180px;
  height: 24px;
  background: var(--color-surface, #E5E5E5);
  border-radius: 6px;
}

.skeleton-badge {
  width: 80px;
  height: 28px;
  background: var(--color-surface, #E5E5E5);
  border-radius: 14px;
}

.skeleton-body {
  padding: 24px;
}

@media (max-width: 767px) {
  .skeleton-body {
    padding: 20px;
  }
}

.skeleton-info {
  display: flex;
  gap: 32px;
  margin-bottom: 28px;
}

@media (max-width: 767px) {
  .skeleton-info {
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }
}

.skeleton-info::before,
.skeleton-info::after {
  content: '';
  width: 140px;
  height: 20px;
  background: var(--color-surface, #E5E5E5);
  border-radius: 4px;
}

.skeleton-stepper {
  height: 60px;
  background: var(--color-surface, #E5E5E5);
  border-radius: 8px;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>