import { requireAccountRole } from '@app/auth'
import BannersTable from '../../../tables/banners.table'

export const apiAdminBannersDeleteRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  await BannersTable.delete(ctx, id)

  return { success: true }
})
