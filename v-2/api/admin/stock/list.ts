import { requireAccountRole } from '@app/auth'
import StockTable from '../../../tables/stock.table'

export const apiAdminStockListRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const stock = await StockTable.findAll(ctx, {
    limit: 1000,
  })

  return stock.map(s => ({
    id: s.id,
    flower: typeof s.flower === 'string' ? s.flower : s.flower?.id,
    quantity: s.quantity ?? 0,
  }))
})
