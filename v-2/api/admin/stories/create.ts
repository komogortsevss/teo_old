import { requireAccountRole } from '@app/auth'
import StoriesTable from '../../../tables/stories.table'

export const apiAdminStoriesCreateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const body = ctx.req.body
  const story = await StoriesTable.create(ctx, {
    label: body.label ?? '',
    coverHash: body.coverHash ?? '',
    slides: body.slides ?? [],
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
  })

  return { success: true, id: story.id }
})
