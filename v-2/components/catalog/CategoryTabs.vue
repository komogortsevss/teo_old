<template>
  <div class="category-tabs-wrap">
    <div class="category-tabs" ref="tabsRef">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="category-tab"
        :class="{ active: modelValue === cat.id }"
        @click="$emit('update:modelValue', cat.id)"
      >
        {{ cat.name }}<span v-if="cat.count !== undefined" class="category-count">{{ cat.count }}</span>
      </button>
      <span class="tabs-spacer" aria-hidden="true">&nbsp;</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, default: null },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.category-tabs-wrap {
  width: 100%;
  border-bottom: 1px solid var(--color-shadow);
}

@media (max-width: 767px) {
  .category-tabs-wrap {
    width: calc(100% + 32px);
    margin-left: -16px;
    position: relative;
  }
}

.category-tabs {
  display: flex;
  gap: 0;
  padding: 0;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

@media (max-width: 767px) {
  .category-tabs {
    padding-left: 16px;
    padding-right: 16px;
  }
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.tabs-spacer {
  display: none;
}

.category-tab {
  white-space: nowrap;
  padding: 12px 20px;
  border-radius: 0;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #000;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
  line-height: 22px;
  margin-bottom: -1px;
  flex-shrink: 0;
}

.category-tab:hover {
  color: #000;
}

.category-tab.active {
  color: #000;
  font-weight: 600;
  border-bottom: 2.5px solid var(--color-primary);
}

.category-count {
  font-size: 0.7em;
  vertical-align: super;
  color: rgba(0, 0, 0, 0.45);
  margin-left: 2px;
  font-weight: 500;
  line-height: 1;
}
</style>