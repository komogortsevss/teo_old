import ProductsTable from '../../tables/products.table'

export const apiProductsCountAvailableRoute = app.get('/', async (ctx, req) => {
  const count = await ProductsTable.countBy(ctx, { isAvailable: true })
  return { count }
})
