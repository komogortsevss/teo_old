import LoyaltySettings from "../../../tables/loyaltySettings.table"

export const apiLoyaltySettingsGetRoute = app.get('/', async (ctx, req) => {
  const settings = await LoyaltySettings.findOneBy(ctx, {})
  
  if (!settings) {
    // Возвращаем дефолтные настройки
    return {
      isActive: false,
      earnPercent: 5,
      maxSpendPercent: 30,
      bonusLifetimeDays: 365,
      minOrderAmountForEarn: { amount: 1000, currency: 'RUB' },
      welcomeBonus: 0
    }
  }
  
  return settings
})
