import { requireAccountRole } from '@app/auth'
import HeroTable from '../../../tables/hero.table'

export const apiAdminHeroDeleteRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  await HeroTable.delete(ctx, id)

  return { success: true }
})
