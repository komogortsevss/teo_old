import Customers from "../../../../../loyalty-service/tables/customers.table"
import CustomerBonuses from "../../../../../loyalty-service/tables/customerBonuses.table"

export const apiAdminLoyaltyCustomersSearchRoute = app.get('/', async (ctx, req) => {
  const q = req.query.q as string
  
  if (!q || q.length < 2) {
    return []
  }
  
  // Поиск по имени
  const byName = await Customers.findAll(ctx, {
    where: { fuzzyText: q },
    limit: 50
  })
  
  // Поиск по телефону
  const byPhone = await Customers.findAll(ctx, {
    where: { phone: { $like: `%${q}%` } },
    limit: 50
  })
  
  // Поиск по email
  const byEmail = await Customers.findAll(ctx, {
    where: { email: { $like: `%${q}%` } },
    limit: 50
  })
  
  // Объединяем результаты
  const uniqueCustomers = new Map()
  
  for (const c of [...byName, ...byPhone, ...byEmail]) {
    if (!uniqueCustomers.has(c.id)) {
      uniqueCustomers.set(c.id, c)
    }
  }
  
  const result = await Promise.all(
    Array.from(uniqueCustomers.values()).map(async (customer) => {
      const bonusRecord = await CustomerBonuses.findOneBy(ctx, { 
        customerId: customer.id 
      })
      
      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        balance: bonusRecord?.balance ?? 0,
        totalEarned: bonusRecord?.totalEarned ?? 0,
        totalSpent: bonusRecord?.totalSpent ?? 0,
        lastLoginAt: customer.lastLoginAt
      }
    })
  )
  
  return result
})
