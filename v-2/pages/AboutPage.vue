<template>
  <div class="about-page">
    <Header page-name="о нас" />
    <main class="about-content">
      <section class="about-hero">
        <h1 class="about-title">О нас</h1>
        <p class="about-subtitle">История ТЕО — от домашних роз до сервиса доставки</p>
      </section>

      <section class="about-story">
        <div class="story-block" v-for="(paragraph, i) in paragraphs" :key="i">
          <p class="story-text">{{ paragraph }}</p>
        </div>
      </section>

      <section class="about-cta">
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

const paragraphs = [
  'Знакомьтесь, это Тео — основатель нашего сервиса.',
  'Он вырос в Эквадоре, на ранчо его дяди. Там свежие розы в вазе — не признак праздника или особого повода, а просто часть уютного дома.',
  'Переехав в Россию, он больше всего скучал именно по этой атмосфере. Реальность местных магазинов его расстроила: цветы стоили дорого и выглядели несвежими.',
  'Тогда он решил: «Хочу, чтобы было как дома». Тео попросил дядю отправлять ему коробку роз напрямую из Эквадора каждую неделю. Свежие, без посредников, без лишней упаковки — просто цветы для жизни.',
  'Сначала Тео украшал ими свой дом и дарил друзьям. Потом друзья начали заказывать для себя. А потом — и друзья друзей. Так родился сервис доставки свежих цветов.',
  'Сегодня это прямые поставки свежих эквадорских цветов по честной цене — не ради повода, а ради атмосферы дома.',
]
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: var(--color-background);
}

.about-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 120px 32px 80px;
}

.about-hero {
  margin-bottom: 48px;
}

.about-title {
  font-size: 40px;
  font-weight: 900;
  color: var(--color-text-dark);
  margin: 0 0 12px;
  letter-spacing: -0.5px;
}

.about-subtitle {
  font-size: 18px;
  line-height: 28px;
  color: var(--color-text-muted);
  margin: 0;
}

.about-story {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 56px;
}

.story-text {
  font-size: 17px;
  line-height: 30px;
  color: var(--color-text-dark);
  margin: 0;
}

.about-cta {
  text-align: center;
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
  .about-content {
    padding: 84px 16px 48px;
  }

  .about-title {
    font-size: 30px;
  }

  .about-subtitle {
    font-size: 16px;
    line-height: 24px;
  }

  .story-text {
    font-size: 16px;
    line-height: 28px;
  }
}
</style>