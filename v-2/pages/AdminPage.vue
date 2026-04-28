<template>
  <div class="admin-page">
    <div class="admin-header">
      <div class="admin-logo">
        <span class="logo-text">ТЕО</span>
        <span class="logo-sep">|</span>
        <span class="logo-sub">Управление</span>
      </div>
      <a :href="storeUrl" class="btn-store" target="_blank">
        <i class="fas fa-store"></i>
        Магазин
      </a>
    </div>

    <!-- Вкладки -->
    <div class="admin-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'orders' }"
        @click="activeTab = 'orders'"
      >
        <i class="fas fa-shopping-bag"></i>
        Заказы
        <span class="tab-count">{{ orders.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'products' }"
        @click="activeTab = 'products'"
      >
        <i class="fas fa-seedling"></i>
        Букеты
        <span class="tab-count">{{ products.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'stories' }"
        @click="activeTab = 'stories'"
      >
        <i class="fas fa-images"></i>
        Сторис
        <span class="tab-count">{{ stories.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'banners' }"
        @click="activeTab = 'banners'"
      >
        <i class="fas fa-rectangle-ad"></i>
        Баннеры
        <span class="tab-count">{{ banners.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'hero' }"
        @click="activeTab = 'hero'"
      >
        <i class="fas fa-star"></i>
        Hero блок
        <span class="tab-count">{{ heroes.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'flowers' }"
        @click="activeTab = 'flowers'"
      >
        <i class="fas fa-seedling"></i>
        Цветы
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'stock' }"
        @click="activeTab = 'stock'"
      >
        <i class="fas fa-warehouse"></i>
        Склад
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'addons' }"
        @click="activeTab = 'addons'"
      >
        <i class="fas fa-gift"></i>
        Доп. товары
        <span class="tab-count">{{ addons.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'promos' }"
        @click="activeTab = 'promos'"
      >
        <i class="fas fa-ticket-alt"></i>
        Промокоды
        <span class="tab-count">{{ promos.length }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'loyalty' }"
        @click="activeTab = 'loyalty'"
      >
        <i class="fas fa-gift"></i>
        Теобонусы
        <span class="tab-count">{{ loyaltyStats?.activeCustomers || 0 }}</span>
      </button>
    </div>

    <div class="admin-content">
      <!-- Заказы -->
      <template v-if="activeTab === 'orders'">
        <div class="page-title-row">
          <h1 class="page-title">Заказы</h1>
          <div class="stats-chips">
            <span class="stat-chip">
              <span class="stat-dot dot-all"></span>
              Всего: {{ orders.length }}
            </span>
            <span class="stat-chip">
              <span class="stat-dot" style="background: #2563eb;"></span>
              Новых: {{ orders.filter(o => o.status === 'new').length }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Загрузка...</span>
        </div>

        <OrdersList
          v-else
          :orders="orders"
          @statusUpdated="loadData"
          @orderUpdated="loadData"
          @orderDeleted="loadData"
        />
      </template>

      <!-- Букеты -->
      <template v-if="activeTab === 'products'">
        <div class="page-title-row">
          <h1 class="page-title">Букеты</h1>
          <div class="stats-chips">
            <span class="stat-chip">
              <span class="stat-dot dot-all"></span>
              Всего: {{ products.length }}
            </span>
            <span class="stat-chip">
              <span class="stat-dot dot-available"></span>
              В наличии: {{ products.filter(p => p.isAvailable).length }}
            </span>
            <span class="stat-chip">
              <span class="stat-dot dot-unavailable"></span>
              Нет: {{ products.filter(p => !p.isAvailable).length }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Загрузка...</span>
        </div>

        <ProductList
          v-else
          :products="products"
          :categories="categories"
          @add="openProductForm(null)"
          @edit="openProductForm"
          @deleted="onProductDeleted"
          @updated="onUpdated"
        />
      </template>

      <!-- Сторис -->
      <template v-if="activeTab === 'stories'">
        <div class="page-title-row">
          <h1 class="page-title">Сторис</h1>
          <div class="stats-chips">
            <span class="stat-chip">
              <span class="stat-dot dot-all"></span>
              Всего: {{ stories.length }}
            </span>
            <span class="stat-chip">
              <span class="stat-dot dot-available"></span>
              Активных: {{ stories.filter(s => s.isActive).length }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Загрузка...</span>
        </div>

        <StoriesList
          v-else
          :stories="stories"
          @add="openStoryForm(null)"
          @edit="openStoryForm"
          @deleted="onStoryDeleted"
        />
      </template>

      <!-- Баннеры -->
      <template v-if="activeTab === 'banners'">
        <div class="page-title-row">
          <h1 class="page-title">Баннеры</h1>
          <div class="stats-chips">
            <span class="stat-chip">
              <span class="stat-dot dot-all"></span>
              Всего: {{ banners.length }}
            </span>
            <span class="stat-chip">
              <span class="stat-dot dot-available"></span>
              Активных: {{ banners.filter(b => b.isActive).length }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Загрузка...</span>
        </div>

        <BannersList
          v-else
          :banners="banners"
          @add="openBannerForm(null)"
          @edit="openBannerForm"
          @deleted="onBannerDeleted"
        />
      </template>

      <!-- Hero блок -->
      <template v-if="activeTab === 'hero'">
        <div class="page-title-row">
          <h1 class="page-title">Hero блоки</h1>
          <div class="stats-chips">
            <span class="stat-chip">
              <span class="stat-dot dot-all"></span>
              Всего: {{ heroes.length }}
            </span>
            <span class="stat-chip">
              <span class="stat-dot dot-available"></span>
              Активных: {{ heroes.filter(h => h.isActive).length }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Загрузка...</span>
        </div>

        <HeroesList
          v-else
          :heroes="heroes"
          @add="openHeroForm(null)"
          @edit="openHeroForm"
          @deleted="onHeroDeleted"
        />
      </template>

      <!-- Цветы -->
      <template v-if="activeTab === 'flowers'">
        <FlowersList />
      </template>

      <!-- Склад -->
      <template v-if="activeTab === 'stock'">
        <StockList />
      </template>

      <!-- Доп. товары -->
      <template v-if="activeTab === 'addons'">
        <div class="page-title-row">
          <h1 class="page-title">Дополнительные товары</h1>
          <div class="stats-chips">
            <span class="stat-chip">
              <span class="stat-dot dot-all"></span>
              Всего: {{ addons.length }}
            </span>
            <span class="stat-chip">
              <span class="stat-dot dot-available"></span>
              Активных: {{ addons.filter(a => a.isAvailable).length }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Загрузка...</span>
        </div>

        <AddonsList
          v-else
          :addons="addons"
          @add="openAddonForm(null)"
          @edit="openAddonForm"
          @deleted="onAddonDeleted"
        />
      </template>

      <!-- Промокоды -->
      <template v-if="activeTab === 'promos'">
        <div class="page-title-row">
          <h1 class="page-title">Промокоды</h1>
          <div class="stats-chips">
            <span class="stat-chip">
              <span class="stat-dot dot-all"></span>
              Всего: {{ promos.length }}
            </span>
            <span class="stat-chip">
              <span class="stat-dot dot-available"></span>
              Активных: {{ promos.filter(p => p.isActive).length }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Загрузка...</span>
        </div>

        <PromoList
          v-else
          :promos="promos"
          @create="openPromoForm(null)"
          @edit="openPromoForm"
          @toggle="onPromoToggle"
          @delete="onPromoDelete"
        />
      </template>

      <!-- Теобонусы -->
      <template v-if="activeTab === 'loyalty'">
        <div class="loyalty-admin">
          <div class="loyalty-tabs">
            <button
              class="loyalty-tab"
              :class="{ active: loyaltyTab === 'settings' }"
              @click="loyaltyTab = 'settings'"
            >
              Настройки
            </button>
            <button
              class="loyalty-tab"
              :class="{ active: loyaltyTab === 'customers' }"
              @click="loyaltyTab = 'customers'"
            >
              Клиенты
            </button>
            <button
              class="loyalty-tab"
              :class="{ active: loyaltyTab === 'reports' }"
              @click="loyaltyTab = 'reports'"
            >
              Отчёты
            </button>
          </div>

          <div v-if="loyaltyTab === 'settings'" class="loyalty-content">
            <LoyaltySettings />
          </div>
          <div v-if="loyaltyTab === 'customers'" class="loyalty-content">
            <CustomerBonuses />
          </div>
          <div v-if="loyaltyTab === 'reports'" class="loyalty-content">
            <LoyaltyReports />
          </div>
        </div>
      </template>
    </div>

    <!-- Формы -->
    <ProductForm
      v-if="productFormVisible"
      :product="editingProduct"
      :categories="categories"
      @close="closeProductForm"
      @saved="onProductSaved"
    />

    <StoryForm
      v-if="storyFormVisible"
      :story="editingStory"
      @close="closeStoryForm"
      @saved="onStorySaved"
    />

    <BannerForm
      v-if="bannerFormVisible"
      :banner="editingBanner"
      @close="closeBannerForm"
      @saved="onBannerSaved"
    />

    <HeroForm
      v-if="heroFormVisible"
      :hero="editingHero"
      @close="closeHeroForm"
      @saved="onHeroSaved"
    />

    <AddonForm
      v-if="addonFormVisible"
      :addon="editingAddon"
      @close="closeAddonForm"
      @saved="onAddonSaved"
    />

    <PromoForm
      v-if="promoFormVisible"
      :promo="editingPromo"
      @close="closePromoForm"
      @submit="onPromoSubmit"
    />

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">
        <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProductList from '../components/admin/ProductList.vue'
import ProductForm from '../components/admin/ProductForm.vue'
import StoriesList from '../components/admin/StoriesList.vue'
import StoryForm from '../components/admin/StoryForm.vue'
import BannersList from '../components/admin/BannersList.vue'
import BannerForm from '../components/admin/BannerForm.vue'
import HeroesList from '../components/admin/HeroesList.vue'
import HeroForm from '../components/admin/HeroForm.vue'
import AddonsList from '../components/admin/AddonsList.vue'
import AddonForm from '../components/admin/AddonForm.vue'
import OrdersList from '../components/admin/OrdersList.vue'
import FlowersList from '../components/admin/FlowersList.vue'
import StockList from '../components/admin/StockList.vue'
import PromoList from '../components/admin/PromoList.vue'
import PromoForm from '../components/admin/PromoForm.vue'
import LoyaltySettings from '../teo/admin-loyalty/components/admin/LoyaltySettings.vue'
import CustomerBonuses from '../teo/admin-loyalty/components/admin/CustomerBonuses.vue'
import LoyaltyReports from '../teo/admin-loyalty/components/admin/LoyaltyReports.vue'
import { apiAdminLoyaltyReportsSummaryRoute } from '../teo/admin-loyalty/api/admin/loyalty/reports/summary'
import { apiAdminProductsListRoute } from '../api/admin/products/list'
import { apiAdminStoriesListRoute } from '../api/admin/stories/list'
import { apiAdminBannersListRoute } from '../api/admin/banners/list'
import { apiCategoriesListRoute } from '../api/categories/list'
import { apiAdminHeroGetRoute } from '../api/admin/hero/get'
import { apiAdminAddonsListRoute } from '../api/admin/addons/list'
import { apiAdminOrdersListRoute } from '../api/admin/orders/list'
import { apiAdminPromoListRoute } from '../api/admin/promo/list'
import { apiAdminPromoCreateRoute } from '../api/admin/promo/create'
import { apiAdminPromoUpdateRoute } from '../api/admin/promo/update'
import { apiAdminPromoDeleteRoute } from '../api/admin/promo/delete'

const activeTab = ref('orders')
const loyaltyTab = ref('settings')
const loyaltyStats = ref({ activeCustomers: 0 })
const products = ref([])
const categories = ref([])
const stories = ref([])
const banners = ref([])
const heroes = ref([])
const addons = ref([])
const orders = ref([])
const promos = ref([])
const loading = ref(true)
const productFormVisible = ref(false)
const storyFormVisible = ref(false)
const bannerFormVisible = ref(false)
const heroFormVisible = ref(false)
const addonFormVisible = ref(false)
const promoFormVisible = ref(false)
const editingProduct = ref(null)
const editingStory = ref(null)
const editingBanner = ref(null)
const editingHero = ref(null)
const editingAddon = ref(null)
const editingPromo = ref(null)
const toast = ref(null)
const storeUrl = '/v-2'

async function loadData() {
  loading.value = true
  try {
    const [prods, cats, strs, bnrs, hrs, adds, ords, prms, loyStats] = await Promise.all([
      apiAdminProductsListRoute.run(ctx),
      apiCategoriesListRoute.run(ctx),
      apiAdminStoriesListRoute.run(ctx),
      apiAdminBannersListRoute.run(ctx),
      apiAdminHeroGetRoute.run(ctx),
      apiAdminAddonsListRoute.run(ctx),
      apiAdminOrdersListRoute.run(ctx),
      apiAdminPromoListRoute.run(ctx),
      apiAdminLoyaltyReportsSummaryRoute.run(ctx),
    ])
    products.value = prods
    categories.value = cats
    stories.value = strs
    banners.value = bnrs
    heroes.value = hrs
    addons.value = adds
    orders.value = ords
    promos.value = prms.promos || []
    loyaltyStats.value = {
      activeCustomers: loyStats?.summary?.activeCustomers || 0
    }
  } catch (e) {
    showToast('error', 'Ошибка загрузки данных')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

function openProductForm(product) {
  editingProduct.value = product
  productFormVisible.value = true
}

function closeProductForm() {
  productFormVisible.value = false
  editingProduct.value = null
}

async function onProductSaved() {
  closeProductForm()
  showToast('success', editingProduct.value ? 'Букет обновлён' : 'Букет создан')
  await loadData()
}

function onProductDeleted(id) {
  products.value = products.value.filter(p => p.id !== id)
  showToast('success', 'Букет удалён')
}

function onUpdated(data) {
  const idx = products.value.findIndex(p => p.id === data.id)
  if (idx !== -1) {
    products.value[idx] = { ...products.value[idx], ...data }
  }
  showToast('success', 'Сохранено')
}

function openStoryForm(story) {
  editingStory.value = story
  storyFormVisible.value = true
}

function closeStoryForm() {
  storyFormVisible.value = false
  editingStory.value = null
}

async function onStorySaved() {
  closeStoryForm()
  showToast('success', 'Сторис сохранена')
  await loadData()
}

function onStoryDeleted(id) {
  stories.value = stories.value.filter(s => s.id !== id)
  showToast('success', 'Сторис удалена')
}

function openBannerForm(banner) {
  editingBanner.value = banner
  bannerFormVisible.value = true
}

function closeBannerForm() {
  bannerFormVisible.value = false
  editingBanner.value = null
}

async function onBannerSaved() {
  closeBannerForm()
  showToast('success', 'Баннер сохранён')
  await loadData()
}

function onBannerDeleted(id) {
  banners.value = banners.value.filter(b => b.id !== id)
  showToast('success', 'Баннер удалён')
}

function openHeroForm(hero) {
  editingHero.value = hero
  heroFormVisible.value = true
}

function closeHeroForm() {
  heroFormVisible.value = false
  editingHero.value = null
}

async function onHeroSaved() {
  closeHeroForm()
  showToast('success', 'Hero блок сохранён')
  await loadData()
}

function onHeroDeleted(id) {
  heroes.value = heroes.value.filter(h => h.id !== id)
  showToast('success', 'Hero блок удалён')
}

function openAddonForm(addon) {
  editingAddon.value = addon
  addonFormVisible.value = true
}

function closeAddonForm() {
  addonFormVisible.value = false
  editingAddon.value = null
}

async function onAddonSaved() {
  closeAddonForm()
  showToast('success', 'Товар сохранён')
  await loadData()
}

function onAddonDeleted(id) {
  addons.value = addons.value.filter(a => a.id !== id)
  showToast('success', 'Товар удалён')
}

let toastTimer = null
function showToast(type, message) {
  toast.value = { type, message }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 3000)
}

function openPromoForm(promo) {
  editingPromo.value = promo
  promoFormVisible.value = true
}

function closePromoForm() {
  promoFormVisible.value = false
  editingPromo.value = null
}

async function onPromoSubmit(data) {
  try {
    const route = data.id ? apiAdminPromoUpdateRoute : apiAdminPromoCreateRoute
    const result = await route.run(ctx, data)
    if (result.success) {
      showToast('success', data.id ? 'Промокод обновлён' : 'Промокод создан')
      closePromoForm()
      await loadData()
    } else {
      showToast('error', result.error || 'Ошибка сохранения')
    }
  } catch (e) {
    showToast('error', 'Ошибка сохранения промокода')
  }
}

async function onPromoToggle(promo) {
  try {
    const result = await apiAdminPromoUpdateRoute.run(ctx, {
      id: promo.id,
      isActive: !promo.isActive,
    })
    if (result.success) {
      showToast('success', promo.isActive ? 'Промокод деактивирован' : 'Промокод активирован')
      await loadData()
    } else {
      showToast('error', result.error || 'Ошибка обновления')
    }
  } catch (e) {
    showToast('error', 'Ошибка обновления статуса')
  }
}

async function onPromoDelete(promo) {
  if (!confirm(`Удалить промокод «${promo.code}»?`)) return
  try {
    const result = await apiAdminPromoDeleteRoute.run(ctx, { id: promo.id })
    if (result.success) {
      showToast('success', result.message || 'Промокод удалён')
      await loadData()
    } else {
      showToast('error', result.error || 'Ошибка удаления')
    }
  } catch (e) {
    showToast('error', 'Ошибка удаления промокода')
  }
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--admin-bg-light);
  font-family: 'Roboto', sans-serif;
  isolation: isolate;
  --color-white: #FFFFFF;
  
  /* Лавандовая палитра из формы букета */
  --admin-primary: #A88BC8;
  --admin-primary-dark: #8E6FB2;
  --admin-accent: #DCCDEA;
  --admin-bg-light: #FFFFFF;
  --admin-bg-medium: #f0eaf7;
  --admin-border: #DCCDEA;
  --admin-text-dark: #2B2233;
  --admin-text-medium: #5F5568;
  --admin-text-soft: #6b7280;
  --admin-text-light: #9ca3af;
  --admin-accent-light: #d1d5db;
  --admin-success: #16a34a;
  --admin-danger: #ef4444;
}

.admin-header {
  background: var(--color-white, #fff);
  border-bottom: 1px solid var(--admin-bg-medium);
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(43,34,51,0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}
.admin-logo { display: flex; align-items: center; gap: 10px; }
.logo-text { font-family: 'TEO Font', sans-serif; font-size: 22px; font-weight: 400; color: var(--admin-text-dark); letter-spacing: 0; }
.logo-sep { color: var(--admin-accent-light); font-size: 18px; }
.logo-sub { font-size: 14px; color: var(--admin-text-light); font-weight: 400; }

.btn-store {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 16px;
  background: var(--admin-bg-light);
  color: var(--admin-primary);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid var(--admin-accent);
}
.btn-store:hover { 
  background: var(--admin-primary);
  color: var(--color-white);
  border-color: var(--admin-primary);
}

/* Tabs */
.admin-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 24px 0;
  background: var(--color-white, #fff);
  border-bottom: 1px solid var(--admin-bg-medium);
  position: sticky;
  top: 64px;
  z-index: 99;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  border: none;
  background: transparent;
  color: var(--admin-text-soft);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2.5px solid transparent;
  transition: all 0.2s;
  font-family: inherit;
}
.tab-btn:hover { color: var(--admin-primary-dark); }
.tab-btn.active {
  color: var(--admin-primary);
  border-bottom-color: var(--admin-primary);
}

.tab-count {
  background: var(--admin-bg-medium);
  color: var(--admin-primary-dark);
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 10px;
}
.tab-btn.active .tab-count { background: var(--admin-primary); color: var(--color-white); }

.admin-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  position: relative;
  z-index: 1;
  isolation: isolate;
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.page-title {
  font-size: 26px;
  font-weight: 800;
  color: var(--admin-text-dark);
  margin: 0;
}

.stats-chips { display: flex; gap: 10px; flex-wrap: wrap; }
.stat-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: var(--color-white);
  border-radius: 20px;
  font-size: 13px;
  color: var(--admin-text-soft);
  border: 1px solid var(--admin-bg-medium);
}
.stat-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.dot-all { background: var(--admin-primary); }
.dot-available { background: var(--admin-success); }
.dot-unavailable { background: var(--admin-danger); }

.loading-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 60px;
  justify-content: center;
  color: var(--admin-primary);
  font-size: 16px;
}
.loading-state i { font-size: 24px; }

/* Toast */
.toast {
  position: fixed;
  bottom: 32px;
  right: 32px;
  padding: 14px 20px;
  border-radius: 14px;
  color: var(--color-white);
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 999;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18);
}
.toast.success { background: var(--admin-success); }
.toast.error { background: var(--admin-danger); }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

@media (max-width: 768px) {
  .admin-header { padding: 0 16px; }
  .admin-content { padding: 20px 12px; }
  .toast { bottom: 16px; right: 16px; left: 16px; }
  .admin-tabs { padding: 8px 12px 0; overflow-x: auto; }
  .tab-btn { padding: 0 14px; font-size: 13px; white-space: nowrap; }
}
</style>