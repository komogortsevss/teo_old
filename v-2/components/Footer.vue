<template>
  <footer id="contacts" class="footer">
    <div class="footer-container">
      
      <!-- Верхняя секция -->
      <div class="footer-top">
        <!-- Колонка 1: О компании -->
        <div class="footer-col footer-about">
          <h3 class="footer-logo">{{ cfg?.company?.name || 'ТЕО' }}</h3>
          <p class="footer-description">
            {{ cfg?.company?.description || '' }}
          </p>
          <div class="footer-socials">
            <a
              v-for="s in (cfg?.socials || [])"
              :key="s.name"
              :href="s.url"
              class="social-link"
              :aria-label="s.name"
            >
              <svg width="18" height="18" viewBox="0 0 512 512" fill="currentColor"><path d="M64 0C28.7 0 0 28.7 0 64L0 352c0 35.3 28.7 64 64 64l96 0 0 80c0 6.1 3.4 11.6 8.8 14.3s11.9 2.1 16.8-1.5L309.3 416 448 416c35.3 0 64-28.7 64-64l0-288c0-35.3-28.7-64-64-64L64 0z"/></svg>
            </a>
          </div>
        </div>

        <!-- Колонка 2: Навигация -->
        <div class="footer-col">
          <h4 class="footer-heading">Навигация</h4>
          <ul class="footer-links">
            <li v-for="item in navLinks" :key="item.key">
              <a :href="item.href">{{ item.label }}</a>
            </li>
          </ul>
        </div>

        <!-- Колонка 3: Категории -->
        <div class="footer-col">
          <h4 class="footer-heading">Категории</h4>
          <ul class="footer-links">
            <li v-for="cat in (cfg?.footerCategories || [])" :key="cat.label">
              <a :href="cat.href">{{ cat.label }}</a>
            </li>
          </ul>
        </div>

        <!-- Колонка 4: Контакты и доставка -->
        <div class="footer-col">
          <h4 class="footer-heading">Контакты</h4>
          <ul class="footer-contacts">
            <li v-if="cfg?.contacts?.phone">
              <svg class="footer-icon" width="15" height="15" viewBox="0 0 512 512" fill="currentColor"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
              <a :href="'tel:' + (cfg.contacts.phoneRaw || '')">{{ cfg.contacts.phone }}</a>
            </li>
            <li v-if="cfg?.contacts?.email">
              <svg class="footer-icon" width="15" height="15" viewBox="0 0 512 512" fill="currentColor"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
              <a :href="'mailto:' + cfg.contacts.email">{{ cfg.contacts.email }}</a>
            </li>
            <li>
              <svg class="footer-icon" width="15" height="15" viewBox="0 0 384 512" fill="currentColor"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
              <span>Москва</span>
            </li>
            <li>
              <svg class="footer-icon" width="15" height="15" viewBox="0 0 512 512" fill="currentColor"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
              <span>Доставка ежедневно, 09:00 — 21:00</span>
            </li>
            <li>
              <svg class="footer-icon" width="15" height="15" viewBox="0 0 640 512" fill="currentColor"><path d="M48 0C21.5 0 0 21.5 0 48L0 368c0 26.5 21.5 48 48 48l16 0c0 53 43 96 96 96s96-43 96-96l128 0c0 53 43 96 96 96s96-43 96-96l32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64 0-32 0-18.7c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7L416 96l0-48c0-26.5-21.5-48-48-48L48 0zM416 160l50.7 0L544 237.3l0 18.7-128 0 0-96zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>
              <span>Бесплатно в пределах МКАД</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Нижняя секция -->
      <div class="footer-bottom">
        <div class="footer-bottom-left">
          <p class="footer-copyright">{{ cfg?.company?.copyright || '' }}</p>
          <p class="footer-legal-entity">{{ cfg?.company?.legalName || '' }}</p>
        </div>
        <div class="footer-legal">
          <template v-for="(link, i) in (cfg?.legal || [])" :key="link.label">
            <a :href="link.href">{{ link.label }}</a>
            <span v-if="i < (cfg?.legal?.length || 0) - 1" class="footer-divider">•</span>
          </template>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useConfig } from '../shared/useConfig'

const { config: cfg, loadConfig } = useConfig()
onMounted(loadConfig)

const navLinks = computed(() => {
  const nav = cfg.value?.nav || []
  return nav.filter(item => item.key !== 'contacts')
})
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, var(--color-footer-gradient-start) 0%, var(--color-background) 100%);
  border-top: 1px solid var(--color-border);
  padding: 64px 0 32px;
  margin-top: 80px;
  contain: layout style;
  content-visibility: auto;
  contain-intrinsic-size: 0 300px;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
}

.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid var(--color-border);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.footer-about {
  gap: 16px;
}

.footer-logo {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-dark);
  letter-spacing: -0.5px;
  margin: 0;
}

.footer-description {
  font-size: 15px;
  line-height: 24px;
  color: var(--color-text-soft);
  margin: 0;
  max-width: 280px;
}

.footer-socials {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-hover-bg);
  border-radius: 10px;
  color: var(--color-primary);
  font-size: 18px;
  transition: all 0.25s ease;
  text-decoration: none;
}

.social-link:hover {
  background: var(--color-primary);
  color: var(--color-white);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
}

.footer-heading {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 0;
  letter-spacing: 0.3px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-links a {
  font-size: 15px;
  line-height: 22px;
  color: var(--color-text-soft);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--color-primary);
}

.footer-contacts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.footer-contacts li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  line-height: 22px;
  color: var(--color-text-soft);
}

.footer-icon {
  color: var(--color-primary);
  margin-top: 3px;
  flex-shrink: 0;
  width: 15px;
  height: 15px;
}

.footer-contacts a {
  color: var(--color-text-soft);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-contacts a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  padding-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-bottom-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-copyright {
  font-size: 14px;
  color: var(--color-text-soft);
  margin: 0;
}

.footer-legal-entity {
  font-size: 13px;
  color: var(--color-text-soft);
  margin: 0;
  opacity: 0.7;
}

.footer-legal {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.footer-legal a {
  color: var(--color-text-soft);
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-legal a:hover {
  color: var(--color-primary);
}

.footer-divider {
  color: var(--color-text-soft);
  opacity: 0.4;
}

@media (max-width: 1023px) {
  .footer-top {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .footer-about {
    grid-column: 1 / -1;
  }
}

@media (max-width: 767px) {
  .footer {
    padding: 48px 0 24px;
    margin-top: 48px;
  }

  .footer-container {
    padding: 0 16px;
  }

  .footer-top {
    grid-template-columns: 1fr;
    gap: 32px;
    padding-bottom: 32px;
  }

  .footer-about {
    grid-column: 1;
  }

  .footer-description {
    max-width: 100%;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    padding-top: 24px;
    gap: 12px;
  }

  .footer-legal {
    flex-wrap: wrap;
  }

  .footer-logo {
    font-size: 28px;
  }

  .footer-socials {
    justify-content: flex-start;
  }
}
</style>