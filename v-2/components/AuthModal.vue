<template>
  <Teleport to="body">
    <Transition name="auth-overlay">
      <div v-if="isOpen" class="auth-overlay" @click.self="close"></div>
    </Transition>

    <Transition name="auth-modal">
      <div v-if="isOpen" class="auth-modal" role="dialog" aria-modal="true">

        <!-- Step 1: Choose messenger -->
        <div v-if="step === 'choose'" class="auth-content">
          <button class="auth-close" @click="close" aria-label="Закрыть">
            <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
          </button>

          <div class="auth-icon-wrap">
            <svg class="auth-flower-icon" width="48" height="48" viewBox="0 0 512 512" fill="currentColor"><path d="M256 0c-25.3 0-47.2 14.7-57.6 36c-7-2.6-14.5-4-22.4-4c-35.3 0-64 28.7-64 64c0 7.9 1.4 15.4 4 22.4C94.7 128.8 80 150.7 80 176s14.7 47.2 36 57.6c-2.6 7-4 14.5-4 22.4c0 35.3 28.7 64 64 64c7.9 0 15.4-1.4 22.4-4c10.4 21.3 32.3 36 57.6 36s47.2-14.7 57.6-36c7 2.6 14.5 4 22.4 4c35.3 0 64-28.7 64-64c0-7.9-1.4-15.4-4-22.4c21.3-10.4 36-32.3 36-57.6s-14.7-47.2-36-57.6c2.6-7 4-14.5 4-22.4c0-35.3-28.7-64-64-64c-7.9 0-15.4 1.4-22.4 4C303.2 14.7 281.3 0 256 0zM224 176a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM228.3 372.1c-2.8-.5-5.6-1.1-8.3-1.8V480c0 17.7 14.3 32 32 32h8c17.7 0 32-14.3 32-32V370.3c-2.7 .7-5.5 1.3-8.3 1.8c-7.5 1.3-15.2 1.9-23.1 1.9h-9.2c-7.9 0-15.6-.7-23.1-1.9z"/></svg>
          </div>

          <h2 class="auth-title">Войти в ТЕО</h2>
          <p class="auth-subtitle">Выберите мессенджер для получения кода</p>

          <div class="messenger-buttons">
            <button class="messenger-btn telegram-btn" @click="initAuth('telegram')" :disabled="loading">
              <span class="messenger-icon">
                <svg width="22" height="22" viewBox="0 0 496 512" fill="currentColor"><path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"/></svg>
              </span>
              <span class="messenger-label">Telegram</span>
              <span class="messenger-arrow">→</span>
            </button>

            <button class="messenger-btn max-btn" @click="initAuth('max')" :disabled="loading">
              <span class="messenger-icon">
                <svg width="22" height="22" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>
              </span>
              <span class="messenger-label">Max Messenger</span>
              <span class="messenger-arrow">→</span>
            </button>
          </div>

          <p class="auth-hint">Бот отправит вам код для входа</p>
        </div>

        <!-- Step 2: Waiting for code / Enter code -->
        <div v-if="step === 'code'" class="auth-content">
          <button class="auth-close" @click="close" aria-label="Закрыть">
            <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
          </button>

          <button class="auth-back" @click="goBack" aria-label="Назад">
            <svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>
          </button>

          <div class="auth-icon-wrap">
            <span class="step-icon" :class="chosenMessenger">
              <svg v-if="chosenMessenger === 'telegram'" width="32" height="32" viewBox="0 0 496 512" fill="currentColor"><path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"/></svg>
              <svg v-else width="32" height="32" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>
            </span>
          </div>

          <h2 class="auth-title">Введите код</h2>
          <p class="auth-subtitle">
            <template v-if="!botOpened">
              {{ instructions || 'Откройте бота и нажмите START' }}
            </template>
            <template v-else>
              Код отправлен в {{ chosenMessenger === 'telegram' ? 'Telegram' : 'Max' }}
            </template>
          </p>

          <!-- Deep link button -->
          <a
            v-if="!botOpened"
            :href="deepLink"
            target="_blank"
            class="open-bot-btn"
            @click="onBotOpened"
          >
            Открыть {{ chosenMessenger === 'telegram' ? 'Telegram' : 'Max' }}
          </a>

          <!-- Code input -->
          <div v-if="botOpened" class="code-input-wrap">
            <div class="code-inputs">
              <input
                v-for="(d, i) in 4"
                :key="i"
                :ref="el => codeRefs[i] = el"
                type="text"
                inputmode="numeric"
                maxlength="1"
                class="code-digit"
                :class="{ filled: codeDigits[i], error: codeError }"
                :value="codeDigits[i]"
                @input="onDigitInput(i, $event)"
                @keydown="onDigitKeydown(i, $event)"
                @paste="onPaste($event)"
                @focus="onDigitFocus(i)"
              />
            </div>
            <Transition name="error-fade">
              <p v-if="codeError" class="code-error">{{ codeError }}</p>
            </Transition>
          </div>

          <!-- Verifying spinner -->
          <div v-if="verifying" class="verifying-wrap">
            <div class="spinner"></div>
            <span>Проверяем код…</span>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div v-if="step === 'success'" class="auth-content">
          <div class="success-check-wrap">
            <svg class="success-check" width="64" height="64" viewBox="0 0 512 512" fill="currentColor"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
          </div>
          <h2 class="auth-title">Добро пожаловать!</h2>
          <p class="auth-subtitle">{{ successName || 'Вы успешно авторизованы' }}</p>
          <p class="auth-redirect-hint">Перенаправляем…</p>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { apiAuthInitRoute } from '../api/auth/init'
import { apiAuthVerifyRoute } from '../api/auth/verify'
import { apiAuthCheckRoute } from '../api/auth/check'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'authenticated'])

const step = ref('choose')
const loading = ref(false)
const chosenMessenger = ref('')
const deepLink = ref('')
const bucketId = ref('')
const botOpened = ref(false)
const instructions = ref('')
const codeDigits = ref(['', '', '', ''])
const codeRefs = ref([])
const codeError = ref('')
const verifying = ref(false)
const successName = ref('')

function close() {
  step.value = 'choose'
  loading.value = false
  chosenMessenger.value = ''
  deepLink.value = ''
  bucketId.value = ''
  botOpened.value = false
  instructions.value = ''
  codeDigits.value = ['', '', '', '']
  codeError.value = ''
  verifying.value = false
  successName.value = ''
  emit('close')
}

function goBack() {
  step.value = 'choose'
  botOpened.value = false
  codeDigits.value = ['', '', '', '']
  codeError.value = ''
}

async function initAuth(messenger) {
  loading.value = true
  chosenMessenger.value = messenger

  try {
    const res = await apiAuthInitRoute.run(ctx, { messenger })
    if (res.success) {
      deepLink.value = res.deepLink
      bucketId.value = res.bucketId
      instructions.value = res.instructions || ''
      step.value = 'code'
    } else {
      codeError.value = 'Ошибка инициализации'
    }
  } catch (e) {
    codeError.value = 'Не удалось подключиться'
  } finally {
    loading.value = false
  }
}

function onBotOpened() {
  setTimeout(() => {
    botOpened.value = true
    nextTick(() => {
      if (codeRefs.value[0]) codeRefs.value[0].focus()
    })
  }, 1000)
}

function onDigitInput(index, event) {
  const val = event.target.value.replace(/\D/g, '')
  codeDigits.value[index] = val ? val[0] : ''
  codeError.value = ''

  if (val && index < 3) {
    nextTick(() => {
      if (codeRefs.value[index + 1]) codeRefs.value[index + 1].focus()
    })
  }

  const full = codeDigits.value.join('')
  if (full.length === 4) {
    verifyCode(full)
  }
}

function onDigitKeydown(index, event) {
  if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
    codeDigits.value[index - 1] = ''
    nextTick(() => {
      if (codeRefs.value[index - 1]) codeRefs.value[index - 1].focus()
    })
  }
}

function onDigitFocus(index) {
  if (codeRefs.value[index]) {
    codeRefs.value[index].select()
  }
}

function onPaste(event) {
  event.preventDefault()
  const text = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '')
  if (text.length >= 4) {
    for (let i = 0; i < 4; i++) {
      codeDigits.value[i] = text[i]
    }
    nextTick(() => {
      if (codeRefs.value[3]) codeRefs.value[3].focus()
      verifyCode(text.slice(0, 4))
    })
  }
}

async function verifyCode(code) {
  verifying.value = true
  codeError.value = ''

  try {
    const verifyRes = await apiAuthVerifyRoute.run(ctx, { bucketId: bucketId.value, code })

    if (!verifyRes.success) {
      codeError.value = verifyRes.error === 'Wrong code' ? 'Неверный код' : 'Ошибка проверки'
      verifying.value = false
      codeDigits.value = ['', '', '', '']
      nextTick(() => {
        if (codeRefs.value[0]) codeRefs.value[0].focus()
      })
      return
    }

    const checkRes = await apiAuthCheckRoute.run(ctx, { bucketId: bucketId.value })

    if (checkRes.success && checkRes.loginUrl) {
      successName.value = checkRes.displayName || 'Вы успешно авторизованы'
      step.value = 'success'
      verifying.value = false

      setTimeout(() => {
        window.location.href = checkRes.loginUrl
      }, 1500)
    } else {
      codeError.value = 'Не удалось войти. Попробуйте снова.'
      verifying.value = false
    }
  } catch (e) {
    codeError.value = 'Ошибка соединения'
    verifying.value = false
    codeDigits.value = ['', '', '', '']
    nextTick(() => {
      if (codeRefs.value[0]) codeRefs.value[0].focus()
    })
  }
}

watch(() => props.isOpen, (val) => {
  if (val) {
    step.value = 'choose'
    codeDigits.value = ['', '', '', '']
    codeError.value = ''
    botOpened.value = false
  }
})
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 11000;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.auth-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 11001;
  width: 400px;
  max-width: calc(100vw - 32px);
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.18), 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.auth-content {
  padding: 40px 32px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.auth-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.auth-back {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-back:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.auth-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f8f8f8, #f0f0f0);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.auth-flower-icon {
  color: #000;
  opacity: 0.85;
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-icon.telegram {
  color: #2AABEE;
}

.step-icon.max {
  color: #000;
}

.auth-title {
  font-size: 22px;
  font-weight: 700;
  color: #000;
  margin: 0 0 6px;
  text-align: center;
}

.auth-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px;
  text-align: center;
  line-height: 1.5;
}

.auth-subtitle strong {
  color: #333;
}

.messenger-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.messenger-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.messenger-btn:hover:not(:disabled) {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.messenger-btn:active:not(:disabled) {
  transform: translateY(0);
}

.messenger-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.messenger-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.telegram-btn .messenger-icon {
  background: linear-gradient(135deg, #2AABEE, #229ED9);
  color: #fff;
}

.max-btn .messenger-icon {
  background: linear-gradient(135deg, #333, #111);
  color: #fff;
}

.messenger-label {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  flex: 1;
  text-align: left;
}

.messenger-arrow {
  font-size: 18px;
  color: #ccc;
  font-weight: 300;
  transition: color 0.2s, transform 0.2s;
}

.messenger-btn:hover .messenger-arrow {
  color: #999;
  transform: translateX(2px);
}

.auth-hint {
  font-size: 12px;
  color: #aaa;
  margin: 16px 0 0;
  text-align: center;
}

.open-bot-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 52px;
  border-radius: 14px;
  background: #000;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  font-family: inherit;
  margin-bottom: 8px;
}

.open-bot-btn:hover {
  background: #2a2a2a;
}

.code-input-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.code-inputs {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.code-digit {
  width: 60px;
  height: 68px;
  border-radius: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  background: #fafafa;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: #000;
  outline: none;
  transition: all 0.2s;
  font-family: inherit;
  caret-color: #000;
}

.code-digit:focus {
  border-color: #000;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.06);
}

.code-digit.filled {
  border-color: rgba(0, 0, 0, 0.2);
  background: #fff;
}

.code-digit.error {
  border-color: #e05b5b;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}

.code-error {
  font-size: 13px;
  color: #e05b5b;
  margin: 8px 0 0;
  text-align: center;
  font-weight: 500;
}

.verifying-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  font-size: 14px;
  color: #888;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(0, 0, 0, 0.1);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.success-check-wrap {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.success-check {
  color: #000;
}

@keyframes scale-in {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.auth-redirect-hint {
  font-size: 13px;
  color: #aaa;
  margin: 12px 0 0;
  animation: pulse-opacity 1.5s ease-in-out infinite;
}

@keyframes pulse-opacity {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Transitions */
.auth-overlay-enter-active,
.auth-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.auth-overlay-enter-from,
.auth-overlay-leave-to {
  opacity: 0;
}

.auth-modal-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.auth-modal-leave-active {
  transition: all 0.2s ease;
}

.auth-modal-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.92);
}

.auth-modal-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.96);
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.25s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 480px) {
  .auth-modal {
    width: calc(100vw - 24px);
    border-radius: 20px;
  }

  .auth-content {
    padding: 36px 24px 32px;
  }

  .code-digit {
    width: 52px;
    height: 60px;
    font-size: 24px;
    border-radius: 14px;
  }

  .code-inputs {
    gap: 8px;
  }
}
</style>