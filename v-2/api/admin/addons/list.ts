import { requireAccountRole } from '@app/auth'
import { Money } from '@app/heap'
import AddonsTable from '../../../tables/addons.table'

export const apiAdminAddonsListRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const addons = await AddonsTable.findAll(ctx, {
    limit: 1000,
    order: [{ sortOrder: 'asc' }]
  })

  return addons.map(a => ({
    id: a.id,
    name: a.name,
    imageHash: a.imageHash,
    priceAmount: a.price instanceof Money ? a.price.amount : (typeof a.price === 'number' ? a.price : 0),
    icon: a.icon ?? 'fa-solid fa-gift',
    type: a.type ?? 'regular',
    sortOrder: a.sortOrder ?? 0,
    isActive: a.isActive ?? true,
    isAvailable: a.isActive ?? true,
  }))
})
