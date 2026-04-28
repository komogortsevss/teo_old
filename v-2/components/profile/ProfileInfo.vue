<template>
  <div class="pi-card">
    <div class="pi-header">
      <i class="fa-solid fa-user pi-icon"></i>
      <h2 class="pi-title">Личные данные</h2>
    </div>

    <div class="pi-contact" v-if="phone">
      <span class="pi-contact-label">Телефон</span>
      <span class="pi-contact-value">{{ phone }}</span>
    </div>

    <div class="pi-contact" v-if="email">
      <span class="pi-contact-label">Email</span>
      <span class="pi-contact-value">{{ email }}</span>
    </div>

    <div class="pi-fields">
      <div class="pi-field">
        <label class="pi-label">Имя</label>
        <input v-model="localFirstName" class="pi-input" placeholder="Ваше имя" type="text" />
      </div>
      <div class="pi-field">
        <label class="pi-label">Фамилия</label>
        <input v-model="localLastName" class="pi-input" placeholder="Ваша фамилия" type="text" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
})

const localFirstName = ref(props.firstName)
const localLastName = ref(props.lastName)

watch(() => props.firstName, v => { localFirstName.value = v })
watch(() => props.lastName, v => { localLastName.value = v })

const hasChanges = computed(() =>
  localFirstName.value !== props.firstName || localLastName.value !== props.lastName
)

function getData() {
  return {
    firstName: localFirstName.value,
    lastName: localLastName.value,
    hasChanges: hasChanges.value
  }
}

function reset(newFirstName, newLastName) {
  localFirstName.value = newFirstName
  localLastName.value = newLastName
}

defineExpose({ getData, reset, hasChanges })
</script>

<style scoped>
.pi-card {
  background: var(--color-white);
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
}

.pi-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.pi-icon {
  font-size: 18px;
  color: #000;
}

.pi-title {
  font-size: 17px;
  font-weight: 700;
  color: #000;
  margin: 0;
}

.pi-contact {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  padding: 12px 14px;
  background: var(--color-light-bg);
  border-radius: 10px;
}

.pi-contact-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-medium-gray);
}

.pi-contact-value {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  word-break: break-all;
}

.pi-fields {
  display: flex;
  gap: 12px;
}

.pi-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pi-label {
  font-size: 12px;
  font-weight: 600;
  color: #000;
}

.pi-input {
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
}

.pi-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-hover-bg);
  background: var(--color-white);
}

@media (max-width: 480px) {
  .pi-fields { flex-direction: column; }
}
</style>