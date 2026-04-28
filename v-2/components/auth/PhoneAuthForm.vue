<template>
  <div class="phone-auth-form">
    <!-- Step 1: Enter phone -->
    <div v-if="step === 'phone'" class="form-step">
      <div class="input-group">
        <label class="input-label">Номер телефона</label>
        <input
          ref="phoneInput"
          v-model="phone"
          type="tel"
          class="auth-input"
          placeholder="+7 (___) ___-__-__"
          maxlength="18"
          @input="onPhoneInput"
          @keydown.enter="sendCode"
        />
      </div>

      <div v-if="error" class="error-message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>

      <button
        class="auth-btn"
        :disabled="!isPhoneValid || isLoading"
        @click="sendCode"
      >
        <span v-if="isLoading" class="spinner"></span>
        <span v-else>Позвоните мне</span>
      </button>

      </div>

    <!-- Step 2: Waiting for call -->
    <div v-else class="form-step">
      <div class="code-header">
        <button class="back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
        </button>
        <span class="code-phone">{{ phone }}</span>
      </div>

      <div class="call-instruction">
        <div class="phone-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
        <p class="call-hint">Позвоните на номер:</p>
        <a :href="'tel:+' + callNumber.replace(/\D/g, '')" class="call-number">{{ formatCallNumber(callNumber) }}</a>
        <p class="call-note">После звонка вы будете автоматически авторизованы</p>
      </div>

      <div v-if="error" class="error-message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </div>

      <div class="waiting-status">
        <div v-if="isChecking" class="checking-spinner">
          <span class="spinner"></span>
          <span>Ожидаем звонок...</span>
        </div>
        <div v-else class="timer-wrapper">
          <span class="timer">{{ timer }} сек</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'

const props = defineProps<{
  backUrl: string
}>()

const step = ref<'phone' | 'code'>('phone')
const phone = ref('')
const callNumber = ref('')
const sessionId = ref('')
const isLoading = ref(false)
const isChecking = ref(false)
const error = ref('')
const timer = ref(120)
const phoneInput = ref<HTMLInputElement>()

let timerInterval: ReturnType<typeof setInterval> | null = null
let checkInterval: ReturnType<typeof setInterval> | null = null

const isPhoneValid = computed(() => {
  const digits = phone.value.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('7')
})

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  if (digits.length === 1) return '+7'

  let result = '+7'
  if (digits.length > 1) result += ' (' + digits.slice(1, 4)
  if (digits.length >= 4) result += ')'
  if (digits.length > 4) result += ' ' + digits.slice(4, 7)
  if (digits.length >= 7) result += '-'
  if (digits.length > 7) result += digits.slice(7, 9)
  if (digits.length >= 9) result += '-'
  if (digits.length > 9) result += digits.slice(9, 11)

  return result
}

function onPhoneInput(e: Event) {
  const target = e.target as HTMLInputElement
  const cursorPosition = target.selectionStart || 0
  const previousLength = phone.value.length

  phone.value = formatPhone(target.value)

  // Restore cursor position
  nextTick(() => {
    let newPosition = cursorPosition
    if (phone.value.length > previousLength) {
      newPosition = cursorPosition + (phone.value.length - previousLength)
    }
    target.setSelectionRange(newPosition, newPosition)
  })
}

async function sendCode() {
  if (!isPhoneValid.value || isLoading.value) return

  isLoading.value = true
  error.value = ''

  try {
    const digits = phone.value.replace(/\D/g, '')
    const normalizedPhone = digits.startsWith('7') ? '+7' + digits.slice(1) : '+' + digits

    const response = await fetch('/v-2/api/auth/callgate/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: normalizedPhone })
    })

    const data = await response.json()
    console.log('Call Gate init response:', data)

    if (data.success) {
      sessionId.value = data.sessionId
      callNumber.value = data.callNumber
      step.value = 'code'
      startTimer()
      startChecking()
    } else {
      error.value = data.error || 'Не удалось получить номер для звонка'
    }
  } catch (err) {
    error.value = 'Ошибка соединения. Попробуйте позже.'
  } finally {
    isLoading.value = false
  }
}

function formatCallNumber(num: string): string {
  if (!num) return ''
  let digits = num.replace(/\D/g, '')
  if (digits.length === 10 && !digits.startsWith('7')) {
    digits = '7' + digits
  }
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
  }
  return num.startsWith('+') ? num : '+' + num
}

function startTimer() {
  timer.value = 120
  timerInterval = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      if (timerInterval) clearInterval(timerInterval)
      if (checkInterval) clearInterval(checkInterval)
      error.value = 'Время ожидания истекло. Попробуйте ещё раз.'
      isChecking.value = false
    }
  }, 1000)
}

function startChecking() {
  isChecking.value = true
  // Проверяем статус каждые 3 секунды
  checkInterval = setInterval(() => {
    checkCallStatus()
  }, 3000)
}

async function checkCallStatus() {
  if (!sessionId.value) return

  try {
    const digits = phone.value.replace(/\D/g, '')
    const normalizedPhone = digits.startsWith('7') ? '+7' + digits.slice(1) : '+' + digits
    const response = await fetch('/v-2/api/auth/callgate/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: normalizedPhone,
        sessionId: sessionId.value
      })
    })

    const data = await response.json()
    console.log('Call Gate check response:', data)

    if (data.success && data.token) {
      if (timerInterval) clearInterval(timerInterval)
      if (checkInterval) clearInterval(checkInterval)
      isChecking.value = false
      window.location.href = `/s/auth/token-login?token=${data.token}&back=${encodeURIComponent(props.backUrl)}`
      return
    }

    if (data.pending) {
      return
    }

    // Если не pending и не success — реальная ошибка, показываем
    if (data.error && !data.pending) {
      error.value = data.error
      if (timerInterval) clearInterval(timerInterval)
      if (checkInterval) clearInterval(checkInterval)
      isChecking.value = false
    }
  } catch (err) {
    console.error('Check status error:', err)
  }
}

function goBack() {
  step.value = 'phone'
  error.value = ''
  isChecking.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
  nextTick(() => {
    phoneInput.value?.focus()
  })
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (checkInterval) clearInterval(checkInterval)
})
</script>

<style scoped>
.form-step {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 8px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 16px;
}

.code-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.back-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #333333;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

.code-phone {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
}

.call-instruction {
  text-align: center;
  padding: 24px 0;
}

.phone-icon {
  margin: 0 auto 20px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  border-radius: 50%;
  color: #ffffff;
}

.call-hint {
  font-size: 14px;
  color: #666666;
  margin: 0 0 12px;
}

.call-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 16px;
  text-decoration: none;
  letter-spacing: 1px;
}

.call-number:hover {
  color: #333333;
}

.call-note {
  font-size: 13px;
  color: #999999;
  margin: 0;
  line-height: 1.5;
}

.waiting-status {
  text-align: center;
  margin-top: 24px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
}

.checking-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  color: #666666;
}

.timer-wrapper {
  font-size: 14px;
  color: #999999;
}

.text-btn {
  background: none;
  border: none;
  color: #000000;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.text-btn:hover {
  color: #333333;
}

.timer {
  font-size: 14px;
  color: #999999;
}

@media (max-width: 480px) {
  .code-input {
    width: 44px;
    height: 52px;
    font-size: 22px;
  }

  .code-inputs {
    gap: 6px;
  }
}
</style>