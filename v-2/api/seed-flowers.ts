import FlowersTable from '../tables/flowers.table'

export const seedFlowersRoute = app.post('/', async (ctx, req) => {
  const defaultFlowers = [
    { name: 'Роза', slug: 'rose', sortOrder: 1 },
    { name: 'Кустовая роза', slug: 'spray-rose', sortOrder: 2 },
    { name: 'Альстромерия', slug: 'alstroemeria', sortOrder: 3 },
    { name: 'Маттиола', slug: 'matthiola', sortOrder: 4 },
    { name: 'Диантус', slug: 'diantus', sortOrder: 5 },
  ]

  const created = []

  for (const flower of defaultFlowers) {
    const existing = await FlowersTable.findOneBy(ctx, { slug: flower.slug })
    if (!existing) {
      const newFlower = await FlowersTable.create(ctx, flower)
      created.push(newFlower)
    }
  }

  return { success: true, created: created.length, total: defaultFlowers.length }
})
