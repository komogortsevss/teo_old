<template>
  <div class="promo-form-overlay" @click.self="$emit('close')">
    <div class="promo-form">
      <div class="promo-form__header">
        <h2>{{ isEditing ? 'Редактирование промокода' : 'Новый промокод' }}</h2>
        <button class="promo-form__close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <form class="promo-form__body" @submit.prevent="handleSubmit">
        <div class="promo-form__field">
          <label class="promo-form__label">
            Код промокода <span class="promo-form__required">*</span>
          </label>
          <input
            v-model="form.code"
            type="text"
            placeholder="Например: SUMMER2024"
            class="promo-form__input"
            :class="{ 'promo-form__input--error': errors.code }"
            @blur="normalizeCode"
          />
          <span v-if="errors.code" class="promo-form__error">{{ errors.code }}</span>
          <span class="promo-form__hint">
            Будет преобразован в верхний регистр
          </span>
        </div>

        <div class="promo-form__field">
          <label class="promo-form__label">
            Название <span class="promo-form__required">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Например: Летняя скидка 20%"
            class="promo-form__input"
            :class="{ 'promo-form__input--error': errors.title }"
          />
          <span v-if="errors.title" class="promo-form__error">{{ errors.title }}</span>
        </div>

        <div class="promo-form__field">
          <label class="promo-form__label">
            Тип скидки <span class="promo-form__required">*</span>
          </label>
          <div class="promo-form__radio-group">
            <label class="promo-form__radio">
              <input
                v-model="form.discountType"
                type="radio"
                value="fixed"
              />
              <span>Фиксированная сумма (₽)</span>
            </label>
            <label class="promo-form__radio">
              <input
                v-model="form.discountType"
                type="radio"
                value="percent"
              />
              <span>Процент (%)</span>
            </label>
          </div>
        </div>

        <div class="promo-form__row">
          <div class="promo-form__field">
            <label class="promo-form__label">
              Размер скидки <span class="promo-form__required">*</span>
            </label>
            <input
              v-model.number="form.discountValue"
              type="number"
              min="0"
              :placeholder="form.discountType === 'fixed' ? '500' : '20'"
              class="promo-form__input"
              :class="{ 'promo-form__input--error': errors.discountValue }"
            />
            <span v-if="errors.discountValue" class="promo-form__error">
              {{ errors.discountValue }}
            </span>
          </div>

          <div v-if="form.discountType === 'percent'" class="promo-form__field">
            <label class="promo-form__label">Максимальная скидка (₽)</label>
            <input
              v-model.number="form.maxDiscount"
              type="number"
              min="0"
              placeholder="Не ограничено"
              class="promo-form__input"
            />
            <span class="promo-form__hint">Оставьте пустым, чтобы не ограничивать</span>
          </div>
        </div>

        <div class="promo-form__field">
          <label class="promo-form__label">Минимальная сумма заказа (₽)</label>
          <input
            v-model.number="form.minOrderAmount"
            type="number"
            min="0"
            placeholder="0"
            class="promo-form__input"
          />
          <span class="promo-form__hint">Минимальная сумма корзины для применения промокода</span>
        </div>

        <div class="promo-form__field">
          <label class="promo-form__label">Лимит использований</label>
          <input
            v-model.number="form.usageLimit"
            type="number"
            min="0"
            placeholder="Не ограничено"
            class="promo-form__input"
          />
          <span class="promo-form__hint">0 или пусто — без ограничений</span>
        </div>

        <div class="promo-form__row">
          <div class="promo-form__field">
            <label class="promo-form__label">Дата начала</label>
            <input
              v-model="form.startAt"
              type="datetime-local"
              class="promo-form__input"
            />
          </div>
          <div class="promo-form__field">
            <label class="promo-form__label">Дата окончания</label>
            <input
              v-model="form.endAt"
              type="datetime-local"
              class="promo-form__input"
            />
          </div>
        </div>

        <div class="promo-form__field promo-form__field--checkboxes">
          <label class="promo-form__checkbox">
            <input v-model="form.isSingleUse" type="checkbox" />
            <span>Одноразовый (один клиент может использовать только один раз)</span>
          </label>
          <label class="promo-form__checkbox">
            <input v-model="form.isActive" type="checkbox" />
            <span>Активен (доступен для использования)</span>
          </label>
        </div>

        <div v-if="formError" class="promo-form__form-error">
          {{ formError }}
        </div>

        <div class="promo-form__actions">
          <button
            type="button"
            class="promo-form__btn promo-form__btn--secondary"
            @click="$emit('close')"
          >
            Отмена
          </button>
          <button
            type="submit"
            class="promo-form__btn promo-form__btn--primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Создать') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';

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

interface FormData {
  code: string;
  title: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  startAt: string;
  endAt: string;
  isSingleUse: boolean;
  isActive: boolean;
}

const props = defineProps<{
  promo?: PromoCode | null;
}>();

const emit = defineEmits<{
  close: [];
  submit: [data: any];
}>();

const isEditing = computed(() => !!props.promo);
const isSubmitting = ref(false);
const formError = ref('');
const errors = reactive<Record<string, string>>({});

const form = reactive<FormData>({
  code: '',
  title: '',
  discountType: 'percent',
  discountValue: 0,
  minOrderAmount: null,
  maxDiscount: null,
  usageLimit: null,
  startAt: '',
  endAt: '',
  isSingleUse: false,
  isActive: true,
});

watch(
  () => props.promo,
  (promo) => {
    if (promo) {
      form.code = promo.code;
      form.title = promo.title;
      form.discountType = promo.discountType;
      form.discountValue = promo.discountValue;
      form.minOrderAmount = promo.minOrderAmount || null;
      form.maxDiscount = promo.maxDiscount || null;
      form.usageLimit = promo.usageLimit || null;
      form.startAt = promo.startAt
        ? new Date(promo.startAt).toISOString().slice(0, 16)
        : '';
      form.endAt = promo.endAt
        ? new Date(promo.endAt).toISOString().slice(0, 16)
        : '';
      form.isSingleUse = promo.isSingleUse;
      form.isActive = promo.isActive;
    } else {
      form.code = '';
      form.title = '';
      form.discountType = 'percent';
      form.discountValue = 0;
      form.minOrderAmount = null;
      form.maxDiscount = null;
      form.usageLimit = null;
      form.startAt = '';
      form.endAt = '';
      form.isSingleUse = false;
      form.isActive = true;
    }
    Object.keys(errors).forEach((key) => delete errors[key]);
    formError.value = '';
  },
  { immediate: true }
);

function normalizeCode() {
  form.code = form.code.trim().toUpperCase();
}

function validate(): boolean {
  Object.keys(errors).forEach((key) => delete errors[key]);
  formError.value = '';

  let isValid = true;

  if (!form.code.trim()) {
    errors.code = 'Код промокода обязателен';
    isValid = false;
  }

  if (!form.title.trim()) {
    errors.title = 'Название обязательно';
    isValid = false;
  }

  if (form.discountValue < 0) {
    errors.discountValue = 'Скидка не может быть отрицательной';
    isValid = false;
  }

  if (form.discountValue === 0) {
    errors.discountValue = 'Укажите размер скидки';
    isValid = false;
  }

  if (form.discountType === 'percent' && form.discountValue > 100) {
    errors.discountValue = 'Процент не может быть больше 100';
    isValid = false;
  }

  if (form.startAt && form.endAt) {
    const start = new Date(form.startAt);
    const end = new Date(form.endAt);
    if (start >= end) {
      formError.value = 'Дата окончания должна быть позже даты начала';
      isValid = false;
    }
  }

  return isValid;
}

function handleSubmit() {
  if (!validate()) return;

  const data: any = {
    code: form.code.trim().toUpperCase(),
    title: form.title.trim(),
    discountType: form.discountType,
    discountValue: form.discountValue,
    isActive: form.isActive,
    isSingleUse: form.isSingleUse,
  };

  if (form.minOrderAmount !== null && form.minOrderAmount > 0) {
    data.minOrderAmount = form.minOrderAmount;
  }

  if (form.maxDiscount !== null && form.maxDiscount > 0) {
    data.maxDiscount = form.maxDiscount;
  }

  if (form.usageLimit !== null && form.usageLimit > 0) {
    data.usageLimit = form.usageLimit;
  }

  if (form.startAt) {
    data.startAt = form.startAt;
  }

  if (form.endAt) {
    data.endAt = form.endAt;
  }

  if (props.promo) {
    data.id = props.promo.id;
  }

  emit('submit', data);
}
</script>

<style scoped>
.promo-form-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.promo-form {
  background: var(--color-white);
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.promo-form__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--admin-border);
}

.promo-form__header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--admin-text-dark);
}

.promo-form__close {
  width: 36px;
  height: 36px;
  border: none;
  background: var(--admin-bg-medium);
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  color: var(--admin-text-medium);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.promo-form__close:hover {
  background: var(--admin-border);
  color: var(--admin-text-dark);
}

.promo-form__body {
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.promo-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.promo-form__field--checkboxes {
  gap: 12px;
}

.promo-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.promo-form__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--admin-text-dark);
}

.promo-form__required {
  color: var(--admin-danger);
}

.promo-form__input {
  padding: 10px 14px;
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.promo-form__input:focus {
  outline: none;
  border-color: var(--admin-primary);
}

.promo-form__input--error {
  border-color: var(--admin-danger);
}

.promo-form__error {
  font-size: 12px;
  color: var(--admin-danger);
}

.promo-form__hint {
  font-size: 12px;
  color: var(--admin-text-light);
}

.promo-form__radio-group {
  display: flex;
  gap: 20px;
}

.promo-form__radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--admin-text-dark);
}

.promo-form__radio input {
  width: 18px;
  height: 18px;
  accent-color: var(--admin-primary);
}

.promo-form__checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--admin-text-dark);
}

.promo-form__checkbox input {
  width: 18px;
  height: 18px;
  accent-color: var(--admin-primary);
  margin-top: 2px;
}

.promo-form__form-error {
  padding: 12px 16px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 10px;
  font-size: 14px;
}

.promo-form__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid var(--admin-border);
}

.promo-form__btn {
  padding: 10px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.promo-form__btn--secondary {
  background: var(--admin-bg-medium);
  color: var(--admin-text-dark);
}

.promo-form__btn--secondary:hover {
  background: var(--admin-border);
}

.promo-form__btn--primary {
  background: var(--admin-primary);
  color: var(--color-white);
}

.promo-form__btn--primary:hover:not(:disabled) {
  background: var(--admin-primary-dark);
}

.promo-form__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .promo-form-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .promo-form {
    max-height: 85vh;
    border-radius: 16px 16px 0 0;
  }

  .promo-form__row {
    grid-template-columns: 1fr;
  }

  .promo-form__radio-group {
    flex-direction: column;
    gap: 12px;
  }
}
</style>