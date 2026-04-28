import { requireAccountRole } from '@app/auth'
import { Money } from '@app/heap'
import ProductsTable from '../../../tables/products.table'
import CategoriesTable from '../../../tables/categories.table'

export const apiAdminProductsListRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const products = await ProductsTable.findAll(ctx, {
    limit: 1000,
    order: [{ sortOrder: 'asc' }]
  })

  const categories = await CategoriesTable.findAll(ctx, { limit: 100 })
  const catMap = new Map(categories.map(c => [c.id, { name: c.name, slug: c.slug }]))

  return products.map(p => {
    const catId = typeof p.category === 'string' ? p.category : p.category?.id
    const catInfo = catMap.get(catId)
    
    return {
      id: p.id,
      name: p.name,
      slug: p.slug ?? '',
      description: p.description,
      categoryId: catId,
      categoryName: catInfo?.name || '',
      categorySlug: catInfo?.slug || '',
      priceAmount: p.price instanceof Money ? p.price.amount : (typeof p.price === 'number' ? p.price : 0),
      price: p.price instanceof Money ? p.price.amount.toLocaleString('ru-RU') + ' ₽' : '0 ₽',
      imageHash: p.imageHash,
      imageHashes: p.imageHashes ?? [],
      stemsCount: p.stemsCount,
      isAvailable: p.isAvailable ?? true,
      sortOrder: p.sortOrder ?? 0,
      flowers: p.flowers ?? [],
      composition: p.composition ?? [],
      availableAddons: p.availableAddons ?? [],
    }
  })
})
