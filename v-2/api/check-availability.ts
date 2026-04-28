import ProductsTable from '../tables/products.table'
import StockTable from '../tables/stock.table'

export const apiCheckAvailabilityJobRoute = app.job('/', async (ctx) => {
  const products = await ProductsTable.findAll(ctx, { limit: 1000 })
  const stock = await StockTable.findAll(ctx, { limit: 1000 })

  const stockMap = new Map<string, number>()
  for (const item of stock) {
    const fid = typeof item.flower === 'string' ? item.flower : item.flower?.id
    if (fid) stockMap.set(fid, item.quantity || 0)
  }

  let updated = 0

  for (const product of products) {
    const comp = product.composition as Array<{ flowerId: string; quantity: number }> | null

    let isAvailable = false

    if (comp && comp.length > 0) {
      isAvailable = true
      for (const compItem of comp) {
        const stockQuantity = stockMap.get(compItem.flowerId) || 0
        if (stockQuantity < compItem.quantity) {
          isAvailable = false
          break
        }
      }
    }

    if (product.isAvailable !== isAvailable) {
      await ProductsTable.update(ctx, {
        id: product.id,
        isAvailable
      })
      updated++
    }
  }

  ctx.account.log('Availability check completed', {
    level: 'info',
    json: { totalProducts: products.length, updated }
  })

  return { success: true, updated }
})
