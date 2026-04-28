import { requireAccountRole } from '@app/auth'
import AddonsTable from '../../../tables/addons.table'

export const apiAdminAddonsDeleteRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  await AddonsTable.delete(ctx, id)

  return { success: true }
})
