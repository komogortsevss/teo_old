import LoyaltySettings from "../../tables/loyaltySettings.table"
import CustomerBonuses from "../../tables/customerBonuses.table"
import BonusTransactions from "../../tables/bonusTransactions.table"
import Customers from "../../tables/customers.table"
import { findUserById } from '@app/auth'

// API для начисления бонусов при создании заказа
export const apiLoyaltyEarnOnOrderRoute = app.post('/', async (ctx, req) => {
  const { userId, orderId, total, status } = req.body
  
  if (!userId || !orderId) {
    return { success: false, error: 'Missing userId or orderId' }
  }
  
  // Находим или создаём клиента в loyalty системе
  let customer = await Customers.findOneBy(ctx, { maxId: userId })
  
  if (!customer) {
    // Подтягиваем данные системного пользователя
    let firstName = ''
    let lastName = ''
    let phone = ''
    let email = ''
    
    try {
      const user = await findUserById(ctx, userId)
      if (user) {
        firstName = user.firstName || ''
        lastName = user.lastName || ''
        phone = user.confirmedPhone || ''
        email = user.confirmedEmail || ''
      }
    } catch (e) {
      ctx.account.log('Failed to fetch user data', { level: 'warn', err: e })
    }
    
    customer = await Customers.create(ctx, {
      maxId: userId,
      firstName,
      lastName,
      phone,
      email,
      isActive: true,
      lastLoginAt: new Date()
    })
  } else {
    // Обновляем данные клиента при каждом заказе
    try {
      const user = await findUserById(ctx, userId)
      if (user) {
        await Customers.update(ctx, {
          id: customer.id,
          firstName: user.firstName || customer.firstName,
          lastName: user.lastName || customer.lastName,
          phone: user.confirmedPhone || customer.phone,
          email: user.confirmedEmail || customer.email,
          lastLoginAt: new Date()
        })
      }
    } catch (e) {
      ctx.account.log('Failed to update customer data', { level: 'warn', err: e })
    }
  }
  
  const customerId = customer.id
  
  // Проверяем настройки
  const settings = await LoyaltySettings.findOneBy(ctx, {})
  if (!settings || !settings.isActive) {
    return { success: false, error: 'Loyalty system inactive' }
  }
  
  // Проверяем минимальную сумму заказа
  const minOrderAmount = settings.minOrderAmountForEarn?.amount ?? 1000
  if (total < minOrderAmount) {
    return { success: false, error: 'Order amount below minimum', minOrderAmount }
  }
  
  // Проверяем, не были ли уже начислены бонусы
  const existingTransaction = await BonusTransactions.findOneBy(ctx, {
    customerId,
    orderId,
    type: 'earn'
  })
  
  if (existingTransaction) {
    return { success: false, error: 'Already earned for this order' }
  }
  
  // Рассчитываем бонусы
  const bonusAmount = Math.floor(total * settings.earnPercent / 100)
  
  if (bonusAmount <= 0) {
    return { success: false, error: 'Bonus amount is zero' }
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
  
  await BonusTransactions.create(ctx, {
    customerId,
    orderId,
    type: 'earn',
    amount: bonusAmount,
    balanceAfter: newBalance,
    description: `Начисление бонусов за заказ`,
    expiresAt,
    isExpired: false
  })
  
  return { 
    success: true, 
    bonusAmount, 
    newBalance,
    customerId,
    orderId
  }
})
