import LoyaltySettings from "../../../tables/loyaltySettings.table"
import CustomerBonuses from "../../../tables/customerBonuses.table"
import BonusTransactions from "../../../tables/bonusTransactions.table"

export const apiLoyaltySpendRoute = app.post('/', async (ctx, req) => {
  const { customerId, orderId, bonusAmount, orderAmount } = req.body
  
  if (!customerId || !orderId || !bonusAmount) {
    return { error: 'customerId, orderId and bonusAmount required' }
  }
  
  const settings = await LoyaltySettings.findOneBy(ctx, {})
  
  if (!settings || !settings.isActive) {
    return { error: 'Loyalty system inactive' }
  }

  // Проверяем баланс
  let bonusRecord = await CustomerBonuses.findOneBy(ctx, { customerId })
  
  if (!bonusRecord || bonusRecord.balance < bonusAmount) {
    return { error: 'Insufficient bonus balance' }
  }
  
  // Проверяем максимальный процент списания
  const maxSpendByPercent = Math.floor(orderAmount * settings.maxSpendPercent / 100)
  if (bonusAmount > maxSpendByPercent) {
    return { error: `Cannot spend more than ${settings.maxSpendPercent}% of order amount` }
  }
  
  const newBalance = bonusRecord.balance - bonusAmount
  const newTotalSpent = bonusRecord.totalSpent + bonusAmount
  
  // Обновляем баланс
  await CustomerBonuses.update(ctx, {
    id: bonusRecord.id,
    balance: newBalance,
    totalSpent: newTotalSpent,
    lastTransactionAt: new Date()
  })
  
  // Создаём транзакцию
  const transaction = await BonusTransactions.create(ctx, {
    customerId,
    orderId,
    type: 'spend',
    amount: bonusAmount,
    balanceAfter: newBalance,
    description: `Списание бонусов за заказ #${orderId}`,
    isExpired: false
  })
  
  // Отправляем событие
  await ctx.account.captureCustomerEvent(ctx, {
    event: 'bonus_spent',
    customer: { displayName: '' },
    contacts: [{ type: 'user_id', value: customerId }],
    metricEventData: {
      action_param1: 'bonus_spent',
      action_param2: orderId,
      action_param3_int: bonusAmount,
      action_param4_float: orderAmount,
      action_param5_float: settings.maxSpendPercent
    }
  })
  
  return {
    success: true,
    bonusAmount,
    newBalance,
    transactionId: transaction.id
  }
})
