// @shared

import { Money } from '@app/heap'

export interface CompositionItem {
  flowerId: string
  quantity: number
}

export interface AddonDto {
  id: string
  name: string
  imageHash: string
  priceAmount: number
  icon: string
  type: string
  sortOrder: number
  isActive: boolean
}

export interface VaseRule {
  addonId: string
  minStems: number
  maxStems: number | null
  quantity: number
}

export type AvailableAddonEntry = { addonId: string } | VaseRule

export interface ProductDto {
  id: string
  name: string
  slug: string | null
  description: string
  categoryId: string | null
  categorySlug: string | null
  price: string
  priceAmount: number
  imageHash: string
  imageHashes: string[]
  stemsCount: number | null
  isAvailable: boolean
  sortOrder: number
  flowers: string[]
  maxBouquets: number | null
  composition: CompositionItem[]
  availableAddons: AvailableAddonEntry[]
  stockForFlowers?: Record<string, number> // Реальные остатки на складе для цветов из состава
}

export function mapProductToDto(
  ctx: any, 
  p: any, 
  maxBouquets?: number | null, 
  stockMap?: Map<string, number>,
  categoriesMap?: Map<string, { slug: string; name: string }>
): ProductDto {
  const mainHash: string = p.imageHash ?? ''
  const extraHashes: string[] = Array.isArray(p.imageHashes) ? p.imageHashes : []
  const allHashes = mainHash
    ? [mainHash, ...extraHashes.filter((h: string) => h && h !== mainHash)]
    : extraHashes

  const composition: CompositionItem[] = Array.isArray(p.composition) ? p.composition : []

  const rawAddons = Array.isArray(p.availableAddons) ? p.availableAddons : []
  const normalizedAddons: AvailableAddonEntry[] = rawAddons.map((a: any) => {
    if (typeof a === 'string') return { addonId: a }
    if (a && a.addonId) return a
    return { addonId: String(a) }
  })

  // Собираем реальные остатки для цветов из состава
  const stockForFlowers: Record<string, number> = {}
  if (stockMap && composition.length > 0) {
    for (const c of composition) {
      stockForFlowers[c.flowerId] = stockMap.get(c.flowerId) || 0
    }
  }

  // Получаем slug категории
  const categoryId = p.category?.id ?? null
  const categorySlug = categoryId && categoriesMap ? categoriesMap.get(categoryId)?.slug ?? null : null

  return {
    id: p.id,
    name: p.name,
    slug: p.slug ?? null,
    description: p.description,
    categoryId,
    categorySlug,
    price: p.price?.format ? (p.price as Money).format(ctx, { maximumFractionDigits: 0 }) : String(p.price ?? 0),
    priceAmount: p.price?.amount ?? 0,
    imageHash: mainHash,
    imageHashes: allHashes,
    stemsCount: p.stemsCount ?? null,
    isAvailable: p.isAvailable ?? false,
    sortOrder: p.sortOrder ?? 0,
    flowers: Array.isArray(p.flowers) ? p.flowers : [],
    maxBouquets: maxBouquets !== undefined ? maxBouquets : null,
    composition,
    availableAddons: normalizedAddons,
    stockForFlowers: Object.keys(stockForFlowers).length > 0 ? stockForFlowers : undefined,
  }
}

export function calcMaxBouquets(
  composition: Array<{ flowerId: string; quantity: number }> | null,
  stockMap: Map<string, number>
): number | null {
  if (!composition || composition.length === 0) return null

  let minBouquets = Infinity
  for (const item of composition) {
    const stockQty = stockMap.get(item.flowerId) || 0
    const possible = Math.floor(stockQty / item.quantity)
    if (possible < minBouquets) minBouquets = possible
  }

  return minBouquets === Infinity ? null : minBouquets
}
