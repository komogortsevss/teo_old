import BannersTable from "../../tables/banners.table"

export const apiBannersListRoute = app.get('/', async (ctx, req) => {
  const banners = await BannersTable.findAll(ctx, {
    where: { isActive: true },
    order: [{ sortOrder: 'asc' }],
    limit: 100
  })
  
  return banners
})
