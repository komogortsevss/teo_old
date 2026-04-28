import LoyaltySettings from "../../../../../loyalty-service/tables/loyaltySettings.table"
import CustomerBonuses from "../../../../../loyalty-service/tables/customerBonuses.table"
import BonusTransactions from "../../../../../loyalty-service/tables/bonusTransactions.table"

export const apiAdminLoyaltyReportsSummaryRoute = app.get('/', async (ctx, req) => {
  const settings = await LoyaltySettings.findOneBy(ctx, {})
  
  // Общая статистика по балансам
  const allBalances = await CustomerBonuses.findAll(ctx, { limit: 1000 })
  
  const totalBonusesInCirculation = allBalances.reduce((sum, b) => sum + b.balance, 0)
  const totalEarnedLifetime = allBalances.reduce((sum, b) => sum + b.totalEarned, 0)
  const totalSpentLifetime = allBalances.reduce((sum, b) => sum + b.totalSpent, 0)
  const activeCustomers = allBalances.filter(b => b.balance > 0).length
  
  // Статистика за период (по умолчанию за последние 30 дней)
  const days = parseInt(req.query.days as string) || 30
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  const recentTransactions = await BonusTransactions.findAll(ctx, {
    where: { createdAt: { $gte: fromDate } },
    limit: 1000
  })
  
  const earnedInPeriod = recentTransactions
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const spentInPeriod = recentTransactions
    .filter(t => t.type === 'spend')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expiredInPeriod = recentTransactions
    .filter(t => t.type === 'expire')
    .reduce((sum, t) => sum + t.amount, 0)
  
  return {
    settings: {
      isActive: settings?.isActive ?? false,
      earnPercent: settings?.earnPercent ?? 0,
      maxSpendPercent: settings?.maxSpendPercent ?? 0,
      bonusLifetimeDays: settings?.bonusLifetimeDays ?? 0
    },
    summary: {
      totalBonusesInCirculation,
      totalEarnedLifetime,
      totalSpentLifetime,
      activeCustomers,
      totalCustomers: allBalances.length
    },
    periodStats: {
      days,
      earned: earnedInPeriod,
      spent: spentInPeriod,
      expired: expiredInPeriod
    }
  }
})
