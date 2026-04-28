<template>
  <div class="stock-list">
    <div class="stock-header">
      <h2>Складской учёт</h2>
      <button @click="loadData" class="btn-refresh" title="Обновить">
        <i class="fas fa-sync"></i>
      </button>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    
    <div v-else class="stock-table-wrapper">
      <table class="stock-table">
        <thead>
          <tr>
            <th>Цветок</th>
            <th>Slug</th>
            <th style="text-align: right;">Количество (стеблей)</th>
            <th style="text-align: center;">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in stockItems" :key="item.flowerId">
            <td>
              <strong>{{ item.flowerName }}</strong>
            </td>
            <td>
              <code>{{ item.flowerSlug }}</code>
            </td>
            <td style="text-align: right;">
              <span :class="['quantity', getQuantityClass(item.quantity)]">
                {{ item.quantity }}
              </span>
            </td>
            <td style="text-align: center;">
              <div class="actions-row">
                <button @click="openModal(item, 'add')" class="btn-action btn-add">
                  <i class="fas fa-plus"></i>
                  Добавить
                </button>
                <button @click="openModal(item, 'deduct')" class="btn-action btn-deduct">
                  <i class="fas fa-minus"></i>
                  Списать
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="stockItems.length === 0" class="empty-state">
        <p>Нет данных о цветах в наличии</p>
      </div>
    </div>

    <!-- Modal добавления / списания -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ modalMode === 'add' ? 'Добавить на склад' : 'Списать со склада' }}</h3>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-content">
          <p class="flower-name">{{ editingItem?.flowerName }}</p>
          <p class="current-qty">Текущий остаток: <strong>{{ editingItem?.quantity }}</strong> шт.</p>
          
          <div class="form-group">
            <label>{{ modalMode === 'add' ? 'Сколько добавить?' : 'Сколько списать?' }}</label>
            <input 
              v-model.number="amount" 
              type="number" 
              min="1"
              placeholder="Введите количество"
              @keyup.enter="confirmAction"
              ref="amountInput"
            />
          </div>

          <p v-if="amount > 0" class="result-qty">
            Итого на складе: 
            <strong :class="getQuantityClass(resultQuantity)">{{ resultQuantity }}</strong> шт.
          </p>
          <p v-if="modalMode === 'deduct' && amount > editingItem?.quantity" class="error-text">
            Нельзя списать больше, чем есть на складе
          </p>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">Отмена</button>
          <button 
            @click="confirmAction" 
            :class="['btn-confirm', modalMode === 'add' ? 'btn-confirm-add' : 'btn-confirm-deduct']"
            :disabled="!isValid"
          >
            {{ modalMode === 'add' ? 'Добавить' : 'Списать' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { apiAdminFlowersListRoute } from '../../api/admin/flowers/list'
import { apiAdminStockListRoute } from '../../api/admin/stock/list'
import { apiAdminStockUpdateRoute } from '../../api/admin/stock/update'

const flowers = ref([])
const stock = ref([])
const loading = ref(true)
const showModal = ref(false)
const modalMode = ref('add')
const editingItem = ref(null)
const amount = ref(1)
const amountInput = ref(null)

const stockItems = computed(() => {
  return flowers.value.map(flower => {
    const stockItem = stock.value.find(s => {
      const sFlowerId = typeof s.flower === 'string' ? s.flower : s.flower?.id
      return sFlowerId === flower.id
    })
    return {
      flowerId: flower.id,
      flowerName: flower.name,
      flowerSlug: flower.slug,
      quantity: stockItem?.quantity || 0,
      stockId: stockItem?.id
    }
  }).sort((a, b) => a.flowerName.localeCompare(b.flowerName, 'ru'))
})

const resultQuantity = computed(() => {
  if (!editingItem.value || !amount.value) return editingItem.value?.quantity || 0
  if (modalMode.value === 'add') {
    return editingItem.value.quantity + amount.value
  } else {
    return Math.max(0, editingItem.value.quantity - amount.value)
  }
})

const isValid = computed(() => {
  if (!amount.value || amount.value <= 0) return false
  if (modalMode.value === 'deduct' && amount.value > editingItem.value?.quantity) return false
  return true
})

onMounted(async () => {
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    const [flowersData, stockData] = await Promise.all([
      apiAdminFlowersListRoute.run(ctx),
      apiAdminStockListRoute.run(ctx)
    ])
    flowers.value = flowersData
    stock.value = stockData
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  }
  loading.value = false
}

function getQuantityClass(quantity) {
  if (quantity === 0) return 'zero'
  if (quantity < 20) return 'low'
  return 'normal'
}

function openModal(item, mode) {
  editingItem.value = item
  modalMode.value = mode
  amount.value = 1
  showModal.value = true
  nextTick(() => {
    amountInput.value?.focus()
    amountInput.value?.select()
  })
}

function closeModal() {
  showModal.value = false
  editingItem.value = null
  amount.value = 1
}

async function confirmAction() {
  if (!editingItem.value || !isValid.value) return

  const newQuantity = resultQuantity.value

  try {
    await apiAdminStockUpdateRoute.run(ctx, {
      flowerId: editingItem.value.flowerId,
      quantity: newQuantity
    })
    await loadData()
    closeModal()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    alert('Ошибка сохранения данных')
  }
}
</script>

<style scoped>
.stock-list {
  padding: 24px;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.stock-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--admin-text-dark);
}

.btn-refresh {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-bg-light);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--admin-primary);
}

.btn-refresh:hover {
  background: var(--admin-accent);
  color: var(--admin-primary-dark);
}

.loading {
  text-align: center;
  padding: 48px;
  color: var(--admin-text-soft);
  font-size: 16px;
}

.stock-table-wrapper {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
}

.stock-table thead {
  background: var(--admin-bg-light);
}

.stock-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--admin-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stock-table td {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  font-size: 14px;
}

.stock-table code {
  padding: 2px 6px;
  background: var(--admin-bg-light);
  border-radius: 4px;
  font-size: 13px;
  font-family: monospace;
  color: var(--admin-text-dark);
}

.quantity {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.quantity.zero {
  background: #ffebee;
  color: #d32f2f;
}

.quantity.low {
  background: #fff3e0;
  color: #f57c00;
}

.quantity.normal {
  background: #e8f5e9;
  color: #388e3c;
}

.actions-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  font-weight: 600;
  font-family: inherit;
}

.btn-add {
  background: #e8f5e9;
  border-color: #a5d6a7;
  color: #2e7d32;
}

.btn-add:hover {
  background: #2e7d32;
  color: white;
  border-color: #2e7d32;
}

.btn-deduct {
  background: #fff3e0;
  border-color: #ffcc80;
  color: #e65100;
}

.btn-deduct:hover {
  background: #e65100;
  color: white;
  border-color: #e65100;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: var(--admin-text-soft);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 90%;
  max-width: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-bg-light);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: var(--admin-text-soft);
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--admin-accent);
  color: var(--admin-primary);
}

.modal-content {
  padding: 24px;
}

.flower-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-dark);
}

.current-qty {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: var(--admin-text-medium);
}

.result-qty {
  margin: 16px 0 0 0;
  font-size: 15px;
  color: var(--admin-text-dark);
}

.error-text {
  margin: 12px 0 0 0;
  font-size: 13px;
  color: #d32f2f;
  font-weight: 500;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: var(--admin-primary);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--color-border);
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-cancel {
  background: white;
  color: var(--admin-text-dark);
  border: 1.5px solid var(--admin-accent);
}

.btn-cancel:hover {
  background: var(--admin-bg-light);
  border-color: var(--admin-primary);
}

.btn-confirm-add {
  background: #2e7d32;
  color: white;
}

.btn-confirm-add:hover:not(:disabled) {
  background: #1b5e20;
}

.btn-confirm-deduct {
  background: #e65100;
  color: white;
}

.btn-confirm-deduct:hover:not(:disabled) {
  background: #bf360c;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>