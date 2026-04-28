<template>
  <CartModal />
  <div class="header-root">
    <!-- Floating header container -->
    <div class="header-pill">

      <!-- MOBILE: Burger button (left) -->
      <button class="icon-btn burger-btn mobile-only" @click="drawerOpen = !drawerOpen" aria-label="Открыть меню">
        <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor"><path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/></svg>
      </button>

      <!-- Logo -->
      <div class="logo-wrap">
        <a href="/v-2" class="logo-link">
          <span class="logo-teo">ТЕО</span>
          <template v-if="pageName">
            <span class="logo-divider mobile-only">|</span>
            <span class="logo-page mobile-only">{{ pageName }}</span>
          </template>
        </a>
      </div>

      <!-- DESKTOP + TABLET: Nav center -->
      <nav class="desktop-nav desktop-only">
        <a
          v-for="item in navItems"
          :key="item.key"
          :href="item.href"
          class="nav-item"
          :class="{ active: activeNav === item.key }"
          @click="activeNav = item.key"
        >{{ item.label }}</a>
      </nav>

      <!-- Right actions -->
      <div class="right-actions">
        <a v-if="isLoggedIn" :href="profileUrl" class="account-link desktop-only">
          {{ userName }}
        </a>
        <a v-else :href="signinUrl" class="account-link desktop-only">
          Войти
        </a>
        <button class="icon-btn cart-btn" aria-label="Корзина" @click="onCartClick">
          <svg width="20" height="20" viewBox="0 0 576 512" fill="currentColor"><path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.8 14.9 16.1 25.5 31.4 25.5L502 342c13.3 0 24 10.7 24 24s-10.7 24-24 24l-274.1 0c-33.7 0-63.6-23.6-70.8-56.7L105.2 56 69.5 56 24 56C10.7 56 0 45.3 0 32L0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>
          <span v-if="cartCount > 0" class="cart-badge"></span>
        </button>
      </div>
    </div>

    <!-- Drawer Overlay -->
    <Teleport to="body">
      <transition name="overlay">
        <div v-if="drawerOpen" class="drawer-overlay" @click="drawerOpen = false"></div>
      </transition>

      <!-- Mobile Drawer -->
      <transition name="drawer">
        <div v-if="drawerOpen" class="drawer">
          <div class="drawer-header">
            <span class="drawer-logo">{{ cfg?.company?.name || 'ТЕО' }}</span>
            <button class="icon-btn drawer-close" @click="drawerOpen = false" aria-label="Закрыть">
              <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            </button>
          </div>
          <nav class="drawer-nav">
            <a
              v-for="item in navItems"
              :key="item.key"
              :href="item.href"
              class="drawer-item"
              @click="drawerOpen = false"
            >{{ item.label }}</a>
          </nav>
          <div class="drawer-divider"></div>
          <template v-if="isLoggedIn">
            <a :href="profileUrl" class="drawer-item drawer-account" @click="drawerOpen = false">
              <svg class="drawer-account-icon" width="15" height="15" viewBox="0 0 448 512" fill="currentColor"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>
              {{ userName }}
            </a>
          </template>
          <template v-else>
            <a :href="signinUrl" class="drawer-item drawer-account" @click="drawerOpen = false">
              <svg class="drawer-account-icon" width="15" height="15" viewBox="0 0 448 512" fill="currentColor"><path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/></svg>
              Войти
            </a>
          </template>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent, watch } from 'vue'
import { useCart } from '../shared/useCart'
import { useConfig } from '../shared/useConfig'
import { profilePageRoute } from '../profile'

defineEmits([])
defineExpose({})

// Lazy load CartModal - heavy component (1300+ lines)
const CartModal = defineAsyncComponent({
  loader: () => import('./CartModal.vue'),
  delay: 0,
  suspensible: false
})

const props = defineProps({
  pageName: { type: String, default: '' },
  initialUser: { type: Object, default: null }
})

const drawerOpen = ref(false)
const { totalCount: cartCount, openCart } = useCart()
const { config: cfg, loadConfig } = useConfig()

// Determine active nav based on current URL
function getActiveNavFromUrl() {
  const path = window.location.pathname
  const hash = window.location.hash
  
  // Check for contacts (hash anchor)
  if (hash === '#contacts') return 'contacts'
  
  // Check each nav item
  const items = cfg.value?.nav || [
    { label: 'Каталог', href: '/v-2/catalog', key: 'catalog' },
    { label: 'Доставка', href: '/v-2/delivery', key: 'delivery' },
    { label: 'О нас', href: '/v-2/about', key: 'about' },
    { label: 'Контакты', href: '#contacts', key: 'contacts' },
  ]
  
  for (const item of items) {
    if (item.href.startsWith('#')) continue // Skip hash links
    if (path === item.href || path.startsWith(item.href + '/')) {
      return item.key
    }
  }
  
  return ''
}

const activeNav = ref('')

// Update active nav on mount and when URL changes
onMounted(() => {
  loadConfig()
  activeNav.value = getActiveNavFromUrl()
  
  // Listen for hash changes (for contacts anchor)
  window.addEventListener('hashchange', () => {
    activeNav.value = getActiveNavFromUrl()
  })
})

// Also update when config loads (in case nav items change)
watch(cfg, () => {
  if (typeof window !== 'undefined') {
    activeNav.value = getActiveNavFromUrl()
  }
}, { immediate: true })

function onCartClick() {
  drawerOpen.value = false
  openCart()
}

// Use SSR user data as initial value, fallback to ctx.user
const isLoggedIn = computed(() => {
  const user = props.initialUser || ctx.user
  return !!user && user.type === 'Real'
})
const userName = computed(() => {
  const user = props.initialUser || ctx.user
  if (!user) return ''
  return user.firstName || user.displayName || 'Кабинет'
})
const profileUrl = computed(() => profilePageRoute.url())
const signinUrl = computed(() => {
  const back = encodeURIComponent(window.location.pathname + window.location.search)
  return `/s/auth/signin?back=${back}`
})

const navItems = computed(() => cfg.value?.nav || [
  { label: 'Каталог', href: '/v-2/catalog', key: 'catalog' },
  { label: 'Доставка', href: '/v-2/delivery', key: 'delivery' },
  { label: 'О нас', href: '/v-2/about', key: 'about' },
  { label: 'Контакты', href: '#contacts', key: 'contacts' },
])

</script>

<style scoped>
.header-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-width: 100vw;
  z-index: 1000;
  pointer-events: none;
}

.header-pill {
  height: 64px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  box-shadow: 0 2px 12px var(--color-shadow);
  pointer-events: all;
}

.logo-wrap {
  flex: 0 0 auto;
  max-width: 280px;
  height: 100%;
  display: flex;
  align-items: center;
}

.logo-link {
  font-size: 42px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -1px;
  color: var(--color-text-dark);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: baseline;
  height: 100%;
  transition: color 0.2s ease;
}

.logo-link:hover {
  color: var(--color-text-soft);
}

.logo-teo {
  font-family: 'TEO Font', sans-serif;
  font-weight: 400;
  display: flex;
  align-items: center;
  height: 100%;
}

.logo-page {
  font-size: 24px;
  font-weight: 400;
  color: var(--color-text-light-gray);
  text-transform: lowercase;
}

.logo-divider {
  color: var(--color-text-light-gray);
  font-weight: 300;
  margin: 0 2px;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  color: #000;
  text-decoration: none;
  padding: 10px 8px;
  min-height: 44px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  transition: color 0.2s ease, background 0.2s ease;
  white-space: nowrap;
  position: relative;
}

.nav-item:hover {
  color: var(--color-primary-dark);
  background: var(--color-primary-hover-bg);
}

.nav-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.nav-item.active {
  color: var(--color-primary-dark);
  font-weight: 600;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 0 0 auto;
}

.account-link {
  font-size: 15px;
  line-height: 22px;
  font-weight: 500;
  color: #000;
  text-decoration: none;
  white-space: nowrap;
  padding: 11px 8px;
  min-height: 44px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  transition: color 0.2s ease, background 0.2s ease;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
}

.account-link:hover {
  color: var(--color-primary-dark);
  background: var(--color-primary-hover-bg);
}

.account-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-dark);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: color 0.2s ease, background 0.2s ease;
  position: relative;
  flex-shrink: 0;
}

.icon-btn:hover {
  color: var(--color-primary-dark);
  background: var(--color-primary-hover-bg);
}

.icon-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.cart-btn {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid var(--color-white);
  pointer-events: none;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-shadow-dark);
  z-index: 998;
  pointer-events: all;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid var(--color-border);
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 10px 30px var(--color-shadow);
  z-index: 999;
  padding: 0 24px 32px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  pointer-events: all;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  flex-shrink: 0;
}

.drawer-logo {
  font-family: 'TEO Font', sans-serif;
  font-size: 22px;
  font-weight: 400;
  color: var(--color-text-dark);
  letter-spacing: 0;
}

.drawer-close {
  color: var(--color-text-soft);
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
}

.drawer-item {
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  color: #000;
  text-decoration: none;
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 12px;
  transition: color 0.2s ease, background 0.2s ease, font-weight 0s;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  width: 100%;
  text-align: left;
}

.drawer-item:hover {
  color: var(--color-primary-dark);
  background: var(--color-primary-hover-bg);
}

.drawer-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.drawer-divider {
  height: 1px;
  background: var(--color-border);
  margin: 16px 0;
}

.drawer-account {
  margin-top: 4px;
}

.drawer-account-icon {
  margin-right: 10px;
  color: var(--color-text-soft);
  flex-shrink: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(-100%);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.25s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

@media (min-width: 1280px) {
  .header-pill {
    height: 64px;
    padding: 0 48px;
  }

  .desktop-nav {
    gap: 32px;
  }

  .nav-item {
    font-size: 16px;
    line-height: 24px;
  }

  .right-actions {
    gap: 16px;
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .header-pill {
    height: 60px;
    padding: 0 24px;
  }

  .logo-link {
    font-size: 36px;
    line-height: 1;
  }

  .logo-page {
    font-size: 20px;
  }

  .desktop-nav {
    gap: 24px;
  }

  .nav-item {
    font-size: 15px;
    line-height: 22px;
  }

  .account-link {
    font-size: 15px;
    line-height: 22px;
  }

  .right-actions {
    gap: 16px;
  }
}

@media (max-width: 767px) {
  .header-pill {
    height: 60px;
    padding: 0 16px;
    justify-content: space-between;
  }

  .logo-wrap {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    max-width: 180px;
  }

  .logo-link {
    font-size: 32px;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .logo-page {
    font-size: 18px;
  }

  

  .right-actions {
    gap: 0;
    margin-left: auto;
  }
}

.desktop-only {
  display: none;
}

.mobile-only {
  display: flex;
}

@media (min-width: 768px) {
  .desktop-only {
    display: flex;
  }

  .mobile-only {
    display: none !important;
  }
}
</style>