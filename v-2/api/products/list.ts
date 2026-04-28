import ProductsTable from '../../tables/products.table'
import StockTable from '../../tables/stock.table'
import CategoriesTable from '../../tables/categories.table'
import { mapProductToDto, calcMaxBouquets, type ProductDto } from '../../shared/mapProduct'
export type { ProductDto } from '../../shared/mapProduct'

export const apiProductsListRoute = app.get('/', async (ctx, req) => {
  const categoryId = req.query.categoryId as string | undefined

  const whereAvailable: any = { isAvailable: true }
  const whereUnavailable: any = { isAvailable: false }
  if (categoryId) {
    whereAvailable.category = categoryId
    whereUnavailable.category = categoryId
  }

  const [available, unavailable, stock, categories] = await Promise.all([
    ProductsTable.findAll(ctx, { where: whereAvailable, order: [{ sortOrder: 'asc' }], limit: 200 }),
    ProductsTable.findAll(ctx, { where: whereUnavailable, order: [{ sortOrder: 'asc' }], limit: 200 }),
    StockTable.findAll(ctx, { limit: 1000 }),
    CategoriesTable.findAll(ctx, { limit: 100 }),
  ])

  const stockMap = new Map<string, number>()
  for (const s of stock) {
    const fid = typeof s.flower === 'string' ? s.flower : s.flower?.id
    if (fid) stockMap.set(fid, s.quantity || 0)
  }

  const categoriesMap = new Map<string, { slug: string; name: string }>()
  for (const c of categories) {
    categoriesMap.set(c.id, { slug: c.slug, name: c.name })
  }

  const products = [...available, ...unavailable]

  return products.map(p => {
    const comp = p.composition as Array<{ flowerId: string; quantity: number }> | null
    const maxBouquets = calcMaxBouquets(comp, stockMap)
    return mapProductToDto(ctx, p, maxBouquets, stockMap, categoriesMap)
  })
})
