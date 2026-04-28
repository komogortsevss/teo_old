<template>
  <div class="catalog-page">
    <Header page-name="каталог" />
    <h1 class="sr-only">Каталог букетов — свежие цветы из Эквадора с доставкой</h1>

    <div class="catalog-controls">
      <div class="catalog-tabs-wrap">
        <CategoryTabs
          v-model="activeCategoryId"
          :categories="allCategories"
        />
      </div>
      <div class="catalog-subcontrols">
        <button class="sort-btn" @click="toggleSort">
          <span>Цена</span>
          <i class="fa-solid" :class="sortMode === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
        </button>
        <div class="price-filters">
          <template v-for="(f, i) in priceFilters" :key="f.key">
            <span v-if="i > 0" class="price-sep">|</span>
            <button
              class="price-filter-btn"
              :class="{ active: priceFilter === f.key, disabled: !isPriceFilterAvailable(f.key) }"
              :disabled="!isPriceFilterAvailable(f.key)"
              @click="togglePriceFilter(f.key)"
            >{{ f.label }}</button>
          </template>
        </div>
      </div>
    </div>

    <div v-if="loading" class="catalog-loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
      Загружаем букеты…
    </div>

    <div v-else-if="filteredProducts.length === 0" class="catalog-empty">
      <i class="fa-solid fa-leaf"></i>
      <p>В этой категории пока нет товаров</p>
    </div>

    <div v-else class="products-grid">
      <div
        v-for="(product, index) in filteredProducts"
        :key="product.id"
        class="card-wrap"
        :class="getMobileClass(index)"
      >
        <ProductCard
          :product="product"
          :variant="getMobileVariant(index)"
          :eager="index === 0"
          @add-to-cart="handleAddToCart"
          @open-product="handleOpenProduct"
        />
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast">
        <i class="fa-solid fa-check-circle"></i>
        {{ toastText }}
      </div>
    </Transition>

    <Transition name="fav-btn-anim">
      <a v-if="favoriteIds.length > 0" :href="favoritesUrl" class="fav-float">
        <i class="fa-solid fa-heart"></i>
        <span class="fav-float-count">{{ favoriteIds.length }}</span>
      </a>
    </Transition>
    <ProductModal
      :product="openedProduct"
      @close="handleCloseModal"
      @add-to-cart="handleAddToCart"
      @open-product="handleOpenProduct"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Header from '../components/Header.vue'
import CategoryTabs from '../components/catalog/CategoryTabs.vue'
import ProductCard from '../components/catalog/ProductCard.vue'
import ProductModal from '../components/ProductModal.vue'
import { apiCategoriesListRoute } from '../api/categories/list'
import { apiProductsListRoute } from '../api/products/list'
import { useFavorites } from '../shared/useFavorites'
import { favoritesPageRoute } from '../favorites'
import { productPageRoute } from '../product'
import { productSeoPageRoute } from '../product-seo'

const categories = ref([])
const products = ref([])
const loading = ref(true)
const activeCategoryId = ref(null)

const { favoriteIds } = useFavorites()
const favoritesUrl = favoritesPageRoute.url()

const allCategories = computed(() => {
  const totalCount = categories.value.reduce((sum, cat) => sum + (cat.count || 0), 0)
  return [
    { id: null, name: 'Все', slug: 'all', sortOrder: 0, count: totalCount },
    ...categories.value,
  ]
})

const sortMode = ref('asc')
const priceFilter = ref(null)

const priceFilters = [
  { key: 'under5', label: 'до 5к' },
  { key: '5to10', label: '5–10к' },
  { key: 'over10', label: '10к +' },
]

function toggleSort() {
  sortMode.value = sortMode.value === 'asc' ? 'desc' : 'asc'
}

function togglePriceFilter(key) {
  if (!isPriceFilterAvailable(key)) return
  priceFilter.value = priceFilter.value === key ? null : key
}

function isPriceFilterAvailable(key) {
  const categoryProducts = activeCategoryId.value
    ? products.value.filter(p => p.categoryId === activeCategoryId.value)
    : products.value

  if (key === 'under5') return categoryProducts.some(p => p.priceAmount < 5000)
  if (key === '5to10') return categoryProducts.some(p => p.priceAmount >= 5000 && p.priceAmount <= 10000)
  if (key === 'over10') return categoryProducts.some(p => p.priceAmount > 10000)
  return false
}

const filteredProducts = computed(() => {
  let list = activeCategoryId.value
    ? products.value.filter(p => p.categoryId === activeCategoryId.value)
    : products.value

  if (priceFilter.value === 'under5') list = list.filter(p => p.priceAmount < 5000)
  else if (priceFilter.value === '5to10') list = list.filter(p => p.priceAmount >= 5000 && p.priceAmount <= 10000)
  else if (priceFilter.value === 'over10') list = list.filter(p => p.priceAmount > 10000)

  const available = list.filter(p => p.isAvailable)
  const unavailable = list.filter(p => !p.isAvailable)

  if (sortMode.value === 'desc') {
    available.sort((a, b) => b.priceAmount - a.priceAmount)
    unavailable.sort((a, b) => b.priceAmount - a.priceAmount)
  } else {
    available.sort((a, b) => a.priceAmount - b.priceAmount)
    unavailable.sort((a, b) => a.priceAmount - b.priceAmount)
  }

  return [...available, ...unavailable]
})

const openedProduct = ref(null)
let prevUrl = ''

function handleOpenProduct(product) {
  openedProduct.value = product
  prevUrl = window.location.href
  
  // Используем ЧПУ если доступно
  let productUrl
  if (product.categorySlug && product.slug) {
    productUrl = productSeoPageRoute.query({ 
      category: product.categorySlug, 
      slug: product.slug 
    }).url()
  } else {
    productUrl = productPageRoute.query({ id: product.id }).url()
  }
  
  history.pushState({ productModal: true }, '', productUrl)
}

function handleCloseModal() {
  openedProduct.value = null
  if (prevUrl) {
    history.pushState({}, '', prevUrl)
    prevUrl = ''
  }
}

function handlePopState(e) {
  if (openedProduct.value) {
    openedProduct.value = null
    prevUrl = ''
  }
}
const toastVisible = ref(false)
const toastText = ref('')
let toastTimer = null

function getMobileVariant(index) {
  const pos = index % 6
  if (pos === 2) return 'large'
  if (pos === 5) return 'horizontal'
  return 'default'
}

function getMobileClass(index) {
  const pos = index % 6
  if (pos === 2) return 'card-large'
  if (pos === 5) return 'card-horizontal'
  return ''
}

function handleAddToCart({ product, quantity }) {
  toastText.value = `«${product.name}» × ${quantity} добавлен в корзину`
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2800)
}

onMounted(async () => {
  window.addEventListener('popstate', handlePopState)
  try {
    const [cats, prods] = await Promise.all([
      apiCategoriesListRoute.run(ctx),
      apiProductsListRoute.run(ctx),
    ])
    categories.value = cats
    products.value = prods

    const urlParams = new URLSearchParams(window.location.search)
    const catParam = urlParams.get('category')
    if (catParam && cats.some(c => c.id === catParam)) {
      activeCategoryId.value = catParam
    }
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})
</script>

<style scoped>
.catalog-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 120px 32px 80px;
  width: 100%;
  box-sizing: border-box;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.catalog-controls {
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
  overflow: visible;
}

.catalog-tabs-wrap {
  width: 100%;
  min-width: 0;
  overflow: visible;
}

.catalog-subcontrols {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 0;
}

.price-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.price-sep {
  color: var(--color-surface);
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  user-select: none;
}

.price-filter-btn {
  padding: 4px 0 4px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s, border-color 0.2s;
  line-height: 1;
}

.price-filter-btn:hover {
  color: #000;
}

.price-filter-btn.active {
  color: #000;
  font-weight: 600;
  border-bottom: 2.5px solid var(--color-primary);
}

.price-filter-btn.disabled {
  color: var(--color-surface);
  cursor: not-allowed;
  opacity: 0.5;
}

.price-filter-btn.disabled:hover {
  color: var(--color-surface);
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 0;
  border: none;
  background: transparent;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
  flex-shrink: 0;
}

.sort-btn:hover {
  color: #000;
}

.sort-btn i {
  font-size: 12px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
}

.card-wrap {
  content-visibility: auto;
  contain-intrinsic-size: 0 420px;
  min-width: 0;
}

.catalog-loading,
.catalog-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  color: var(--color-text-muted);
  font-size: 18px;
}

.catalog-loading i,
.catalog-empty i {
  font-size: 40px;
  opacity: 0.6;
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
  .catalog-page {
    padding: 100px 24px 64px;
    width: 100%;
  }
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (max-width: 767px) {
  .catalog-page {
    padding: 84px 16px 48px;
    width: 100%;
    min-width: 0;
  }
  .catalog-subcontrols {
    padding: 8px 0 0;
  }
  .sort-btn {
    font-size: 13px;
  }
  .price-filter-btn {
    font-size: 13px;
  }
  .catalog-title {
    font-size: 26px;
    line-height: 32px;
  }
  .products-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .card-large {
    grid-column: 1 / -1;
  }
  .card-horizontal {
    grid-column: 1 / -1;
  }
}

/* ── Floating favourites button ───────────────────────── */
.fav-float {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  background: var(--color-favorite-float);
  color: var(--color-white);
  border-radius: 50px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 8px 28px var(--color-primary-shadow-hover);
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}

.fav-float i {
  font-size: 16px;
}

.fav-float-count {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.fav-float:hover {
  background: var(--color-favorite-float-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px var(--color-primary-shadow-hover-strong);
}

.fav-btn-anim-enter-active,
.fav-btn-anim-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fav-btn-anim-enter-from,
.fav-btn-anim-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.85);
}

@media (max-width: 767px) {
  .fav-float {
    bottom: 20px;
    right: 16px;
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>