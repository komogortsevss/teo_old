import { requireAccountRole } from '@app/auth'
import OrdersTable from '../../../tables/orders.table'

export const apiAdminOrdersListRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const orders = await OrdersTable.findAll(ctx, {
    limit: 1000,
    order: [{ createdAt: 'desc' }]
  })

  return orders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber ?? '',
    userId: o.userId,
    deliveryDate: o.deliveryDate,
    deliveryTime: o.deliveryTime,
    buyerName: o.buyerName ?? '',
    buyerPhone: o.buyerPhone ?? '',
    forOther: o.forOther ?? false,
    recipientName: o.recipientName,
    recipientPhone: o.recipientPhone,
    clarifyAddressWithRecipient: o.clarifyAddressWithRecipient ?? false,
    street: o.street,
    house: o.house,
    apartment: o.apartment,
    entrance: o.entrance,
    floor: o.floor,
    intercom: o.intercom,
    hasNote: o.hasNote ?? false,
    noteText: o.noteText,
    comment: o.comment,
    items: o.items ?? [],
    addons: o.addons ?? [],
    totalPrice: o.totalPrice ?? 0,
    status: o.status ?? 'new',
    createdAt: o.createdAt,
  }))
})
