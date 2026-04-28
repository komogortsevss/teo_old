import { requireAccountRole } from '@app/auth'
import StoriesTable from '../../../tables/stories.table'

export const apiAdminStoriesListRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const stories = await StoriesTable.findAll(ctx, {
    limit: 1000,
    order: [{ sortOrder: 'asc' }]
  })

  return stories.map(s => ({
    id: s.id,
    label: s.label,
    coverHash: s.coverHash,
    slides: s.slides ?? [],
    sortOrder: s.sortOrder ?? 0,
    isActive: s.isActive ?? true,
  }))
})
