import CustomerBonuses from "../../../tables/customerBonuses.table"
import Customers from "../../../tables/customers.table"

// API для получения баланса по userId (maxId системного пользователя)
export const apiLoyaltyBalanceByUserRoute = app.get('/', async (ctx, req) => {
  const userId = req.query.userId || req.body?.userId
  
  if (!userId) {
    return { error: 'userId required' }
  }
  
  // Находим клиента по maxId
  const customer = await Customers.findOneBy(ctx, { maxId: userId })
  
  if (!customer) {
    // Клиент ещё не создан, возвращаем нулевой баланс
    return {
      customerId: null,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastTransactionAt: null
    }
  }
  
  const customerId = customer.id
  
  let bonusRecord = await CustomerBonuses.findOneBy(ctx, { customerId })
  
  if (!bonusRecord) {
    bonusRecord = await CustomerBonuses.create(ctx, {
      customerId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0
    })
  }
  
  return {
    customerId: customerId,
    balance: bonusRecord.balance,
    totalEarned: bonusRecord.totalEarned,
    totalSpent: bonusRecord.totalSpent,
    lastTransactionAt: bonusRecord.lastTransactionAt
  }
})
