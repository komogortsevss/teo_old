import { requireAccountRole } from '@app/auth'
import LoyaltySettings from "../../../tables/loyaltySettings.table"
import { Money } from "@app/heap"

export const apiLoyaltySettingsUpdateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Staff')
  
  const {
    isActive,
    earnPercent,
    maxSpendPercent,
    bonusLifetimeDays,
    minOrderAmountForEarn,
    welcomeBonus
  } = req.body
  
  let settings = await LoyaltySettings.findOneBy(ctx, {})
  
  const updateData: any = {
    isActive: isActive ?? settings?.isActive ?? false,
    earnPercent: earnPercent ?? settings?.earnPercent ?? 5,
    maxSpendPercent: maxSpendPercent ?? settings?.maxSpendPercent ?? 30,
    bonusLifetimeDays: bonusLifetimeDays ?? settings?.bonusLifetimeDays ?? 365,
    welcomeBonus: welcomeBonus ?? settings?.welcomeBonus ?? 0
  }
  
  if (minOrderAmountForEarn !== undefined && minOrderAmountForEarn !== null) {
    updateData.minOrderAmountForEarn = new Money(Number(minOrderAmountForEarn), 'RUB')
  } else if (settings?.minOrderAmountForEarn) {
    updateData.minOrderAmountForEarn = settings.minOrderAmountForEarn
  } else {
    updateData.minOrderAmountForEarn = new Money(1000, 'RUB')
  }
  
  if (settings) {
    settings = await LoyaltySettings.update(ctx, {
      id: settings.id,
      ...updateData
    })
  } else {
    settings = await LoyaltySettings.create(ctx, updateData)
  }
  
  return { success: true, settings }
})
