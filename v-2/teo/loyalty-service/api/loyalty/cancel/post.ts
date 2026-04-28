import CustomerBonuses from "../../../tables/customerBonuses.table"
import BonusTransactions from "../../../tables/bonusTransactions.table"

export const apiLoyaltyCancelRoute = app.post('/', async (ctx, req) => {
  const { customerId, orderId } = req.body
  
  if (!customerId || !orderId) {
    return { error: 'customerId and orderId required' }
  }
  
  // Находим транзакции по заказу
  const earnTransaction = await BonusTransactions.findOneBy(ctx, { 
    customerId, 
    orderId, 
    type: 'earn' 
  })
  
  const spendTransaction = await BonusTransactions.findOneBy(ctx, { 
    customerId, 
    orderId, 
    type: 'spend' 
  })
  
  const results = {
    earnReturned: false,
    spendReturned: false
  }
  
  // Возвращаем начисленные бонусы (списываем их обратно)
  if (earnTransaction) {
    const bonusRecord = await CustomerBonuses.findOneBy(ctx, { customerId })
    if (bonusRecord) {
      const newBalance = Math.max(0, bonusRecord.balance - earnTransaction.amount)
      
      await CustomerBonuses.update(ctx, {
        id: bonusRecord.id,
        balance: newBalance,
        lastTransactionAt: new Date()
      })
      
      await BonusTransactions.create(ctx, {
        customerId,
        orderId,
        type: 'cancel',
        amount: -earnTransaction.amount,
        balanceAfter: newBalance,
        description: `Отмена начисления бонусов по заказу #${orderId}`,
        isExpired: false
      })
      
      results.earnReturned = true
    }
  }
  
  // Возвращаем списанные бонусы (начисляем обратно)
  if (spendTransaction) {
    const bonusRecord = await CustomerBonuses.findOneBy(ctx, { customerId })
    if (bonusRecord) {
      const newBalance = bonusRecord.balance + spendTransaction.amount
      const newTotalSpent = Math.max(0, bonusRecord.totalSpent - spendTransaction.amount)
      
      await CustomerBonuses.update(ctx, {
        id: bonusRecord.id,
        balance: newBalance,
        totalSpent: newTotalSpent,
        lastTransactionAt: new Date()
      })
      
      await BonusTransactions.create(ctx, {
        customerId,
        orderId,
        type: 'cancel',
        amount: spendTransaction.amount,
        balanceAfter: newBalance,
        description: `Возврат бонусов по отмене заказа #${orderId}`,
        isExpired: false
      })
      
      results.spendReturned = true
    }
  }
  
  return {
    success: true,
    ...results
  }
})
