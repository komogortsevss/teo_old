import { requireAccountRole } from '@app/auth'
import OrdersTable from '../../../tables/orders.table'

export const apiAdminOrdersUpdateStatusRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const body = ctx.req.body
  const id = body.id as string
  const status = body.status as string
  if (!id) throw new Error('id is required')
  if (!status) throw new Error('status is required')

  // Новая шкала статусов: 4 этапа
  // new (Принят) → assembled (Собран) → with_courier (У курьера) → delivered (Доставлен)
  // Обратная совместимость: processing → Принят, delivering/completed → У курьера/Доставлен
  const validStatuses = ['new', 'processing', 'assembled', 'with_courier', 'delivering', 'delivered', 'completed', 'cancelled']
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status: ' + status)
  }

  const order = await OrdersTable.update(ctx, { id, status })

  return { success: true, id: order.id, status }
})
