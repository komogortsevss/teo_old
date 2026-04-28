import { requireAccountRole } from '@app/auth'
import FlowersTable from '../../../tables/flowers.table'

export const apiAdminFlowersDeleteRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  await FlowersTable.delete(ctx, id)

  return { success: true }
})
