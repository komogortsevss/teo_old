import { requireAccountRole } from '@app/auth'
import BannersTable from '../../../tables/banners.table'

export const apiAdminBannersUpdateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  const body = ctx.req.body
  const banner = await BannersTable.update(ctx, {
    id,
    title: body.title ?? '',
    imageHash: body.imageHash ?? '',
    link: body.link ?? '',
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
  })

  return { success: true, id: banner.id }
})
