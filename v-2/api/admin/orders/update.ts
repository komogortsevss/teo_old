import { requireAccountRole } from '@app/auth'
import OrdersTable from '../../../tables/orders.table'

export const apiAdminOrdersUpdateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const body = ctx.req.body
  const id = body.id as string
  if (!id) throw new Error('id is required')

  const order = await OrdersTable.update(ctx, {
    id,
    deliveryDate: body.deliveryDate,
    deliveryTime: body.deliveryTime,
    buyerName: body.buyerName,
    buyerPhone: body.buyerPhone,
    recipientName: body.recipientName,
    recipientPhone: body.recipientPhone,
    street: body.street,
    house: body.house,
    apartment: body.apartment,
    entrance: body.entrance,
    floor: body.floor,
    intercom: body.intercom,
    noteText: body.noteText,
    comment: body.comment,
  })

  return { success: true, id: order.id }
})
