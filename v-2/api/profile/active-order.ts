import OrdersTableCrm from '/teo/tables/orders.table'
import { requireRealUser, findIdentities } from '@app/auth'

export interface OrderDto {
  id: string
  orderNumber: string
  deliveryDate: string
  deliveryTime: string
  status: string
  street: string
  house: string
  apartment?: string
  entrance?: string
  floor?: string
  totalPrice: number
  items: Array<{
    id: string
    name: string
    imageHash?: string
    quantity: number
    priceAmount: number
  }>
}

// Нормализация телефона для поиска — оставляем только цифры
function normalizePhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/[^0-9]/g, '')
}

// Нормализация email для поиска — lowercase
function normalizeEmail(email: string): string {
  if (!email) return ''
  return email.toLowerCase().trim()
}

// Получить сегодняшнюю дату в Москве (UTC+3) в формате YYYY-MM-DD
function getMoscowToday(): string {
  const now = new Date()
  const moscowOffset = 3 * 60 * 60 * 1000
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
  const moscowTime = new Date(utc + moscowOffset)
  return moscowTime.toISOString().split('T')[0] // "2025-04-05"
}

export const apiProfileActiveOrderRoute = app.get('/', async (ctx, req) => {
  requireRealUser(ctx)

  // Получаем телефон пользователя
  let userPhone = ctx.user.confirmedPhone || (ctx.user as any).phone || ''
  
  // Если confirmedPhone пустой, ищем Phone идентити
  if (!userPhone) {
    const phoneIdentities = await findIdentities(ctx, {
      where: { userId: ctx.user.id, type: 'Phone' },
      order: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      limit: 1
    })
    if (phoneIdentities.length > 0) {
      userPhone = phoneIdentities[0].key
    }
  }

  // Получаем email пользователя
  let userEmail = ctx.user.confirmedEmail || (ctx.user as any).email || ''
  
  // Если confirmedEmail пустой, ищем Email идентити
  if (!userEmail) {
    const emailIdentities = await findIdentities(ctx, {
      where: { userId: ctx.user.id, type: 'Email' },
      order: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      limit: 1
    })
    if (emailIdentities.length > 0) {
      userEmail = emailIdentities[0].key
    }
  }

  const normalizedUserPhone = normalizePhone(userPhone)
  const normalizedUserEmail = normalizeEmail(userEmail)
  const today = getMoscowToday()
  
  // Логи для отладки
  console.log('[ActiveOrder] User:', { 
    userId: ctx.user.id, 
    userPhone, 
    userEmail, 
    normalizedUserPhone, 
    normalizedUserEmail,
    today 
  })
  
  // Загружаем все заказы из CRM
  const allOrders = await OrdersTableCrm.findAll(ctx, {
    order: [{ createdAt: 'desc' }],
    limit: 500,
  })
  
  console.log('[ActiveOrder] Total orders loaded:', allOrders.length)
  console.log('[ActiveOrder] Order numbers:', allOrders.map(o => o.orderNumber))

  // Ищем заказы пользователя на сегодня
  const userOrders = allOrders.filter(order => {
    // Проверяем совпадение по телефону
    const orderPhone = normalizePhone(order.customerPhone || '')
    const phoneMatch = normalizedUserPhone && orderPhone === normalizedUserPhone
    
    // Проверяем совпадение по email
    const orderEmail = normalizeEmail(order.customerEmail || '')
    const emailMatch = normalizedUserEmail && orderEmail === normalizedUserEmail
    
    // Должно совпадать либо телефон, либо email
    const customerMatch = phoneMatch || emailMatch
    
    // Извлекаем дату из deliveryDate (может быть ISO строкой или Date объектом)
    let orderDate = ''
    if (order.deliveryDate) {
      if (typeof order.deliveryDate === 'string') {
        orderDate = order.deliveryDate.split('T')[0]
      } else if (order.deliveryDate instanceof Date) {
        orderDate = order.deliveryDate.toISOString().split('T')[0]
      }
    }
    const dateMatch = orderDate === today
    
    // Проверяем статус — не доставлен и не отменён
    const isActive = !['delivered', 'completed', 'cancelled'].includes(order.status)
    
    // Лог для заказа 000067 или всех заказов на сегодня
    if (order.orderNumber === '000067' || dateMatch) {
      console.log(`[ActiveOrder] Checking order ${order.orderNumber}:`, {
        orderPhone: order.customerPhone,
        orderEmail: order.customerEmail,
        normalizedOrderPhone: orderPhone,
        normalizedOrderEmail: orderEmail,
        phoneMatch,
        emailMatch,
        customerMatch,
        orderDate,
        today,
        dateMatch,
        status: order.status,
        isActive,
        result: customerMatch && dateMatch && isActive
      })
    }
    
    return customerMatch && dateMatch && isActive
  })
  
  // Берём первый (самый новый) заказ
  const activeOrder = userOrders[0]
  
  console.log('[ActiveOrder] Found orders:', userOrders.length)
  console.log('[ActiveOrder] Active order:', activeOrder?.orderNumber || 'none')

  if (!activeOrder) {
    return { order: null }
  }

  // Парсим адрес доставки (формат: "ул. Пушкина, д. 10, кв. 5")
  const addressParts = (activeOrder.deliveryAddress || '').split(',')
  const street = addressParts[0]?.trim() || ''
  const houseMatch = addressParts[1]?.match(/д\.?\s*(\d+)/)
  const house = houseMatch ? houseMatch[1] : ''
  const aptMatch = addressParts[2]?.match(/кв\.?\s*(\d+)/)
  const apartment = aptMatch ? aptMatch[1] : ''

  const orderDto: OrderDto = {
    id: activeOrder.id,
    orderNumber: activeOrder.orderNumber || activeOrder.id.slice(-6),
    deliveryDate: activeOrder.deliveryDate ? (typeof activeOrder.deliveryDate === 'string' ? activeOrder.deliveryDate.slice(0, 10) : activeOrder.deliveryDate.toISOString().slice(0, 10)) : '',
    deliveryTime: activeOrder.deliveryTime,
    status: activeOrder.status || 'new',
    street: street,
    house: house,
    apartment: apartment,
    entrance: '',
    floor: '',
    totalPrice: activeOrder.total?.amount || 0,
    items: (activeOrder.items || []).map((item: any) => ({
      id: item.id || item.productId || '',
      name: item.name || '',
      imageHash: item.imageHash,
      quantity: item.quantity || 1,
      priceAmount: item.price?.amount || item.priceAmount || 0
    }))
  }

  return { order: orderDto }
})
