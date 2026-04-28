import ProductsTable from '../../tables/products.table'
import StockTable from '../../tables/stock.table'
import CategoriesTable from '../../tables/categories.table'
import { mapProductToDto, calcMaxBouquets } from '../../shared/mapProduct'

export const apiProductGetRoute = app.get('/', async (ctx, req) => {
  const id = req.query.id as string
  if (!id) return null

  const [p, stock, categories] = await Promise.all([
    ProductsTable.findById(ctx, id),
    StockTable.findAll(ctx, { limit: 1000 }),
    CategoriesTable.findAll(ctx, { limit: 100 }),
  ])
  if (!p) return null

  const stockMap = new Map<string, number>()
  for (const s of stock) {
    const fid = typeof s.flower === 'string' ? s.flower : s.flower?.id
    if (fid) stockMap.set(fid, s.quantity || 0)
  }

  const categoriesMap = new Map<string, { slug: string; name: string }>()
  for (const c of categories) {
    categoriesMap.set(c.id, { slug: c.slug, name: c.name })
  }

  const comp = p.composition as Array<{ flowerId: string; quantity: number }> | null
  const maxBouquets = calcMaxBouquets(comp, stockMap)

  return mapProductToDto(ctx, p, maxBouquets, stockMap, categoriesMap)
})
