import { requireAccountRole } from '@app/auth'
import { Money } from '@app/heap'
import AddonsTable from '../../../tables/addons.table'

export const apiAdminAddonsCreateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const body = ctx.req.body
  const addon = await AddonsTable.create(ctx, {
    name: body.name,
    imageHash: body.imageHash ?? '',
    price: new Money(Number(body.priceAmount) || 0, 'RUB'),
    icon: body.icon ?? 'fa-solid fa-gift',
    type: body.type ?? 'regular',
    sortOrder: body.sortOrder ?? 0,
    isActive: body.isActive ?? true,
  })

  return { success: true, id: addon.id }
})
