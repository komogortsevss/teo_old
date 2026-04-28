<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="isOpen" class="cart-overlay" @click.self="closeCart"></div>
    </Transition>

    <Transition name="drawer">
      <div v-if="isOpen" class="cart-drawer" role="dialog" aria-modal="true" aria-label="Корзина">

        <!-- Header -->
        <div class="cd-header">
          <span class="cd-title">Корзина</span>
          <button class="cd-close" @click="closeCart">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Empty state -->
        <div v-if="items.length === 0" class="cd-empty">
          <i class="fa-solid fa-bag-shopping"></i>
          <p>Корзина пуста</p>
          <span>Добавьте букеты, чтобы оформить заказ</span>
        </div>

        <!-- Content -->
        <div v-else class="cd-scroll">

          <!-- Cart items with vases -->
          <div class="cd-section">
            <div v-for="item in items" :key="item.id" class="cart-item-group" :class="{ 'with-vase': getItemVaseRules(item).length > 0 && !item.isRemoving }">
              <CartItem
                :item="item"
                :can-increment="canIncrementItem(item.id)"
                @increment="updateItemQty(item.id, 1)"
                @decrement="updateItemQty(item.id, -1)"
                @remove="removeItem(item.id)"
                @undo="undoRemoveItem(item.id)"
              />
              <!-- Vase selector per bouquet -->
              <VaseSelector
                v-if="!item.isRemoving && getItemVaseRules(item).length > 0"
                :all-vase-addons="allVaseAddons"
                :vase-rules="getItemVaseRules(item)"
                :bouquet-name="item.name"
                :total-stems="getItemTotalStems(item)"
                :selected-addon-id="item.selectedVase?.addonId || null"
                @select="(addonId, qty) => onSelectVase(item.id, addonId, qty)"
                show-label
              />
            </div>
          </div>

          <!-- Regular addons (global) -->
          <div v-if="regularAddonsForCart.length > 0" class="cd-section">
            <div class="addons-grid">
              <AddonCard
                v-for="addon in regularAddonsForCart"
                :key="addon.id"
                :name="addon.name"
                :price="addon.priceAmount"
                :imageHash="addon.imageHash"
                :icon="addon.icon"
                :selected="isAddonSelected(addon.id)"
                :quantity="getAddonQuantity(addon.id)"
                @toggle="toggleAddon(addon)"
                @increment="updateAddonQty(addon.id, 1)"
                @decrement="updateAddonQty(addon.id, -1)"
              />
            </div>
          </div>

          <!-- Order form -->
          <div class="cd-section">
            <div v-if="showClearButton" class="cd-section-header">
              <button class="cd-clear-form" @click="clearOrderForm">
                <i class="fa-solid fa-trash-can"></i>
                Очистить
              </button>
            </div>
            <CartOrderForm
              ref="orderFormRef"
              :active-items="activeItems"
              :addons="addons"
              :all-addons-cache="allAddonsCacheArr"
              :total-price="totalPrice"
              :is-authenticated="isAuthenticated"
              @submitted="onOrderSubmitted"
              @error="submitError = $event"
            />
          </div>

        </div>

        <!-- Auth confirm modal -->
        <Transition name="auth-confirm">
          <div v-if="showAuthConfirm" class="auth-confirm-overlay" @click.self="showAuthConfirm = false">
            <div class="auth-confirm-modal">
              <div class="auth-confirm-icon">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <h3 class="auth-confirm-title">Подтвердите номер телефона</h3>
              <p class="auth-confirm-text">
                Для оформления заказа необходимо подтвердить ваш номер телефона. Это займет всего минуту.
              </p>
              <div class="auth-confirm-buttons">
                <button class="auth-confirm-btn primary" @click="confirmAuth">
                  <i class="fa-solid fa-phone"></i>
                  Подтвердить номер
                </button>
                <button class="auth-confirm-btn secondary" @click="showAuthConfirm = false">
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Footer with total and submit -->
        <div v-if="activeItems.length > 0" class="cd-footer">
          <Transition name="stock-banner">
            <div v-if="errorMessage" class="cd-error-banner" key="error">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <span>{{ errorMessage }}</span>
            </div>
          </Transition>
          <Transition name="stock-banner">
            <div v-if="stockResolved && !errorMessage" class="cd-success-banner" key="resolved">
              <i class="fa-solid fa-circle-check"></i>
              <span>Отлично! Сейчас цветов хватает</span>
            </div>
          </Transition>

          <!-- Bonus block -->
          <BonusBlock
            v-if="isAuthenticated"
            :user-id="currentUserId"
            :settings="loyaltySettings"
            :balance="bonusBalance"
            :subtotal="totalPrice"
            :discount-amount="promoDiscount"
            @update:bonuses-to-spend="bonusesToSpend = $event"
            @calculate="onBonusCalculate"
          />

          <!-- Promo code block -->
          <div class="cd-promo-block">
            <div v-if="!appliedPromo" class="cd-promo-input-wrap">
              <input
                v-model="promoCodeInput"
                class="cd-promo-input"
                :class="{ error: promoError }"
                placeholder="Промокод"
                type="text"
                @input="promoError = ''; promoSuccess = ''"
                @keydown.enter="validatePromoCode"
                :disabled="promoLoading"
              />
              <button
                class="cd-promo-btn"
                @click="validatePromoCode"
                :disabled="promoLoading || !promoCodeInput.trim()"
              >
                <template v-if="promoLoading">
                  <i class="fa-solid fa-spinner fa-spin"></i>
                </template>
                <template v-else>
                  <i class="fa-solid fa-arrow-right"></i>
                </template>
              </button>
            </div>
            <div v-else class="cd-promo-applied">
              <div class="cd-promo-info">
                <i class="fa-solid fa-ticket"></i>
                <span class="cd-promo-code">{{ appliedPromo.code }}</span>
                <span class="cd-promo-discount">−{{ appliedPromo.discountAmount.toLocaleString('ru-RU') }} ₽</span>
              </div>
              <button class="cd-promo-remove" @click="removePromoCode" :disabled="promoLoading">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div v-if="promoError" class="cd-promo-error">{{ promoError }}</div>
            <div v-if="promoSuccess && !appliedPromo" class="cd-promo-success">{{ promoSuccess }}</div>
          </div>

          <!-- Price breakdown -->
          <div class="cd-price-breakdown">
            <div class="cd-total-header" @click="toggleBreakdown" :class="{ 'is-open': isBreakdownOpen }">
              <span class="cd-total-label">Итого</span>
              <div class="cd-total-value-wrap">
                <span class="cd-total-value" :class="{ discounted: promoDiscount > 0 }">{{ finalTotalPrice.toLocaleString('ru-RU') }} ₽</span>
                <span class="cd-total-arrow">
                  <i class="fa-solid" :class="isBreakdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                </span>
              </div>
            </div>
            <Transition name="breakdown-expand">
              <div v-show="isBreakdownOpen" class="cd-breakdown-content">
                <div class="cd-breakdown-divider"></div>
                <div v-if="bouquetsTotal > 0" class="cd-breakdown-row">
                  <span class="cd-breakdown-label">Букеты × {{ totalBouquetsCount }}</span>
                  <span class="cd-breakdown-value">{{ bouquetsTotal.toLocaleString('ru-RU') }} ₽</span>
                </div>
                <div v-if="vasesTotal > 0" class="cd-breakdown-row">
                  <span class="cd-breakdown-label">Вазы</span>
                  <span class="cd-breakdown-value">{{ vasesTotal.toLocaleString('ru-RU') }} ₽</span>
                </div>
                <div v-if="promoDiscount > 0" class="cd-breakdown-row cd-promo-row">
                  <span class="cd-breakdown-label">Скидка по промокоду</span>
                  <span class="cd-breakdown-value cd-discount-value">−{{ promoDiscount.toLocaleString('ru-RU') }} ₽</span>
                </div>
                <div v-if="bonusDiscount > 0" class="cd-breakdown-row cd-promo-row">
                  <span class="cd-breakdown-label">Списание бонусов</span>
                  <span class="cd-breakdown-value cd-discount-value">−{{ bonusDiscount.toLocaleString('ru-RU') }} ₽</span>
                </div>
                <template v-for="addon in addons" :key="addon.id">
                  <div class="cd-breakdown-row">
                    <span class="cd-breakdown-label">{{ addon.name }} × {{ addon.quantity }}</span>
                    <span class="cd-breakdown-value">{{ (addon.priceAmount * addon.quantity).toLocaleString('ru-RU') }} ₽</span>
                  </div>
                </template>
              </div>
            </Transition>
          </div>
          <button class="cd-submit" @click="submitOrder" :disabled="submitting">
            <template v-if="submitting">
              <i class="fa-solid fa-spinner fa-spin"></i>
              Отправляем…
            </template>
            <template v-else>
              <i class="fa-solid fa-check"></i>
              Оформить заказ
            </template>
          </button>
        </div>

        <!-- Success state -->
        <Transition name="success-fade">
          <div v-if="submitted" class="cd-success">
            <div class="success-icon"><i class="fa-solid fa-circle-check"></i></div>
            <h3>Заказ оформлен!</h3>
            <p>Мы свяжемся с вами в ближайшее время</p>
            <!-- Bonus earned info -->
            <div v-if="bonusEarned > 0" class="cd-success-bonus">
              <i class="fa-solid fa-gift"></i>
              <span>Начислено <strong>{{ bonusEarned }}</strong> бонусов!</span>
            </div>
            <div class="success-actions">
              <button class="cd-close-success" @click="handleSuccessClose">Закрыть</button>
              <a v-if="!wasAuthenticated" :href="profileUrl" class="cd-profile-btn">
                <i class="fa-solid fa-user"></i>
                Войти в личный кабинет
              </a>
            </div>
          </div>
        </Transition>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useCart, allAddonsCache, calcTotalStems } from '../shared/useCart'
import CartItem from './cart/CartItem.vue'
import AddonCard from './cart/AddonCard.vue'
import VaseSelector from './cart/VaseSelector.vue'
import CartOrderForm from './cart/CartOrderForm.vue'

// Lazy load BonusBlock - only needed for authenticated users
const BonusBlock = defineAsyncComponent({
  loader: () => import('../teo/cart-bonuses/components/BonusBlock.vue'),
  delay: 0,
  suspensible: false
})
import { apiAddonsListRoute } from '../api/addons/list'
import { apiProfileGetRoute } from '../api/profile/get'
import { profilePageRoute } from '../profile'
import { apiPromoValidateRoute } from '../teo/promo-service/api/promo/validate'
import { apiPromoApplyRoute } from '../teo/promo-service/api/promo/apply'
import { apiPromoRemoveRoute } from '../teo/promo-service/api/promo/remove'
import { apiLoyaltySettingsGetRoute } from '../teo/loyalty-service/api/loyalty/settings/get'
import { apiLoyaltyBalanceByUserRoute } from '../teo/loyalty-service/api/loyalty/balance/by-user'

const {
  items, addons, isOpen, totalCount, totalPrice,
  stockError, stockResolved,
  removeItem, undoRemoveItem, updateItemQty, canIncrementItem,
  selectVaseForItem, getSelectedVase,
  updateAddonQty, toggleAddon, isAddonSelected, getAddonQuantity,
  openCart, closeCart, clearCart
} = useCart()

const activeItems = computed(() => items.value.filter(i => !i.isRemoving))

// Price breakdown calculations
const MONO_STEP = 10

const bouquetsTotal = computed(() => {
  return activeItems.value.reduce((s, i) => {
    if (i.isMono && i.step > 1) {
      const pricePerStem = i.priceAmount / i.step
      return s + Math.round(pricePerStem * i.quantity)
    }
    if (i.step > 1) {
      const full = Math.floor(i.quantity / i.step)
      const extra = i.quantity % i.step
      return s + i.priceAmount * full + extra * (i.priceAmount / i.step)
    }
    return s + i.priceAmount * i.quantity
  }, 0)
})

const vasesTotal = computed(() => {
  return activeItems.value
    .filter(i => i.selectedVase)
    .reduce((s, i) => {
      const addonId = i.selectedVase ? i.selectedVase.addonId : null
      const addonQty = i.selectedVase ? i.selectedVase.quantity : 1
      if (!addonId) return s
      const vase = allAddonsCacheArr.value.find(a => a.id === addonId)
      return s + (vase ? vase.priceAmount * addonQty : 0)
    }, 0)
})

const addonsTotal = computed(() => {
  return addons.value.reduce((s, a) => s + a.priceAmount * a.quantity, 0)
})

const finalTotalPrice = computed(() => {
  return Math.max(0, totalPrice.value - promoDiscount.value - bonusDiscount.value)
})

const totalBouquetsCount = computed(() => {
  return activeItems.value.reduce((s, i) => {
    if (i.isMono && i.step > 1) {
      return s + Math.round((i.quantity - i.step) / MONO_STEP) + 1
    }
    return s + i.quantity
  }, 0)
})

const allAddonsCacheArr = ref([])

onMounted(async () => {
  try {
    const loaded = await apiAddonsListRoute.run(ctx)
    allAddonsCacheArr.value = loaded
    allAddonsCache.value = loaded
  } catch (e) {
    console.error('Failed to load addons', e)
  }

  // Check if we need to auto-submit order after auth redirect
  checkPendingOrderAfterAuth()
})

function checkPendingOrderAfterAuth() {
  try {
    const pending = localStorage.getItem('teo-pending-order')
    if (pending === '1') {
      localStorage.removeItem('teo-pending-order')
      pendingOrderAfterAuth.value = true
      // Open cart automatically
      if (items.value.length > 0) {
        openCart()
      }
      // Small delay to ensure cart is restored and form is ready
      setTimeout(() => {
        autoSubmitAfterAuth()
      }, 800)
    }
  } catch (e) {}
}

async function autoSubmitAfterAuth() {
  if (items.value.length === 0) return
  submitting.value = true
  try {
    await orderFormRef.value?.submit()
  } catch (e) {
    const msg = e?.message || ''
    if (msg === 'VALIDATION_ERROR') {
      // Form has validation errors, let user fix them
      submitError.value = 'Пожалуйста, проверьте заполнение всех полей'
    } else if (msg === 'OUTSIDE_MKAD') {
      submitError.value = 'Доставка осуществляется только в пределах МКАД. Измените адрес доставки.'
    } else if (msg !== 'AUTH_REQUIRED') {
      submitError.value = 'Ошибка при оформлении заказа. Попробуйте ещё раз.'
    }
  } finally {
    submitting.value = false
    pendingOrderAfterAuth.value = false
  }
}

function confirmAuth() {
  showAuthConfirm.value = false
  // Save flag that we want to submit order after auth
  try {
    localStorage.setItem('teo-pending-order', '1')
  } catch (e) {}
  // Redirect to auth
  const currentUrl = window.location.pathname + window.location.search
  window.location.href = `/s/auth/signin?back=${encodeURIComponent(currentUrl)}`
}

const allVaseAddons = computed(() => allAddonsCacheArr.value.filter(a => a.type === 'vase'))

function getItemVaseRules(item) {
  if (!item.availableAddons || item.availableAddons.length === 0) return []
  return item.availableAddons.filter(a => {
    if (!a || !a.addonId) return false
    const addon = allAddonsCacheArr.value.find(ad => ad.id === a.addonId)
    if (!addon || addon.type !== 'vase') return false
    return a.minStems != null
  })
}

function getItemTotalStems(item) {
  return calcTotalStems(item)
}

function onSelectVase(itemId, addonId, quantity) {
  selectVaseForItem(itemId, addonId, quantity || 1)
}

// Get regular addons available for items in cart (union of all items' regular addons)
const regularAddonsForCart = computed(() => {
  const regularIds = new Set()
  for (const item of activeItems.value) {
    if (!item.availableAddons) continue
    for (const entry of item.availableAddons) {
      const aid = typeof entry === 'string' ? entry : entry.addonId
      if (!aid) continue
      const addon = allAddonsCacheArr.value.find(a => a.id === aid)
      if (addon && addon.type === 'regular') regularIds.add(aid)
    }
  }
  return allAddonsCacheArr.value.filter(a => regularIds.has(a.id))
})

const submitting = ref(false)
const submitted = ref(false)
const submitError = ref('')
const orderFormRef = ref(null)

// Bonus state
const loyaltySettings = ref(null)
const bonusBalance = ref(0)
const bonusesToSpend = ref(0)
const bonusDiscount = ref(0)
const bonusEarned = ref(0)

// Promo code state
const promoCodeInput = ref('')
const promoLoading = ref(false)
const promoError = ref('')
const promoSuccess = ref('')
const appliedPromo = ref(null)
const promoDiscount = ref(0)
const createdOrderId = ref(null)

const showClearButton = computed(() => {
  return orderFormRef.value?.hasAnyFormField ?? false
})
const showAuthConfirm = ref(false)
const pendingOrderAfterAuth = ref(false)

function clearOrderForm() {
  if (orderFormRef.value) {
    orderFormRef.value.clearForm()
  }
}
const isAuthenticated = ref(false)
const wasAuthenticated = ref(false)
const currentUserId = ref('')
const isBreakdownOpen = ref(false)

function toggleBreakdown() {
  isBreakdownOpen.value = !isBreakdownOpen.value
}

const profileUrl = computed(() => profilePageRoute.url())

onMounted(async () => {
  try {
    const profile = await apiProfileGetRoute.run(ctx)
    isAuthenticated.value = !!(profile?.user?.id)
    if (isAuthenticated.value) {
      currentUserId.value = profile.user.id
      await loadLoyaltyData()
    }
  } catch (e) {
    isAuthenticated.value = false
  }
})

async function loadLoyaltyData() {
  try {
    const [settingsRes, balanceRes] = await Promise.all([
      apiLoyaltySettingsGetRoute.run(ctx),
      apiLoyaltyBalanceByUserRoute.query({ userId: currentUserId.value }).run(ctx)
    ])
    loyaltySettings.value = settingsRes
    if (!balanceRes.error) {
      bonusBalance.value = balanceRes.balance || 0
    }
  } catch (e) {
    console.error('Failed to load loyalty data', e)
  }
}

function onBonusCalculate(data) {
  bonusDiscount.value = data.bonusDiscount || 0
  bonusEarned.value = data.earnableBonuses || 0
}

const errorMessage = computed(() => stockError.value || submitError.value)

watch(items, () => {
  if (submitError.value) {
    submitError.value = ''
  }
}, { deep: true })

async function submitOrder() {
  if (!orderFormRef.value) return

  // If not authenticated - show auth confirmation modal
  if (!isAuthenticated.value) {
    showAuthConfirm.value = true
    return
  }

  submitting.value = true
  submitError.value = ''
  try {
    const order = await orderFormRef.value.submitWithOrder({
      bonusesToSpend: bonusesToSpend.value,
      bonusDiscount: bonusDiscount.value
    })
    createdOrderId.value = order?.id || null
    
    // Сохраняем начисленные бонусы для отображения
    if (order?.bonusesEarned > 0) {
      bonusEarned.value = order.bonusesEarned
    }
    
    // Apply promo code if validated
    if (appliedPromo.value && createdOrderId.value) {
      await applyPromoCodeToOrder(createdOrderId.value)
    }
    
    // submitted is set by onOrderSubmitted after success
    onOrderSubmitted()
  } catch (e) {
    const msg = e?.message || ''
    if (msg.includes('не хватает') || msg.includes('складе')) {
      submitError.value = msg
    } else if (msg === 'VALIDATION_ERROR') {
      // do nothing, form handles its own validation display
    } else if (msg === 'OUTSIDE_MKAD') {
      submitError.value = 'Доставка осуществляется только в пределах МКАД. Измените адрес доставки.'
    } else if (msg === 'AUTH_REQUIRED') {
      // Auth redirect is handled by CartOrderForm, just stop submitting
      submitting.value = false
      return
    } else {
      submitError.value = 'Ошибка при оформлении заказа. Попробуйте ещё раз.'
    }
  } finally {
    submitting.value = false
  }
}

async function validatePromoCode() {
  if (!promoCodeInput.value.trim()) return
  
  promoLoading.value = true
  promoError.value = ''
  promoSuccess.value = ''
  
  try {
    const cartItems = activeItems.value.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.priceAmount
    }))
    
    const result = await apiPromoValidateRoute.run(ctx, {
      code: promoCodeInput.value.trim(),
      cartAmount: totalPrice.value,
      items: cartItems
    })
    
    if (result.valid) {
      appliedPromo.value = {
        id: result.promoCode.id,
        code: result.promoCode.code,
        title: result.promoCode.title,
        discountType: result.promoCode.discountType,
        discountValue: result.promoCode.discountValue,
        discountAmount: result.discountAmount
      }
      promoDiscount.value = result.discountAmount
      promoSuccess.value = `Промокод применён! Скидка ${result.discountAmount.toLocaleString('ru-RU')} ₽`
      promoCodeInput.value = ''
    } else {
      promoError.value = result.error || 'Неверный промокод'
    }
  } catch (e) {
    promoError.value = 'Ошибка проверки промокода'
  } finally {
    promoLoading.value = false
  }
}

async function applyPromoCodeToOrder(orderId) {
  if (!appliedPromo.value || !orderId) return
  
  try {
    const cartItems = activeItems.value.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.priceAmount
    }))
    
    await apiPromoApplyRoute.run(ctx, {
      code: appliedPromo.value.code,
      orderId: orderId,
      cartAmount: totalPrice.value + promoDiscount.value, // Original amount before discount
      customerId: ctx.user?.id,
      items: cartItems
    })
  } catch (e) {
    console.error('Failed to apply promo code to order:', e)
  }
}

async function removePromoCode() {
  if (!appliedPromo.value) return
  
  // If order already created - remove from order
  if (createdOrderId.value) {
    promoLoading.value = true
    try {
      await apiPromoRemoveRoute.run(ctx, {
        orderId: createdOrderId.value,
        customerId: ctx.user?.id
      })
      appliedPromo.value = null
      promoDiscount.value = 0
    } catch (e) {
      promoError.value = 'Ошибка удаления промокода'
    } finally {
      promoLoading.value = false
    }
  } else {
    // Just clear locally
    appliedPromo.value = null
    promoDiscount.value = 0
    promoError.value = ''
    promoSuccess.value = ''
  }
}

function onOrderSubmitted() {
  wasAuthenticated.value = isAuthenticated.value
  submitted.value = true
  // Reset bonus state
  bonusesToSpend.value = 0
  bonusDiscount.value = 0
  bonusEarned.value = 0
  clearCart()
  window.dispatchEvent(new CustomEvent('cart-cleared'))
}

function handleSuccessClose() {
  submitted.value = false
  closeCart()
}
</script>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-shadow-dark);
  z-index: 10100;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  background: var(--color-white);
  z-index: 10101;
  display: block;
  overflow-y: auto;
  box-shadow: -8px 0 40px var(--color-shadow-medium);
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
}

.cd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: var(--color-white);
  z-index: 10;
}

.cd-title { font-size: 16px; font-weight: 700; color: #000; }

.cd-close {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  background: var(--color-border-light); color: var(--color-text-soft);
  font-size: 14px; cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: background 0.15s, color 0.15s;
}
.cd-close:hover { background: var(--color-border-light); color: var(--color-text-dark); }

.cd-empty {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; color: var(--color-surface); padding: 40px;
}
.cd-empty i { font-size: 52px; opacity: 0.5; }
.cd-empty p { font-size: 17px; font-weight: 600; color: #000; margin: 0; }
.cd-empty span { font-size: 14px; color: var(--color-surface); text-align: center; }

.cd-scroll {
  flex: none; overflow-y: visible; padding: 0 24px 16px;
  overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
  min-height: 0;
}

.cd-section { padding: 20px 0 4px; border-bottom: 1px solid var(--color-border-light); }
.cd-section:last-child { border-bottom: none; }

.cd-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.cd-section-label {
  font-size: 11px; font-weight: 400; letter-spacing: 0.04em;
  text-transform: uppercase; color: #6b7280;
  margin-bottom: 16px;
}

.cd-clear-form {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--color-error);
  background: transparent;
  color: var(--color-error);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}

.cd-clear-form:hover {
  background: var(--color-error);
  color: var(--color-white);
}

.cd-clear-form i {
  font-size: 13px;
}

.addons-grid { display: flex; flex-direction: column; gap: 8px; padding-bottom: 8px; }

/* Grouped cart item with vase */
.cart-item-group {
  background: var(--color-white);
  border: 1px solid var(--color-border-light);
  border-radius: 14px;
  margin-bottom: 10px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.cart-item-group.with-vase {
  background: var(--color-light-bg, #FAFAFA);
  border: 1px solid var(--color-border);
}

.cart-item-group.with-vase :deep(.ci-content) {
  border-bottom: 1px solid var(--color-border-light);
}

.cart-item-group :deep(.ci-content) {
  padding: 12px 16px;
}

.cart-item-group :deep(.vase-selector) {
  margin: 0;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 0;
}

.cart-item-group :deep(.vs-label) {
  font-size: 11px;
  font-weight: 400;
  color: #6b7280;
  text-transform: none;
  letter-spacing: 0;
}

.cd-footer {
  border-top: 1px solid var(--color-border);
  padding: 16px 24px 24px;
  flex-shrink: 1;
  background: var(--color-white);
}

.cd-price-breakdown { margin-bottom: 16px; }
.cd-total-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
  border-radius: 8px;
  margin: -8px -12px;
  padding: 12px;
}
.cd-total-header:hover {
  background-color: var(--color-border-light);
}
.cd-total-header:active {
  background-color: var(--color-border);
}
.cd-total-label { font-size: 16px; font-weight: 600; color: #000; }
.cd-total-value-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cd-total-value { font-size: 20px; font-weight: 700; color: #000; }

.cd-total-value.discounted {
  color: #16a34a;
}
.cd-total-arrow {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border-light);
  border-radius: 8px;
  transition: background-color 0.2s, transform 0.2s;
  font-size: 12px;
  color: var(--color-text-soft);
}
.cd-total-header:hover .cd-total-arrow {
  background: var(--color-border);
}
.cd-total-header.is-open .cd-total-arrow {
  background: var(--color-primary);
  color: var(--color-white);
}
.cd-breakdown-content {
  overflow: hidden;
}
.cd-breakdown-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.cd-breakdown-row:last-child { margin-bottom: 0; }
.cd-breakdown-label { font-size: 14px; color: #6b7280; }
.cd-breakdown-value { font-size: 14px; color: #000; font-weight: 500; }
.cd-breakdown-divider { height: 1px; background: var(--color-border); margin: 12px 0; }

/* Animations */
.breakdown-expand-enter-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.breakdown-expand-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.breakdown-expand-enter-from,
.breakdown-expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  transform: translateY(-8px);
}
.breakdown-expand-enter-to,
.breakdown-expand-leave-from {
  opacity: 1;
  max-height: 400px;
  margin-top: 0;
  transform: translateY(0);
}

.cd-submit {
  width: 100%; height: 52px; border-radius: 14px; border: none;
  background: var(--color-primary); color: var(--color-white);
  font-size: 16px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: background 0.2s; font-family: inherit;
}
.cd-submit:hover:not(:disabled) { background: var(--color-primary-dark); }
.cd-submit:disabled { opacity: 0.6; cursor: default; }

.cd-success {
  position: absolute; inset: 0; background: var(--color-white); border-radius: inherit;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 40px; text-align: center;
}
.success-icon { font-size: 64px; color: var(--color-primary); line-height: 1; }
.cd-success h3 { font-size: 24px; font-weight: 700; color: #000; margin: 0; }
.cd-success p { font-size: 15px; color: #000; line-height: 1.6; margin: 0; }

.cd-success-bonus {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #d1fae5 0%, #bbf7d0 100%);
  border-radius: 12px;
  color: #065f46;
  font-size: 14px;
  margin: 8px 0;
}

.cd-success-bonus i {
  font-size: 18px;
}

.cd-success-bonus strong {
  font-size: 18px;
  font-weight: 700;
}

.cd-close-success {
  margin-top: 12px; height: 48px; padding: 0 32px; border-radius: 12px; border: none;
  background: var(--color-primary); color: var(--color-white);
  font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.2s; font-family: inherit;
}
.cd-close-success:hover { background: var(--color-primary-dark); }

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.cd-profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 32px;
  border-radius: 12px;
  border: 2px solid var(--color-primary);
  background: var(--color-white);
  color: var(--color-primary);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-family: inherit;
}

.cd-profile-btn:hover {
  background: var(--color-primary);
  color: var(--color-white);
}

.cd-error-banner {
  display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px;
  background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;
  margin-bottom: 12px; color: #b91c1c; font-size: 13px; line-height: 1.4;
}
.cd-error-banner i { flex-shrink: 0; margin-top: 2px; font-size: 14px; }

.cd-success-banner {
  display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;
  margin-bottom: 12px; color: #15803d; font-size: 13px; line-height: 1.4; font-weight: 400;
}
.cd-success-banner i { flex-shrink: 0; margin-top: 2px; font-size: 14px; }

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.drawer-enter-active, .drawer-leave-active { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
.success-fade-enter-active, .success-fade-leave-active { transition: opacity 0.3s ease; }
.success-fade-enter-from, .success-fade-leave-to { opacity: 0; }
.stock-banner-enter-active { transition: all 0.3s ease; }
.stock-banner-leave-active { transition: all 0.4s ease; }
.stock-banner-enter-from { opacity: 0; transform: translateY(-8px); }
.stock-banner-leave-to { opacity: 0; transform: translateY(-4px); }

/* Auth confirm modal */
.auth-confirm-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 10200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-confirm-modal {
  background: var(--color-white);
  border-radius: 20px;
  padding: 32px 28px;
  max-width: 360px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: auth-confirm-appear 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes auth-confirm-appear {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.auth-confirm-icon i {
  font-size: 28px;
  color: var(--color-primary);
}

.auth-confirm-title {
  font-size: 20px;
  font-weight: 700;
  color: #000;
  margin: 0 0 12px;
}

.auth-confirm-text {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 24px;
}

.auth-confirm-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.auth-confirm-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.auth-confirm-btn.primary {
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
}

.auth-confirm-btn.primary:hover {
  background: var(--color-primary-dark);
}

.auth-confirm-btn.secondary {
  background: transparent;
  color: #6b7280;
  border: 1.5px solid var(--color-border);
}

.auth-confirm-btn.secondary:hover {
  background: var(--color-border-light);
  color: #000;
}

/* Auth confirm transitions */
.auth-confirm-enter-active,
.auth-confirm-leave-active {
  transition: opacity 0.25s ease;
}

.auth-confirm-enter-from,
.auth-confirm-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .cart-drawer {
    width: 100vw;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 0;
    top: 0;
    bottom: auto;
    height: 100dvh;
    max-height: 100dvh;
    display: block;
    overflow-y: auto;
  }
  .cd-scroll {
    flex: none;
    overflow-y: visible;
    padding-bottom: 24px;
  }
  .cd-footer {
    flex-shrink: 1;
  }
  .cd-header {
    padding-top: max(12px, env(safe-area-inset-top));
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .cd-title { font-size: 16px; }
  .cd-close {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  .auth-confirm-modal {
    padding: 28px 24px;
    margin: 16px;
  }
}

/* Promo code styles */
.cd-promo-block {
  margin-bottom: 16px;
}

.cd-promo-input-wrap {
  display: flex;
  gap: 8px;
}

.cd-promo-input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: var(--color-white);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.cd-promo-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.cd-promo-input.error {
  border-color: var(--color-error);
  background: #fef2f2;
}

.cd-promo-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cd-promo-input::placeholder {
  font-size: 11px;
  color: #888;
}

.cd-promo-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.cd-promo-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.cd-promo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cd-promo-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
}

.cd-promo-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cd-promo-info i {
  color: #16a34a;
  font-size: 16px;
}

.cd-promo-code {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.cd-promo-discount {
  font-size: 14px;
  font-weight: 600;
  color: #16a34a;
}

.cd-promo-remove {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.cd-promo-remove:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
  color: #000;
}

.cd-promo-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cd-promo-error {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-error);
  line-height: 1.4;
}

.cd-promo-success {
  margin-top: 8px;
  font-size: 13px;
  color: #16a34a;
  line-height: 1.4;
}

.cd-promo-row {
  color: #16a34a;
}

.cd-discount-value {
  color: #16a34a;
  font-weight: 600;
}

@media (max-width: 600px) {
  .cd-promo-input,
  .cd-promo-btn {
    height: 48px;
  }
  
  .cd-promo-btn {
    width: 48px;
  }
}
</style>