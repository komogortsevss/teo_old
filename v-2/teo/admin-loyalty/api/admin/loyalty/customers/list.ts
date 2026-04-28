import Customers from "../../../../../loyalty-service/tables/customers.table"
import CustomerBonuses from "../../../../../loyalty-service/tables/customerBonuses.table"

export const apiAdminLoyaltyCustomersListRoute = app.get('/', async (ctx, req) => {
  const customers = await Customers.findAll(ctx, { limit: 1000 })
  
  const result = await Promise.all(
    customers.map(async (customer) => {
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
