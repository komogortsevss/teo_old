<template>
  <div class="active-order-card" @click="goToOrder">
    <div class="card-header" :class="{ 'header-no-border': ['delivered', 'completed'].includes(order.status) }">
      <div class="header-content">
        <span class="order-number">№{{ order.orderNumber }}</span>
        <template v-if="['delivered', 'completed'].includes(order.status)">
          <div class="status-badge-completed">
            <i class="fa-solid fa-check"></i>
          </div>
          <span class="status-text">Доставлен</span>
        </template>
      </div>
    </div>

    <div v-if="!['delivered', 'completed'].includes(order.status)" class="card-body">
      <div class="info-block">
        <span class="info-value">{{ formatDeliveryTime(order.deliveryTime) }} | {{ formatAddress(order) }}</span>
      </div>

      <!-- Шкала статуса заказа (скрыта при доставленном заказе) -->
      <div v-if="!['delivered', 'completed'].includes(order.status)" class="status-track">
          <div class="steps-container">
            <!-- Кружки этапов -->
            <div 
              v-for="(step, index) in statusSteps" 
              :key="'circle-' + step.key"
              class="step-item"
            >
              <div
                class="step-circle"
                :class="{
                  'step-completed': isStepCompleted(order.status, step.key),
                  'step-active': isStepActive(order.status, step.key)
                }"
                :data-step="step.key"
              >
                <i v-if="isStepCompleted(order.status, step.key)" class="fa-solid fa-check"></i>
                <div v-else-if="isStepActive(order.status, step.key)" class="step-dot-inner"></div>
              </div>
              <span
                class="step-label"
                :class="{
                  'label-completed': isStepCompleted(order.status, step.key),
                  'label-active': isStepActive(order.status, step.key)
                }"
              >
                {{ step.label }}
              </span>
            </div>
            
            
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { profilePageRoute } from '../profile.tsx'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const goToOrder = () => {
  // Переход в ЛК с параметром открытия попапа заказа
  window.location.href = profilePageRoute.query({ tab: 'orders', orderId: props.order.id }).url()
}

// Шаги шкалы статуса (4 основных этапа для клиента)
const statusSteps = [
  { key: 'new', label: 'Принят', color: '#3B82F6' },      // Синий
  { key: 'assembled', label: 'Собран', color: '#F59E0B' }, // Жёлтый
  { key: 'with_courier', label: 'У курьера', color: '#F97316' }, // Оранжевый
  { key: 'delivered', label: 'Доставлен', color: '#10B981' },    // Зелёный
]

// Маппинг статуса CRM → индекс этапа шкалы
// 0: Принят (new), 1: Собран (assembled), 2: У курьера (with_courier), 3: Доставлен (delivered)
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

// Получить цвет для шага
function getStepColor(stepKey) {
  const step = statusSteps.find(s => s.key === stepKey)
  return step?.color || '#E5E7EB'
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


const formatDeliveryTime = (time) => {
  if (!time) return '—'
  const [start, end] = time.split('-')
  return `Сегодня, с ${start} до ${end}`
}

const formatAddress = (order) => {
  let address = order.street || ''
  if (order.house) address += ', ' + order.house
  if (order.apartment) address += ', кв. ' + order.apartment
  return address || '—'
}
</script>

<style scoped>
.active-order-card {
  background: var(--color-white, #FFFFFF);
  border-radius: 20px;
  box-shadow: 0 4px 24px var(--color-shadow, rgba(0, 0, 0, 0.10));
  margin: 12px auto 16px;
  max-width: 1280px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.active-order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px var(--color-shadow-medium, rgba(0, 0, 0, 0.14));
}

@media (max-width: 767px) {
  .active-order-card {
    margin: 12px 16px 20px;
    border-radius: 16px;
  }
}

@media (min-width: 768px) and (max-width: 1279px) {
  .active-order-card {
    margin: 16px 32px 24px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid var(--color-border-light, rgba(0, 0, 0, 0.06));
}

.card-header.header-no-border {
  border-bottom: none;
}

@media (max-width: 767px) {
  .card-header {
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-number {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-dark, #000000);
}

/* Зелёный бейдж с галочкой для выполненного заказа */
.status-badge-completed {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10B981;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-badge-completed i {
  font-size: 10px;
  color: white;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #10B981;
}

.card-body {
  padding: 16px 24px 24px;
}

@media (max-width: 767px) {
  .card-body {
    padding: 12px 20px 20px;
  }
}

.info-block {
  margin-bottom: 20px;
}

.info-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-dark, #000000);
}

/* Шкала статуса заказа */
.status-track {
  margin-top: 8px;
}

.steps-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

/* Элемент этапа (кружок + подпись) */
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Кружок этапа */
.step-circle {
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

.step-circle i {
  font-size: 12px;
  color: white;
}

.step-dot-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

/* Завершённый шаг — зелёный с галочкой */
.step-circle.step-completed {
  background: #10B981;
  border-color: #10B981;
}

/* Текущий шаг — цвет зависит от этапа */
.step-circle.step-active {
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

/* Цвета для активных шагов */
.step-circle.step-active[data-step="new"] {
  background: #3B82F6;
  border-color: #3B82F6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.step-circle.step-active[data-step="assembled"] {
  background: #F59E0B;
  border-color: #F59E0B;
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2);
}

.step-circle.step-active[data-step="with_courier"] {
  background: #F97316;
  border-color: #F97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.2);
}

.step-circle.step-active[data-step="delivered"] {
  background: #10B981;
  border-color: #10B981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

/* Подписи этапов */
.step-label {
  font-size: 11px;
  color: #000000;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-label.label-completed {
  color: #000000;
}

.step-label.label-active {
  color: #000000;
  font-weight: 600;
}

</style>