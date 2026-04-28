<template>
  <div v-if="items.length > 0" class="rp-wrap">
    <h3 class="rp-title">Ещё букеты с {{ titleFlowers }}</h3>
    <div class="rp-scroll">
      <div
        v-for="item in items"
        :key="item.id"
        class="rp-card-wrap"
      >
        <ProductCard
          :product="item"
          variant="default"
          :hideCounter="true"
          @open-product="$emit('open-product', $event)"
          @add-to-cart="$emit('add-to-cart', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { apiProductsRelatedRoute } from '../api/products/related'
import ProductCard from './catalog/ProductCard.vue'

const FLOWER_NAMES = {
  'rose': 'розой',
  'alstroemeria': 'альстромерией',
  'matthiola': 'маттиолой',
  'diantus': 'диантусом',
  'spray-rose': 'кустовой розой',
}

const props = defineProps({
  productId: {
    type: String,
    required: true,
  },
  currentFlowers: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['open-product', 'add-to-cart'])

const items = ref([])

const titleFlowers = computed(() => {
  if (items.value.length === 0) return ''
  const allRelatedFlowers = new Set()
  items.value.forEach(item => {
    const fl = Array.isArray(item.flowers) ? item.flowers : []
    fl.forEach(f => allRelatedFlowers.add(f))
  })
  const common = props.currentFlowers.filter(f => allRelatedFlowers.has(f))
  if (common.length === 0) return 'теми же цветами'
  return common.map(f => FLOWER_NAMES[f] || f).join(', ')
})

async function load() {
  if (!props.productId) return
  try {
    const result = await apiProductsRelatedRoute.query({ productId: props.productId }).run(ctx)
    items.value = Array.isArray(result) ? result : []
  } catch (e) {
    items.value = []
  }
}

onMounted(load)
watch(() => props.productId, load)
</script>

<style scoped>
.rp-wrap {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid var(--color-card-border);
}

.rp-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 20px;
}

.rp-scroll {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 1024px) {
  .rp-scroll {
    grid-template-columns: repeat(3, 1fr);
  }
}

.rp-card-wrap {
  width: 100%;
}

@media (max-width: 767px) {
  .rp-scroll {
    gap: 12px;
  }

  .rp-title {
    font-size: 16px;
  }
}
</style>