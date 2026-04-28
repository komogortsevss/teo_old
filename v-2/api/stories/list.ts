import Stories from '../../tables/stories.table'

export interface StorySlide {
  imageHash: string
  text: string
  price: string
}

export interface StoryDto {
  id: string
  label: string
  coverHash: string
  slides: StorySlide[]
  sortOrder: number
  isActive: boolean
}

export const apiStoriesListRoute = app.get('/', async (ctx, req) => {
  const stories = await Stories.findAll(ctx, {
    where: { isActive: true },
    order: [{ sortOrder: 'asc' }],
    limit: 50,
  })

  return stories.map(s => ({
    id: s.id,
    label: s.label,
    coverHash: s.coverHash,
    slides: (() => { if (!s.slides) return []; if (typeof s.slides === 'string') { try { return JSON.parse(s.slides) } catch { return [] } } return Array.isArray(s.slides) ? s.slides : [] })(),
    sortOrder: s.sortOrder ?? 0,
    isActive: s.isActive,
  })) as StoryDto[]
})
