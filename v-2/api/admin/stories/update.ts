import { requireAccountRole } from '@app/auth'
import StoriesTable from '../../../tables/stories.table'

export const apiAdminStoriesUpdateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  const body = ctx.req.body
  const story = await StoriesTable.update(ctx, {
    id,
    label: body.label ?? '',
    coverHash: body.coverHash ?? '',
    slides: body.slides ?? [],
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
  })

  return { success: true, id: story.id }
})
