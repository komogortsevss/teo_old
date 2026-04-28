import { requireAccountRole } from '@app/auth'
import StoriesTable from '../../../tables/stories.table'

export const apiAdminStoriesDeleteRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  await StoriesTable.delete(ctx, id)

  return { success: true }
})
