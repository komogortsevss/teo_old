<template>
  <div class="customer-bonuses">
    <h2 class="section-title">Балансы клиентов</h2>
    
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Поиск по имени, телефону или email..."
        @input="onSearch"
      />
    </div>
    
    <div class="customers-list">
      <table v-if="customers.length > 0">
        <thead>
          <tr>
            <th>Клиент</th>
            <th>Контакты</th>
            <th>Баланс</th>
            <th>Всего начислено</th>
            <th>Всего потрачено</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in customers" :key="customer.id">
            <td>
              <div class="customer-name">
                {{ customer.firstName }} {{ customer.lastName }}
              </div>
            </td>
            <td>
              <div class="customer-contacts">
                <span v-if="customer.phone">{{ customer.phone }}</span>
                <span v-if="customer.email">{{ customer.email }}</span>
              </div>
            </td>
            <td>
              <span class="balance" :class="{ 'high': customer.balance > 1000 }">
                {{ customer.balance }}
              </span>
            </td>
            <td>{{ customer.totalEarned }}</td>
            <td>{{ customer.totalSpent }}</td>
            <td>
              <div class="actions">
                <button class="btn-action" @click="openManualModal(customer, 'earn')">
                  + Начислить
                </button>
                <button class="btn-action" @click="openManualModal(customer, 'spend')">
                  - Списать
                </button>
                <button class="btn-action" @click="viewTransactions(customer)">
                  История
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">Клиенты не найдены</div>
    </div>
    
    <!-- Модальное окно для ручной операции -->
    <div v-if="showManualModal" class="modal-overlay" @click.self="closeManualModal">
      <div class="modal">
        <h3>{{ manualType === 'earn' ? 'Начисление бонусов' : 'Списание бонусов' }}</h3>
        <div class="modal-body">
          <p class="customer-info">
            Клиент: <strong>{{ selectedCustomer?.firstName }} {{ selectedCustomer?.lastName }}</strong>
            <br>
            Текущий баланс: <strong>{{ selectedCustomer?.balance }}</strong>
          </p>
          <div class="form-group">
            <label>Количество бонусов</label>
            <input type="number" v-model.number="manualAmount" min="1" />
          </div>
          <div class="form-group">
            <label>Описание (необязательно)</label>
            <input type="text" v-model="manualDescription" placeholder="Причина операции" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeManualModal">Отмена</button>
          <button 
            class="btn-primary" 
            @click="submitManual"
            :disabled="!manualAmount || manualAmount <= 0"
          >
            {{ manualType === 'earn' ? 'Начислить' : 'Списать' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно истории транзакций -->
    <div v-if="showTxModal" class="modal-overlay" @click.self="closeTxModal">
      <div class="modal modal-large">
        <h3>История транзакций</h3>
        <div class="modal-body">
          <p class="customer-info">
            Клиент: <strong>{{ selectedCustomer?.firstName }} {{ selectedCustomer?.lastName }}</strong>
          </p>
          <table v-if="transactions.length > 0" class="tx-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Тип</th>
                <th>Сумма</th>
                <th>Баланс после</th>
                <th>Описание</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions" :key="tx.id">
                <td>{{ formatDate(tx.createdAt) }}</td>
                <td>
                  <span class="tx-type" :class="tx.type">{{ txTypeText(tx.type) }}</span>
                </td>
                <td :class="tx.type">
                  {{ tx.type === 'spend' || tx.type === 'expire' ? '-' : '+' }}{{ tx.amount }}
                </td>
                <td>{{ tx.balanceAfter }}</td>
                <td>{{ tx.description }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty">Транзакций нет</div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeTxModal">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiAdminLoyaltyCustomersListRoute } from '../../api/admin/loyalty/customers/list'
import { apiAdminLoyaltyCustomersSearchRoute } from '../../api/admin/loyalty/customers/search'
import { apiLoyaltyManualRoute } from '../../../loyalty-service/api/loyalty/manual/post'
import { apiLoyaltyTransactionsListRoute } from '../../../loyalty-service/api/loyalty/transactions/list'

const customers = ref([])
const searchQuery = ref('')
const showManualModal = ref(false)
const showTxModal = ref(false)
const selectedCustomer = ref(null)
const manualType = ref('earn')
const manualAmount = ref(0)
const manualDescription = ref('')
const transactions = ref([])

const txTypeText = (type) => ({
  earn: 'Начисление',
  spend: 'Списание',
  cancel: 'Возврат',
  expire: 'Сгорание',
  manual: 'Ручная'
}[type] || type)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU')
}

const loadCustomers = async () => {
  try {
    const data = await apiAdminLoyaltyCustomersListRoute.run(ctx)
    if (Array.isArray(data)) {
      customers.value = data
    }
  } catch (e) {
    console.error('Failed to load customers', e)
  }
}

const onSearch = () => {
  // Дебаунс поиска
  clearTimeout(window.searchTimeout)
  window.searchTimeout = setTimeout(async () => {
    if (!searchQuery.value) {
      loadCustomers()
      return
    }
    try {
      const data = await apiAdminLoyaltyCustomersSearchRoute.query({ q: searchQuery.value }).run(ctx)
      if (Array.isArray(data)) {
        customers.value = data
      }
    } catch (e) {
      console.error('Search failed', e)
    }
  }, 300)
}

const openManualModal = (customer, type) => {
  selectedCustomer.value = customer
  manualType.value = type
  manualAmount.value = 0
  manualDescription.value = ''
  showManualModal.value = true
}

const closeManualModal = () => {
  showManualModal.value = false
  selectedCustomer.value = null
}

const submitManual = async () => {
  try {
    const data = await apiLoyaltyManualRoute.run(ctx, {
      customerId: selectedCustomer.value.id,
      type: manualType.value,
      amount: manualAmount.value,
      description: manualDescription.value
    })
    
    if (data.success) {
      alert('Операция выполнена')
      closeManualModal()
      loadCustomers()
    } else {
      alert('Ошибка: ' + data.error)
    }
  } catch (e) {
    alert('Ошибка выполнения')
  }
}

const viewTransactions = async (customer) => {
  selectedCustomer.value = customer
  showTxModal.value = true
  
  try {
    const data = await apiLoyaltyTransactionsListRoute.query({ customerId: customer.id, limit: 50 }).run(ctx)
    if (Array.isArray(data)) {
      transactions.value = data
    }
  } catch (e) {
    console.error('Failed to load transactions', e)
  }
}

const closeTxModal = () => {
  showTxModal.value = false
  selectedCustomer.value = null
  transactions.value = []
}

onMounted(loadCustomers)
</script>

<style scoped>
.customer-bonuses {
  padding: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #2B2233;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  max-width: 400px;
  padding: 10px 14px;
  border: 1px solid #DCCDEA;
  border-radius: 8px;
  font-size: 14px;
}

.customers-list table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.customers-list th,
.customers-list td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.customers-list th {
  background: #f7f3fb;
  font-weight: 600;
  font-size: 13px;
  color: #5F5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.customer-name {
  font-weight: 500;
  color: #2B2233;
}

.customer-contacts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.balance {
  font-weight: 600;
  color: #A88BC8;
}

.balance.high {
  color: #16a34a;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 6px 12px;
  border: 1px solid #DCCDEA;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #f7f3fb;
  border-color: #A88BC8;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
  background: white;
  border-radius: 12px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 800px;
}

.modal h3 {
  margin-bottom: 20px;
  color: #2B2233;
}

.modal-body {
  margin-bottom: 20px;
}

.customer-info {
  background: #f7f3fb;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #5F5568;
  margin-bottom: 6px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #DCCDEA;
  border-radius: 8px;
  font-size: 15px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #DCCDEA;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.btn-primary {
  padding: 10px 20px;
  background: #A88BC8;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background: #8E6FB2;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tx-table {
  width: 100%;
  font-size: 13px;
}

.tx-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.tx-type.earn { background: #d1fae5; color: #065f46; }
.tx-type.spend { background: #fee2e2; color: #991b1b; }
.tx-type.cancel { background: #dbeafe; color: #1e40af; }
.tx-type.expire { background: #f3f4f6; color: #6b7280; }
.tx-type.manual { background: #fef3c7; color: #92400e; }

.tx-table .earn { color: #16a34a; font-weight: 500; }
.tx-table .spend { color: #dc2626; font-weight: 500; }
</style>