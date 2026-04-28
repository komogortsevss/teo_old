import { requireAccountRole } from '@app/auth'
import BannersTable from '../../../tables/banners.table'

export const apiAdminBannersCreateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const body = ctx.req.body
  const banner = await BannersTable.create(ctx, {
    title: body.title ?? '',
    imageHash: body.imageHash ?? '',
    link: body.link ?? '',
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
  })

  return { success: true, id: banner.id }
})
