import OrdersTableCrm from '/teo/tables/orders.table'
import { findIdentities } from '@app/auth'

// Нормализация телефона для поиска (убираем все не-цифры, кроме +)
// Добавляем +7 если номер начинается с 9 (российский мобильный)
function normalizePhone(phone: string): string {
  if (!phone) return ''
  let normalized = phone.replace(/[^\d+]/g, '')
  // Если номер без + и начинается с 9, добавляем +7
  if (!normalized.startsWith('+') && normalized.startsWith('9')) {
    normalized = '+7' + normalized
  }
  // Если номер без + но с 7 в начале, добавляем +
  if (!normalized.startsWith('+') && normalized.startsWith('7')) {
    normalized = '+' + normalized
  }
  return normalized
}

export const apiProfileOrdersRoute = app.get('/', async (ctx, req) => {
  if (!ctx.user) {
    ctx.account.log('Profile orders: no user', { level: 'warn' })
    return []
  }

  // Получаем телефон и email пользователя из разных источников
  let userPhone = ctx.user.confirmedPhone || (ctx.user as any).phone || ''
  let phoneSource = ctx.user.confirmedPhone ? 'ctx.user.confirmedPhone' : 'user.phone'
  
  // Получаем email пользователя
  let userEmail = ctx.user.confirmedEmail || (ctx.user as any).email || ''
  let emailSource = ctx.user.confirmedEmail ? 'ctx.user.confirmedEmail' : 'user.email'

  ctx.account.log('Profile orders: initial check', {
    level: 'info',
    json: {
      userId: ctx.user.id,
      userType: ctx.user.type,
      displayName: ctx.user.displayName,
      hasSmartUserConfirmedPhone: !!ctx.user.confirmedPhone,
      smartUserConfirmedPhone: ctx.user.confirmedPhone,
      hasPhone: !!(ctx.user as any).phone,
      phone: (ctx.user as any).phone,
      userPhone,
      phoneSource,
      hasSmartUserConfirmedEmail: !!ctx.user.confirmedEmail,
      smartUserConfirmedEmail: ctx.user.confirmedEmail,
      hasEmail: !!(ctx.user as any).email,
      email: (ctx.user as any).email,
      userEmail,
      emailSource,
    }
  })

  // Если confirmedPhone пустой, пытаемся найти Phone идентити
  if (!userPhone) {
    const identities = await findIdentities(ctx, {
      where: { userId: ctx.user.id, type: 'Phone' },
      order: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      limit: 5
    })
    ctx.account.log('Profile orders: phone identities search', {
      level: 'info',
      json: { 
        found: identities.length, 
        identities: identities.map(i => ({ 
          key: i.key, 
          isPrimary: i.isPrimary,
          isBlocked: i.isBlocked,
          createdAt: i.createdAt 
        })) 
      }
    })
    if (identities.length > 0) {
      userPhone = identities[0].key
      phoneSource = 'identity'
    }
  }

  // Если email пустой, пытаемся найти Email идентити
  if (!userEmail) {
    const emailIdentities = await findIdentities(ctx, {
      where: { userId: ctx.user.id, type: 'Email' },
      order: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      limit: 5
    })
    ctx.account.log('Profile orders: email identities search', {
      level: 'info',
      json: { 
        found: emailIdentities.length, 
        identities: emailIdentities.map(i => ({ 
          key: i.key, 
          isPrimary: i.isPrimary,
          isBlocked: i.isBlocked,
          createdAt: i.createdAt 
        })) 
      }
    })
    if (emailIdentities.length > 0) {
      userEmail = emailIdentities[0].key
      emailSource = 'identity'
    }
  }

  const normalizedUserPhone = normalizePhone(userPhone)
  const normalizedUserEmail = userEmail.toLowerCase().trim()

  ctx.account.log('Profile orders search start', {
    level: 'info',
    json: {
      userId: ctx.user.id,
      userPhone,
      phoneSource,
      normalizedUserPhone,
      userEmail,
      emailSource,
      normalizedUserEmail,
    }
  })

  try {
    // Загружаем все заказы и фильтруем в JS с нормализацией телефонов и email
    // Сортируем по дате и времени доставки (ближайшие сначала)
    const allOrders = await OrdersTableCrm.findAll(ctx, {
      order: [{ deliveryDate: 'desc' }, { deliveryTime: 'desc' }],
      limit: 500,
    })

    const userOrders = allOrders.filter(order => {
      // Проверка по телефону (нормализованному)
      const orderPhone = normalizePhone(order.customerPhone || '')
      const phoneMatch = normalizedUserPhone && (
        orderPhone === normalizedUserPhone ||
        orderPhone === normalizedUserPhone.replace('+', '')
      )
      
      // Проверка по email (регистронезависимое сравнение)
      const orderEmail = (order.customerEmail || '').toLowerCase().trim()
      const emailMatch = normalizedUserEmail && orderEmail === normalizedUserEmail
      
      return phoneMatch || emailMatch
    })

    ctx.account.log('Profile orders found', {
      level: 'info',
      json: {
        userId: ctx.user.id,
        userPhone,
        normalizedUserPhone,
        userEmail,
        normalizedUserEmail,
        totalScanned: allOrders.length,
        matched: userOrders.length,
        sampleOrders: userOrders.slice(0, 3).map(o => ({
          id: o.id,
          number: o.orderNumber,
          phone: o.customerPhone,
          email: o.customerEmail,
        }))
      }
    })

    return userOrders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalPrice: o.total?.amount || 0,
      deliveryDate: o.deliveryDate ? new Date(o.deliveryDate).toISOString().split('T')[0] : '',
      deliveryTime: o.deliveryTime,
      items: o.items || [],
      addons: o.addons || [],
      createdAt: o.createdAt,
      street: o.deliveryAddress || '',
      house: '',
      apartment: '',
      buyerName: o.customerName,
      buyerPhone: o.customerPhone,
      buyerEmail: o.customerEmail,
      recipientName: o.recipientName,
      recipientPhone: o.recipientPhone,
      forOther: o.orderType === 'gift',
      hasNote: !!o.cardText,
      noteText: o.cardText,
      comment: o.comment,
      bonusDiscount: o.bonusUsed?.amount || 0,
      bonusesEarned: o.bonusEarned?.amount || 0,
    }))

  } catch (e) {
    ctx.account.log('Profile orders error', {
      level: 'error',
      err: e,
      json: { userId: ctx.user.id, userPhone, userEmail }
    })
    return []
  }
})
