<template>
  <div class="af-card">
    <div class="af-header">
      <div class="af-header-left">
        <i :class="['fa-solid', type === 'work' ? 'fa-briefcase' : 'fa-house', 'af-icon']"></i>
        <div>
          <h2 class="af-title">{{ type === 'work' ? 'Работа' : 'Дом' }}</h2>
          <p class="af-hint">Будет подставляться автоматически при оформлении заказа</p>
        </div>
      </div>
      <button 
        v-if="hasAnyValue" 
        class="af-clear-btn" 
        @click="clearAddress"
        type="button"
      >
        <i class="fa-solid fa-trash-can"></i>
        Очистить
      </button>
    </div>

    <div class="af-fields">
      <div class="af-field af-full">
        <label class="af-label">Улица</label>
        <input v-model="local.street" class="af-input" placeholder="Название улицы" type="text" />
      </div>
      <div class="af-row">
        <div class="af-field af-flex-big">
          <label class="af-label">Дом</label>
          <input v-model="local.house" class="af-input" placeholder="Дом" type="text" />
        </div>
        <div class="af-field af-flex">
          <label class="af-label">{{ type === 'work' ? 'Офис' : 'Кв.' }}</label>
          <input v-model="local.apartment" class="af-input" :placeholder="type === 'work' ? 'Офис' : 'Кв.'" type="text" />
        </div>
        <div class="af-field af-flex">
          <label class="af-label">Подъезд</label>
          <input v-model="local.entrance" class="af-input" placeholder="—" type="text" />
        </div>
        <div class="af-field af-flex">
          <label class="af-label">Этаж</label>
          <input v-model="local.floor" class="af-input" placeholder="—" type="text" />
        </div>
        <div class="af-field af-flex">
          <label class="af-label">Домофон</label>
          <input v-model="local.intercom" class="af-input" placeholder="—" type="text" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const props = defineProps({
  address: { type: Object, default: () => ({}) },
  type: { type: String, default: 'home' }, // 'home' или 'work'
})

const local = reactive({
  street: props.address.street || '',
  house: props.address.house || '',
  apartment: props.address.apartment || '',
  entrance: props.address.entrance || '',
  floor: props.address.floor || '',
  intercom: props.address.intercom || '',
})

watch(() => props.address, (val) => {
  if (val) {
    local.street = val.street || ''
    local.house = val.house || ''
    local.apartment = val.apartment || ''
    local.entrance = val.entrance || ''
    local.floor = val.floor || ''
    local.intercom = val.intercom || ''
  }
}, { deep: true })

const hasAnyValue = computed(() =>
  local.street !== '' ||
  local.house !== '' ||
  local.apartment !== '' ||
  local.entrance !== '' ||
  local.floor !== '' ||
  local.intercom !== ''
)

const hasChanges = computed(() =>
  local.street !== (props.address.street || '') ||
  local.house !== (props.address.house || '') ||
  local.apartment !== (props.address.apartment || '') ||
  local.entrance !== (props.address.entrance || '') ||
  local.floor !== (props.address.floor || '') ||
  local.intercom !== (props.address.intercom || '')
)

function clearAddress() {
  local.street = ''
  local.house = ''
  local.apartment = ''
  local.entrance = ''
  local.floor = ''
  local.intercom = ''
}

function getData() {
  return {
    street: local.street,
    house: local.house,
    apartment: local.apartment,
    entrance: local.entrance,
    floor: local.floor,
    intercom: local.intercom,
    hasChanges: hasChanges.value
  }
}

function reset(newAddress) {
  local.street = newAddress.street || ''
  local.house = newAddress.house || ''
  local.apartment = newAddress.apartment || ''
  local.entrance = newAddress.entrance || ''
  local.floor = newAddress.floor || ''
  local.intercom = newAddress.intercom || ''
}

defineExpose({ getData, reset, hasChanges, clearAddress })
</script>

<style scoped>
.af-card {
  background: var(--color-white);
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
}

.af-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.af-header-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}

.af-icon {
  font-size: 18px;
  color: #000;
  margin-top: 2px;
}

.af-title {
  font-size: 17px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.af-hint {
  font-size: 12px;
  color: var(--color-text-medium-gray);
  margin: 2px 0 0;
}

.af-clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid var(--color-error);
  background: transparent;
  color: var(--color-error);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
  flex-shrink: 0;
}

.af-clear-btn:hover {
  background: var(--color-error);
  color: var(--color-white);
}

.af-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.af-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.af-full { width: 100%; }

.af-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.af-flex-big { flex: 1.4; min-width: 80px; display: flex; flex-direction: column; gap: 5px; }
.af-flex { flex: 1; min-width: 60px; display: flex; flex-direction: column; gap: 5px; }

.af-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-medium-gray);
}

.af-input {
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1.5px solid var(--color-border);
  font-size: 14px;
  color: #000;
  background: var(--color-light-bg);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
  width: 100%;
}

.af-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-hover-bg);
  background: var(--color-white);
}

@media (max-width: 480px) {
  .af-row { gap: 6px; }
  .af-flex, .af-flex-big { min-width: 60px; }
  
  .af-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .af-clear-btn {
    align-self: flex-start;
  }
}
</style>