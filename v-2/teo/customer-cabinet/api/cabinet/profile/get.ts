import Customers from "../../../../loyalty-service/tables/customers.table"
import CustomerBonuses from "../../../../loyalty-service/tables/customerBonuses.table"

export const apiCabinetProfileGetRoute = app.get('/', async (ctx, req) => {
  const { customerId } = req.query
  
  if (!customerId) {
    return { error: 'customerId required' }
  }
  
  const customer = await Customers.findById(ctx, customerId)
  if (!customer) {
    return { error: 'Customer not found' }
  }
  
  const bonusRecord = await CustomerBonuses.findOneBy(ctx, { customerId })
  
  return {
    customer: {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
      lastLoginAt: customer.lastLoginAt
    },
    bonuses: {
      balance: bonusRecord?.balance ?? 0,
      totalEarned: bonusRecord?.totalEarned ?? 0,
      totalSpent: bonusRecord?.totalSpent ?? 0
    }
  }
})
