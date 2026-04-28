import CustomerBonuses from "../../../tables/customerBonuses.table"
import Customers from "../../../tables/customers.table"

export const apiLoyaltyBalanceGetRoute = app.get('/', async (ctx, req) => {
  const customerId = req.query.customerId || req.body?.customerId
  
  if (!customerId) {
    return { error: 'customerId required' }
  }
  
  // Проверяем существование клиента
  const customer = await Customers.findById(ctx, customerId)
  if (!customer) {
    return { error: 'Customer not found' }
  }
  
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
    customerId: bonusRecord.customerId?.id || customerId,
    balance: bonusRecord.balance,
    totalEarned: bonusRecord.totalEarned,
    totalSpent: bonusRecord.totalSpent,
    lastTransactionAt: bonusRecord.lastTransactionAt
  }
})
