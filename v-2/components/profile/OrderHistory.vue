<template>
  <div class="oh-card">
    <div class="oh-header">
      <i class="fa-solid fa-clock-rotate-left oh-icon"></i>
      <h2 class="oh-title">История заказов</h2>
    </div>

    <div v-if="loadingOrders" class="oh-loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
    </div>

    <div v-else-if="orders.length === 0" class="oh-empty">
      <i class="fa-solid fa-bag-shopping"></i>
      <p>У вас пока нет заказов</p>
      <a href="/v-2/catalog" class="oh-catalog-link">Перейти в каталог</a>
    </div>

    <div v-else class="oh-list" ref="listRef">
      <div
        v-for="order in orders"
        :key="order.id"
        class="oh-order"
        @click="openOrder(order)"
      >
        <div class="oh-order-header">
          <div class="oh-order-number">№ {{ order.orderNumber }}</div>
        </div>

        <div class="oh-order-date">
          <template v-if="order.deliveryDate">
            Доставка {{ formatFullDeliveryDate(order.deliveryDate) }}<template v-if="order.deliveryTime">, {{ formatDeliveryTime(order.deliveryTime) }}</template>
          </template>
          <template v-else>
            {{ formatDate(order.createdAt) }}
          </template>
        </div>

        <div v-if="order.street" class="oh-address-line">
          {{ order.street }}<template v-if="order.house">, д. {{ order.house }}</template>
        </div>

        <div class="oh-items">
          <div v-for="item in (order.items || [])" :key="item.id" class="oh-item">
            <div v-if="item.imageHash" class="oh-item-img-wrap">
              <img
                :src="`https://fs.chatium.ru/thumbnail/${item.imageHash}/s/80x80`"
                class="oh-item-img"
                loading="lazy"
                decoding="async"
                alt=""
              />
            </div>
            <div class="oh-item-info">
              <span class="oh-item-name">{{ item.name }}</span>
              <span class="oh-item-qty">× {{ formatItemQty(item) }}</span>
            </div>
          </div>
          <div v-for="addon in (order.addons || [])" :key="addon.id" class="oh-item oh-addon-item">
            <div class="oh-item-info">
              <span class="oh-item-name">{{ addon.name }}</span>
              <span class="oh-item-qty">× {{ addon.quantity }}</span>
            </div>
          </div>
        </div>

        <div class="oh-order-footer">
          <div class="oh-price-block">
            <span class="oh-total">{{ (order.totalPrice || 0).toLocaleString('ru-RU') }} ₽</span>
            <div v-if="order.bonusDiscount > 0" class="oh-bonus-info">
              <span class="oh-bonus-discount">−{{ order.bonusDiscount }} ₽ бонусами</span>
            </div>
            <div v-if="order.bonusesEarned > 0" class="oh-bonus-info">
              <span class="oh-bonus-earned">+{{ order.bonusesEarned }} бонусов начислено</span>
            </div>
          </div>
        </div>

        <!-- Шкала статуса заказа -->
        <div class="oh-status-track">
          <template v-if="order.status === 'cancelled'">
            <div class="oh-status-track-cancelled">
              <i class="fa-solid fa-circle-xmark"></i>
              <span>Заказ отменён</span>
            </div>
          </template>
          <template v-else>
            <div class="oh-steps-container">
              <!-- Кружки этапов -->
              <div 
                v-for="(step, index) in statusSteps" 
                :key="'circle-' + step.key"
                class="oh-step-item"
              >
                <div
                  class="oh-step-circle"
                  :class="{
                    'step-completed': isStepCompleted(order.status, step.key),
                    'step-active': isStepActive(order.status, step.key)
                  }"
                  :data-step="step.key"
                >
                  <i v-if="isStepCompleted(order.status, step.key)" class="fa-solid fa-check"></i>
                  <div v-else-if="isStepActive(order.status, step.key)" class="step-dot"></div>
                </div>
                <span
                  class="oh-step-label"
                  :class="{
                    'label-completed': isStepCompleted(order.status, step.key),
                    'label-active': isStepActive(order.status, step.key)
                  }"
                >
                  {{ step.label }}
                </span>
              </div>
              
              
            </div>
          </template>
        </div>
      </div>
    </div>

    <OrderDetailModal
      :is-open="isModalOpen"
      :order="selectedOrder"
      @close="closeModal"
      @update:order="onOrderUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import OrderDetailModal from './OrderDetailModal.vue'

const props = defineProps({
  orders: { type: Array, default: () => [] },
  loadingOrders: { type: Boolean, default: false },
})

const listRef = ref(null)

const emit = defineEmits(['update:order'])

const isModalOpen = ref(false)
const selectedOrder = ref(null)

function openOrder(order) {
  selectedOrder.value = order
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  selectedOrder.value = null
}

// Обновление заказа в списке при изменении статуса в модальном окне
function onOrderUpdated(updatedOrder) {
  emit('update:order', updatedOrder)
}

// Новая шкала статусов (4 этапа)
const statusLabels = {
  new: 'Принят',
  processing: 'Принят',
  assembled: 'Собран',
  ready_for_courier: 'У курьера',
  with_courier: 'У курьера',
  delivering: 'У курьера',
  delivered: 'Доставлен',
  completed: 'Доставлен',
  cancelled: 'Отменён',
}

// Полный порядок статусов для определения прогресса
const fullStatusOrder = ['new', 'processing', 'assembled', 'ready_for_courier', 'delivering', 'delivered', 'completed']

function statusLabel(status) {
  return statusLabels[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDeliveryDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function formatFullDeliveryDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDeliveryTime(timeStr) {
  if (!timeStr) return ''
  // Преобразуем "16-17" в "16:00 — 17:00"
  const parts = timeStr.split('-')
  if (parts.length === 2) {
    return `${parts[0]}:00 — ${parts[1]}:00`
  }
  return timeStr
}

// Форматирование количества товара с учётом монобукетов
function formatItemQty(item) {
  // Для монобукетов: quantity = количество стеблей, показываем количество букетов
  if (item.isMono && item.stemsCount && item.stemsCount > 1) {
    return Math.floor(item.quantity / item.stemsCount)
  }
  // Для обычных букетов: quantity = количество букетов
  return item.quantity
}

// Шаги шкалы статуса (4 основных этапа для клиента)
// Индексы: 0 = new/processing, 1 = assembled, 2 = with_courier/ready_for_courier/delivering, 3 = delivered/completed
const statusSteps = [
  { key: 'new', label: 'Принят', color: '#3B82F6' },      // Синий
  { key: 'assembled', label: 'Собран', color: '#F59E0B' }, // Жёлтый
  { key: 'with_courier', label: 'У курьера', color: '#F97316' }, // Оранжевый
  { key: 'delivered', label: 'Доставлен', color: '#10B981' },    // Зелёный
]

// Маппинг статуса CRM → индекс этапа шкалы
// 0: Принят (new/processing), 1: Собран (assembled), 2: У курьера (with_courier/ready_for_courier/delivering), 3: Доставлен (delivered/completed)
// Обратная совместимость: ready_for_courier, delivering → У курьера (2)
function getStatusIndex(status) {
  switch (status) {
    case 'new':
    case 'processing':
      return 0
    case 'assembled':
      return 1
    case 'ready_for_courier':
    case 'delivering':
    case 'with_courier':
      return 2
    case 'delivered':
    case 'completed':
      return 3
    default:
      return 0
  }
}

// Проверка: является ли шаг активным (текущим)
function isStepActive(currentStatus, stepKey) {
  const currentStepIndex = getStatusIndex(currentStatus)
  const stepIndex = statusSteps.findIndex(s => s.key === stepKey)
  // Только текущий шаг активен, но не завершённые
  if (currentStepIndex === 3 && ['delivered', 'completed'].includes(currentStatus)) {
    return false // Доставлен — не активный, а завершённый
  }
  return currentStepIndex === stepIndex
}

// Проверка: является ли шаг завершённым
function isStepCompleted(currentStatus, stepKey) {
  const currentStepIndex = getStatusIndex(currentStatus)
  const stepIndex = statusSteps.findIndex(s => s.key === stepKey)
  // Для delivered/completed все шаги завершены, включая последний
  if (['delivered', 'completed'].includes(currentStatus)) {
    return stepIndex <= currentStepIndex
  }
  return stepIndex < currentStepIndex
}

// Расчёт позиции линии (отступ слева)
// Для 4 кружков: 0%, 33.33%, 66.66%, 100%
// Линия i находится между кружком i и i+1
</script>

<style scoped>
.oh-card {
  background: var(--color-white);
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
}

.oh-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.oh-icon {
  font-size: 18px;
  color: #000;
}

.oh-title {
  font-size: 17px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.oh-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
  font-size: 24px;
  color: var(--color-surface);
}

.oh-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: var(--color-surface);
}

.oh-empty i { font-size: 36px; opacity: 0.5; }
.oh-empty p { font-size: 15px; font-weight: 600; color: #000; margin: 0; }

.oh-catalog-link {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 10px;
  border: 1.5px solid var(--color-border);
  transition: all 0.2s;
  margin-top: 4px;
}

.oh-catalog-link:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-hover-bg);
}

.oh-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.oh-order {
  border: 1.5px solid var(--color-border);
  border-radius: 14px;
  padding: 16px;
  transition: all 0.2s;
  cursor: pointer;
}

.oh-order:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.oh-order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.oh-order-number {
  font-size: 15px;
  font-weight: 700;
  color: #000;
}

.oh-order-date {
  font-size: 12px;
  color: var(--color-text-medium-gray);
  margin-bottom: 4px;
}

.oh-address-line {
  font-size: 12px;
  color: var(--color-text-medium-gray);
  margin-bottom: 12px;
}

.oh-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.oh-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 6px;
  background: var(--color-light-bg);
  border-radius: 10px;
}

.oh-item-img-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.oh-item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.oh-item-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.oh-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  line-height: 1.2;
}

.oh-item-qty {
  font-size: 11px;
  color: var(--color-text-medium-gray);
}

.oh-order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.oh-price-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.oh-total {
  font-size: 16px;
  font-weight: 700;
  color: #000;
}

.oh-bonus-info {
  font-size: 12px;
}

.oh-bonus-discount {
  color: #16a34a;
  font-weight: 500;
}

.oh-bonus-earned {
  color: #A88BC8;
  font-weight: 500;
}

.oh-address {
  font-size: 12px;
  color: var(--color-text-medium-gray);
  display: flex;
  align-items: center;
  gap: 4px;
}

.oh-address i {
  font-size: 11px;
}

/* Шкала статуса заказа — НОВЫЙ ДИЗАЙН */
.oh-status-track {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
}

.oh-steps-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

/* Элемент этапа (кружок + подпись) */
.oh-step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Кружок этапа */
.oh-step-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E5E7EB;
  border: 2px solid #E5E7EB;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.oh-step-circle i {
  font-size: 12px;
  color: white;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

/* Завершённый шаг — зелёный с галочкой */
.oh-step-circle.step-completed {
  background: #10B981;
  border-color: #10B981;
}

/* Текущий шаг — цвет зависит от этапа */
.oh-step-circle.step-active {
  transform: scale(1.1);
}

/* Цвета для активных шагов */
.oh-step-circle.step-active[data-step="new"] {
  background: #3B82F6;
  border-color: #3B82F6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.oh-step-circle.step-active[data-step="assembled"] {
  background: #F59E0B;
  border-color: #F59E0B;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
}

.oh-step-circle.step-active[data-step="with_courier"] {
  background: #F97316;
  border-color: #F97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2);
}

.oh-step-circle.step-active[data-step="delivered"] {
  background: #10B981;
  border-color: #10B981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

/* Подписи этапов */
.oh-step-label {
  font-size: 10px;
  color: #000000;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.oh-step-label.label-completed {
  color: #000000;
}

.oh-step-label.label-active {
  color: #000000;
  font-weight: 600;
}

/* Отменённый заказ */
.oh-status-track-cancelled {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background: #fee2e2;
  border-radius: 10px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  animation: fadeInCancelled 0.4s ease;
}

@keyframes fadeInCancelled {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Плавная анимация изменения статуса */
.status-change-enter-active,
.status-change-leave-active {
  transition: all 0.3s ease;
}

.status-change-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.status-change-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

.oh-status-track-cancelled i {
  font-size: 14px;
}
</style>