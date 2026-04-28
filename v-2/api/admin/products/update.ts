import { requireAccountRole } from '@app/auth'
import { Money } from '@app/heap'
import ProductsTable from '../../../tables/products.table'

export const apiAdminProductsUpdateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  const body = ctx.req.body
  
  // Получаем текущий товар для сохранения существующего slug если не передан новый
  const existingProduct = await ProductsTable.findById(ctx, id)
  if (!existingProduct) throw new Error('Product not found')
  
  // Если slug не передан или пустой, сохраняем существующий
  const slug = body.slug !== undefined && body.slug !== null 
    ? body.slug 
    : (existingProduct.slug ?? '')
  
  const product = await ProductsTable.update(ctx, {
    id,
    name: body.name,
    slug: slug,
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
