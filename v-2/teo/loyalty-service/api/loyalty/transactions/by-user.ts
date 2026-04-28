import BonusTransactions from "../../../tables/bonusTransactions.table"
import Customers from "../../../tables/customers.table"

// API для получения транзакций по userId (maxId системного пользователя)
export const apiLoyaltyTransactionsByUserRoute = app.get('/', async (ctx, req) => {
  const userId = req.query.userId || req.body?.userId
  const limit = Math.min(parseInt(req.query.limit || '50'), 100)
  
  if (!userId) {
    return { error: 'userId required' }
  }
  
  // Находим клиента по maxId
  const customer = await Customers.findOneBy(ctx, { maxId: userId })
  
  if (!customer) {
    return []
  }
  
  const customerId = customer.id
  
  const transactions = await BonusTransactions.findAll(ctx, {
    where: { customerId },
    limit,
    order: [{ createdAt: 'desc' }]
  })
  
  // Добавляем orderNumber к транзакциям
  const ordersTable = await import('../../../../../tables/orders.table')
  const Orders = ordersTable.default
  
  const ordersIds = transactions
    .filter(t => t.orderId)
    .map(t => t.orderId)
  
  const orders = ordersIds.length > 0 
    ? await Orders.findAll(ctx, { 
        where: { id: ordersIds },
        limit: ordersIds.length
      })
    : []
  
  const ordersMap = new Map(orders.map(o => [o.id, o]))
  
  return transactions.map(tx => ({
    ...tx,
    orderNumber: tx.orderId ? ordersMap.get(tx.orderId)?.orderNumber : null
  }))
})
