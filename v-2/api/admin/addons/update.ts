import { requireAccountRole } from '@app/auth'
import { Money } from '@app/heap'
import AddonsTable from '../../../tables/addons.table'

export const apiAdminAddonsUpdateRoute = app.post('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const id = ctx.req.query.id as string
  if (!id) throw new Error('id is required')

  const body = ctx.req.body
  const addon = await AddonsTable.update(ctx, {
    id,
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
