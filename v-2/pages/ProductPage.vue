<template>
  <div>
    <header class="pp-header">
      <div class="pp-header-inner">
        <a :href="catalogUrl" class="pp-back">
          <i class="fa-solid fa-arrow-left"></i>
          Каталог
        </a>
        
      </div>
    </header>

    <main class="pp-main">
      <div v-if="loading" class="pp-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        Загружаем букет…
      </div>

      <div v-else-if="!product" class="pp-not-found">
        <i class="fa-solid fa-leaf"></i>
        <p>Букет не найден</p>
        <a :href="catalogUrl" class="pp-to-catalog">Вернуться в каталог</a>
      </div>

      <template v-else>
        <nav class="pp-breadcrumbs" aria-label="Хлебные крошки">
          <a :href="homeUrl">Главная</a>
          <span class="pp-sep">/</span>
          <a :href="catalogUrlWithCategory">{{ categoryName || 'Каталог' }}</a>
          <span class="pp-sep">/</span>
          <span>{{ product.name }}</span>
        </nav>

        <ProductDetail :product="product" @add-to-cart="handleAddToCart" @open-product="handleOpenProduct" />

        <Transition name="toast">
          <div v-if="toastVisible" class="pp-toast">
            <i class="fa-solid fa-check-circle"></i>
            {{ toastText }}
          </div>
        </Transition>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductDetail from '../components/ProductDetail.vue'
import { apiProductGetRoute } from '../api/products/get'
import { apiProductGetBySlugRoute } from '../api/products/get-by-slug'
import { catalogPageRoute } from '../catalog'
import { indexPageRoute } from '../index'
import { productSeoPageRoute } from '../product-seo'

const product = ref(null)
const category = ref(null)
const loading = ref(true)
const toastVisible = ref(false)
const toastText = ref('')
let toastTimer = null

const catalogUrl = catalogPageRoute.url()
const homeUrl = indexPageRoute.url()

const categoryName = computed(() => category.value?.name || '')
const categorySlug = computed(() => category.value?.slug || '')

const catalogUrlWithCategory = computed(() => {
  if (categorySlug.value) {
    return catalogPageRoute.query({ category: categorySlug.value }).url()
  }
  return catalogUrl
})

onMounted(async () => {
  // Пробуем получить данные из SSR
  if (window.__INITIAL_PRODUCT__) {
    product.value = window.__INITIAL_PRODUCT__
    if (window.__CATEGORY__) {
      category.value = window.__CATEGORY__
    }
    loading.value = false
    return
  }

  // Определяем тип URL: ЧПУ или старый формат
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  const isSeoUrl = pathParts.length >= 3 && pathParts[pathParts.length - 2] !== 'product'

  try {
    if (isSeoUrl) {
      // ЧПУ формат: /v-2/catalog/{category}/{product}
      const productSlug = pathParts[pathParts.length - 1]
      const categorySlugFromUrl = pathParts[pathParts.length - 2]
      
      const result = await apiProductGetBySlugRoute.query({ 
        category: categorySlugFromUrl, 
        slug: productSlug 
      }).run(ctx)
      
      if (result) {
        product.value = result
        category.value = { slug: categorySlugFromUrl, name: result.categoryName }
      }
    } else {
      // Старый формат: /v-2/product?id=xxx
      const params = new URLSearchParams(window.location.search)
      const id = params.get('id')
      
      if (id) {
        product.value = await apiProductGetRoute.query({ id }).run(ctx)
      }
    }
  } finally {
    loading.value = false
  }
})

function handleAddToCart({ product: p, quantity }) {
  toastText.value = `«${p.name}» × ${quantity} добавлен в корзину`
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, 2800)
}

function handleOpenProduct(relatedProduct) {
  if (relatedProduct.categorySlug && relatedProduct.slug) {
    // Используем ЧПУ если доступно
    window.location.href = productSeoPageRoute.query({ 
      category: relatedProduct.categorySlug, 
      slug: relatedProduct.slug 
    }).url()
  } else {
    // Fallback на старый формат
    window.location.href = '/v-2/product?id=' + relatedProduct.id
  }
}
</script>

<style scoped>
.pp-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-header-bg);
  backdrop-filter: blur(12px);
  
  height: 56px;
  display: flex;
  align-items: center;
}

.pp-header-inner {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pp-back {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
}

.pp-back:hover { color: var(--color-primary-dark); }
.pp-back i { font-size: 14px; }

.pp-logo {
  font-size: 22px;
  font-weight: 700;
  color: #000;
  text-decoration: none;
  letter-spacing: 0.02em;
}

.pp-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 96px 32px 80px;
}

.pp-loading,
.pp-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  color: #000;
  font-size: 18px;
}

.pp-loading i,
.pp-not-found i {
  font-size: 40px;
  opacity: 0.5;
}

.pp-to-catalog {
  margin-top: 8px;
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: underline;
}

.pp-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 32px;
  font-size: 13px;
  color: #000;
  flex-wrap: wrap;
}

.pp-breadcrumbs a {
  color: #000;
  text-decoration: none;
  transition: color 0.2s;
}

.pp-breadcrumbs a:hover { color: #000; }

.pp-sep {
  opacity: 0.5;
}

.pp-toast {
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

.pp-toast i { color: var(--color-white); font-size: 16px; }

.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

@media (max-width: 767px) {
  .pp-header-inner { padding: 0 16px; }
  .pp-main { padding: 80px 8px 48px; }
  .pp-breadcrumbs { margin-bottom: 20px; }
}
</style>