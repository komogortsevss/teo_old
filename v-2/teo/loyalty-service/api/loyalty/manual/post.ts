import { requireAccountRole } from '@app/auth'
import CustomerBonuses from "../../../tables/customerBonuses.table"
import BonusTransactions from "../../../tables/bonusTransactions.table"
import LoyaltySettings from "../../../tables/loyaltySettings.table"

export const apiLoyaltyManualRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')
  
  const { customerId, type, amount, description, expiresAt } = req.body
  
  if (!customerId || !type || !amount) {
    return { error: 'customerId, type and amount required' }
  }
  
  if (!['earn', 'spend'].includes(type)) {
    return { error: 'type must be earn or spend' }
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
  
  let newBalance = bonusRecord.balance
  let newTotalEarned = bonusRecord.totalEarned
  let newTotalSpent = bonusRecord.totalSpent
  
  if (type === 'earn') {
    newBalance += amount
    newTotalEarned += amount
  } else {
    if (bonusRecord.balance < amount) {
      return { error: 'Insufficient bonus balance' }
    }
    newBalance -= amount
    newTotalSpent += amount
  }
  
  // Обновляем баланс
  await CustomerBonuses.update(ctx, {
    id: bonusRecord.id,
    balance: newBalance,
    totalEarned: newTotalEarned,
    totalSpent: newTotalSpent,
    lastTransactionAt: new Date()
  })
  
  // Создаём транзакцию
  const settings = await LoyaltySettings.findOneBy(ctx, {})
  const defaultExpiresAt = settings?.bonusLifetimeDays > 0 && type === 'earn'
    ? new Date(Date.now() + settings.bonusLifetimeDays * 24 * 60 * 60 * 1000)
    : null
  
  const transaction = await BonusTransactions.create(ctx, {
    customerId,
    orderId: null,
    type: 'manual',
    amount: type === 'earn' ? amount : -amount,
    balanceAfter: newBalance,
    description: description || `Ручное ${type === 'earn' ? 'начисление' : 'списание'} бонусов`,
    expiresAt: expiresAt ? new Date(expiresAt) : defaultExpiresAt,
    isExpired: false,
    adminId: ctx.user?.id
  })
  
  return {
    success: true,
    type,
    amount,
    newBalance,
    transactionId: transaction.id
  }
})
