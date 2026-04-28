<template>
  <div class="loyalty-settings">
    <h2 class="section-title">Настройки Теобонусов</h2>

    <div class="settings-form">
      <div class="form-group switch-group">
        <label class="switch">
          <input type="checkbox" v-model="settings.isActive" />
          <span class="slider"></span>
        </label>
        <span class="switch-label">
          Система лояльности {{ settings.isActive ? 'активна' : 'выключена' }}
        </span>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Процент начисления (%)</label>
          <input
            type="number"
            v-model.number="settings.earnPercent"
            min="0"
            max="100"
          />
          <small>Сколько % от суммы заказа начисляется бонусами</small>
        </div>

        <div class="form-group">
          <label>Макс. процент списания (%)</label>
          <input
            type="number"
            v-model.number="settings.maxSpendPercent"
            min="0"
            max="100"
          />
          <small>Сколько % от заказа можно оплатить бонусами</small>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Срок жизни бонусов (дней)</label>
          <input
            type="number"
            v-model.number="settings.bonusLifetimeDays"
            min="0"
          />
          <small>0 = бессрочные бонусы</small>
        </div>

        <div class="form-group">
          <label>Мин. сумма заказа для начисления (₽)</label>
          <input
            type="number"
            v-model.number="settings.minOrderAmountForEarn"
            min="0"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Приветственный бонус</label>
          <input
            type="number"
            v-model.number="settings.welcomeBonus"
            min="0"
          />
          <small>Бонусы новым клиентам за регистрацию</small>
        </div>

        <div class="form-group">
          <!-- Зарезервировано для будущих настроек -->
        </div>
      </div>

      <div class="form-actions">
        <button
          class="btn-save"
          @click="saveSettings"
          :disabled="saving"
        >
          {{ saving ? 'Сохранение...' : 'Сохранить настройки' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const settings = ref({
  isActive: false,
  earnPercent: 5,
  maxSpendPercent: 30,
  bonusLifetimeDays: 365,
  minOrderAmountForEarn: 1000,
  welcomeBonus: 0
})

const saving = ref(false)

const loadSettings = async () => {
  try {
    const res = await fetch('/v-2/teo/loyalty-service/api/loyalty/settings/get')
    const data = await res.json()
    if (!data.error) {
      settings.value = {
        ...settings.value,
        ...data,
        minOrderAmountForEarn: data.minOrderAmountForEarn?.amount || 1000
      }
    }
  } catch (e) {
    console.error('Failed to load settings', e)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    const res = await fetch('/v-2/teo/loyalty-service/api/loyalty/settings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings.value)
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
    }

    const data = await res.json()
    if (data.success) {
      alert('Настройки сохранены')
    } else {
      alert('Ошибка: ' + (data.error || data.message || 'Неизвестная ошибка'))
    }
  } catch (e) {
    alert('Ошибка сохранения: ' + (e.message || 'Проверьте соединение'))
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
</script>

<style scoped>
.loyalty-settings {
  max-width: 800px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #2B2233;
}

.settings-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #DCCDEA;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #5F5568;
  margin-bottom: 6px;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #DCCDEA;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #A88BC8;
}

.form-group small {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.switch-group {
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 28px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #A88BC8;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.switch-label {
  font-weight: 500;
  color: #2B2233;
}

.form-actions {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-save {
  background: #A88BC8;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #8E6FB2;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>