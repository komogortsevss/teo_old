<template>
  <div class="loyalty-reports">
    <!-- Сводка -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(summary.totalBonusesInCirculation) }}</div>
          <div class="stat-label">Бонусов в обороте</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-value">{{ summary.activeCustomers }}</div>
          <div class="stat-label">Активных клиентов</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(summary.totalEarnedLifetime) }}</div>
          <div class="stat-label">Всего начислено</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📉</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatNumber(summary.totalSpentLifetime) }}</div>
          <div class="stat-label">Всего списано</div>
        </div>
      </div>
    </div>

    <!-- Период -->
    <div class="period-section">
      <h3 class="section-title">Статистика за период</h3>
      <div class="period-selector">
        <button
          v-for="period in periods"
          :key="period.days"
          class="period-btn"
          :class="{ active: selectedPeriod === period.days }"
          @click="selectPeriod(period.days)"
        >
          {{ period.label }}
        </button>
      </div>
      
      <div class="period-stats">
        <div class="period-stat earned">
          <div class="period-label">Начислено</div>
          <div class="period-value">+{{ formatNumber(periodStats.earned) }}</div>
        </div>
        <div class="period-stat spent">
          <div class="period-label">Списано</div>
          <div class="period-value">-{{ formatNumber(periodStats.spent) }}</div>
        </div>
        <div class="period-stat expired">
          <div class="period-label">Сгорело</div>
          <div class="period-value">{{ formatNumber(periodStats.expired) }}</div>
        </div>
      </div>
    </div>

    <!-- Настройки программы -->
    <div class="settings-section">
      <h3 class="section-title">Настройки программы</h3>
      <div class="settings-grid">
        <div class="setting-item">
          <div class="setting-label">Статус</div>
          <div class="setting-value">
            <span class="status-badge" :class="{ active: settings.isActive }">
              {{ settings.isActive ? 'Активна' : 'Неактивна' }}
            </span>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-label">Процент начисления</div>
          <div class="setting-value">{{ settings.earnPercent }}%</div>
        </div>
        <div class="setting-item">
          <div class="setting-label">Макс. % списания</div>
          <div class="setting-value">{{ settings.maxSpendPercent }}%</div>
        </div>
        <div class="setting-item">
          <div class="setting-label">Срок жизни бонусов</div>
          <div class="setting-value">{{ settings.bonusLifetimeDays || '∞' }} дней</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiAdminLoyaltyReportsSummaryRoute } from '../../api/admin/loyalty/reports/summary'

const periods = [
  { days: 7, label: '7 дней' },
  { days: 30, label: '30 дней' },
  { days: 90, label: '90 дней' },
  { days: 365, label: 'Год' },
]

const selectedPeriod = ref(30)
const loading = ref(false)

const settings = ref({
  isActive: false,
  earnPercent: 0,
  maxSpendPercent: 0,
  bonusLifetimeDays: 0
})

const summary = ref({
  totalBonusesInCirculation: 0,
  totalEarnedLifetime: 0,
  totalSpentLifetime: 0,
  activeCustomers: 0,
  totalCustomers: 0
})

const periodStats = ref({
  days: 30,
  earned: 0,
  spent: 0,
  expired: 0
})

function formatNumber(num) {
  if (num === undefined || num === null) return '0'
  return num.toLocaleString('ru-RU')
}

async function loadStats() {
  loading.value = true
  try {
    const data = await apiAdminLoyaltyReportsSummaryRoute.query({ days: selectedPeriod.value.toString() }).run(ctx)
    if (data) {
      settings.value = data.settings || settings.value
      summary.value = data.summary || summary.value
      periodStats.value = data.periodStats || periodStats.value
    }
  } catch (e) {
    console.error('Failed to load loyalty stats:', e)
  } finally {
    loading.value = false
  }
}

function selectPeriod(days) {
  selectedPeriod.value = days
  loadStats()
}

onMounted(loadStats)
</script>

<style scoped>
.loyalty-reports {
  padding: 8px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--color-white, #fff);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--admin-bg-medium);
  box-shadow: 0 2px 8px rgba(43, 34, 51, 0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--admin-bg-medium);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--admin-text-dark);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--admin-text-soft);
  margin-top: 4px;
}

.period-section,
.settings-section {
  background: var(--color-white, #fff);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--admin-bg-medium);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--admin-text-dark);
  margin: 0 0 20px 0;
}

.period-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.period-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid var(--admin-border);
  background: var(--color-white);
  color: var(--admin-text-medium);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.period-btn:hover {
  border-color: var(--admin-primary);
  color: var(--admin-primary);
}

.period-btn.active {
  background: var(--admin-primary);
  border-color: var(--admin-primary);
  color: var(--color-white);
}

.period-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.period-stat {
  padding: 16px;
  border-radius: 12px;
  text-align: center;
}

.period-stat.earned {
  background: rgba(22, 163, 74, 0.08);
}

.period-stat.spent {
  background: rgba(239, 68, 68, 0.08);
}

.period-stat.expired {
  background: rgba(156, 163, 175, 0.08);
}

.period-label {
  font-size: 12px;
  color: var(--admin-text-soft);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.period-value {
  font-size: 24px;
  font-weight: 700;
}

.period-stat.earned .period-value {
  color: #16a34a;
}

.period-stat.spent .period-value {
  color: #ef4444;
}

.period-stat.expired .period-value {
  color: #6b7280;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--admin-bg-medium);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 14px;
  color: var(--admin-text-medium);
}

.setting-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--admin-text-dark);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 20px;
  }
}
</style>