<template>
  <div class="promo-list">
    <!-- Шапка с поиском и кнопкой добавления -->
    <div class="promo-list__header">
      <div class="promo-list__search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по коду или названию..."
          class="promo-list__search-input"
        />
        <span class="promo-list__search-icon">🔍</span>
      </div>
      <button class="promo-list__add-btn" @click="$emit('create')">
        <span>+</span>
        Новый промокод
      </button>
    </div>

    <!-- Таблица промокодов -->
    <div class="promo-list__table-wrapper">
      <table class="promo-list__table">
        <thead>
          <tr>
            <th>Код</th>
            <th>Название</th>
            <th>Скидка</th>
            <th>Использований</th>
            <th>Срок действия</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="promo in filteredPromos"
            :key="promo.id"
            :class="{ 'promo-list__row--inactive': !promo.isActive }"
          >
            <td>
              <code class="promo-list__code">{{ promo.code }}</code>
            </td>
            <td>{{ promo.title }}</td>
            <td>
              <span class="promo-list__discount">
                <template v-if="promo.discountType === 'fixed'">
                  {{ formatPrice(promo.discountValue) }}
                </template>
                <template v-else>
                  {{ promo.discountValue }}%
                  <span
                    v-if="promo.maxDiscount"
                    class="promo-list__max-discount"
                  >
                    (макс. {{ formatPrice(promo.maxDiscount) }})
                  </span>
                </template>
              </span>
              <div
                v-if="promo.minOrderAmount"
                class="promo-list__min-order"
              >
                от {{ formatPrice(promo.minOrderAmount) }}
              </div>
            </td>
            <td>
              <span class="promo-list__usage">
                {{ promo.usageCount }}
                <span v-if="promo.usageLimit > 0">
                  / {{ promo.usageLimit }}
                </span>
              </span>
              <span
                v-if="promo.isSingleUse"
                class="promo-list__badge promo-list__badge--single"
              >
                1 раз
              </span>
            </td>
            <td>
              <template v-if="promo.startAt || promo.endAt">
                <div v-if="promo.startAt">
                  с {{ formatDate(promo.startAt) }}
                </div>
                <div v-if="promo.endAt">
                  до {{ formatDate(promo.endAt) }}
                </div>
              </template>
              <span v-else class="promo-list__no-limit">Бессрочно</span>
            </td>
            <td>
              <span
                :class="[
                  'promo-list__status',
                  promo.isActive
                    ? 'promo-list__status--active'
                    : 'promo-list__status--inactive',
                ]"
              >
                {{ promo.isActive ? 'Активен' : 'Неактивен' }}
              </span>
            </td>
            <td>
              <div class="promo-list__actions">
                <button
                  class="promo-list__action-btn promo-list__action-btn--edit"
                  @click="$emit('edit', promo)"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  class="promo-list__action-btn promo-list__action-btn--toggle"
                  :title="promo.isActive ? 'Деактивировать' : 'Активировать'"
                  @click="$emit('toggle', promo)"
                >
                  {{ promo.isActive ? '🚫' : '✅' }}
                </button>
                <button
                  class="promo-list__action-btn promo-list__action-btn--delete"
                  @click="$emit('delete', promo)"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Пустое состояние -->
    <div v-if="filteredPromos.length === 0" class="promo-list__empty">
      <template v-if="searchQuery">
        <p>По запросу «{{ searchQuery }}» ничего не найдено</p>
        <button
          class="promo-list__clear-search"
          @click="searchQuery = ''"
        >
          Очистить поиск
        </button>
      </template>
      <template v-else>
        <p>У вас пока нет промокодов</p>
        <p class="promo-list__empty-hint">
          Создайте первый промокод, чтобы начать
        </p>
      </template>
    </div>

    <!-- Статистика -->
    <div v-if="promos.length > 0" class="promo-list__stats">
      <span>Всего: {{ promos.length }}</span>
      <span>Активных: {{ activeCount }}</span>
      <span>Использований: {{ totalUsages }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface PromoCode {
  id: string;
  code: string;
  title: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
  usageCount: number;
  usageLimit: number;
  startAt?: string;
  endAt?: string;
  isSingleUse: boolean;
  createdAt: string;
  updatedAt: string;
}

const props = defineProps<{
  promos: PromoCode[];
}>();

defineEmits<{
  create: [];
  edit: [promo: PromoCode];
  delete: [promo: PromoCode];
  toggle: [promo: PromoCode];
}>();

const searchQuery = ref('');

const filteredPromos = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.promos;
  }
  const query = searchQuery.value.toLowerCase();
  return props.promos.filter(
    (p) =>
      p.code.toLowerCase().includes(query) ||
      p.title.toLowerCase().includes(query)
  );
});

const activeCount = computed(
  () => props.promos.filter((p) => p.isActive).length
);

const totalUsages = computed(() =>
  props.promos.reduce((sum, p) => sum + p.usageCount, 0)
);

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
</script>

<style scoped>
.promo-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.promo-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.promo-list__search {
  position: relative;
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.promo-list__search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.promo-list__search-input:focus {
  outline: none;
  border-color: #A88BC8;
}

.promo-list__search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.promo-list__add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #A88BC8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.promo-list__add-btn:hover {
  background: #8E6FB2;
}

.promo-list__table-wrapper {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.promo-list__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.promo-list__table th {
  background: #f9fafb;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.promo-list__table td {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
}

.promo-list__table tr:last-child td {
  border-bottom: none;
}

.promo-list__row--inactive {
  opacity: 0.6;
}

.promo-list__code {
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
}

.promo-list__discount {
  font-weight: 600;
  color: #16a34a;
}

.promo-list__max-discount {
  font-size: 12px;
  color: #6b7280;
  font-weight: normal;
}

.promo-list__min-order {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.promo-list__usage {
  font-weight: 500;
}

.promo-list__badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  margin-left: 8px;
}

.promo-list__badge--single {
  background: #fef3c7;
  color: #92400e;
}

.promo-list__no-limit {
  color: #9ca3af;
  font-size: 13px;
}

.promo-list__status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.promo-list__status--active {
  background: #dcfce7;
  color: #166534;
}

.promo-list__status--inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.promo-list__actions {
  display: flex;
  gap: 8px;
}

.promo-list__action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.promo-list__action-btn:hover {
  background: #e5e7eb;
}

.promo-list__action-btn--delete:hover {
  background: #fee2e2;
}

.promo-list__empty {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.promo-list__empty-hint {
  font-size: 14px;
  margin-top: 8px;
}

.promo-list__clear-search {
  margin-top: 12px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.promo-list__clear-search:hover {
  background: #e5e7eb;
}

.promo-list__stats {
  display: flex;
  gap: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .promo-list__table-wrapper {
    font-size: 13px;
  }

  .promo-list__table th,
  .promo-list__table td {
    padding: 12px 8px;
  }

  .promo-list__actions {
    flex-direction: column;
  }
}
</style>