import { requireAccountRole } from '@app/auth'
import OrdersTable from '../../../tables/orders.table'

export const apiAdminOrdersDeleteRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const body = ctx.req.body
  const id = body.id as string
  if (!id) throw new Error('id is required')

  await OrdersTable.delete(ctx, id)

  return { success: true }
})
