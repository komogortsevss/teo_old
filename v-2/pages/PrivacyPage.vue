<template>
  <div class="privacy-page">
    <Header page-name="конфиденциальность" />
    <main class="privacy-content">
      <h1 class="privacy-title">Политика конфиденциальности</h1>
      <p class="privacy-date">Дата публикации: 25 марта 2026 г.</p>

      <section class="legal-section">
        <h2>1. Общие положения</h2>
        <p>Настоящая Политика конфиденциальности (далее — Политика) определяет порядок обработки и защиты персональных данных пользователей сайта ТЕО (далее — Сайт), принадлежащего ИП Комогорцева Е.С. (далее — Оператор).</p>
        <p>Оформляя заказ или предоставляя свои персональные данные на Сайте, пользователь выражает согласие с условиями данной Политики.</p>
      </section>

      <section class="legal-section">
        <h2>2. Какие данные мы собираем</h2>
        <p>При использовании Сайта мы можем собирать следующие данные:</p>
        <ul>
          <li>Имя и фамилия</li>
          <li>Номер телефона</li>
          <li>Адрес доставки</li>
          <li>Данные об устройстве и браузере (cookies, IP-адрес)</li>
          <li>История заказов</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>3. Цели обработки данных</h2>
        <p>Персональные данные используются для:</p>
        <ul>
          <li>Оформления и доставки заказов</li>
          <li>Связи с клиентом по вопросам заказа</li>
          <li>Улучшения качества обслуживания</li>
          <li>Выполнения требований законодательства РФ</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>4. Защита данных</h2>
        <p>Оператор принимает необходимые организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения.</p>
      </section>

      <section class="legal-section">
        <h2>5. Передача данных третьим лицам</h2>
        <p>Оператор не передает персональные данные третьим лицам, за исключением случаев:</p>
        <ul>
          <li>Передачи данных курьерской службе для осуществления доставки</li>
          <li>Требований законодательства РФ</li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>6. Использование файлов cookie</h2>
        <p>Сайт использует файлы cookie для обеспечения корректной работы, улучшения пользовательского опыта и сбора аналитических данных. Продолжая использовать Сайт, вы соглашаетесь с использованием cookie.</p>
      </section>

      <section class="legal-section">
        <h2>7. Права пользователя</h2>
        <p>Пользователь имеет право:</p>
        <ul>
          <li>Запросить информацию о хранимых персональных данных</li>
          <li>Потребовать удаления или исправления своих данных</li>
          <li>Отозвать согласие на обработку персональных данных</li>
        </ul>
        <p>Для этого направьте запрос на адрес: <a href="mailto:s@teo2you.ru">s@teo2you.ru</a></p>
      </section>

      <section class="legal-section">
        <h2>8. Контактная информация</h2>
        <p>ИП Комогорцева Е.С.</p>
        <p>Email: <a href="mailto:s@teo2you.ru">s@teo2you.ru</a></p>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: var(--color-background);
}

.privacy-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 120px 32px 80px;
}

.privacy-title {
  font-size: 36px;
  font-weight: 900;
  color: var(--color-text-dark);
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.privacy-date {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 40px;
}

.legal-section {
  margin-bottom: 32px;
}

.legal-section h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 12px;
}

.legal-section p {
  font-size: 15px;
  line-height: 26px;
  color: var(--color-text-dark);
  margin: 0 0 10px;
}

.legal-section ul {
  padding-left: 24px;
  margin: 8px 0 10px;
}

.legal-section li {
  font-size: 15px;
  line-height: 26px;
  color: var(--color-text-dark);
  margin-bottom: 4px;
}

.legal-section a {
  color: var(--color-primary);
  text-decoration: underline;
  transition: color 0.2s;
}

.legal-section a:hover {
  color: var(--color-primary-dark);
}

@media (max-width: 767px) {
  .privacy-content {
    padding: 84px 16px 48px;
  }

  .privacy-title {
    font-size: 28px;
  }
}
</style>