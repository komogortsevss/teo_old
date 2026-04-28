import { requireAccountRole } from '@app/auth'
import FlowersTable from '../../../tables/flowers.table'

export const apiAdminFlowersListRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const flowers = await FlowersTable.findAll(ctx, {
    limit: 1000,
    order: [{ sortOrder: 'asc' }]
  })

  return flowers.map(f => ({
    id: f.id,
    name: f.name,
    slug: f.slug,
    sortOrder: f.sortOrder ?? 0,
  }))
})
