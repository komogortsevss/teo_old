// @shared

import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface ProductCounterInput {
  stemsCount: number | null
  flowers: string[]
  priceAmount: number
  maxBouquets?: number | null
  composition?: Array<{ flowerId: string; quantity: number }>
}

export interface ProductCounter {
  step: ComputedRef<number>
  count: Ref<number>
  isMonoBouquet: ComputedRef<boolean>
  displayCount: ComputedRef<number>
  bouquetCount: ComputedRef<number>
  totalPrice: ComputedRef<string>
  canIncrement: ComputedRef<boolean>
  maxCount: ComputedRef<number | null>
  increment: () => void
  decrement: () => void
}

const MONO_STEP = 10

export function useProductCounter(getProduct: () => ProductCounterInput): ProductCounter {
  const step = computed(() => {
    const p = getProduct()
    if (p.stemsCount && p.stemsCount > 1) return p.stemsCount
    return 1
  })

  const isMonoBouquet = computed(() => {
    const p = getProduct()
    if ((p.stemsCount ?? 0) <= 1) return false
    if (Array.isArray(p.flowers) && p.flowers.length === 1) return true
    if (Array.isArray(p.composition) && p.composition.length === 1) return true
    return false
  })

  const count = ref(step.value)

  const displayCount = computed(() => count.value)

  const bouquetCount = computed(() => {
    if (isMonoBouquet.value) {
      return Math.round((count.value - step.value) / MONO_STEP) + 1
    }
    if (step.value > 1) return count.value / step.value
    return count.value
  })

  const maxCount = computed(() => {
    const p = getProduct()
    if (p.maxBouquets == null || p.maxBouquets <= 0) return null
    if (isMonoBouquet.value) {
      return step.value + (p.maxBouquets - 1) * MONO_STEP
    }
    return p.maxBouquets * step.value
  })

  const canIncrement = computed(() => {
    if (maxCount.value === null) return true
    const nextQty = count.value + MONO_STEP
    if (isMonoBouquet.value) return nextQty <= maxCount.value
    const nextNonMono = count.value + step.value
    return nextNonMono <= maxCount.value
  })

  const totalPrice = computed(() => {
    const p = getProduct()
    if (isMonoBouquet.value) {
      const pricePerStem = (p.priceAmount ?? 0) / (p.stemsCount ?? 1)
      const total = pricePerStem * count.value
      return Math.round(total).toLocaleString('ru-RU') + ' ₽'
    }
    const total = (p.priceAmount ?? 0) * bouquetCount.value
    return Math.round(total).toLocaleString('ru-RU') + ' ₽'
  })

  function increment() {
    if (!canIncrement.value) return
    if (isMonoBouquet.value) {
      count.value += MONO_STEP
    } else {
      count.value += step.value
    }
  }

  function decrement() {
    if (isMonoBouquet.value) {
      if (count.value - MONO_STEP < step.value) return
      count.value -= MONO_STEP
    } else {
      const newVal = count.value - step.value
      if (newVal < step.value) return
      count.value = newVal
    }
  }

  return { step, count, isMonoBouquet, displayCount, bouquetCount, totalPrice, canIncrement, maxCount, increment, decrement }
}

export function stemWord(n: number): string {
  const last2 = n % 100
  const last1 = n % 10
  if (last2 >= 11 && last2 <= 14) return 'стеблей'
  if (last1 === 1) return 'стебель'
  if (last1 >= 2 && last1 <= 4) return 'стебля'
  return 'стеблей'
}

export function bouquetWord(n: number): string {
  const last2 = n % 100
  const last1 = n % 10
  if (last2 >= 11 && last2 <= 14) return 'букетов'
  if (last1 === 1) return 'букет'
  if (last1 >= 2 && last1 <= 4) return 'букета'
  return 'букетов'
}
