import { requireAccountRole } from '@app/auth'
import HeroTable from '../../../tables/hero.table'

export const apiAdminHeroUpdateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  const body = ctx.req.body
  const hero = await HeroTable.update(ctx, {
    id,
    title: body.title ?? '',
    subtitle: body.subtitle ?? '',
    buttonText: body.buttonText ?? '',
    buttonLink: body.buttonLink ?? '',
    buttonPosition: body.buttonPosition ?? 'center-center',
    imageHash: body.imageHash ?? '',
    mobileImageHash: body.mobileImageHash ?? '',
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
  })

  return { success: true, id: hero.id }
})
