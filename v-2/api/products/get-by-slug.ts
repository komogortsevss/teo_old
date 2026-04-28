import ProductsTable from "../../tables/products.table"
import StockTable from "../../tables/stock.table"
import CategoriesTable from "../../tables/categories.table"
import { mapProductToDto, calcMaxBouquets } from "../../shared/mapProduct"

export const apiProductGetBySlugRoute = app.get('/', async (ctx, req) => {
  const categorySlug = req.query.category as string
  const productSlug = req.query.slug as string

  if (!categorySlug || !productSlug) {
    return null
  }

  // Находим категорию по slug
  const category = await CategoriesTable.findOneBy(ctx, { slug: categorySlug })
  if (!category) {
    return null
  }

  // Находим товар по slug и категории
  const product = await ProductsTable.findOneBy(ctx, {
    slug: productSlug,
    category: category.id,
  })

  if (!product) {
    return null
  }

  // Загружаем остатки для расчета maxBouquets
  const stock = await StockTable.findAll(ctx, { limit: 1000 })
  const stockMap = new Map<string, number>()
  for (const s of stock) {
    const fid = typeof s.flower === 'string' ? s.flower : s.flower?.id
    if (fid) stockMap.set(fid, s.quantity || 0)
  }

  const comp = product.composition as Array<{ flowerId: string; quantity: number }> | null
  const maxBouquets = calcMaxBouquets(comp, stockMap)

  return mapProductToDto(ctx, product, maxBouquets, stockMap)
})
