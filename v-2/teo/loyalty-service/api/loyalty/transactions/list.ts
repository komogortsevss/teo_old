import BonusTransactions from "../../../tables/bonusTransactions.table"

export const apiLoyaltyTransactionsListRoute = app.get('/', async (ctx, req) => {
  const { customerId, limit = 50, offset = 0 } = req.query
  
  if (!customerId) {
    return { error: 'customerId required' }
  }
  
  const transactions = await BonusTransactions.findAll(ctx, {
    where: { customerId },
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
    order: [{ createdAt: 'desc' }]
  })
  
  return transactions
})
