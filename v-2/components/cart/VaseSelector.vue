<template>
  <div class="vase-selector" v-if="filteredVases.length > 0">
    <div v-if="showLabel" class="vs-label">подходящие по размеру вазы</div>
    <div class="vs-options">
      <template v-for="(vase, index) in filteredVases" :key="vase.id + '-' + vase.ruleQuantity">
        <div
          class="vs-option"
          :class="{ selected: selectedAddonId === vase.id }"
          @click="$emit('select', vase.id, vase.ruleQuantity)"
        >
        <div class="vs-img">
          <img
            v-if="vase.imageHash"
            :src="getThumbnailUrl(vase.imageHash, 72, undefined)"
            :srcset="`
              https://fs.chatium.ru/thumbnail/${getCleanHash(vase.imageHash)}/s/36x48 36w,
              https://fs.chatium.ru/thumbnail/${getCleanHash(vase.imageHash)}/s/72x96 72w
            `"
            sizes="36px"
            :alt="vase.name"
            loading="lazy"
            decoding="async"
            width="36"
            height="48"
          />
          <i v-else class="fa-solid fa-wine-glass vs-icon-fallback"></i>
        </div>
        <div class="vs-info">
          <span class="vs-name">
            {{ vase.name }}
            <span v-if="vase.ruleQuantity > 1" class="vs-qty-badge">× {{ vase.ruleQuantity }}</span>
          </span>
          <span class="vs-price">{{ (vase.priceAmount * vase.ruleQuantity).toLocaleString('ru-RU') }} ₽</span>
        </div>
        <div class="vs-check">
          <i v-if="selectedAddonId === vase.id" class="fa-solid fa-circle-check"></i>
          <i v-else class="fa-regular fa-circle"></i>
        </div>
      </div>
      <div v-if="index < filteredVases.length - 1" class="vs-divider">или</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getThumbnailUrl } from '@app/storage'

const props = defineProps({
  allVaseAddons: { type: Array, required: true },
  vaseRules: { type: Array, required: true },
  bouquetName: { type: String, required: true },
  totalStems: { type: Number, required: true },
  selectedAddonId: { type: String, default: null },
  showLabel: { type: Boolean, default: false },
})

defineEmits(['select'])

const filteredVases = computed(() => {
  const result = []
  const ts = props.totalStems

  for (const rule of props.vaseRules) {
    if (ts < (rule.minStems || 0)) continue
    if (rule.maxStems != null && ts > rule.maxStems) continue

    const addon = props.allVaseAddons.find(a => a.id === rule.addonId)
    if (!addon) continue

    const existing = result.find(r => r.id === rule.addonId)
    if (existing) continue

    result.push({
      ...addon,
      ruleQuantity: rule.quantity || 1,
    })
  }

  return result
})

function getCleanHash(hash) {
  return hash ? hash.replace(/\.[^/.]+$/, '') : ''
}
</script>

<style scoped>
.vase-selector {
  margin-top: 4px;
  margin-bottom: 8px;
  padding: 10px 12px;
  background: var(--color-light-bg, #FAFAFA);
  border-radius: 12px;
  border: 1px solid var(--color-border-light, rgba(0,0,0,0.06));
}

.vs-label {
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.vs-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vs-divider {
  text-align: center;
  font-size: 11px;
  font-weight: 400;
  color: #9ca3af;
  text-transform: lowercase;
  padding: 2px 0;
  letter-spacing: 0.02em;
}

.vs-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1.5px solid var(--color-border, rgba(0,0,0,0.08));
  background: var(--color-white, #fff);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.vs-option:hover {
  border-color: var(--color-primary, #000);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.vs-option.selected {
  border-color: var(--color-primary, #000);
  background: rgba(0,0,0,0.02);
}

.vs-img {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-border-light, rgba(0,0,0,0.06));
  display: flex;
  align-items: center;
  justify-content: center;
}

.vs-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vs-icon-fallback {
  font-size: 16px;
  color: var(--color-surface, #e5e5e5);
}

.vs-info {
  flex: 1;
  min-width: 0;
}

.vs-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #000;
  line-height: 1.3;
}

.vs-qty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary, #000);
  color: var(--color-white, #fff);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  line-height: 1.4;
}

.vs-price {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-soft, #000);
  margin-top: 1px;
}

.vs-check {
  font-size: 18px;
  color: var(--color-surface, #e5e5e5);
  flex-shrink: 0;
  transition: color 0.2s;
}

.vs-option.selected .vs-check {
  color: var(--color-primary, #000);
}
</style>