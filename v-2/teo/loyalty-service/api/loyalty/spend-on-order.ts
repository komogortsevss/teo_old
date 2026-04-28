import LoyaltySettings from "../../tables/loyaltySettings.table"
import CustomerBonuses from "../../tables/customerBonuses.table"
import BonusTransactions from "../../tables/bonusTransactions.table"
import Customers from "../../tables/customers.table"

// API для списания бонусов при создании заказа
export const apiLoyaltySpendOnOrderRoute = app.post('/', async (ctx, req) => {
  const { userId, orderId, bonusesToSpend, subtotal } = req.body
  
  if (!userId || !orderId || !bonusesToSpend || bonusesToSpend <= 0) {
    return { success: false, error: 'Missing required parameters' }
  }
  
  // Находим клиента
  const customer = await Customers.findOneBy(ctx, { maxId: userId })
  
  if (!customer) {
    return { success: false, error: 'Customer not found' }
  }
  
  const customerId = customer.id
  
  // Проверяем настройки
  const settings = await LoyaltySettings.findOneBy(ctx, {})
  if (!settings || !settings.isActive) {
    return { success: false, error: 'Loyalty system inactive' }
  }
  
  // Проверяем минимальную сумму заказа для списания
  const minOrderAmount = settings.minOrderAmountForSpend?.amount ?? 1000
  if (subtotal < minOrderAmount) {
    return { success: false, error: 'Order amount below minimum for spend' }
  }
  
  // Проверяем максимальный процент списания
  const maxSpendPercent = settings.maxSpendPercent ?? 100
  const maxSpendAmount = Math.floor(subtotal * maxSpendPercent / 100)
  
  if (bonusesToSpend > maxSpendAmount) {
    return { success: false, error: 'Bonuses exceed max spend amount', maxSpendAmount }
  }
  
  // Получаем запись баланса
  const bonusRecord = await CustomerBonuses.findOneBy(ctx, { customerId })
  
  if (!bonusRecord || bonusRecord.balance < bonusesToSpend) {
    return { success: false, error: 'Insufficient bonus balance' }
  }
  
  // Проверяем, не были ли уже списаны бонусы
  const existingTransaction = await BonusTransactions.findOneBy(ctx, {
    customerId,
    orderId,
    type: 'spend'
  })
  
  if (existingTransaction) {
    return { success: false, error: 'Already spent for this order' }
  }
  
  const newBalance = bonusRecord.balance - bonusesToSpend
  const newTotalSpent = bonusRecord.totalSpent + bonusesToSpend
  
  // Обновляем баланс
  await CustomerBonuses.update(ctx, {
    id: bonusRecord.id,
    balance: newBalance,
    totalSpent: newTotalSpent,
    lastTransactionAt: new Date()
  })
  
  // Создаём транзакцию списания
  await BonusTransactions.create(ctx, {
    customerId,
    orderId,
    type: 'spend',
    amount: -bonusesToSpend,
    balanceAfter: newBalance,
    description: `Списание бонусов за заказ`,
    expiresAt: null,
    isExpired: false
  })
  
  return { 
    success: true, 
    bonusesSpent: bonusesToSpend,
    newBalance,
    customerId,
    orderId
  }
})
