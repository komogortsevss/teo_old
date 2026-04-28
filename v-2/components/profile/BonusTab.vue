<template>
  <div class="bonus-tab">
    <div v-if="loading" class="bonus-loading">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <span>Загрузка данных о бонусах...</span>
    </div>

    <template v-else-if="!settings?.isActive">
      <div class="bonus-inactive">
        <i class="fa-solid fa-gift"></i>
        <h3>Программа лояльности</h3>
        <p>Скоро здесь появится информация о бонусах</p>
      </div>
    </template>

    <template v-else>
      <!-- Баланс -->
      <div class="bonus-balance-card">
        <div class="balance-header">
          <i class="fa-solid fa-coins"></i>
          <span>Ваши Теобонусы</span>
        </div>
        <div class="balance-amount">
          <span class="balance-number">{{ balance }}</span>
          <span class="balance-label">бонусов</span>
        </div>
        <div class="balance-hints">
          <div class="hint">
            <span class="hint-value">{{ totalEarned }}</span>
            <span class="hint-label">начислено</span>
          </div>
          <div class="hint-divider"></div>
          <div class="hint">
            <span class="hint-value">{{ totalSpent }}</span>
            <span class="hint-label">потрачено</span>
          </div>
        </div>
      </div>

      <!-- Правила -->
      <div class="bonus-rules">
        <h4 class="rules-title">Как работают бонусы</h4>
        <div class="rules-list">
          <div class="rule-item">
            <i class="fa-solid fa-percent"></i>
            <span>Начисляем {{ settings?.earnPercent || 5 }}% от суммы заказа</span>
          </div>
          <div class="rule-item">
            <i class="fa-solid fa-wallet"></i>
            <span>Можно списать до {{ settings?.maxSpendPercent || 30 }}% стоимости заказа</span>
          </div>
          <div class="rule-item">
            <i class="fa-solid fa-calendar"></i>
            <span>Бонусы действуют {{ settings?.bonusLifetimeDays || 365 }} дней</span>
          </div>
        </div>
      </div>

      <!-- История транзакций -->
      <div class="bonus-history">
        <h4 class="history-title">История операций</h4>
        <div v-if="transactionsLoading" class="history-loading">
          <i class="fa-solid fa-spinner fa-spin"></i>
        </div>
        <div v-else-if="transactions.length === 0" class="history-empty">
          <i class="fa-solid fa-receipt"></i>
          <p>У вас пока нет операций с бонусами</p>
          <span>Совершите заказ, чтобы получить первые бонусы!</span>
        </div>
        <div v-else class="transactions-list">
          <div
            v-for="tx in transactions"
            :key="tx.id"
            class="transaction-item"
            :class="{ 'is-earn': tx.type === 'earn', 'is-spend': tx.type === 'spend', 'is-cancel': tx.type === 'cancel' || tx.type === 'expired' }"
          >
            <div class="tx-icon">
              <i :class="getTransactionIcon(tx.type)"></i>
            </div>
            <div class="tx-content">
              <div class="tx-title">{{ getTransactionTitle(tx) }}</div>
              <div class="tx-date">{{ formatDate(tx.createdAt) }}</div>
              <div v-if="tx.orderId" class="tx-order">Заказ #{{ tx.orderNumber || tx.orderId.slice(-6) }}</div>
            </div>
            <div class="tx-amount" :class="{ 'positive': tx.amount > 0, 'negative': tx.amount < 0 }">
              {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiLoyaltyBalanceByUserRoute } from '../../teo/loyalty-service/api/loyalty/balance/by-user'
import { apiLoyaltyTransactionsByUserRoute } from '../../teo/loyalty-service/api/loyalty/transactions/by-user'
import { apiLoyaltySettingsGetRoute } from '../../teo/loyalty-service/api/loyalty/settings/get'

const props = defineProps({
  userId: String
})

const loading = ref(true)
const transactionsLoading = ref(true)
const balance = ref(0)
const totalEarned = ref(0)
const totalSpent = ref(0)
const settings = ref(null)
const transactions = ref([])

onMounted(async () => {
  await loadSettings()
  if (props.userId) {
    await Promise.all([
      loadBalance(),
      loadTransactions()
    ])
  }
  loading.value = false
})

async function loadSettings() {
  try {
    const res = await apiLoyaltySettingsGetRoute.run(ctx)
    settings.value = res
  } catch (e) {
    console.error('Failed to load loyalty settings', e)
  }
}

async function loadBalance() {
  try {
    const res = await apiLoyaltyBalanceByUserRoute.query({ userId: props.userId }).run(ctx)
    if (!res.error) {
      balance.value = res.balance || 0
      totalEarned.value = res.totalEarned || 0
      totalSpent.value = res.totalSpent || 0
    }
  } catch (e) {
    console.error('Failed to load balance', e)
  }
}

async function loadTransactions() {
  transactionsLoading.value = true
  try {
    const res = await apiLoyaltyTransactionsByUserRoute.query({ userId: props.userId, limit: '50' }).run(ctx)
    transactions.value = res || []
  } catch (e) {
    console.error('Failed to load transactions', e)
  } finally {
    transactionsLoading.value = false
  }
}

function getTransactionIcon(type) {
  const icons = {
    earn: 'fa-solid fa-plus-circle',
    spend: 'fa-solid fa-minus-circle',
    cancel: 'fa-solid fa-rotate-left',
    expired: 'fa-solid fa-clock',
    manual: 'fa-solid fa-hand-holding-heart',
    welcome: 'fa-solid fa-gift'
  }
  return icons[type] || 'fa-solid fa-circle'
}

function getTransactionTitle(tx) {
  const titles = {
    earn: 'Начисление бонусов',
    spend: 'Списание бонусов',
    cancel: 'Возврат бонусов',
    expired: 'Сгорание бонусов',
    manual: 'Ручное начисление',
    welcome: 'Приветственный бонус'
  }
  return tx.description || titles[tx.type] || 'Операция с бонусами'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.bonus-tab {
  max-width: 600px;
}

.bonus-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: var(--color-text-soft);
}

.bonus-loading i {
  font-size: 32px;
}

.bonus-inactive {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-soft);
}

.bonus-inactive i {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--color-surface);
}

.bonus-inactive h3 {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin: 0 0 8px;
}

.bonus-inactive p {
  font-size: 15px;
  margin: 0;
}

/* Balance Card */
.bonus-balance-card {
  background: linear-gradient(135deg, #A88BC8 0%, #8E6FB2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
}

.balance-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 16px;
}

.balance-header i {
  font-size: 16px;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 20px;
}

.balance-number {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.balance-label {
  font-size: 18px;
  opacity: 0.9;
}

.balance-hints {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.hint {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hint-value {
  font-size: 18px;
  font-weight: 600;
}

.hint-label {
  font-size: 12px;
  opacity: 0.8;
}

.hint-divider {
  width: 1px;
  height: 32px;
  background: rgba(255,255,255,0.2);
}

/* Rules */
.bonus-rules {
  background: var(--color-light-bg, #FAFAFA);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.rules-title {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0 0 16px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--color-text-medium-gray);
}

.rule-item i {
  width: 20px;
  text-align: center;
  color: #A88BC8;
}

/* History */
.bonus-history {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.history-title {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0 0 16px;
}

.history-loading {
  display: flex;
  justify-content: center;
  padding: 40px;
  color: var(--color-text-soft);
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-soft);
}

.history-empty i {
  font-size: 40px;
  margin-bottom: 12px;
  color: var(--color-surface);
}

.history-empty p {
  font-size: 15px;
  margin: 0 0 4px;
  color: #000;
}

.history-empty span {
  font-size: 13px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--color-light-bg, #FAFAFA);
  border-radius: 10px;
  transition: background 0.2s;
}

.transaction-item:hover {
  background: var(--color-border-light);
}

.tx-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
}

.is-earn .tx-icon {
  background: #d1fae5;
  color: #065f46;
}

.is-spend .tx-icon {
  background: #fee2e2;
  color: #991b1b;
}

.is-cancel .tx-icon {
  background: #fef3c7;
  color: #92400e;
}

.tx-content {
  flex: 1;
  min-width: 0;
}

.tx-title {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 4px;
}

.tx-date {
  font-size: 12px;
  color: var(--color-text-soft);
  margin-bottom: 2px;
}

.tx-order {
  font-size: 12px;
  color: var(--color-text-medium-gray);
}

.tx-amount {
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.tx-amount.positive {
  color: #16a34a;
}

.tx-amount.negative {
  color: #dc2626;
}

@media (max-width: 767px) {
  .bonus-balance-card {
    padding: 20px;
  }

  .balance-number {
    font-size: 36px;
  }

  .balance-hints {
    gap: 12px;
  }

  .hint-value {
    font-size: 16px;
  }
}
</style>