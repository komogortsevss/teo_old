import AddonsTable from '../../tables/addons.table'

export const apiAddonsListRoute = app.get('/', async (ctx, req) => {
  const addons = await AddonsTable.findAll(ctx, {
    where: { isActive: true },
    order: [{ sortOrder: 'asc' }],
    limit: 100
  })
  
  return addons.map(addon => ({
    id: addon.id,
    name: addon.name,
    imageHash: addon.imageHash,
    priceAmount: addon.price.amount,
    icon: addon.icon,
    type: addon.type || 'regular',
    sortOrder: addon.sortOrder,
    isActive: addon.isActive
  }))
})
