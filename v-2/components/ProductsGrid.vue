<template>
  <section class="products-section">
    <div class="products-container">
      <h2 class="products-title">Популярные букеты</h2>
      
      <!-- Actual products grid - always rendered, no skeleton/content swap -->
      <div class="products-grid">
        <div 
          v-for="(product, index) in products" 
          :key="index"
          class="product-cell"
          :class="getCellClass(index)"
        >
          <img
            :src="getThumbnailUrl(product.imageHash, 400, 400)"
            :srcset="`
              https://fs.chatium.ru/thumbnail/${getCleanHash(product.imageHash)}/s/320x320 320w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(product.imageHash)}/s/400x400 400w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(product.imageHash)}/s/640x640 640w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(product.imageHash)}/s/960x960 960w
            `"
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
            :alt="product.name"
            class="product-img"
            :loading="index < 4 ? 'eager' : 'lazy'"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
            decoding="async"
            width="400"
            height="400"
          />
          
          <div class="product-overlay">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-bottom">
              <span class="product-price">{{ product.price }} ₽</span>
              <button class="product-btn">В корзину</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { getThumbnailUrl } from '@app/storage'

// Always loaded - no loading state to prevent CLS
const loaded = ref(true)

const products = ref([
  {
    name: 'Букет "Розовая мечта"',
    description: '15 роз эквадорских',
    price: '4 500',
    imageHash: 'image_msk_vviWcMcU5a.2656x3984.jpeg'
  },
  {
    name: 'Композиция "Нежность"',
    description: 'Пионы и эустомы',
    price: '6 800',
    imageHash: 'image_msk_GTzi9UoVg8.2656x3984.jpeg'
  },
  {
    name: 'Букет "Весна"',
    description: 'Тюльпаны микс',
    price: '3 200',
    imageHash: 'image_msk_BwmsJCJjKw.2656x3984.jpeg'
  },
  {
    name: 'Букет "Элегантность"',
    description: '21 роза премиум',
    price: '7 900',
    imageHash: 'image_msk_ggLlECqmIT.2656x3984.jpeg'
  },
  {
    name: 'Композиция "Luxury"',
    description: 'Орхидеи и розы',
    price: '12 500',
    imageHash: 'image_msk_8bnbXRl9kK.2656x3984.jpeg'
  },
  {
    name: 'Букет "Солнечный"',
    description: 'Герберы яркие',
    price: '2 900',
    imageHash: 'image_msk_NqKRFvuvdb.2656x3984.jpeg'
  },
  {
    name: 'Букет "Романтика"',
    description: 'Пионовидные розы',
    price: '5 400',
    imageHash: 'image_msk_Rc6j4dKQ6q.2656x3984.jpeg'
  },
  {
    name: 'Композиция "Сад"',
    description: 'Полевые цветы',
    price: '4 100',
    imageHash: 'image_msk_4FlU8gXgdV.2656x3984.jpeg'
  },
  {
    name: 'Букет "Страсть"',
    description: 'Красные розы 25 шт',
    price: '8 500',
    imageHash: 'image_msk_sP9Sz31Vad.2656x3984.jpeg'
  },
  {
    name: 'Букет "Легкость"',
    description: 'Хризантемы белые',
    price: '3 600',
    imageHash: 'image_msk_XueQ7Wh967.2656x3984.jpeg'
  }
])

function getCellClass(index) {
  const classes = ['cell-big', '', '', 'cell-wide', '', '', 'cell-wide', '', '', 'cell-wide']
  return classes[index] || ''
}

function getCleanHash(hash) {
  return hash ? hash.replace(/\.[^/.]+$/, '') : ''
}
</script>

<style scoped>
.products-section {
  padding: 64px 24px;
  background: var(--color-light-bg);
}

.products-container {
  max-width: 1280px;
  margin: 0 auto;
}

.products-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 48px;
  text-align: center;
}

.products-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.product-cell {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  contain: layout style paint;
  content-visibility: auto;
  contain-intrinsic-size: 300px 300px;
  /* Fixed aspect ratio to prevent CLS */
  aspect-ratio: 1;
}

/* First 4 products - no content-visibility for LCP */
.product-cell:nth-child(-n+4) {
  content-visibility: visible;
}

.product-cell:hover {
  box-shadow: 0 8px 30px var(--color-shadow-dark);
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.product-cell:hover .product-img {
  transform: scale(1.1);
}

.product-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
}

.product-cell:hover .product-overlay {
  opacity: 1;
}

.product-name {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 8px;
}

.product-desc {
  color: rgba(255,255,255,0.9);
  font-size: 14px;
  margin: 0 0 12px;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  color: #fff;
  font-weight: 700;
  font-size: 20px;
}

.product-btn {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
  color: #fff;
  padding: 8px 16px;
  border-radius: 100px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.product-btn:hover {
  background: rgba(255,255,255,0.3);
}

/* Skeleton styles */
@media (min-width: 768px) {
  .products-section {
    padding: 80px 24px;
  }

  .products-title {
    font-size: 40px;
  }

  .products-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .cell-big {
    grid-column: span 2;
    grid-row: span 2;
    aspect-ratio: 1;
    contain-intrinsic-size: 600px 600px;
  }

  .cell-wide {
    grid-column: span 2;
    aspect-ratio: 2/1;
    contain-intrinsic-size: 600px 300px;
  }

  .product-name {
    font-size: 18px;
  }

  .product-price {
    font-size: 24px;
  }
}
</style>