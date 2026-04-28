import Hero from '../../tables/hero.table'

export const apiHeroGetRoute = app.get('/', async (ctx, req) => {
  const heroes = await Hero.findAll(ctx, {
    where: { isActive: true },
    order: [{ sortOrder: 'asc' }],
    limit: 100
  })
  return heroes
})
