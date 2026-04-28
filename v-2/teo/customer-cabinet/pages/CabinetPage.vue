<template>
  <div class="cabinet-page">
    <div class="container">
      <h1 class="page-title">Личный кабинет</h1>
      
      <div class="cabinet-grid">
        <!-- Профиль -->
        <div class="profile-card">
          <h2 class="section-title">Мои данные</h2>
          <div v-if="profile" class="profile-info">
            <div class="info-row">
              <span class="label">Имя:</span>
              <span class="value">{{ profile.firstName }} {{ profile.lastName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Телефон:</span>
              <span class="value">{{ profile.phone || 'Не указан' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">{{ profile.email || 'Не указан' }}</span>
            </div>
          </div>
          <div v-else class="loading">Загрузка...</div>
        </div>
        
        <!-- Баланс бонусов -->
        <div class="bonuses-card">
          <h2 class="section-title">Мои Теобонусы</h2>
          <div v-if="bonuses" class="bonuses-info">
            <div class="balance-display">
              <span class="balance-value">{{ bonuses.balance }}</span>
              <span class="balance-label">бонусов</span>
            </div>
            <div class="bonuses-stats">
              <div class="stat">
                <span class="stat-value">{{ bonuses.totalEarned }}</span>
                <span class="stat-label">начислено</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ bonuses.totalSpent }}</span>
                <span class="stat-label">потрачено</span>
              </div>
            </div>
          </div>
          <div v-else class="loading">Загрузка...</div>
        </div>
      </div>
      
      <!-- История заказов -->
      <div class="orders-section">
        <h2 class="section-title">История заказов</h2>
        <div v-if="orders.length > 0" class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-header">
              <span class="order-number">Заказ #{{ order.id.slice(-6) }}</span>
              <span class="order-status" :class="order.status">{{ statusText(order.status) }}</span>
            </div>
            <div class="order-details">
              <div class="order-items">
                <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
                  {{ item.name }} x {{ item.quantity }}
                </div>
              </div>
              <div class="order-bonuses" v-if="order.bonusEarned || order.bonusAmount">
                <span v-if="order.bonusEarned" class="bonus-earned">+{{ order.bonusEarned }} бонусов</span>
                <span v-if="order.bonusAmount" class="bonus-spent">-{{ order.bonusAmount }} бонусов</span>
              </div>
              <div class="order-total">
                <span class="total-label">Итого:</span>
                <span class="total-value">{{ formatPrice(order.total) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-orders">
          У вас пока нет заказов
        </div>
      </div>
      
      <!-- История транзакций -->
      <div class="transactions-section">
        <h2 class="section-title">История бонусов</h2>
        <div v-if="transactions.length > 0" class="transactions-list">
          <div v-for="tx in transactions" :key="tx.id" class="transaction-row">
            <div class="tx-info">
              <span class="tx-type" :class="tx.type">{{ txTypeText(tx.type) }}</span>
              <span class="tx-date">{{ formatDate(tx.createdAt) }}</span>
            </div>
            <div class="tx-amount" :class="tx.type">
              {{ tx.type === 'spend' || tx.type === 'expire' ? '-' : '+' }}{{ tx.amount }}
            </div>
            <div class="tx-balance">{{ tx.balanceAfter }}</div>
          </div>
        </div>
        <div v-else class="empty-transactions">
          История бонусов пуста
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  customerId: String
})

const profile = ref(null)
const bonuses = ref(null)
const orders = ref([])
const transactions = ref([])

const statusText = (status) => ({
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  delivering: 'В доставке',
  completed: 'Выполнен',
  cancelled: 'Отменён'
}[status] || status)

const txTypeText = (type) => ({
  earn: 'Начисление',
  spend: 'Списание',
  cancel: 'Возврат',
  expire: 'Сгорание',
  manual: 'Ручная операция'
}[type] || type)

const formatPrice = (money) => {
  if (!money) return '0 ₽'
  return `${money.amount?.toLocaleString('ru-RU') || money.toLocaleString?.() || money} ₽`
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(async () => {
  if (!props.customerId) return
  
  // Загрузка профиля и бонусов
  try {
    const profileRes = await fetch(`/teo/customer-cabinet/api/cabinet/profile/get?customerId=${props.customerId}`)
    const profileData = await profileRes.json()
    if (!profileData.error) {
      profile.value = profileData.customer
      bonuses.value = profileData.bonuses
    }
  } catch (e) {
    console.error('Failed to load profile', e)
  }
  
  // Загрузка заказов
  try {
    const ordersRes = await fetch(`/teo/customer-cabinet/api/cabinet/orders/list?customerId=${props.customerId}`)
    const ordersData = await ordersRes.json()
    if (Array.isArray(ordersData)) {
      orders.value = ordersData
    }
  } catch (e) {
    console.error('Failed to load orders', e)
  }
  
  // Загрузка транзакций
  try {
    const txRes = await fetch(`/teo/loyalty-service/api/loyalty/transactions/list?customerId=${props.customerId}`)
    const txData = await txRes.json()
    if (Array.isArray(txData)) {
      transactions.value = txData
    }
  } catch (e) {
    console.error('Failed to load transactions', e)
  }
})
</script>

<style scoped>
.cabinet-page {
  padding: 40px 0;
  background: #f8f8f8;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 32px;
  color: #2B2233;
}

.cabinet-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .cabinet-grid {
    grid-template-columns: 1fr;
  }
}

.profile-card,
.bonuses-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2B2233;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #666;
}

.value {
  font-weight: 500;
  color: #2B2233;
}

.balance-display {
  text-align: center;
  padding: 24px;
  background: linear-gradient(135deg, #A88BC8 0%, #8E6FB2 100%);
  border-radius: 12px;
  color: white;
  margin-bottom: 20px;
}

.balance-value {
  display: block;
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.balance-label {
  font-size: 16px;
  opacity: 0.9;
}

.bonuses-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat {
  text-align: center;
  padding: 16px;
  background: #f8f8f8;
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 600;
  color: #2B2233;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.orders-section,
.transactions-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 24px;
}

.order-card {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-number {
  font-weight: 600;
  color: #2B2233;
}

.order-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.order-status.pending { background: #fef3c7; color: #92400e; }
.order-status.paid { background: #dbeafe; color: #1e40af; }
.order-status.delivering { background: #e0e7ff; color: #3730a3; }
.order-status.completed { background: #d1fae5; color: #065f46; }
.order-status.cancelled { background: #fee2e2; color: #991b1b; }

.order-bonuses {
  display: flex;
  gap: 12px;
  margin: 12px 0;
  font-size: 14px;
}

.bonus-earned {
  color: #16a34a;
}

.bonus-spent {
  color: #dc2626;
}

.order-total {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-weight: 600;
}

.transaction-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.tx-info {
  display: flex;
  flex-direction: column;
}

.tx-type {
  font-weight: 500;
  font-size: 14px;
}

.tx-type.earn { color: #16a34a; }
.tx-type.spend { color: #dc2626; }
.tx-type.cancel { color: #2563eb; }
.tx-type.expire { color: #6b7280; }

.tx-date {
  font-size: 12px;
  color: #9ca3af;
}

.tx-amount {
  font-weight: 600;
  font-size: 16px;
}

.tx-amount.earn { color: #16a34a; }
.tx-amount.spend { color: #dc2626; }
.tx-amount.cancel { color: #2563eb; }
.tx-amount.expire { color: #6b7280; }

.tx-balance {
  text-align: right;
  color: #666;
  font-size: 14px;
}

.empty-orders,
.empty-transactions {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}
</style>