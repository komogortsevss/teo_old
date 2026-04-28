import CategoriesTable from '../../tables/categories.table'
import ProductsTable from '../../tables/products.table'

export interface CategoryDto {
  id: string
  name: string
  slug: string
  sortOrder: number
  count?: number
}

export const apiCategoriesListRoute = app.get('/', async (ctx, req) => {
  const categories = await CategoriesTable.findAll(ctx, {
    order: [{ sortOrder: 'asc' }],
    limit: 100,
  })

  // Подсчитываем количество доступных букетов в каждой категории
  const productCounts = await ProductsTable
    .select({
      categoryId: 'category',
      count: { $count: ['id'] }
    })
    .where({
      isAvailable: true
    })
    .group(['categoryId'])
    .run(ctx)

  // Добавляем count к каждой категории
  return categories.map(cat => {
    const countRow = productCounts.find((row: any) => {
      // RefLink имеет поле id, или может быть уже строкой
      const rowCatId = row.categoryId?.id || row.categoryId
      return rowCatId === cat.id
    })
    
    return {
      ...cat,
      count: countRow ? Number(countRow.count) : 0
    }
  }) as CategoryDto[]
})
