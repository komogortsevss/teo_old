import LoyaltySettings from "../../loyalty-service/tables/loyaltySettings.table"
import BonusTransactions from "../../loyalty-service/tables/bonusTransactions.table"
import CustomerBonuses from "../../loyalty-service/tables/customerBonuses.table"

// Job: Проверка и аннулирование просроченных бонусов
export const jobBonusExpiration = app.job('/bonus-expiration', async (ctx, params) => {
  const settings = await LoyaltySettings.findOneBy(ctx, {})
  
  if (!settings || !settings.isActive || !settings.bonusLifetimeDays) {
    return { processed: 0 }
  }
  
  // Находим все неистёкшие транзакции с истёкшим сроком
  const now = new Date()
  const expiredTransactions = await BonusTransactions.findAll(ctx, {
    where: {
      type: 'earn',
      isExpired: false,
      expiresAt: { $lt: now }
    },
    limit: 1000
  })
  
  let processed = 0
  
  for (const transaction of expiredTransactions) {
    const bonusRecord = await CustomerBonuses.findOneBy(ctx, { 
      customerId: transaction.customerId 
    })
    
    if (bonusRecord) {
      const newBalance = Math.max(0, bonusRecord.balance - transaction.amount)
      
      await CustomerBonuses.update(ctx, {
        id: bonusRecord.id,
        balance: newBalance,
        lastTransactionAt: new Date()
      })
      
      // Помечаем транзакцию как истёкшую
      await BonusTransactions.update(ctx, {
        id: transaction.id,
        isExpired: true
      })
      
      // Создаём транзакцию аннулирования
      await BonusTransactions.create(ctx, {
        customerId: transaction.customerId,
        orderId: null,
        type: 'expire',
        amount: transaction.amount,
        balanceAfter: newBalance,
        description: `Аннулирование просроченных бонусов (${transaction.amount})`,
        isExpired: true
      })
      
      // Отправляем событие
      await ctx.account.captureCustomerEvent(ctx, {
        event: 'bonus_expired',
        customer: { displayName: '' },
        contacts: [{ type: 'user_id', value: transaction.customerId }],
        metricEventData: {
          action_param1: 'bonus_expired',
          action_param3_int: transaction.amount
        }
      })
      
      processed++
    }
  }
  
  ctx.account.log('Bonus expiration job completed', {
    level: 'info',
    json: { processed }
  })
  
  return { processed }
})
