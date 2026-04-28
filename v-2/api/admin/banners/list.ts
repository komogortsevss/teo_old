import { requireAccountRole } from '@app/auth'
import BannersTable from '../../../tables/banners.table'

export const apiAdminBannersListRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const banners = await BannersTable.findAll(ctx, {
    limit: 1000,
    order: [{ sortOrder: 'asc' }]
  })

  return banners.map(b => ({
    id: b.id,
    title: b.title,
    imageHash: b.imageHash,
    link: b.link,
    sortOrder: b.sortOrder ?? 0,
    isActive: b.isActive ?? true,
  }))
})
