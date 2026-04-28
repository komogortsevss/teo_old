import LoyaltySettings from "../../../tables/loyaltySettings.table"
import CustomerBonuses from "../../../tables/customerBonuses.table"
import { Money } from "@app/heap"

export const apiLoyaltyCalculateRoute = app.post('/', async (ctx, req) => {
  const { customerId, subtotal, discountAmount = 0, bonusToSpend = 0 } = req.body
  
  const settings = await LoyaltySettings.findOneBy(ctx, {})
  
  if (!settings || !settings.isActive) {
    return {
      isActive: false,
      canEarn: false,
      canSpend: false,
      message: 'Система лояльности временно недоступна'
    }
  }
  
  const orderAmount = subtotal - discountAmount
  
  // Расчёт начисляемых бонусов
  let earnableBonuses = 0
  let canEarn = false
  
  const minOrderAmount = settings.minOrderAmountForEarn?.amount ?? 1000
  if (orderAmount >= minOrderAmount) {
    earnableBonuses = Math.floor(orderAmount * settings.earnPercent / 100)
    canEarn = earnableBonuses > 0
  }
  
  // Расчёт максимально доступных для списания бонусов
  let maxSpendableBonuses = 0
  let canSpend = false
  let currentBalance = 0
  
  if (customerId) {
    const bonusRecord = await CustomerBonuses.findOneBy(ctx, { customerId })
    if (bonusRecord) {
      currentBalance = bonusRecord.balance
      const maxSpendByPercent = Math.floor(orderAmount * settings.maxSpendPercent / 100)
      maxSpendableBonuses = Math.min(currentBalance, maxSpendByPercent)
      canSpend = maxSpendableBonuses > 0
    }
  }
  
  // Валидация запрошенного количества бонусов
  const validBonusToSpend = Math.min(bonusToSpend, maxSpendableBonuses)
  
  // Итоговая сумма
  const finalAmount = Math.max(0, orderAmount - validBonusToSpend)
  
  return {
    isActive: true,
    canEarn,
    canSpend,
    earnableBonuses,
    currentBalance,
    maxSpendableBonuses,
    requestedBonusSpend: bonusToSpend,
    validBonusToSpend,
    subtotal,
    discountAmount,
    bonusDiscount: validBonusToSpend,
    finalAmount,
    minOrderAmountForEarn: minOrderAmount,
    earnPercent: settings.earnPercent,
    maxSpendPercent: settings.maxSpendPercent
  }
})
