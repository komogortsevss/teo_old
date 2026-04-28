<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="product" class="modal-overlay" ref="overlayRef" @click.self="close">
        <div class="modal-sheet" role="dialog" :aria-label="product.name">
          <button class="modal-close" @click="close" aria-label="Закрыть">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <div class="modal-scroll">
            <ProductDetail :product="product" @add-to-cart="onAddToCart" @open-product="onOpenProduct" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import ProductDetail from './ProductDetail.vue'

const overlayRef = ref(null)

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'add-to-cart', 'open-product'])

function close() {
  emit('close')
}

function onAddToCart(e) {
  emit('add-to-cart', e)
}

function onOpenProduct(product) {
  emit('open-product', product)
  setTimeout(() => {
    if (overlayRef.value) {
      overlayRef.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, 50)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
  display: block;
  overflow-y: auto;
  padding: 48px 24px 48px;
}

.modal-sheet {
  position: relative;
  background: var(--color-white);
  border-radius: 24px;
  width: 100%;
  max-width: 1020px;
  margin: 0 auto;
  overflow: visible;
  box-shadow: 0 24px 60px var(--color-modal-shadow);
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 16px;
  z-index: 10;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #000000;
  font-size: 27px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.modal-close:hover {
  transform: scale(1.12);
}

@media (max-width: 767px) {
  .modal-close {
    width: 40px;
    height: 40px;
    font-size: 20px;
    color: var(--color-white);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
    top: 10px;
    right: 10px;
  }
}

.modal-scroll {
  overflow: visible;
  padding: 8px;
  flex: 1;
}

@media (min-width: 768px) {
  .modal-scroll {
    padding: 24px 80px 24px 8px;
  }
}

/* Transitions */
.modal-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-sheet,
.modal-leave-to .modal-sheet {
  transform: scale(0.96) translateY(16px);
}

/* Mobile: bottom sheet that lifts on scroll */
@media (max-width: 767px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 56px 0 0;
    overflow-y: auto;
    display: block;
  }

  .modal-sheet {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    max-height: none;
    overflow: visible;
    width: 100%;
    min-height: calc(100vh - 56px);
  }

  .modal-scroll {
    padding: 8px 8px 40px;
    overflow: visible;
  }

  .modal-enter-from .modal-sheet,
  .modal-leave-to .modal-sheet {
    transform: translateY(100%);
  }
}
</style>