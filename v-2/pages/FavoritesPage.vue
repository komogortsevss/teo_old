<template>
  <div class="favorites-page">
    <div class="favorites-header">
      <a :href="catalogUrl" class="back-link">
        <i class="fa-solid fa-arrow-left"></i>
        Каталог
      </a>
      <h1 class="favorites-title">Избранное</h1>
      <p class="favorites-subtitle">{{ favoriteIds.length }} {{ pluralBouquet(favoriteIds.length) }}</p>
    </div>

    <div v-if="favoriteIds.length === 0" class="favorites-empty">
      <i class="fa-regular fa-heart"></i>
      <p>Пока ничего не добавлено</p>
      <a :href="catalogUrl" class="go-catalog-btn">Перейти в каталог</a>
    </div>

    <div v-else-if="loading" class="favorites-loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
      Загружаем...
    </div>

    <div v-else class="products-grid">
      <div v-for="product in favoriteProducts" :key="product.id" class="card-wrap">
        <ProductCard :product="product" @add-to-cart="handleAddToCart" />
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast">
        <i class="fa-solid fa-check-circle"></i>
        {{ toastText }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ProductCard from '../components/catalog/ProductCard.vue'
import { apiProductsListRoute } from '../api/products/list'
import { useFavorites } from '../shared/useFavorites'
import { catalogPageRoute } from '../catalog'

const { favoriteIds } = useFavorites()
const catalogUrl = catalogPageRoute.url()

const allProducts = ref([])
const loading = ref(true)

const favoriteProducts = computed(() =>
  allProducts.value.filter(p => favoriteIds.value.includes(p.id))
)

function pluralBouquet(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'букет'
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'букета'
  return 'букетов'
}

const toastVisible = ref(false)
const toastText = ref('')
let toastTimer = null

function handleAddToCart({ product, quantity }) {
  toastText.value = `«${product.name}» × ${quantity} добавлен в корзину`
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 2800)
}

onMounted(async () => {
  try {
    allProducts.value = await apiProductsListRoute.run(ctx)
  } finally {
    loading.value = false
  }
})

watch(favoriteProducts, (products) => {
  if (!loading.value && products.length === 0) {
    window.location.href = catalogUrl
  }
})
</script>

<style scoped>
.favorites-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 100px 32px 80px;
  width: 100%;
  box-sizing: border-box;
}

.favorites-header {
  margin-bottom: 40px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 20px;
  transition: color 0.18s;
}

.back-link:hover {
  color: var(--color-primary-dark);
}

.favorites-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text-dark);
  line-height: 44px;
  margin: 0 0 8px;
}

.favorites-subtitle {
  font-size: 16px;
  color: var(--color-text-soft);
  margin: 0;
}

.favorites-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  color: var(--color-text-soft);
  font-size: 18px;
  text-align: center;
}

.favorites-empty i {
  font-size: 56px;
  opacity: 0.5;
}

.go-catalog-btn {
  margin-top: 8px;
  display: inline-block;
  padding: 12px 28px;
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: 14px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s;
}

.go-catalog-btn:hover {
  background: var(--color-primary-dark);
}

.favorites-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  color: var(--color-text-soft);
  font-size: 18px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
}

.card-wrap {
  min-width: 0;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: var(--color-white);
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 8px 24px var(--color-primary-shadow);
  z-index: 9999;
  white-space: nowrap;
}

.toast i {
  color: var(--color-white);
  font-size: 16px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

@media (max-width: 1279px) {
  .favorites-page {
    padding: 90px 24px 64px;
  }
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (max-width: 767px) {
  .favorites-page {
    padding: 80px 16px 48px;
  }
  .favorites-title {
    font-size: 26px;
    line-height: 32px;
  }
  .products-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}
</style>