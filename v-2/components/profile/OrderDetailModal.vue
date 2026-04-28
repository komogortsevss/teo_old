<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="odm-overlay" @click.self="close">
        <div class="odm-modal">
          <button class="odm-close" @click="close">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="odm-header">
            <div class="odm-order-number">Заказ № {{ currentOrder?.orderNumber }}</div>
          </div>

          <div class="odm-date">
            <template v-if="currentOrder?.deliveryDate">
              Доставка {{ formatFullDeliveryDate(currentOrder.deliveryDate) }}<template v-if="currentOrder.deliveryTime">, {{ formatDeliveryTime(currentOrder.deliveryTime) }}</template>
            </template>
            <template v-else>
              {{ formatDate(currentOrder?.createdAt) }}
            </template>
          </div>

          <div class="odm-section">
            <div v-if="currentOrder?.clarifyAddressWithRecipient" class="odm-clarify">
              <i class="fa-solid fa-circle-info"></i>
              Адрес уточняется у получателя
            </div>
            <div v-else-if="currentOrder?.street" class="odm-address">
              {{ currentOrder.street }}<template v-if="currentOrder.house">, д. {{ currentOrder.house }}</template>
              <template v-if="currentOrder.apartment">, кв. {{ currentOrder.apartment }}</template>
              <template v-if="currentOrder.entrance">, подъезд {{ currentOrder.entrance }}</template>
              <template v-if="currentOrder.floor">, этаж {{ currentOrder.floor }}</template>
              <template v-if="currentOrder.intercom">, домофон {{ currentOrder.intercom }}</template>
            </div>
            <div v-else class="odm-address">—</div>
          </div>

          <div v-if="currentOrder?.forOther" class="odm-section">
            <h3 class="odm-section-title">Получатель</h3>
            <div class="odm-info-row">
              <span class="odm-label">Имя:</span>
              <span class="odm-value">{{ currentOrder?.recipientName || '—' }}</span>
            </div>
            <div class="odm-info-row">
              <span class="odm-label">Телефон:</span>
              <span class="odm-value">{{ currentOrder?.recipientPhone || '—' }}</span>
            </div>
          </div>

          <div v-if="currentOrder?.hasNote && currentOrder?.noteText" class="odm-section">
            <h3 class="odm-section-title">Записка к букету</h3>
            <div class="odm-note">{{ currentOrder.noteText }}</div>
          </div>

          <div v-if="currentOrder?.comment" class="odm-section">
            <h3 class="odm-section-title">Комментарий</h3>
            <div class="odm-comment">{{ currentOrder.comment }}</div>
          </div>

          <div class="odm-section">
            <h3 class="odm-section-title">Состав заказа</h3>
            <div class="odm-items">
              <div v-for="item in (currentOrder?.items || [])" :key="item.id" class="odm-item">
                <img
                  v-if="item.imageHash"
                  :src="'https://fs.chatium.ru/thumbnail/' + item.imageHash + '/s/120x120'"
                  class="odm-item-img"
                  loading="lazy"
                  alt=""
                />
                <div v-else class="odm-item-placeholder">
                  <i class="fa-solid fa-flower"></i>
                </div>
                <div class="odm-item-details">
                  <span class="odm-item-name">{{ item.name }}</span>
                  <span class="odm-item-price">{{ formatItemPrice(item) }} ₽</span>
                </div>
                <span class="odm-item-qty">× {{ formatItemQty(item) }}</span>
              </div>
              <div v-for="addon in (currentOrder?.addons || [])" :key="addon.id" class="odm-item odm-addon">
                <div class="odm-item-details">
                  <span class="odm-item-name">{{ addon.name }}</span>
                  <span class="odm-item-price">{{ ((addon.priceAmount || 0) * addon.quantity).toLocaleString('ru-RU') }} ₽</span>
                </div>
                <span class="odm-item-qty">× {{ addon.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="odm-footer">
            <span class="odm-total-label">Итого:</span>
            <span class="odm-total">{{ (currentOrder?.totalPrice || 0).toLocaleString('ru-RU') }} ₽</span>
          </div>

          <!-- Шкала статуса заказа -->
          <div class="odm-status-track">
            <template v-if="currentOrder?.status === 'cancelled'">
              <div class="odm-status-track-cancelled">
                <i class="fa-solid fa-circle-xmark"></i>
                <span>Заказ отменён</span>
              </div>
            </template>
            <template v-else>
              <div class="odm-steps-container">
                <!-- Кружки этапов -->
                <div 
                  v-for="(step, index) in statusSteps" 
                  :key="'circle-' + step.key"
                  class="odm-step-item"
                >
                  <div
                    class="odm-step-circle"
                    :class="{
                      'step-completed': isStepCompleted(currentOrder?.status, step.key),
                      'step-active': isStepActive(currentOrder?.status, step.key)
                    }"
                    :data-step="step.key"
                  >
                    <i v-if="isStepCompleted(currentOrder?.status, step.key)" class="fa-solid fa-check"></i>
                    <div v-else-if="isStepActive(currentOrder?.status, step.key)" class="step-dot"></div>
                  </div>
                  <span
                    class="odm-step-label"
                    :class="{
                      'label-completed': isStepCompleted(currentOrder?.status, step.key),
                      'label-active': isStepActive(currentOrder?.status, step.key)
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
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { apiProfileOrdersRoute } from '../../api/profile/orders'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  order: { type: Object, default: null },
})

const emit = defineEmits(['close', 'update:order'])

const currentOrder = ref(props.order)
let detailPollingInterval = null

// Загрузка актуального заказа с сервера
async function refreshOrder() {
  if (!currentOrder.value?.id) return
  
  try {
    const orders = await apiProfileOrdersRoute.run(ctx)
    const updated = orders.find(o => o.id === currentOrder.value.id)
    if (updated) {
      currentOrder.value = updated
      emit('update:order', updated)
    }
  } catch (e) {
    console.error('Failed to refresh order', e)
  }
}

// Polling при открытом модальном окне
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    currentOrder.value = props.order
    refreshOrder() // сразу обновляем
    detailPollingInterval = setInterval(refreshOrder, 5000) // каждые 5 сек
  } else {
    if (detailPollingInterval) {
      clearInterval(detailPollingInterval)
      detailPollingInterval = null
    }
  }
}, { immediate: true })

// Обновляем currentOrder при изменении props.order
watch(() => props.order, (newOrder) => {
  if (newOrder) {
    currentOrder.value = newOrder
  }
})

let scrollY = 0
let originalOverflow = ''
let originalPosition = ''
let originalWidth = ''
let originalHeight = ''
let originalTop = ''

// Блокировка скролла body при открытом модале
function lockScroll() {
  // Сохраняем текущую позицию скролла
  scrollY = window.scrollY || window.pageYOffset
  
  // Сохраняем оригинальные стили
  originalOverflow = document.body.style.overflow
  originalPosition = document.body.style.position
  originalWidth = document.body.style.width
  originalHeight = document.body.style.height
  originalTop = document.body.style.top
  
  // Блокируем скролл (работает на всех устройствах включая iOS)
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.height = '100%'
  document.body.style.top = `-${scrollY}px`
}

function unlockScroll() {
  // Восстанавливаем стили
  document.body.style.overflow = originalOverflow
  document.body.style.position = originalPosition
  document.body.style.width = originalWidth
  document.body.style.height = originalHeight
  document.body.style.top = originalTop
  
  // Восстанавливаем позицию скролла
  window.scrollTo(0, scrollY)
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    lockScroll()
  } else {
    unlockScroll()
  }
}, { immediate: true })

// На всякий случай сбрасываем при размонтировании
onUnmounted(() => {
  unlockScroll()
})


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

function close() {
  emit('close')
}

function statusLabel(status) {
  return statusLabels[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatFullDeliveryDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDeliveryTime(timeStr) {
  if (!timeStr) return ''
  const parts = timeStr.split('-')
  if (parts.length === 2) {
    return `${parts[0]}:00 — ${parts[1]}:00`
  }
  return timeStr
}

// Форматирование цены товара — показываем цену за одну единицу (букет)
function formatItemPrice(item) {
  const price = item.priceAmount || 0
  return price.toLocaleString('ru-RU')
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

</script>

<style scoped>
.odm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.odm-modal {
  background: var(--color-white);
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  position: relative;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.odm-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: var(--color-light-bg);
  color: var(--color-text-medium-gray);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.odm-close:hover {
  background: var(--color-surface);
  color: #000;
}

.odm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-right: 40px;
}

.odm-order-number {
  font-size: 20px;
  font-weight: 700;
  color: #000;
}

.odm-date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #000;
  margin-bottom: 24px;
  margin-top: 16px;
}

.odm-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.odm-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}

.odm-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-medium-gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
}

.odm-info-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.odm-info-row:last-child {
  margin-bottom: 0;
}

.odm-label {
  font-size: 14px;
  color: var(--color-text-medium-gray);
  min-width: 80px;
}

.odm-value {
  font-size: 14px;
  font-weight: 500;
  color: #000;
}

.odm-address {
  font-size: 14px;
  line-height: 1.5;
  color: #000;
}

.odm-clarify {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #d97706;
  background: #fef3c7;
  padding: 10px 14px;
  border-radius: 10px;
}

.odm-clarify i {
  font-size: 14px;
}

.odm-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.odm-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: var(--color-light-bg);
  border-radius: 12px;
}

.odm-item-img {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.odm-item-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: var(--color-border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-medium-gray);
  font-size: 18px;
  flex-shrink: 0;
}

.odm-item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.odm-item-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.odm-item-price {
  font-size: 13px;
  color: var(--color-text-medium-gray);
}

.odm-item-qty {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  padding: 4px 10px;
  background: var(--color-white);
  border-radius: 8px;
}

.odm-addon .odm-item-name {
  color: var(--color-text-medium-gray);
}

.odm-note, .odm-comment {
  font-size: 14px;
  line-height: 1.6;
  color: #000;
  padding: 14px;
  background: var(--color-light-bg);
  border-radius: 12px;
  font-style: italic;
}

.odm-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid var(--color-border);
}

.odm-total-label {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.odm-total {
  font-size: 24px;
  font-weight: 700;
  color: #000;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .odm-modal,
.modal-leave-active .odm-modal {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from .odm-modal,
.modal-leave-to .odm-modal {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

@media (max-width: 600px) {
  .odm-overlay {
    padding: 0;
    align-items: stretch;
  }

  .odm-modal {
    padding: 20px;
    border-radius: 0;
    max-height: 100vh;
    height: 100vh;
    margin: 0;
  }

  .odm-order-number {
    font-size: 18px;
  }

  .odm-total {
    font-size: 20px;
  }
}

/* Шкала статуса заказа в попапе — НОВЫЙ ДИЗАЙН */
.odm-status-track {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-light);
}

.odm-steps-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

/* Элемент этапа (кружок + подпись) */
.odm-step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Кружок этапа */
.odm-step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E5E7EB;
  border: 2px solid #E5E7EB;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.odm-step-circle i {
  font-size: 14px;
  color: white;
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
}

/* Завершённый шаг — зелёный с галочкой */
.odm-step-circle.step-completed {
  background: #10B981;
  border-color: #10B981;
}

/* Текущий шаг — цвет зависит от этапа */
.odm-step-circle.step-active {
  transform: scale(1.1);
}

/* Цвета для активных шагов */
.odm-step-circle.step-active[data-step="new"] {
  background: #3B82F6;
  border-color: #3B82F6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.odm-step-circle.step-active[data-step="assembled"] {
  background: #F59E0B;
  border-color: #F59E0B;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
}

.odm-step-circle.step-active[data-step="with_courier"] {
  background: #F97316;
  border-color: #F97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2);
}

.odm-step-circle.step-active[data-step="delivered"] {
  background: #10B981;
  border-color: #10B981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

/* Подписи этапов */
.odm-step-label {
  font-size: 11px;
  color: #000000;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.odm-step-label.label-completed {
  color: #000000;
}

.odm-step-label.label-active {
  color: #000000;
  font-weight: 600;
}

/* Отменённый заказ */
.odm-status-track-cancelled {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px;
  background: #fee2e2;
  border-radius: 12px;
  color: #dc2626;
  font-size: 14px;
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

.odm-status-track-cancelled i {
  font-size: 16px;
}
</style>