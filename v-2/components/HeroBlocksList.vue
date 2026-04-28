<template>
  <div class="heroes-list">
    <HeroBlock
      v-for="(hero, idx) in allHeroes"
      :key="hero.id"
      :hero-data="hero"
      :is-first="idx === 0"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HeroBlock from './HeroBlock.vue'

const props = defineProps({
  initialHeroes: {
    type: Array,
    default: () => []
  }
})

// All heroes for rendering
const allHeroes = computed(() => props.initialHeroes || [])
</script>

<style scoped>
.heroes-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  /* Reserve space to prevent CLS - matches hero min-height */
  min-height: 450px;
}

@media (min-width: 768px) {
  .heroes-list {
    margin-top: 0;
    min-height: 500px;
  }
}

@media (min-width: 1025px) {
  .heroes-list {
    min-height: 600px;
  }
}
</style>