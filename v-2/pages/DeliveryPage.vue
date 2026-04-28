<template>
  <div class="delivery-page">
    <Header page-name="доставка" />
    <main class="delivery-content">
      <h1 class="delivery-title">Доставка и оплата</h1>

      <section class="info-section">
        <h2 class="section-heading">
          <i class="fa-solid fa-truck"></i>
          Доставка
        </h2>
        <div class="info-cards">
          <div class="info-card">
            <div class="card-icon"><i class="fa-solid fa-location-dot"></i></div>
            <h3>Зона доставки</h3>
            <p>Доставляем цветы по Москве в пределах МКАД бесплатно. За пределы МКАД доставка временно не осуществляется.</p>
          </div>
          <div class="info-card">
            <div class="card-icon"><i class="fa-solid fa-clock"></i></div>
            <h3>Время доставки</h3>
            <p>Ежедневно в часовые интервалы с 09:00 до 21:00. Оформить заказ можно не менее чем за 2 часа до желаемого времени.</p>
          </div>
          <div class="info-card">
            <div class="card-icon"><i class="fa-solid fa-box-open"></i></div>
            <h3>Упаковка</h3>
            <p>Для сохранности и свежести букета доставка выполняется в специальном брендированном пакете с использованием аквабокса.</p>
          </div>
          <div class="info-card">
            <div class="card-icon"><i class="fa-solid fa-calendar-check"></i></div>
            <h3>Вечерние заказы</h3>
            <p>Если заказ оформляется после 19:00, доставка на следующий день доступна не раньше 11:00.</p>
          </div>
        </div>
      </section>

      <section class="info-section">
        <h2 class="section-heading">
          <i class="fa-solid fa-credit-card"></i>
          Оплата
        </h2>
        <div class="payment-block">
          <p class="payment-text">Оплатить букет можно банковской картой при оформлении заказа на сайте.</p>
          <div class="payment-icons">
            <i class="fa-brands fa-cc-visa"></i>
            <i class="fa-brands fa-cc-mastercard"></i>
            <i class="fa-brands fa-cc-apple-pay"></i>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <a :href="catalogUrl" class="cta-button">Перейти в каталог</a>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import { catalogPageRoute } from '../catalog'

const catalogUrl = catalogPageRoute.url()
</script>

<style scoped>
.delivery-page {
  min-height: 100vh;
  background: var(--color-background);
}

.delivery-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 120px 32px 80px;
}

.delivery-title {
  font-size: 40px;
  font-weight: 900;
  color: var(--color-text-dark);
  margin: 0 0 48px;
  letter-spacing: -0.5px;
}

.info-section {
  margin-bottom: 56px;
}

.section-heading {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-heading i {
  font-size: 22px;
}

.info-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.info-card {
  background: var(--color-light-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 28px 24px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.info-card:hover {
  box-shadow: 0 4px 16px var(--color-shadow);
  transform: translateY(-2px);
}

.card-icon {
  width: 44px;
  height: 44px;
  background: var(--color-primary);
  color: var(--color-white);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 16px;
}

.info-card h3 {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 10px;
}

.info-card p {
  font-size: 15px;
  line-height: 24px;
  color: var(--color-text-muted);
  margin: 0;
}

.payment-block {
  background: var(--color-light-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 32px;
}

.payment-text {
  font-size: 17px;
  line-height: 28px;
  color: var(--color-text-dark);
  margin: 0 0 20px;
}

.payment-icons {
  display: flex;
  gap: 16px;
  font-size: 36px;
  color: var(--color-text-muted);
}

.cta-section {
  text-align: center;
  margin-top: 16px;
}

.cta-button {
  display: inline-block;
  padding: 16px 40px;
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 16px;
  font-weight: 600;
  border-radius: 14px;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}

.cta-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px var(--color-primary-shadow);
}

@media (max-width: 767px) {
  .delivery-content {
    padding: 84px 16px 48px;
  }

  .delivery-title {
    font-size: 30px;
    margin-bottom: 36px;
  }

  .info-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .info-card {
    padding: 24px 20px;
  }

  .payment-block {
    padding: 24px 20px;
  }
}
</style>