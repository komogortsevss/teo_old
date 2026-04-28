import { requireAccountRole } from '@app/auth'
import HeroTable from '../../../tables/hero.table'

export const apiAdminHeroGetRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const heroes = await HeroTable.findAll(ctx, {
    limit: 1000,
    order: [{ sortOrder: 'asc' }]
  })

  return heroes.map(h => ({
    id: h.id,
    title: h.title,
    subtitle: h.subtitle,
    buttonText: h.buttonText,
    buttonLink: h.buttonLink,
    buttonPosition: h.buttonPosition ?? 'center-center',
    imageHash: h.imageHash,
    mobileImageHash: h.mobileImageHash,
    sortOrder: h.sortOrder ?? 0,
    isActive: h.isActive ?? true,
  }))
})
