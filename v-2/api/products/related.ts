import ProductsTable from '../../tables/products.table'
import StockTable from '../../tables/stock.table'
import CategoriesTable from '../../tables/categories.table'
import { mapProductToDto, calcMaxBouquets } from '../../shared/mapProduct'

export const apiProductsRelatedRoute = app.get('/', async (ctx, req) => {
  const productId = req.query.productId as string
  if (!productId) return []

  const product = await ProductsTable.findById(ctx, productId)
  if (!product) return []

  const comp = product.composition as Array<{ flowerId: string; quantity: number }> | null
  const flowerIds: string[] = Array.isArray(comp) ? comp.map(c => c.flowerId).filter(Boolean) : []

  if (flowerIds.length === 0) return []

  const currentCategoryId = (product as any).category?.id
  if (!currentCategoryId) return []

  const [currentCategory, allCategories, stock] = await Promise.all([
    CategoriesTable.findById(ctx, currentCategoryId),
    CategoriesTable.findAll(ctx, { limit: 100 }),
    StockTable.findAll(ctx, { limit: 1000 }),
  ])
  if (!currentCategory) return []

  const stockMap = new Map<string, number>()
  for (const s of stock) {
    const fid = typeof s.flower === 'string' ? s.flower : s.flower?.id
    if (fid) stockMap.set(fid, s.quantity || 0)
  }

  const currentSortOrder = currentCategory.sortOrder ?? 0
  const higherCategoryIds = allCategories
    .filter(c => (c.sortOrder ?? 0) > currentSortOrder)
    .map(c => c.id)

  if (higherCategoryIds.length === 0) return []

  const candidates = await ProductsTable.findAll(ctx, {
    where: {
      category: higherCategoryIds,
      isAvailable: true,
    },
    order: [{ sortOrder: 'asc' }],
    limit: 200,
  })

  const flowerIdSet = new Set(flowerIds)

  const related = candidates.filter(p => {
    const pComp = p.composition as Array<{ flowerId: string; quantity: number }> | null
    if (Array.isArray(pComp) && pComp.length > 0) {
      return pComp.some(c => flowerIdSet.has(c.flowerId))
    }
    return false
  })

  const categoriesMap = new Map<string, { slug: string; name: string }>()
  for (const c of allCategories) {
    categoriesMap.set(c.id, { slug: c.slug, name: c.name })
  }

  return related.slice(0, 8).map(p => {
    const pComp = p.composition as Array<{ flowerId: string; quantity: number }> | null
    const maxBouquets = calcMaxBouquets(pComp, stockMap)
    return mapProductToDto(ctx, p, maxBouquets, stockMap, categoriesMap)
  })
})
