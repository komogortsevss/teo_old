<template>
  <div class="bonus-block" v-if="settings?.isActive && balance !== null">
    <!-- Информационная строка сверху -->
    <div class="bonus-info-row">
      <span class="bonus-info-text">
        Начислим за заказ +{{ calculatedEarn }} {{ pluralizeBonus(calculatedEarn) }}. 
        Сейчас у вас {{ balance }} {{ pluralizeBonus(balance) }}. 
        Можно списать <strong>{{ maxSpendable }}</strong>.
      </span>
    </div>

    <!-- Шкала и кнопка -->
    <div v-if="maxSpendable > 0 && appliedBonuses === 0" class="bonus-slider-row">
      <div class="slider-container">
        <input
          type="range"
          v-model.number="sliderValue"
          :min="0"
          :max="maxSpendable"
          :step="1"
          class="bonus-slider"
          @input="onSliderChange"
        />
      </div>
      <button
        class="bonus-apply-btn"
        @click="applyBonuses"
        :disabled="sliderValue <= 0"
      >
        <template v-if="sliderValue > 0">
          Списать {{ sliderValue }} {{ pluralizeBonus(sliderValue) }}
        </template>
        <template v-else>Списать</template>
      </button>
    </div>

    

    <!-- Применённые бонусы -->
    <div v-if="appliedBonuses > 0" class="bonus-applied">
      <div class="bonus-applied-info">
        <i class="fa-solid fa-gift"></i>
        <span class="bonus-applied-text">Списано {{ appliedBonuses }} {{ pluralizeBonus(appliedBonuses) }}</span>
        <span class="bonus-applied-discount">−{{ appliedBonuses.toLocaleString('ru-RU') }} ₽</span>
      </div>
      <button class="bonus-remove" @click="removeBonuses">
        <i class="fa-solid fa-rotate-left"></i>
        <span>Отменить</span>
      </button>
    </div>

    <!-- Недоступно бонусов -->
    <div v-if="maxSpendable <= 0 && balance > 0" class="bonus-unavailable">
      <i class="fa-solid fa-info-circle"></i>
      <span>Недостаточно суммы заказа для списания бонусов</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { apiLoyaltyCalculateByUserRoute } from '../../loyalty-service/api/loyalty/calculate/by-user'

const props = defineProps({
  userId: String,
  settings: Object,
  balance: Number,
  subtotal: Number,
  discountAmount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:bonusesToSpend', 'calculate'])

const sliderValue = ref(0)
const appliedBonuses = ref(0)
const calculatedEarn = ref(0)
const maxSpendable = ref(0)

const canSpend = computed(() => {
  if (!props.settings?.isActive) return false
  if (!props.balance || props.balance <= 0) return false
  const orderAmount = props.subtotal - props.discountAmount
  if (orderAmount <= 0) return false
  const maxByPercent = Math.floor(orderAmount * (props.settings?.maxSpendPercent || 30) / 100)
  return maxByPercent > 0
})

// Функция склонения слова "бонус"
const pluralizeBonus = (n) => {
  const absN = Math.abs(n)
  const lastDigit = absN % 10
  const lastTwoDigits = absN % 100
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'бонусов'
  if (lastDigit === 1) return 'бонус'
  if (lastDigit >= 2 && lastDigit <= 4) return 'бонуса'
  return 'бонусов'
}

const calculateBonuses = async () => {
  if (!props.settings?.isActive) return

  try {
    const data = await apiLoyaltyCalculateByUserRoute.run(ctx, {
      userId: props.userId,
      subtotal: props.subtotal,
      discountAmount: props.discountAmount,
      bonusToSpend: appliedBonuses.value
    })

    if (!data.error) {
      calculatedEarn.value = data.earnableBonuses || 0
      maxSpendable.value = data.maxSpendableBonuses || 0

      // Если применённые бонусы больше максимально доступных - сбрасываем
      if (appliedBonuses.value > maxSpendable.value) {
        appliedBonuses.value = 0
        sliderValue.value = 0
        emit('update:bonusesToSpend', 0)
      }

      // Ограничиваем слайдер максимальным значением
      if (sliderValue.value > maxSpendable.value) {
        sliderValue.value = maxSpendable.value
      }

      emit('calculate', data)
    }
  } catch (e) {
    console.error('Failed to calculate bonuses', e)
  }
}

const onSliderChange = () => {
  // Ограничиваем значение максимумом
  if (sliderValue.value > maxSpendable.value) {
    sliderValue.value = maxSpendable.value
  }
}

const applyBonuses = async () => {
  if (sliderValue.value <= 0) return
  if (sliderValue.value > maxSpendable.value) return
  if (sliderValue.value > props.balance) return

  appliedBonuses.value = sliderValue.value
  emit('update:bonusesToSpend', sliderValue.value)
  
  // Пересчитываем бонусы чтобы получить bonusDiscount для отображения в калуляции
  await calculateBonuses()
}

const removeBonuses = () => {
  appliedBonuses.value = 0
  sliderValue.value = 0
  emit('update:bonusesToSpend', 0)
  calculateBonuses()
}

watch(() => [props.subtotal, props.discountAmount], () => {
  calculateBonuses()
}, { immediate: true })

watch(() => props.balance, () => {
  calculateBonuses()
})
</script>

<style scoped>
.bonus-block {
  margin-bottom: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

/* Информационная строка - размер как у "Букет для другого человека" (14px) */
.bonus-info-row {
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.bonus-info-text {
  font-weight: 400;
}

.bonus-info-text strong {
  font-weight: 600;
  color: #000;
}

/* Шкала и кнопка */
.bonus-slider-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

.slider-container {
  flex: 1;
  display: flex;
  align-items: center;
}

/* Стилизация range input */
.bonus-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  margin: 0;
  padding: 0;
}

/* Центрирование бегунка по вертикали */
.bonus-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #000;
  cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  transition: transform 0.1s, box-shadow 0.2s;
  margin-top: 0;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}

.bonus-slider::-webkit-slider-thumb:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
}

.bonus-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #000;
  cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  margin-top: 0;
}

.bonus-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #000 0%, #000 var(--value, 0%), #e0e0e0 var(--value, 0%), #e0e0e0 100%);
}

.bonus-slider::-moz-range-track {
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
}

.bonus-slider::-moz-range-progress {
  height: 6px;
  border-radius: 3px;
  background: #000;
}

/* Кнопка применения */
.bonus-apply-btn {
  height: 40px;
  padding: 0 20px;
  border: none;
  border-radius: 10px;
  background: #000;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  white-space: nowrap;
  flex-shrink: 0;
}

.bonus-apply-btn:hover:not(:disabled) {
  background: #333;
}

.bonus-apply-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.bonus-apply-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Применённые бонусы */
.bonus-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
}

.bonus-applied-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.bonus-applied-info i {
  color: #16a34a;
  font-size: 18px;
}

.bonus-applied-text {
  font-size: 14px;
  color: #333;
}

.bonus-applied-text strong {
  color: #000;
  font-weight: 600;
}

.bonus-applied-discount {
  font-size: 15px;
  font-weight: 600;
  color: #16a34a;
  margin-left: 8px;
}

.bonus-remove {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #666;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  white-space: nowrap;
}

.bonus-remove:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #000;
}

.bonus-remove i {
  font-size: 14px;
}

/* Недоступно бонусов */
.bonus-unavailable {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
}

.bonus-unavailable i {
  color: #999;
  font-size: 16px;
}

/* Мобильная версия */
@media (max-width: 480px) {
  .bonus-block {
    padding: 14px;
  }

  .bonus-info-row {
    font-size: 14px;
  }

  .bonus-slider-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .bonus-apply-btn {
    width: 100%;
    height: 44px;
  }

  .bonus-applied {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .bonus-remove {
    align-self: stretch;
    justify-content: center;
    padding: 10px;
    background: rgba(0, 0, 0, 0.03);
  }
}
</style>