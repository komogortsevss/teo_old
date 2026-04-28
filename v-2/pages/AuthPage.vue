<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="spinner-wrapper">
        <div class="spinner"></div>
        <p>Перенаправляем на страницу входа...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  backUrl: string
}>()

onMounted(() => {
  const back = encodeURIComponent(props.backUrl || '/v-2')
  window.location.href = `/s/auth/signin?back=${back}`
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
}

.auth-container {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

p {
  font-size: 15px;
  color: #666666;
  margin: 0;
}

@media (max-width: 480px) {
  .auth-page {
    padding: 16px;
    background: #ffffff;
  }

  .auth-container {
    padding: 24px 20px;
    box-shadow: none;
    border-radius: 0;
  }
}
</style>