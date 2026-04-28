import { requireAccountRole } from '@app/auth'
import StockTable from '../../../tables/stock.table'
import { apiCheckAvailabilityJobRoute } from '../../check-availability'

export const apiAdminStockUpdateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const body = ctx.req.body
  const flowerId = body.flowerId as string
  const quantity = Number(body.quantity) ?? 0
  if (!flowerId) throw new Error('flowerId is required')

  const existing = await StockTable.findAll(ctx, {
    limit: 1,
    where: { flower: flowerId }
  })

  if (existing.length > 0) {
    await StockTable.update(ctx, {
      id: existing[0].id,
      quantity,
    })
  } else {
    await StockTable.create(ctx, {
      flower: flowerId,
      quantity,
    })
  }

  apiCheckAvailabilityJobRoute.scheduleJobAsap(ctx, {})

  return { success: true }
})
