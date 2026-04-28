import { requireAccountRole } from '@app/auth'
import ProductsTable from '../../../tables/products.table'

export const apiAdminProductsDeleteRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  await ProductsTable.delete(ctx, id)

  return { success: true }
})
