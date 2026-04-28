import { requireAccountRole } from '@app/auth'
import FlowersTable from '../../../tables/flowers.table'

export const apiAdminFlowersCreateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const body = ctx.req.body
  const flower = await FlowersTable.create(ctx, {
    name: body.name,
    slug: body.slug,
    sortOrder: body.sortOrder ?? 0,
  })

  return { success: true, id: flower.id }
})
