import { requireAccountRole } from '@app/auth'
import { Money } from '@app/heap'
import ProductsTable from '../../../tables/products.table'

export const apiAdminProductsCreateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const body = ctx.req.body
  const product = await ProductsTable.create(ctx, {
    name: body.name,
    slug: body.slug ?? '',
    description: body.description ?? '',
    category: body.categoryId,
    price: new Money(Number(body.priceAmount) || 0, 'RUB'),
    imageHash: body.imageHash ?? '',
    imageHashes: body.imageHashes ?? [],
    stemsCount: body.stemsCount || null,
    isAvailable: body.isAvailable ?? true,
    sortOrder: body.sortOrder ?? 0,
    flowers: body.flowers ?? [],
    composition: body.composition ?? [],
    availableAddons: body.availableAddons ?? [],
  })

  return { success: true, id: product.id }
})
