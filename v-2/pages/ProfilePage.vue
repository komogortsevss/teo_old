<template>
  <div class="profile-page">
    <Header pageName="кабинет" />
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="profile-title">Личный кабинет</h1>
        <button class="logout-btn" @click="logout">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
          Выйти
        </button>
      </div>

      <div v-if="loading" class="profile-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
      </div>

      <template v-else>
        <div class="tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            <i class="fa-solid fa-user"></i>
            Профиль
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'bonuses' }"
            @click="activeTab = 'bonuses'"
          >
            <i class="fa-solid fa-gift"></i>
            Бонусы
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'orders' }"
            @click="activeTab = 'orders'"
          >
            <i class="fa-solid fa-bag-shopping"></i>
            Заказы
            <span v-if="orders.length > 0" class="tab-badge">{{ orders.length }}</span>
          </button>
        </div>

        <div v-if="activeTab === 'profile'" class="tab-content">
          <div class="profile-sections">
            <ProfileInfo
              ref="profileInfoRef"
              :first-name="userData.firstName"
              :last-name="userData.lastName"
              :phone="userData.phone"
              :email="userData.email"
            />
            
            <div class="addresses-section">
              <h3 class="section-title">Мои адреса</h3>
              
              <AddressForm
                ref="homeAddressRef"
                type="home"
                :address="homeAddressData"
              />
              
              <AddressForm
                ref="workAddressRef"
                type="work"
                :address="workAddressData"
              />
            </div>

            <Transition name="fade">
              <div v-if="saved" class="save-success">
                <i class="fa-solid fa-check"></i> Сохранено
              </div>
            </Transition>

            <button class="save-all-btn" @click="saveAll" :disabled="saving || !hasAnyChanges">
              <template v-if="saving">
                <i class="fa-solid fa-spinner fa-spin"></i> Сохраняем…
              </template>
              <template v-else>Сохранить</template>
            </button>
          </div>
        </div>

        <div v-else-if="activeTab === 'orders'" class="tab-content">
          <OrderHistory 
            :orders="orders" 
            :loading-orders="loadingOrders" 
            @update:order="onOrderUpdated"
          />
        </div>

        <div v-else-if="activeTab === 'bonuses'" class="tab-content">
          <BonusTab :user-id="userData.id" />
        </div>
      </template>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'

// Читаем tab из query параметров URL
const getInitialTab = () => {
  if (typeof window === 'undefined') return 'profile'
  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')
  return ['profile', 'bonuses', 'orders'].includes(tab) ? tab : 'profile'
}

const activeTab = ref(getInitialTab())

// Обновляем URL при смене вкладки
const updateUrlTab = (tab) => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('tab', tab)
  history.replaceState({ tab }, '', url)
}

// Слушаем изменения activeTab и обновляем URL
watch(activeTab, (newTab) => {
  updateUrlTab(newTab)
})

// Обрабатываем кнопку "назад" в браузере
const handlePopState = (event) => {
  const tab = event.state?.tab || getInitialTab()
  if (['profile', 'bonuses', 'orders'].includes(tab)) {
    activeTab.value = tab
  }
}

import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import ProfileInfo from '../components/profile/ProfileInfo.vue'
import AddressForm from '../components/profile/AddressForm.vue'
import OrderHistory from '../components/profile/OrderHistory.vue'
import BonusTab from '../components/profile/BonusTab.vue'
import { apiProfileGetRoute } from '../api/profile/get'
import { apiProfileUpdateRoute } from '../api/profile/update'
import { apiProfileOrdersRoute } from '../api/profile/orders'

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const loadingOrders = ref(true)

const profileInfoRef = ref(null)
const homeAddressRef = ref(null)
const workAddressRef = ref(null)

const userData = reactive({
  id: '',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
})

const homeAddressData = reactive({
  street: '',
  house: '',
  apartment: '',
  entrance: '',
  floor: '',
  intercom: '',
})

const workAddressData = reactive({
  street: '',
  house: '',
  apartment: '',
  entrance: '',
  floor: '',
  intercom: '',
})

const orders = ref([])
const ordersListRef = ref(null)
let scrollPosition = 0

const hasAnyChanges = computed(() => {
  const infoChanges = profileInfoRef.value?.hasChanges || false
  const homeChanges = homeAddressRef.value?.hasChanges || false
  const workChanges = workAddressRef.value?.hasChanges || false
  return infoChanges || homeChanges || workChanges
})

let ordersPollingInterval = null

// Интеллектуальное слияние заказов без полной перерисовки
function mergeOrders(newOrders) {
  if (!Array.isArray(newOrders)) return

  // Сохраняем позицию скролла
  const listContainer = document.querySelector('.oh-list')
  if (listContainer) {
    scrollPosition = listContainer.scrollTop
  }

  // Создаем Map существующих заказов для быстрого доступа
  const existingMap = new Map(orders.value.map(o => [o.id, o]))
  const newMap = new Map(newOrders.map(o => [o.id, o]))

  // Обновляем/добавляем заказы
  const merged = newOrders.map(newOrder => {
    const existing = existingMap.get(newOrder.id)
    if (existing) {
      // Проверяем, изменились ли поля
      const hasChanges = 
        existing.status !== newOrder.status ||
        existing.totalPrice !== newOrder.totalPrice ||
        existing.deliveryDate !== newOrder.deliveryDate ||
        existing.deliveryTime !== newOrder.deliveryTime

      if (hasChanges) {
        // Возвращаем новый объект с сохранением реактивности
        return { ...existing, ...newOrder }
      }
      // Возвращаем существующий объект (ссылка не меняется)
      return existing
    }
    // Новый заказ
    return newOrder
  })

  // Удаляем заказы, которых больше нет (редкий случай)
  const currentIds = new Set(newOrders.map(o => o.id))
  const removedIds = orders.value.filter(o => !currentIds.has(o.id)).map(o => o.id)

  if (removedIds.length > 0 || merged.length !== orders.value.length) {
    orders.value = merged
  } else {
    // Обновляем только измененные элементы по индексу
    merged.forEach((order, index) => {
      if (orders.value[index]?.id !== order.id || 
          orders.value[index]?.status !== order.status) {
        orders.value[index] = order
      }
    })
  }

  // Восстанавливаем позицию скролла после обновления DOM
  nextTick(() => {
    const list = document.querySelector('.oh-list')
    if (list && scrollPosition > 0) {
      list.scrollTop = scrollPosition
    }
  })
}
 
async function loadOrders(isPolling = false) {
  // Не показываем лоадер при polling, только при первой загрузке
  if (!isPolling) {
    loadingOrders.value = true
  }
  
  try {
    console.log('[Profile] Loading orders...', isPolling ? '(polling)' : '(initial)')
    const ordersRes = await apiProfileOrdersRoute.run(ctx)
    
    if (Array.isArray(ordersRes)) {
      // Используем интеллектуальное слияние вместо полной замены
      mergeOrders(ordersRes)
      console.log('[Profile] Orders merged:', orders.value.length)
    } else {
      console.warn('[Profile] Orders response is not an array:', ordersRes)
      if (!isPolling) orders.value = []
    }
  } catch (e) {
    console.error('[Profile] Failed to load orders', e)
    if (!isPolling) orders.value = []
  } finally {
    if (!isPolling) {
      loadingOrders.value = false
    }
  }
}

onMounted(async () => {
  // Добавляем слушатель для кнопки "назад"
  window.addEventListener('popstate', handlePopState)
  
  try {
    console.log('[Profile] Mounting, loading profile and orders...')
    console.log('[Profile] ctx.user:', ctx.user ? {
      id: ctx.user.id,
      type: ctx.user.type,
      displayName: ctx.user.displayName,
      confirmedPhone: ctx.user.confirmedPhone,
      phone: ctx.user.phone,
    } : 'null')
    
    // Сначала загружаем профиль
    const profileRes = await apiProfileGetRoute.run(ctx)
    console.log('[Profile] Profile loaded:', profileRes)
    console.log('[Profile] Profile phone:', profileRes.user?.phone)
    
    // Затем загружаем заказы (отдельно для лучшей диагностики)
    console.log('[Profile] Loading orders...')
    let ordersRes = []
    try {
      ordersRes = await apiProfileOrdersRoute.run(ctx)
      console.log('[Profile] Orders loaded:', ordersRes)
    } catch (orderErr) {
      console.error('[Profile] Failed to load orders:', orderErr)
      ordersRes = []
    }

    console.log('[Profile] Profile response:', profileRes)
    console.log('[Profile] Orders response:', ordersRes)
    console.log('[Profile] Profile response user phone:', profileRes.user?.phone)
    console.log('[Profile] Orders count:', Array.isArray(ordersRes) ? ordersRes.length : 'N/A')

    if (profileRes.user) {
      userData.id = profileRes.user.id || ''
      userData.firstName = profileRes.user.firstName || ''
      userData.lastName = profileRes.user.lastName || ''
      userData.phone = profileRes.user.phone || ''
      userData.email = profileRes.user.email || ''
    }
    if (profileRes.profile) {
      // Домашний адрес
      homeAddressData.street = profileRes.profile.street || ''
      homeAddressData.house = profileRes.profile.house || ''
      homeAddressData.apartment = profileRes.profile.apartment || ''
      homeAddressData.entrance = profileRes.profile.entrance || ''
      homeAddressData.floor = profileRes.profile.floor || ''
      homeAddressData.intercom = profileRes.profile.intercom || ''
      // Рабочий адрес
      workAddressData.street = profileRes.profile.workStreet || ''
      workAddressData.house = profileRes.profile.workHouse || ''
      workAddressData.apartment = profileRes.profile.workApartment || ''
      workAddressData.entrance = profileRes.profile.workEntrance || ''
      workAddressData.floor = profileRes.profile.workFloor || ''
      workAddressData.intercom = profileRes.profile.workIntercom || ''
    }
    
    if (Array.isArray(ordersRes)) {
      // Используем mergeOrders даже при первой загрузке для консистентности
      mergeOrders(ordersRes)
      console.log('[Profile] Initial orders loaded:', orders.value.length)
    } else {
      console.warn('[Profile] Orders response is not an array:', ordersRes)
      orders.value = []
    }

    // Запускаем polling для обновления статусов заказов каждые 5 секунд
    ordersPollingInterval = setInterval(() => loadOrders(true), 5000)
  } catch (e) {
    console.error('[Profile] Failed to load profile', e)
  } finally {
    loading.value = false
    loadingOrders.value = false
  }
})

onUnmounted(() => {
  if (ordersPollingInterval) {
    clearInterval(ordersPollingInterval)
  }
  window.removeEventListener('popstate', handlePopState)
})

async function saveAll() {
  saving.value = true
  saved.value = false

  try {
    const infoData = profileInfoRef.value?.getData() || {}
    const homeData = homeAddressRef.value?.getData() || {}
    const workData = workAddressRef.value?.getData() || {}

    const payload = {}

    if (infoData.hasChanges) {
      payload.firstName = infoData.firstName
      payload.lastName = infoData.lastName
    }

    // Домашний адрес
    if (homeData.hasChanges) {
      payload.street = homeData.street
      payload.house = homeData.house
      payload.apartment = homeData.apartment
      payload.entrance = homeData.entrance
      payload.floor = homeData.floor
      payload.intercom = homeData.intercom
    }

    // Рабочий адрес
    if (workData.hasChanges) {
      payload.workStreet = workData.street
      payload.workHouse = workData.house
      payload.workApartment = workData.apartment
      payload.workEntrance = workData.entrance
      payload.workFloor = workData.floor
      payload.workIntercom = workData.intercom
    }

    if (Object.keys(payload).length > 0) {
      await apiProfileUpdateRoute.run(ctx, payload)

      if (infoData.hasChanges) {
        userData.firstName = infoData.firstName
        userData.lastName = infoData.lastName
      }
      if (homeData.hasChanges) {
        Object.assign(homeAddressData, {
          street: homeData.street,
          house: homeData.house,
          apartment: homeData.apartment,
          entrance: homeData.entrance,
          floor: homeData.floor,
          intercom: homeData.intercom,
        })
      }
      if (workData.hasChanges) {
        Object.assign(workAddressData, {
          street: workData.street,
          house: workData.house,
          apartment: workData.apartment,
          entrance: workData.entrance,
          floor: workData.floor,
          intercom: workData.intercom,
        })
      }

      saved.value = true
      setTimeout(() => { saved.value = false }, 2500)
    }
  } catch (e) {
    console.error('Failed to save profile', e)
  } finally {
    saving.value = false
  }
}

async function logout() {
  try {
    await fetch('/s/auth/sign-out', { method: 'POST' })
    window.location.href = '/v-2'
  } catch (e) {
    console.error('Logout failed', e)
  }
}

// Обновление заказа в списке при изменении статуса
function onOrderUpdated(updatedOrder) {
  const index = orders.value.findIndex(o => o.id === updatedOrder.id)
  if (index !== -1) {
    orders.value[index] = { ...orders.value[index], ...updatedOrder }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: var(--color-background);
  font-family: 'TT Norms', 'Roboto', sans-serif;
}

.profile-container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 96px 32px 40px;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.profile-title {
  font-size: 28px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  border: 1.5px solid var(--color-border);
  background: var(--color-white);
  color: #000;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.logout-btn:hover {
  border-color: var(--color-error);
  color: var(--color-error);
  background: var(--color-error-bg);
}

.profile-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
  font-size: 32px;
  color: var(--color-surface);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-medium-gray);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: #000;
}

.tab-btn.active {
  color: #000;
  border-bottom-color: #000;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-white);
  background: var(--color-primary);
  border-radius: 10px;
}

.tab-content {
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
}

.addresses-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-medium-gray);
  margin: 0 0 4px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.save-all-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: none;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.save-all-btn:hover:not(:disabled) { background: var(--color-primary-dark); }
.save-all-btn:disabled { opacity: 0.5; cursor: default; }

.save-success {
  text-align: center;
  font-size: 14px;
  color: #16a34a;
  font-weight: 500;
  padding: 8px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 767px) {
  .profile-container {
    padding: 84px 16px 32px;
  }

  .tabs {
    gap: 4px;
  }

  .tab-btn {
    padding: 10px 12px;
    font-size: 13px;
    gap: 6px;
  }

  .tab-btn i {
    font-size: 12px;
  }

  .profile-title {
    font-size: 22px;
  }

  .logout-btn {
    padding: 8px 14px;
    font-size: 13px;
  }
}
</style>