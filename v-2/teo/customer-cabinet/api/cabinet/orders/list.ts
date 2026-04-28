import Orders from "../../../../loyalty-service/tables/orders.table"

export const apiCabinetOrdersListRoute = app.get('/', async (ctx, req) => {
  const { customerId, limit = 20, offset = 0 } = req.query
  
  if (!customerId) {
    return { error: 'customerId required' }
  }
  
  const orders = await Orders.findAll(ctx, {
    where: { customerId },
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
    order: [{ createdAt: 'desc' }]
  })
  
  return orders.map(order => ({
    id: order.id,
    status: order.status,
    items: order.items ? JSON.parse(order.items) : [],
    subtotal: order.subtotal,
    deliveryCost: order.deliveryCost,
    discountAmount: order.discountAmount,
    bonusAmount: order.bonusAmount,
    bonusEarned: order.bonusEarned,
    total: order.total,
    deliveryAddress: order.deliveryAddress,
    deliveryDate: order.deliveryDate,
    createdAt: order.createdAt,
    paidAt: order.paidAt
  }))
})
