import LoyaltySettings from "../../../tables/loyaltySettings.table"
import CustomerBonuses from "../../../tables/customerBonuses.table"
import BonusTransactions from "../../../tables/bonusTransactions.table"

export const apiLoyaltyEarnRoute = app.post('/', async (ctx, req) => {
  const { customerId, orderId, orderAmount } = req.body
  
  if (!customerId || !orderId) {
    return { error: 'customerId and orderId required' }
  }
  
  const settings = await LoyaltySettings.findOneBy(ctx, {})
  
  if (!settings || !settings.isActive) {
    return { error: 'Loyalty system inactive' }
  }
  
  const minOrderAmount = settings.minOrderAmountForEarn?.amount ?? 1000
  if (orderAmount < minOrderAmount) {
    return { error: 'Order amount below minimum for earning bonuses' }
  }
  
  const bonusAmount = Math.floor(orderAmount * settings.earnPercent / 100)
  
  if (bonusAmount <= 0) {
    return { error: 'Bonus amount is zero' }
  }
  
  // Получаем или создаём запись баланса
  let bonusRecord = await CustomerBonuses.findOneBy(ctx, { customerId })
  
  if (!bonusRecord) {
    bonusRecord = await CustomerBonuses.create(ctx, {
      customerId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0
    })
  }
  
  const newBalance = bonusRecord.balance + bonusAmount
  const newTotalEarned = bonusRecord.totalEarned + bonusAmount
  
  // Обновляем баланс
  await CustomerBonuses.update(ctx, {
    id: bonusRecord.id,
    balance: newBalance,
    totalEarned: newTotalEarned,
    lastTransactionAt: new Date()
  })
  
  // Создаём транзакцию
  const expiresAt = settings.bonusLifetimeDays > 0 
    ? new Date(Date.now() + settings.bonusLifetimeDays * 24 * 60 * 60 * 1000)
    : null
  
  const transaction = await BonusTransactions.create(ctx, {
    customerId,
    orderId,
    type: 'earn',
    amount: bonusAmount,
    balanceAfter: newBalance,
    description: `Начисление бонусов за заказ #${orderId}`,
    expiresAt,
    isExpired: false
  })
  
  // Отправляем событие
  await ctx.account.captureCustomerEvent(ctx, {
    event: 'bonus_earned',
    customer: { displayName: '' },
    contacts: [{ type: 'user_id', value: customerId }],
    metricEventData: {
      action_param1: 'bonus_earned',
      action_param2: orderId,
      action_param3_int: bonusAmount,
      action_param4_float: orderAmount,
      action_param5_float: settings.earnPercent
    }
  })
  
  return {
    success: true,
    bonusAmount,
    newBalance,
    transactionId: transaction.id
  }
})
