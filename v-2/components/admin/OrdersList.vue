<template>
  <div class="orders-list">
    <div class="orders-header">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по номеру, имени или телефону..."
          class="search-input"
        />
      </div>
      <div class="filters">
        <button
          v-for="status in statuses"
          :key="status.value"
          class="filter-btn"
          :class="{ active: statusFilter === status.value }"
          @click="statusFilter = status.value"
        >
          {{ status.label }}
          <span class="filter-count">{{ getCountByStatus(status.value) }}</span>
        </button>
        <div class="columns-dropdown">
          <button @click="showColumnsMenu = !showColumnsMenu" class="filter-btn columns-btn">
            <i class="fas fa-columns"></i> Столбцы
          </button>
          <div v-if="showColumnsMenu" class="dropdown-menu">
            <label v-for="col in availableColumns" :key="col.key" class="dropdown-item">
              <input
                type="checkbox"
                :checked="visibleColumns.includes(col.key)"
                @change="toggleColumn(col.key)"
              />
              <span>{{ col.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredOrders.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>Заказов не найдено</p>
    </div>

    <div v-else class="table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th v-if="isColumnVisible('orderNumber')">Номер заказа</th>
            <th v-if="isColumnVisible('createdAt')">Дата создания</th>
            <th v-if="isColumnVisible('deliveryDate')">Дата доставки</th>
            <th v-if="isColumnVisible('deliveryTime')">Время</th>
            <th v-if="isColumnVisible('buyerName')">Заказчик</th>
            <th v-if="isColumnVisible('buyerPhone')">Телефон заказчика</th>
            <th v-if="isColumnVisible('recipientName')">Получатель</th>
            <th v-if="isColumnVisible('recipientPhone')">Телефон получателя</th>
            <th v-if="isColumnVisible('address')">Адрес</th>
            <th v-if="isColumnVisible('noteText')">Записка</th>
            <th v-if="isColumnVisible('comment')">Комментарий</th>
            <th v-if="isColumnVisible('status')">Статус</th>
            <th v-if="isColumnVisible('totalPrice')">Сумма</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" class="order-row" @click="viewOrder(order)" style="cursor: pointer;">
            <td v-if="isColumnVisible('orderNumber')" class="order-number">{{ order.orderNumber }}</td>
            <td v-if="isColumnVisible('createdAt')" class="order-date">{{ formatCreatedDate(order.createdAt) }}</td>
            <td v-if="isColumnVisible('deliveryDate')" class="delivery-date">{{ formatDeliveryDate(order.deliveryDate) }}</td>
            <td v-if="isColumnVisible('deliveryTime')" class="delivery-time">{{ order.deliveryTime }}</td>
            <td v-if="isColumnVisible('buyerName')" class="buyer-name">{{ order.buyerName }}</td>
            <td v-if="isColumnVisible('buyerPhone')" class="buyer-phone"><a :href="'tel:' + order.buyerPhone" @click.stop>{{ order.buyerPhone }}</a></td>
            <td v-if="isColumnVisible('recipientName')" class="recipient-name">{{ order.recipientName || '—' }}</td>
            <td v-if="isColumnVisible('recipientPhone')" class="recipient-phone">
              <a v-if="order.recipientPhone" :href="'tel:' + order.recipientPhone" @click.stop>{{ order.recipientPhone }}</a>
              <span v-else>—</span>
            </td>
            <td v-if="isColumnVisible('address')" class="address">{{ formatAddress(order) }}</td>
            <td v-if="isColumnVisible('noteText')" class="note">{{ order.noteText || '—' }}</td>
            <td v-if="isColumnVisible('comment')" class="comment">{{ order.comment || '—' }}</td>
            <td v-if="isColumnVisible('status')" class="status" @click.stop>
              <select
                :value="order.status"
                @change="updateStatus(order.id, $event.target.value)"
                class="status-select"
                :class="'status-' + order.status"
              >
                <option value="new">Новый</option>
                <option value="processing">В обработке</option>
                <option value="delivering">Доставляется</option>
                <option value="completed">Выполнен</option>
                <option value="cancelled">Отменён</option>
              </select>
            </td>
            <td v-if="isColumnVisible('totalPrice')" class="price">{{ order.totalPrice.toLocaleString('ru-RU') }} ₽</td>
            <td class="actions" @click.stop>
              <button @click="editOrder(order)" class="action-btn edit-btn" title="Редактировать">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteOrder(order.id)" class="action-btn delete-btn" title="Удалить">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Попап просмотра заказа -->
    <div v-if="viewingOrder" class="modal-overlay" @click.self="viewingOrder = null">
      <div class="modal-content view-modal">
        <div class="modal-header">
          <h3>Заказ {{ viewingOrder.orderNumber }}</h3>
          <button @click="viewingOrder = null" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="order-info-grid">
            <div class="info-section">
              <h4>Информация о доставке</h4>
              <div class="info-row">
                <span class="info-label">Дата доставки:</span>
                <span class="info-value">{{ formatDeliveryDate(viewingOrder.deliveryDate) }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Время:</span>
                <span class="info-value">{{ viewingOrder.deliveryTime }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Статус:</span>
                <span class="info-value" :class="'status-badge status-' + viewingOrder.status">{{ getStatusLabel(viewingOrder.status) }}</span>
              </div>
            </div>

            <div class="info-section">
              <h4>Заказчик</h4>
              <div class="info-row">
                <span class="info-label">Имя:</span>
                <span class="info-value">{{ viewingOrder.buyerName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Телефон:</span>
                <span class="info-value"><a :href="'tel:' + viewingOrder.buyerPhone">{{ viewingOrder.buyerPhone }}</a></span>
              </div>
            </div>

            <div v-if="viewingOrder.forOther" class="info-section">
              <h4>Получатель</h4>
              <div class="info-row">
                <span class="info-label">Имя:</span>
                <span class="info-value">{{ viewingOrder.recipientName || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Телефон:</span>
                <span class="info-value">
                  <a v-if="viewingOrder.recipientPhone" :href="'tel:' + viewingOrder.recipientPhone">{{ viewingOrder.recipientPhone }}</a>
                  <span v-else>—</span>
                </span>
              </div>
            </div>

            <div class="info-section">
              <h4>Адрес доставки</h4>
              <div class="info-row">
                <span class="info-value">{{ formatAddress(viewingOrder) }}</span>
              </div>
            </div>

            <div v-if="viewingOrder.hasNote && viewingOrder.noteText" class="info-section">
              <h4>Записка</h4>
              <div class="info-row">
                <span class="info-value">{{ viewingOrder.noteText }}</span>
              </div>
            </div>

            <div v-if="viewingOrder.comment" class="info-section">
              <h4>Комментарий к заказу</h4>
              <div class="info-row">
                <span class="info-value">{{ viewingOrder.comment }}</span>
              </div>
            </div>
          </div>

          <div class="order-items">
            <h4>Состав заказа</h4>
            <div class="items-list">
              <div v-for="item in viewingOrder.items" :key="item.id" class="item-card">
                <img v-if="item.imageHash" :src="getThumbnail(item.imageHash)" :alt="item.name" class="item-image" />
                <div class="item-details">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-meta">{{ item.quantity }} × {{ item.priceAmount.toLocaleString('ru-RU') }} ₽</div>
                </div>
              </div>
              <div v-for="addon in viewingOrder.addons" :key="addon.id" class="item-card">
                <div class="item-details">
                  <div class="item-name">{{ addon.name }}</div>
                  <div class="item-meta">{{ addon.quantity }} × {{ addon.priceAmount.toLocaleString('ru-RU') }} ₽</div>
                </div>
              </div>
            </div>
            <div class="order-total">
              <span>Итого:</span>
              <span class="total-amount">{{ viewingOrder.totalPrice.toLocaleString('ru-RU') }} ₽</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="viewingOrder = null" class="btn-cancel">Закрыть</button>
          <button @click="editFromView" class="btn-save">Редактировать</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования -->
    <div v-if="editingOrder" class="modal-overlay" @click.self="editingOrder = null">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Редактирование заказа {{ editingOrder.orderNumber }}</h3>
          <button @click="editingOrder = null" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Дата доставки</label>
            <input v-model="editForm.deliveryDate" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label>Время доставки</label>
            <input v-model="editForm.deliveryTime" type="text" class="form-input" placeholder="9-10" />
          </div>
          <div class="form-group">
            <label>Имя заказчика</label>
            <input v-model="editForm.buyerName" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Телефон заказчика</label>
            <input v-model="editForm.buyerPhone" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Имя получателя</label>
            <input v-model="editForm.recipientName" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Телефон получателя</label>
            <input v-model="editForm.recipientPhone" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Улица</label>
            <input v-model="editForm.street" type="text" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Дом</label>
              <input v-model="editForm.house" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label>Квартира</label>
              <input v-model="editForm.apartment" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label>Подъезд</label>
              <input v-model="editForm.entrance" type="text" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Этаж</label>
              <input v-model="editForm.floor" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label>Домофон</label>
              <input v-model="editForm.intercom" type="text" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>Текст записки</label>
            <textarea v-model="editForm.noteText" class="form-textarea" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Комментарий</label>
            <textarea v-model="editForm.comment" class="form-textarea" rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="editingOrder = null" class="btn-cancel">Отмена</button>
          <button @click="saveOrder" class="btn-save">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiAdminOrdersUpdateStatusRoute } from '../../api/admin/orders/update-status'
import { apiAdminOrdersUpdateRoute } from '../../api/admin/orders/update'
import { apiAdminOrdersDeleteRoute } from '../../api/admin/orders/delete'
import { getThumbnailUrl } from '@app/storage'

const props = defineProps({
  orders: { type: Array, required: true },
})

const emit = defineEmits(['statusUpdated', 'orderUpdated', 'orderDeleted'])

const searchQuery = ref('')
const statusFilter = ref('all')
const editingOrder = ref(null)
const viewingOrder = ref(null)
const editForm = ref({})
const showColumnsMenu = ref(false)
const visibleColumns = ref([])

const availableColumns = [
  { key: 'orderNumber', label: 'Номер заказа' },
  { key: 'createdAt', label: 'Дата создания' },
  { key: 'deliveryDate', label: 'Дата доставки' },
  { key: 'deliveryTime', label: 'Время' },
  { key: 'buyerName', label: 'Заказчик' },
  { key: 'buyerPhone', label: 'Телефон заказчика' },
  { key: 'recipientName', label: 'Получатель' },
  { key: 'recipientPhone', label: 'Телефон получателя' },
  { key: 'address', label: 'Адрес' },
  { key: 'noteText', label: 'Записка' },
  { key: 'comment', label: 'Комментарий' },
  { key: 'status', label: 'Статус' },
  { key: 'totalPrice', label: 'Сумма' },
]

const defaultColumns = ['orderNumber', 'createdAt', 'deliveryDate', 'buyerName', 'status', 'totalPrice']

const statuses = [
  { value: 'all', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'processing', label: 'В обработке' },
  { value: 'delivering', label: 'Доставляются' },
  { value: 'completed', label: 'Выполнены' },
  { value: 'cancelled', label: 'Отменены' },
]

const monthNames = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
]

const filteredOrders = computed(() => {
  let result = props.orders

  if (statusFilter.value !== 'all') {
    result = result.filter(o => o.status === statusFilter.value)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.buyerName.toLowerCase().includes(q) ||
      o.buyerPhone.includes(q) ||
      (o.recipientName && o.recipientName.toLowerCase().includes(q)) ||
      (o.recipientPhone && o.recipientPhone.includes(q))
    )
  }

  return result
})

function getCountByStatus(status) {
  if (status === 'all') return props.orders.length
  return props.orders.filter(o => o.status === status).length
}

function formatCreatedDate(date) {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function formatDeliveryDate(dateString) {
  if (!dateString) return '—'
  const d = new Date(dateString)
  const day = String(d.getDate()).padStart(2, '0')
  const month = monthNames[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

function formatAddress(order) {
  if (order.clarifyAddressWithRecipient) return 'Уточнить у получателя'
  if (!order.street) return '—'
  
  const parts = [order.street]
  if (order.house) parts.push(`д. ${order.house}`)
  if (order.apartment) parts.push(`кв. ${order.apartment}`)
  if (order.entrance) parts.push(`под. ${order.entrance}`)
  if (order.floor) parts.push(`эт. ${order.floor}`)
  if (order.intercom) parts.push(`дом. ${order.intercom}`)
  
  return parts.join(', ')
}

function getStatusLabel(status) {
  const labels = {
    new: 'Новый',
    processing: 'В обработке',
    delivering: 'Доставляется',
    completed: 'Выполнен',
    cancelled: 'Отменён',
  }
  return labels[status] || status
}

function getThumbnail(imageHash) {
  return getThumbnailUrl(imageHash, 80, 80)
}

function viewOrder(order) {
  viewingOrder.value = order
}

function editFromView() {
  const order = viewingOrder.value
  viewingOrder.value = null
  editOrder(order)
}

function isColumnVisible(key) {
  return visibleColumns.value.includes(key)
}

function toggleColumn(key) {
  const index = visibleColumns.value.indexOf(key)
  if (index === -1) {
    visibleColumns.value.push(key)
  } else {
    visibleColumns.value.splice(index, 1)
  }
  saveColumnsToStorage()
}

function saveColumnsToStorage() {
  localStorage.setItem('teo-admin-columns', JSON.stringify(visibleColumns.value))
}

function loadColumnsFromStorage() {
  const saved = localStorage.getItem('teo-admin-columns')
  if (saved) {
    try {
      visibleColumns.value = JSON.parse(saved)
    } catch (e) {
      visibleColumns.value = [...defaultColumns]
    }
  } else {
    visibleColumns.value = [...defaultColumns]
  }
}

onMounted(() => {
  loadColumnsFromStorage()
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.columns-dropdown')) {
      showColumnsMenu.value = false
    }
  })
})

function editOrder(order) {
  editingOrder.value = order
  editForm.value = {
    deliveryDate: order.deliveryDate || '',
    deliveryTime: order.deliveryTime || '',
    buyerName: order.buyerName || '',
    buyerPhone: order.buyerPhone || '',
    recipientName: order.recipientName || '',
    recipientPhone: order.recipientPhone || '',
    street: order.street || '',
    house: order.house || '',
    apartment: order.apartment || '',
    entrance: order.entrance || '',
    floor: order.floor || '',
    intercom: order.intercom || '',
    noteText: order.noteText || '',
    comment: order.comment || '',
  }
}

async function saveOrder() {
  try {
    await apiAdminOrdersUpdateRoute.run(ctx, {
      id: editingOrder.value.id,
      ...editForm.value,
    })
    editingOrder.value = null
    emit('orderUpdated')
  } catch (e) {
    console.error('Failed to update order', e)
    alert('Ошибка при сохранении заказа')
  }
}

async function deleteOrder(orderId) {
  if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return
  
  try {
    await apiAdminOrdersDeleteRoute.run(ctx, { id: orderId })
    emit('orderDeleted')
  } catch (e) {
    console.error('Failed to delete order', e)
    alert('Ошибка при удалении заказа')
  }
}

async function updateStatus(orderId, newStatus) {
  try {
    await apiAdminOrdersUpdateStatusRoute.run(ctx, { id: orderId, status: newStatus })
    emit('statusUpdated')
  } catch (e) {
    console.error('Failed to update status', e)
  }
}
</script>

<style scoped>
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.orders-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-bar {
  position: relative;
  max-width: 400px;
}

.search-bar i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--admin-text-medium);
  font-size: 14px;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 0 16px 0 40px;
  border: 1.5px solid var(--admin-bg-medium);
  border-radius: 12px;
  font-size: 14px;
  background: var(--color-white);
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.search-input:focus {
  border-color: var(--admin-primary);
}

.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1.5px solid var(--admin-bg-medium);
  background: var(--color-white);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--admin-text-soft);
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.filter-btn:hover {
  border-color: var(--admin-primary);
  color: var(--admin-primary);
}

.filter-btn.active {
  background: var(--admin-primary);
  border-color: var(--admin-primary);
  color: var(--color-white);
}

.filter-count {
  background: var(--admin-bg-light);
  color: var(--admin-text-soft);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-white);
}

.columns-dropdown {
  position: relative;
}

.columns-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-white);
  border: 1.5px solid var(--admin-bg-medium);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  min-width: 200px;
  z-index: 100;
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
  font-size: 13px;
  font-weight: 500;
  color: var(--admin-text-dark);
}

.dropdown-item:hover {
  background: var(--admin-bg-light);
}

.dropdown-item input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.dropdown-item span {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px;
  color: var(--admin-text-medium);
}

.empty-state i {
  font-size: 48px;
  opacity: 0.5;
}

.table-container {
  overflow-x: auto;
  background: var(--color-white);
  border: 1.5px solid var(--admin-bg-medium);
  border-radius: 14px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.orders-table thead {
  background: var(--admin-bg-light);
}

.orders-table th {
  padding: 12px 10px;
  text-align: left;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--admin-text-medium);
  white-space: nowrap;
  border-bottom: 2px solid var(--admin-bg-medium);
}

.orders-table td {
  padding: 10px;
  border-bottom: 1px solid var(--admin-bg-light);
  vertical-align: top;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-row:hover {
  background: var(--admin-bg-light);
}

.order-number {
  font-weight: 700;
  color: var(--admin-primary);
  white-space: nowrap;
}

.order-date,
.delivery-date {
  white-space: nowrap;
  color: var(--admin-text-dark);
}

.delivery-time {
  white-space: nowrap;
}

.buyer-name,
.recipient-name {
  font-weight: 600;
}

.buyer-phone a,
.recipient-phone a {
  color: var(--admin-primary);
  text-decoration: none;
  white-space: nowrap;
}

.buyer-phone a:hover,
.recipient-phone a:hover {
  text-decoration: underline;
}

.address {
  max-width: 250px;
  font-size: 12px;
}

.note,
.comment {
  max-width: 180px;
  font-size: 12px;
  color: var(--admin-text-soft);
}

.status-select {
  padding: 4px 8px;
  border: 1.5px solid var(--admin-bg-medium);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  outline: none;
  white-space: nowrap;
}

.status-select.status-new {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border-color: rgba(59, 130, 246, 0.3);
}

.status-select.status-processing {
  background: rgba(251, 191, 36, 0.1);
  color: #d97706;
  border-color: rgba(251, 191, 36, 0.3);
}

.status-select.status-delivering {
  background: rgba(168, 85, 247, 0.1);
  color: #7c3aed;
  border-color: rgba(168, 85, 247, 0.3);
}

.status-select.status-completed {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border-color: rgba(34, 197, 94, 0.3);
}

.status-select.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.3);
}

.price {
  font-weight: 700;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 6px;
  white-space: nowrap;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}

.edit-btn {
  background: var(--admin-bg-light);
  color: var(--admin-primary);
  border: 1px solid var(--admin-accent);
}

.edit-btn:hover {
  background: var(--admin-primary);
  color: var(--color-white);
  border-color: var(--admin-primary);
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Модальное окно */
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
  padding: 20px;
}

.modal-content {
  background: var(--color-white);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--admin-bg-light);
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--admin-text-dark);
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--admin-bg-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--admin-text-soft);
}

.close-btn:hover {
  background: var(--admin-accent);
  color: var(--admin-primary);
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--admin-text-dark);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--admin-bg-medium);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--admin-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid var(--admin-bg-light);
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-cancel {
  background: var(--color-white);
  color: var(--admin-text-dark);
  border: 1.5px solid var(--admin-accent);
}

.btn-cancel:hover {
  background: var(--admin-bg-light);
  border-color: var(--admin-primary);
}

.btn-save {
  background: var(--admin-primary);
  color: var(--color-white);
}

.btn-save:hover {
  background: var(--admin-primary-dark);
}

/* Попап просмотра заказа */
.view-modal {
  max-width: 700px;
}

.order-info-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  background: var(--admin-bg-light);
  border-radius: 12px;
  padding: 16px;
}

.info-section h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--admin-text-dark);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(168, 139, 200, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--admin-text-medium);
  min-width: 140px;
}

.info-value {
  font-size: 13px;
  color: var(--admin-text-dark);
  flex: 1;
}

.info-value a {
  color: var(--admin-primary);
  text-decoration: none;
}

.info-value a:hover {
  text-decoration: underline;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.status-new {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.status-badge.status-processing {
  background: rgba(251, 191, 36, 0.1);
  color: #d97706;
}

.status-badge.status-delivering {
  background: rgba(168, 85, 247, 0.1);
  color: #7c3aed;
}

.status-badge.status-completed {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-badge.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.order-items {
  margin-top: 24px;
}

.order-items h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--admin-text-dark);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.item-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--admin-bg-light);
  border-radius: 10px;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-dark);
  margin-bottom: 4px;
}

.item-meta {
  font-size: 12px;
  color: var(--admin-text-medium);
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--admin-bg-light);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  color: var(--admin-text-dark);
}

.total-amount {
  font-size: 20px;
  color: var(--admin-primary);
}
</style>