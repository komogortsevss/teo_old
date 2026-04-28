// @shared
import { ref, computed, watch } from 'vue'

export interface CompositionItem {
  flowerId: string
  quantity: number
}

export interface AvailableAddonEntry {
  addonId: string
  minStems?: number
  maxStems?: number | null
  quantity?: number
}

export interface SelectedVase {
  addonId: string
  quantity: number
}

export interface CartItem {
  id: string
  name: string
  slug?: string
  categorySlug?: string
  imageHash: string
  priceAmount: number
  quantity: number
  step: number
  isMono: boolean
  stemsCount: number | null
  maxBouquets?: number | null
  composition?: CompositionItem[]
  stockForFlowers?: Record<string, number> // Реальные остатки для цветов
  availableAddons?: AvailableAddonEntry[]
  selectedVase?: SelectedVase | null
  isRemoving?: boolean
  removeTimer?: any
}

export interface AddonItem {
  id: string
  name: string
  priceAmount: number
  quantity: number
  type: string
}

const MONO_STEP = 10

function loadFromStorage() {
  if (typeof window === 'undefined') return { items: [], addons: [] }
  try {
    const stored = localStorage.getItem('teo-cart')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        items: parsed.items || [],
        addons: parsed.addons || [],
      }
    }
  } catch (e) {
    console.error('Failed to load cart from localStorage', e)
  }
  return { items: [], addons: [] }
}

const stored = loadFromStorage()
const items = ref<CartItem[]>(stored.items)
const addons = ref<AddonItem[]>(stored.addons)
const isOpen = ref(false)
const stockError = ref('')
const stockResolved = ref(false)
let resolvedTimer: any = null

if (typeof window !== 'undefined') {
  watch([items, addons], () => {
    try {
      const cleanItems = items.value.map(({ isRemoving, removeTimer, ...item }) => item)
      localStorage.setItem('teo-cart', JSON.stringify({
        items: cleanItems,
        addons: addons.value,
      }))
    } catch (e) {
      console.error('Failed to save cart to localStorage', e)
    }
  }, { deep: true })

  watch(items, () => {
    checkStockStatus()
  }, { deep: true, immediate: true })
}

function checkStockStatus() {
  const hasShortage = items.value.some(item => {
    if (item.isRemoving || !item.composition || item.composition.length === 0) return false
    const maxStems = getMaxStems(item)
    if (maxStems !== null && item.quantity > maxStems) return true
    return false
  })

  if (hasShortage) {
    stockError.value = 'Некоторых цветов не хватает на складе. Уменьшите количество букетов.'
    stockResolved.value = false
    if (resolvedTimer) { clearTimeout(resolvedTimer); resolvedTimer = null }
  } else if (stockError.value && !hasShortage) {
    stockError.value = ''
    stockResolved.value = true
    if (resolvedTimer) clearTimeout(resolvedTimer)
    resolvedTimer = setTimeout(() => {
      stockResolved.value = false
      resolvedTimer = null
    }, 4000)
  }
}

function calcFlowerUsageExcluding(excludeId?: string): Map<string, number> {
  const usage = new Map<string, number>()
  for (const item of items.value) {
    if (item.isRemoving) continue
    if (item.id === excludeId) continue
    if (!item.composition || item.composition.length === 0) continue

    if (item.isMono && item.composition.length === 1) {
      const fid = item.composition[0].flowerId
      const prev = usage.get(fid) || 0
      usage.set(fid, prev + item.quantity)
    } else {
      for (const c of item.composition) {
        const prev = usage.get(c.flowerId) || 0
        usage.set(c.flowerId, prev + c.quantity * item.quantity)
      }
    }
  }
  return usage
}

function getEffectiveMaxBouquets(item: CartItem): number | null {
  if (!item.composition || item.composition.length === 0) return null
  if (item.maxBouquets == null || item.maxBouquets <= 0) return null

  const usedByOthers = calcFlowerUsageExcluding(item.id)

  let minBouquets = Infinity
  for (const c of item.composition) {
    // Используем реальные остатки со склада, если есть
    const realStock = item.stockForFlowers?.[c.flowerId]
    const totalStock = realStock !== undefined ? realStock : (item.maxBouquets * c.quantity)
    
    const used = usedByOthers.get(c.flowerId) || 0
    const remaining = totalStock - used
    const possible = Math.floor(remaining / c.quantity)
    if (possible < minBouquets) minBouquets = possible
  }

  return minBouquets === Infinity ? null : minBouquets
}

function getMaxStems(item: CartItem): number | null {
  const effectiveMax = getEffectiveMaxBouquets(item)
  
  // Если effectiveMax === null (нет состава или maxBouquets), возвращаем общий лимит
  if (effectiveMax === null) {
    if (item.maxBouquets != null && item.maxBouquets > 0) {
      if (item.isMono) {
        return item.step + (item.maxBouquets - 1) * MONO_STEP
      }
      return item.maxBouquets * item.step
    }
    return null
  }
  
  // Если effectiveMax <= 0, значит с учётом других букетов цветов не хватает
  // Возвращаем 0, чтобы заблокировать добавление
  if (effectiveMax <= 0) {
    return 0
  }
  
  // Рассчитываем максимум с учётом других букетов
  if (item.isMono) {
    return item.step + (effectiveMax - 1) * MONO_STEP
  }
  return effectiveMax * item.step
}

function getMonoBouquetCount(item: CartItem): number {
  return Math.round((item.quantity - item.step) / MONO_STEP) + 1
}

export function calcTotalStems(item: CartItem): number {
  if (item.isMono && item.stemsCount && item.stemsCount > 1) {
    return item.quantity
  }
  if (!item.composition || item.composition.length === 0) return item.quantity
  const stemsPerBouquet = item.composition.reduce((s, c) => s + c.quantity, 0)
  return item.quantity * stemsPerBouquet
}

export function useCart() {
  const totalCount = computed(() =>
    items.value.filter(i => !i.isRemoving).reduce((s, i) => s + i.quantity, 0) +
    addons.value.reduce((s, i) => s + i.quantity, 0)
  )

  const totalPrice = computed(() => {
    const bouquets = items.value.filter(i => !i.isRemoving).reduce((s, i) => {
      if (i.isMono && i.step > 1) {
        const pricePerStem = i.priceAmount / i.step
        return s + Math.round(pricePerStem * i.quantity)
      }
      if (i.step > 1) {
        const full = Math.floor(i.quantity / i.step)
        const extra = i.quantity % i.step
        return s + i.priceAmount * full + extra * (i.priceAmount / i.step)
      }
      return s + i.priceAmount * i.quantity
    }, 0)
    const addonsTotal = addons.value.reduce((s, a) => s + a.priceAmount * a.quantity, 0)
    const vasesTotal = items.value.filter(i => !i.isRemoving && i.selectedVase)
      .reduce((s, i) => {
        const vase = allAddonsCache.value.find(a => a.id === i.selectedVase!.addonId)
        return s + (vase ? vase.priceAmount * i.selectedVase!.quantity : 0)
      }, 0)
    return bouquets + addonsTotal + vasesTotal
  })

  function addToCart(product: { id: string; name: string; slug?: string; categorySlug?: string; imageHash?: string; imageHashes?: string[]; priceAmount: number; stemsCount?: number | null; flowers?: string[]; maxBouquets?: number | null; composition?: CompositionItem[]; stockForFlowers?: Record<string, number>; availableAddons?: AvailableAddonEntry[] }, quantity: number) {
    const step = product.stemsCount && product.stemsCount > 1 ? product.stemsCount : 1
    const hasOneFlower = (Array.isArray(product.flowers) && product.flowers.length === 1) || (Array.isArray(product.composition) && product.composition.length === 1)
    const isMono = !!(product.stemsCount && product.stemsCount > 1 && hasOneFlower)
    const imageHash = (product.imageHashes && product.imageHashes[0]) || product.imageHash || ''
    const composition = product.composition || []

    const existing = items.value.find(i => i.id === product.id && !i.isRemoving)
    if (existing) {
      existing.maxBouquets = product.maxBouquets
      existing.composition = composition
      existing.stockForFlowers = product.stockForFlowers
      existing.availableAddons = product.availableAddons || []
      existing.stemsCount = product.stemsCount ?? null
      existing.slug = product.slug
      existing.categorySlug = product.categorySlug
      let addQty = isMono ? MONO_STEP : quantity
      let newQty = existing.quantity + addQty
      const maxStems = getMaxStems(existing)
      if (maxStems !== null && newQty > maxStems) newQty = maxStems
      existing.quantity = newQty
      revalidateVaseSelection(existing)
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        categorySlug: product.categorySlug,
        imageHash,
        priceAmount: product.priceAmount,
        quantity: quantity,
        step,
        isMono,
        stemsCount: product.stemsCount ?? null,
        maxBouquets: product.maxBouquets,
        composition,
        stockForFlowers: product.stockForFlowers,
        availableAddons: product.availableAddons || [],
        selectedVase: null,
      }
      items.value.push(newItem)
      const maxStems = getMaxStems(newItem)
      if (maxStems !== null && newItem.quantity > maxStems) {
        newItem.quantity = Math.max(step, maxStems)
      }
    }
    isOpen.value = true
  }

  function removeItem(id: string) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    item.isRemoving = true
    item.removeTimer = setTimeout(() => {
      items.value = items.value.filter(i => i.id !== id)
    }, 2500)
  }

  function undoRemoveItem(id: string) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    if (item.removeTimer) {
      clearTimeout(item.removeTimer)
      item.removeTimer = undefined
    }
    item.isRemoving = false
  }

  function updateItemQty(id: string, delta: number) {
    const item = items.value.find(i => i.id === id)
    if (!item || item.isRemoving) return

    let newQty: number
    if (item.isMono) {
      newQty = item.quantity + delta * MONO_STEP
      if (newQty < item.step) {
        removeItem(id)
        return
      }
    } else {
      const currentBouquets = item.step > 1 ? item.quantity / item.step : item.quantity
      const newBouquets = currentBouquets + delta
      if (newBouquets < 1) {
        removeItem(id)
        return
      }
      newQty = newBouquets * item.step
    }

    if (delta > 0) {
      const maxStems = getMaxStems(item)
      if (maxStems !== null && newQty > maxStems) return
    }

    item.quantity = newQty
    revalidateVaseSelection(item)
  }

  function canIncrementItem(id: string): boolean {
    const item = items.value.find(i => i.id === id)
    if (!item || item.isRemoving) return false

    let nextQty: number
    if (item.isMono) {
      nextQty = item.quantity + MONO_STEP
    } else {
      nextQty = item.quantity + item.step
    }

    const maxStems = getMaxStems(item)
    if (maxStems !== null && nextQty > maxStems) return false
    return true
  }

  function revalidateVaseSelection(item: CartItem) {
    if (!item.selectedVase) return
    const totalStems = calcTotalStems(item)
    const rules = (item.availableAddons || []).filter(a => a.addonId === item.selectedVase!.addonId && a.minStems != null)
    const matchingRule = rules.find(r => {
      if (totalStems < (r.minStems || 0)) return false
      if (r.maxStems != null && totalStems > r.maxStems) return false
      return true
    })
    if (matchingRule) {
      item.selectedVase = { addonId: item.selectedVase!.addonId, quantity: matchingRule.quantity || 1 }
    } else {
      item.selectedVase = null
    }
  }

  function selectVaseForItem(itemId: string, addonId: string | null, quantity: number = 1) {
    const item = items.value.find(i => i.id === itemId)
    if (!item) return
    if (addonId === null || (item.selectedVase && item.selectedVase.addonId === addonId)) {
      item.selectedVase = null
    } else {
      item.selectedVase = { addonId, quantity }
    }
  }

  function getSelectedVase(itemId: string): SelectedVase | null {
    const item = items.value.find(i => i.id === itemId)
    return item?.selectedVase ?? null
  }

  // Regular addons management (global, not per-item)
  function updateAddonQty(id: string, delta: number) {
    const addon = addons.value.find(a => a.id === id)
    if (!addon) return
    addon.quantity += delta
    if (addon.quantity <= 0) {
      addons.value = addons.value.filter(a => a.id !== id)
    }
  }

  function toggleAddon(addon: { id: string; name: string; priceAmount: number; type?: string }) {
    const existing = addons.value.find(a => a.id === addon.id)
    if (existing) {
      addons.value = addons.value.filter(a => a.id !== addon.id)
    } else {
      addons.value.push({ ...addon, type: addon.type || 'regular', quantity: 1 })
    }
  }

  function isAddonSelected(id: string) {
    return addons.value.some(a => a.id === id)
  }

  function getAddonQuantity(id: string) {
    return addons.value.find(a => a.id === id)?.quantity || 0
  }

  function openCart() {
    isOpen.value = true
  }

  function closeCart() {
    isOpen.value = false
  }

  function clearCart() {
    items.value = []
    addons.value = []
  }

  return {
    items,
    addons,
    isOpen,
    totalCount,
    totalPrice,
    stockError,
    stockResolved,
    allAddonsCache,
    addToCart,
    removeItem,
    undoRemoveItem,
    updateItemQty,
    canIncrementItem,
    selectVaseForItem,
    getSelectedVase,
    updateAddonQty,
    toggleAddon,
    isAddonSelected,
    getAddonQuantity,
    openCart,
    closeCart,
    clearCart,
  }
}

// Shared cache for all addons (loaded once from CartModal)
export const allAddonsCache = ref<Array<{
  id: string
  name: string
  imageHash: string
  priceAmount: number
  icon: string
  type: string
}>>([])
