<template>
  <div v-if="showGreeting" :class="['greeting-card', { 'greeting-card--compact': isCompact }]">
    <div class="greeting-content">
      <span v-if="isLoggedIn && hasFirstName" class="greeting-title">Привет, {{ firstName }}!&nbsp;</span>
      <div class="greeting-body">
        <div class="greeting-info">
          <span class="greeting-text-line">Сегодня в каталоге</span>
          <span class="greeting-text-line"><strong>{{ availableCount }}</strong> {{ availableCount === 1 ? 'вариант' : [2, 3, 4].includes(availableCount % 10) && ![12, 13, 14].includes(availableCount % 100) ? 'варианта' : 'вариантов' }} букета</span>
        </div>
        <a :href="catalogUrl" class="greeting-button">
          <span>В каталог</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { apiProductsCountAvailableRoute } from '../api/products/count-available.ts'
import { catalogPageRoute } from '../catalog.tsx'

const props = defineProps({
  initialCount: { type: Number, default: 0 }
})

const isLoggedIn = computed(() => !!ctx.user && ctx.user.type === 'Real')

const firstName = computed(() => {
  if (!ctx.user) return ''
  return ctx.user.firstName || ''
})

const hasFirstName = computed(() => !!firstName.value)

// Use SSR count as initial value
const availableCount = ref(props.initialCount)
const catalogUrl = catalogPageRoute.url()

function bouquetWord(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'букет'
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'букета'
  return 'букетов'
}

const isCompact = computed(() => !isLoggedIn.value || !hasFirstName.value)

const showGreeting = computed(() => {
  // Показываем для авторизованных с именем или для всех если есть букеты
  return (isLoggedIn.value && hasFirstName.value) || availableCount.value > 0
})

// Only fetch if SSR data wasn't provided (fallback)
onMounted(async () => {
  if (props.initialCount > 0) return // Already have SSR data
  
  try {
    const result = await apiProductsCountAvailableRoute.run(ctx)
    availableCount.value = result.count || 0
  } catch (e) {
    console.error('Failed to load available products count', e)
  }
})
</script>

<style scoped>
 .greeting-card {
  margin: 12px 16px 20px;
  padding: 20px;
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  /* Fixed height to prevent CLS - compact for non-logged in */
  min-height: 128px;
  contain: layout style;
}

/* Compact version for non-logged in users (no "Hello, Name!") */
.greeting-card--compact {
  min-height: 90px;
  padding: 16px 20px;
}

.greeting-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.greeting-title {
  font-family: 'TT Norms', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-dark);
  line-height: 1.3;
}

.greeting-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.greeting-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.greeting-text-line {
  display: block;
  font-family: 'TT Norms', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-soft);
  line-height: 1.3;
}

.greeting-text-line strong {
  font-weight: 700;
  color: var(--color-primary);
}

.greeting-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--color-primary);
  color: var(--color-white);
  font-family: 'TT Norms', sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.greeting-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.greeting-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.greeting-button svg {
  transition: transform 0.2s ease;
}

.greeting-button:hover svg {
  transform: translateX(2px);
}

  @media (min-width: 768px) {
  .greeting-card {
    margin: 16px 32px 24px;
    padding: 24px;
    min-height: 112px;
  }
  .greeting-card--compact {
    min-height: 80px;
    padding: 20px 24px;
  }

  .greeting-title {
    font-size: 24px;
  }

  .greeting-body {
    gap: 20px;
  }

  .greeting-text-line {
    font-size: 16px;
  }

  .greeting-button {
    padding: 14px 24px;
    font-size: 15px;
  }
}

@media (min-width: 1280px) {
  .greeting-card {
    max-width: 1280px;
    margin: 20px auto 28px;
    padding: 26px;
    min-height: 128px;
  }
  .greeting-card--compact {
    min-height: 90px;
    padding: 22px 26px;
  }

  .greeting-title {
    font-size: 26px;
  }

  .greeting-text-line {
    font-size: 17px;
  }

  .greeting-button {
    padding: 16px 28px;
    font-size: 16px;
  }
}
</style>