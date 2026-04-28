import OrdersTable from '../../tables/orders.table'
import OrdersTableCrm from '/teo/tables/orders.table'
import ProductsTable from '../../tables/products.table'
import StockTable from '../../tables/stock.table'
import ProfilesTable from '../../tables/profiles.table'
import { Money } from '@app/heap'
import { apiCheckAvailabilityJobRoute } from '../check-availability'
import { sendNotificationToAccountOwners } from '@user-notifier/sdk'
import { sendMessageToChat } from '@sender/sdk'
import { captureCustomerEvent, ContactType } from '@crm/sdk'
import { getWorkspaceEventUrl } from '@start/sdk'
import { productPageRoute } from '../../product'
import { apiLoyaltyEarnOnOrderRoute } from '../../teo/loyalty-service/api/loyalty/earn-on-order'
import { apiLoyaltySpendOnOrderRoute } from '../../teo/loyalty-service/api/loyalty/spend-on-order'

export const apiOrdersCreateRoute = app.post('/', async (ctx, req) => {
  const {
    deliveryDate,
    deliveryTime,
    buyerName,
    buyerPhone,
    forOther,
    recipientName,
    recipientPhone,
    clarifyAddressWithRecipient,
    street,
    house,
    apartment,
    entrance,
    floor,
    intercom,
    hasNote,
    noteText,
    comment,
    items,
    addons,
    totalPrice,
    userId: requestUserId,
    saveAddress,
    addressType,
    bonusesToSpend,
    bonusDiscount,
  } = req.body

  const stockItems = await StockTable.findAll(ctx, { limit: 1000 })
  const stockMap = new Map<string, number>()
  for (const s of stockItems) {
    const fid = typeof s.flower === 'string' ? s.flower : s.flower?.id
    if (fid) stockMap.set(fid, s.quantity || 0)
  }

  const totalNeeds = new Map<string, number>()
  const productCache = new Map<string, any>()

  if (items && items.length > 0) {
    for (const item of items) {
      const product = await ProductsTable.findById(ctx, item.id)
      if (!product) continue
      productCache.set(item.id, product)

      const comp = product.composition as Array<{ flowerId: string; quantity: number }> | null
      if (!comp || comp.length === 0) continue

      const stemsCount = (product as any).stemsCount as number | null
      const isMono = (stemsCount != null && stemsCount > 1 && comp.length === 1)

      if (isMono) {
        const flowerId = comp[0].flowerId
        const stemsToDeduct = item.quantity || stemsCount
        const prev = totalNeeds.get(flowerId) || 0
        totalNeeds.set(flowerId, prev + stemsToDeduct)
      } else {
        const bouquetCount = item.quantity || 1
        for (const c of comp) {
          const stemsToDeduct = c.quantity * bouquetCount
          const prev = totalNeeds.get(c.flowerId) || 0
          totalNeeds.set(c.flowerId, prev + stemsToDeduct)
        }
      }
    }
  }

  const shortages: Array<{ flowerId: string; needed: number; available: number }> = []
  for (const [flowerId, needed] of totalNeeds.entries()) {
    const available = stockMap.get(flowerId) || 0
    if (needed > available) {
      shortages.push({ flowerId, needed, available })
    }
  }

  if (shortages.length > 0) {
    ctx.account.log('Order rejected: insufficient stock', {
      level: 'warn',
      json: { shortages },
    })
    throw new Error('К сожалению, некоторых цветов не хватает на складе. Пожалуйста, уменьшите количество букетов и попробуйте снова.')
  }

  const ordersCount = await OrdersTable.countBy(ctx)
  const orderNumber = String(ordersCount + 1).padStart(6, '0')

  // Use provided userId (from SMS verification) or current authenticated user
  const finalUserId = requestUserId || ctx.user?.id || ''
  
  const order = await OrdersTable.create(ctx, {
    orderNumber,
    userId: finalUserId,
    deliveryDate: deliveryDate || '',
    deliveryTime: deliveryTime || '',
    buyerName,
    buyerPhone,
    forOther: forOther || false,
    recipientName: recipientName || '',
    recipientPhone: recipientPhone || '',
    clarifyAddressWithRecipient: clarifyAddressWithRecipient || false,
    street: street || '',
    house: house || '',
    apartment: apartment || '',
    entrance: entrance || '',
    floor: floor || '',
    intercom: intercom || '',
    hasNote: hasNote || false,
    noteText: noteText || '',
    comment: comment || '',
    items: items || [],
    addons: (addons || []).map(a => ({
      addonId: a.id || a.addonId,
      name: a.name,
      quantity: a.quantity,
      priceAmount: a.priceAmount,
      forBouquetId: a.forBouquetId,
      forBouquetName: a.forBouquetName,
    })),
    totalPrice,
    bonusesToSpend: bonusesToSpend || 0,
    bonusDiscount: bonusDiscount || 0,
    bonusesEarned: 0,
    status: 'new',
    createdAt: new Date(),
  })

  // Create order in CRM table for florist dashboard
  try {
    // Build delivery address string
    let deliveryAddress = ''
    if (!clarifyAddressWithRecipient && street) {
      deliveryAddress = street
      if (house) deliveryAddress += `, д. ${house}`
      if (apartment) deliveryAddress += `, кв. ${apartment}`
      if (entrance) deliveryAddress += `, подъезд ${entrance}`
      if (floor) deliveryAddress += `, этаж ${floor}`
      if (intercom) deliveryAddress += `, домофон ${intercom}`
    } else if (clarifyAddressWithRecipient) {
      deliveryAddress = 'Уточнить у получателя'
    }

    // Determine order type
    const orderType = forOther ? 'gift' : 'self'

    // Parse delivery date
    let deliveryDateParsed: Date | undefined
    if (deliveryDate && deliveryDate !== 'Сегодня' && deliveryDate !== 'Завтра') {
      deliveryDateParsed = new Date(deliveryDate)
    } else {
      deliveryDateParsed = new Date()
      if (deliveryDate === 'Завтра') {
        deliveryDateParsed.setDate(deliveryDateParsed.getDate() + 1)
      }
    }

    ctx.account.log('Creating CRM order', {
      level: 'info',
      json: {
        orderNumber,
        buyerPhone,
        buyerName,
        finalUserId,
      }
    })

    const crmOrder = await OrdersTableCrm.create(ctx, {
      orderNumber,
      customerPhone: buyerPhone || '',
      customerEmail: ctx?.user?.confirmedEmail || (ctx?.user as any)?.email || '',
      customerName: buyerName || '',
      recipientPhone: recipientPhone || '',
      recipientName: recipientName || '',
      orderType,
      deliveryDate: deliveryDateParsed,
      deliveryTime: deliveryTime || '',
      deliveryAddress,
      items: (items || []).map(item => {
        // Find if this bouquet has a vase in addons
        const vaseAddon = (addons || []).find(a => a.forBouquetId === item.id)
        return {
          ...item,
          selectedVase: vaseAddon ? {
            addonId: vaseAddon.id || vaseAddon.addonId,
            quantity: vaseAddon.quantity,
            name: vaseAddon.name,
          } : undefined
        }
      }),
      addons: (addons || []).map(a => ({
        addonId: a.id || a.addonId,
        name: a.name,
        quantity: a.quantity,
        priceAmount: a.priceAmount,
        forBouquetId: a.forBouquetId,
        forBouquetName: a.forBouquetName,
      })),
      total: new Money(Math.round(totalPrice * 100) / 100, 'RUB'),
      discount: bonusDiscount ? new Money(Math.round(bonusDiscount * 100) / 100, 'RUB') : undefined,
      bonusUsed: bonusesToSpend ? new Money(bonusesToSpend, 'RUB') : undefined,
      bonusEarned: new Money(0, 'RUB'),
      status: 'new',
      paymentStatus: 'pending',
      source: 'website',
      comment: comment || '',
      cardText: noteText || '',
      createdAt: new Date(),
    })

    ctx.account.log('Order synced to CRM', { 
      level: 'info', 
      json: { 
        orderNumber, 
        crmOrderId: crmOrder.id,
        customerPhone: crmOrder.customerPhone,
        customerEmail: crmOrder.customerEmail,
      }
    })
  } catch (e) {
    ctx.account.log('Failed to sync order to CRM', { 
      level: 'warn', 
      err: e,
      json: { orderNumber, buyerPhone }
    })
    // Don't throw - order is already created in local table
  }

  // Save address to profile if requested
  if (saveAddress && ctx.user?.id && street) {
    try {
      const existing = await ProfilesTable.findOneBy(ctx, { userId: ctx.user.id })
      const isWork = addressType === 'work'
      
      if (existing) {
        if (isWork) {
          // Save as work address
          await ProfilesTable.update(ctx, {
            id: existing.id,
            workStreet: street || existing.workStreet,
            workHouse: house || existing.workHouse,
            workApartment: apartment || existing.workApartment,
            workEntrance: entrance || existing.workEntrance,
            workFloor: floor || existing.workFloor,
            workIntercom: intercom || existing.workIntercom,
            addressType: 'work',
          })
        } else {
          // Save as home address
          await ProfilesTable.update(ctx, {
            id: existing.id,
            street: street || existing.street,
            house: house || existing.house,
            apartment: apartment || existing.apartment,
            entrance: entrance || existing.entrance,
            floor: floor || existing.floor,
            intercom: intercom || existing.intercom,
            addressType: 'home',
          })
        }
      } else {
        if (isWork) {
          // Create with work address
          await ProfilesTable.create(ctx, {
            userId: ctx.user.id,
            workStreet: street || '',
            workHouse: house || '',
            workApartment: apartment || '',
            workEntrance: entrance || '',
            workFloor: floor || '',
            workIntercom: intercom || '',
            addressType: 'work',
          })
        } else {
          // Create with home address
          await ProfilesTable.create(ctx, {
            userId: ctx.user.id,
            street: street || '',
            house: house || '',
            apartment: apartment || '',
            entrance: entrance || '',
            floor: floor || '',
            intercom: intercom || '',
            addressType: 'home',
          })
        }
      }
    } catch (e) {
      ctx.account.log('Failed to save address to profile', { level: 'warn', err: e })
    }
  }

  if (totalNeeds.size > 0) {
    for (const stockItem of stockItems) {
      const fid = typeof stockItem.flower === 'string' ? stockItem.flower : stockItem.flower?.id
      if (!fid) continue

      const needed = totalNeeds.get(fid)
      if (!needed) continue

      const currentQty = stockItem.quantity || 0
      const newQty = Math.max(0, currentQty - needed)
      ctx.account.log('Stock update', {
        level: 'info',
        json: { flowerId: fid, before: currentQty, deducted: needed, after: newQty },
      })
      await StockTable.update(ctx, {
        id: stockItem.id,
        quantity: newQty,
        updatedAt: new Date(),
      })
    }

    apiCheckAvailabilityJobRoute.scheduleJobAsap(ctx, {})
  }

  // CRM event
  try {
    const contacts: Array<{type: string; value: string}> = []
    if (buyerPhone) contacts.push({ type: ContactType.Phone, value: buyerPhone })

    await captureCustomerEvent(ctx, {
      event: 'order_created',
      customer: {
        displayName: buyerName,
      },
      contacts,
      linkRecords: [order],
      metricEventData: {
        action_param1: orderNumber,
        action_param2: buyerName,
        action_param3: buyerPhone,
        action_param1_float: totalPrice,
      },
    })
  } catch (e) {
    ctx.account.log('CRM event error', { level: 'warn', err: e })
  }

  // Calculate subtotal (sum before bonus discount)
  let subtotal = 0
  if (items && items.length > 0) {
    for (const item of items) {
      const product = productCache.get(item.id)
      if (!product) continue
      const stemsCount = (product as any).stemsCount as number | null
      const comp = product.composition as Array<{ flowerId: string; quantity: number }> | null
      const isMono = (stemsCount != null && stemsCount > 1 && comp && comp.length === 1)
      if (isMono) {
        const bouquetCount = Math.floor(item.quantity / stemsCount)
        subtotal += item.priceAmount * bouquetCount
      } else {
        subtotal += item.priceAmount * (item.quantity || 1)
      }
    }
  }
  if (addons && addons.length > 0) {
    for (const addon of addons) {
      subtotal += addon.priceAmount * (addon.quantity || 1)
    }
  }
  
  // Начисление бонусов за заказ
  if (finalUserId && totalPrice > 0) {
    try {
      const earnResult = await apiLoyaltyEarnOnOrderRoute.run(ctx, {
        userId: finalUserId,
        orderId: order.id,
        total: totalPrice,
        status: 'new'
      })
      
      if (earnResult.success) {
        ctx.account.log('Bonuses earned', { 
          level: 'info',
          json: { 
            orderId: order.id, 
            bonusAmount: earnResult.bonusAmount,
            newBalance: earnResult.newBalance
          }
        })
        
        // Обновляем заказ с начисленными бонусами
        await OrdersTable.update(ctx, {
          id: order.id,
          bonusesEarned: earnResult.bonusAmount
        })
        
        // Обновляем объект заказа для возврата
        order.bonusesEarned = earnResult.bonusAmount

        // Update CRM order with earned bonuses
        try {
          const crmOrders = await OrdersTableCrm.findAll(ctx, {
            where: { orderNumber },
            limit: 1
          })
          if (crmOrders.length > 0) {
            await OrdersTableCrm.update(ctx, {
              id: crmOrders[0].id,
              bonusEarned: new Money(earnResult.bonusAmount, 'RUB'),
            })
          }
        } catch (e) {
          ctx.account.log('Failed to update CRM order bonuses', { level: 'warn', err: e })
        }
      } else {
        ctx.account.log('Bonus earn skipped', { 
          level: 'info',
          json: { reason: earnResult.error }
        })
      }
    } catch (e) {
      ctx.account.log('Bonus earn error', { level: 'warn', err: e })
    }
  }
  
  // Списание бонусов (если использовались)
  if (finalUserId && bonusesToSpend && bonusesToSpend > 0) {
    try {
      const spendResult = await apiLoyaltySpendOnOrderRoute.run(ctx, {
        userId: finalUserId,
        orderId: order.id,
        bonusesToSpend,
        subtotal
      })
      
      if (spendResult.success) {
        ctx.account.log('Bonuses spent', { 
          level: 'info',
          json: { 
            orderId: order.id, 
            bonusesSpent: spendResult.bonusesSpent,
            newBalance: spendResult.newBalance
          }
        })
      } else {
        ctx.account.log('Bonus spend skipped', { 
          level: 'info',
          json: { reason: spendResult.error }
        })
      }
    } catch (e) {
      ctx.account.log('Bonus spend error', { level: 'warn', err: e })
    }
  }

  // Max notification
  try {
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return ''
      if (dateStr === 'Сегодня' || dateStr === 'Завтра') return dateStr
      const date = new Date(dateStr)
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ]
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    }

    let messageText = `Заказ #${orderNumber}\n\n`
    messageText += `Заказчик: ${buyerName}, ${buyerPhone}\n\n`

    // Build addons map for quick lookup
    const addonsMap = new Map<string, typeof addons[0]>()
    if (addons && addons.length > 0) {
      for (const addon of addons) {
        if (addon.forBouquetId) {
          addonsMap.set(addon.forBouquetId, addon)
        }
      }
    }

    if (items && items.length > 0) {
      for (const item of items) {
        const product = productCache.get(item.id)
        if (!product) continue

        const stemsCount = (product as any).stemsCount as number | null
        const comp = product.composition as Array<{ flowerId: string; quantity: number }> | null
        const isMono = (stemsCount != null && stemsCount > 1 && comp && comp.length === 1)

        let totalItemPrice: number
        let displayText: string

        if (isMono) {
          const bouquetCount = Math.floor(item.quantity / stemsCount)
          totalItemPrice = item.priceAmount * bouquetCount
          const stemsText = item.quantity > 1 ? ` (${item.quantity} стеблей)` : ''
          displayText = `${item.name}${stemsText} — ${totalItemPrice?.toLocaleString('ru-RU')} ₽`
        } else {
          totalItemPrice = item.priceAmount * (item.quantity || 1)
          const qtyText = item.quantity > 1 ? ` x${item.quantity}` : ''
          displayText = `${item.name}${qtyText} — ${totalItemPrice?.toLocaleString('ru-RU')} ₽`
        }

        messageText += `${displayText}\n`

        // Add vase info if present
        const vase = addonsMap.get(item.id)
        if (vase) {
          const vaseQty = vase.quantity > 1 ? ` x${vase.quantity}` : ''
          const vasePrice = vase.priceAmount * (vase.quantity || 1)
          messageText += `  ↳ Ваза: ${vase.name}${vaseQty} — ${vasePrice?.toLocaleString('ru-RU')} ₽\n`
        }
      }
    }

    // Regular addons (not vases)
    const regularAddons = (addons || []).filter(a => !a.forBouquetId)
    if (regularAddons.length > 0) {
      for (const addon of regularAddons) {
        const qty = addon.quantity > 1 ? ` x${addon.quantity}` : ''
        const addonPrice = addon.priceAmount * (addon.quantity || 1)
        messageText += `${addon.name}${qty} — ${addonPrice?.toLocaleString('ru-RU')} ₽\n`
      }
    }

    messageText += `\nСумма: ${totalPrice?.toLocaleString('ru-RU')} ₽\n\n`

    if (deliveryDate) messageText += `${formatDate(deliveryDate)}\n`
    if (deliveryTime) messageText += `${deliveryTime}\n`

    if (forOther && recipientName) {
      messageText += `\nПолучатель: ${recipientName}`
      if (recipientPhone) messageText += `, ${recipientPhone}`
      messageText += '\n'
    }

    if (!clarifyAddressWithRecipient && street) {
      let addr = street
      if (house) addr += `, д. ${house}`
      if (apartment) addr += `, кв. ${apartment}`
      if (entrance) addr += `, подъезд ${entrance}`
      if (floor) addr += `, этаж ${floor}`
      if (intercom) addr += `, домофон ${intercom}`
      messageText += `\nАдрес: ${addr}\n`
    } else if (clarifyAddressWithRecipient) {
      messageText += `\nАдрес: уточнить у получателя\n`
    }

    if (hasNote && noteText) messageText += `\nЗаписка: ${noteText}\n`
    if (comment) messageText += `\nКомментарий: ${comment}\n`

    if (items && items.length > 0 && items[0].id) {
      const productUrl = productPageRoute.query({ id: items[0].id }).url()
      messageText += `\n${productUrl}`
    }

    await sendMessageToChat(ctx, 'ZtOrWOsp2zCy58VGGVG0teo2y', {
      text: messageText,
    })
  } catch (e) {
    ctx.account.log('Max notification error', { level: 'warn', err: e })
  }

  try {
    await sendNotificationToAccountOwners(ctx, {
      title: `Новый заказ #${orderNumber}`,
      plain: `Заказ #${orderNumber} на сумму ${totalPrice?.toLocaleString('ru-RU')} ₽ от ${buyerName}`,
      md: `**Новый заказ #${orderNumber}**\nСумма: ${totalPrice?.toLocaleString('ru-RU')} ₽\nЗаказчик: ${buyerName}, ${buyerPhone}`,
    })
  } catch (e) {
    ctx.account.log('Notification error', { level: 'warn', err: e })
  }

  return order
})

// Event registration
app.accountHook('@start/account-events', async (ctx, params) => {
  return [
    {
      name: 'Создан заказ',
      description: 'Клиент оформил заказ на сайте',
      url: await getWorkspaceEventUrl(ctx, 'order_created'),
      icon: '🛒',
      category: 'deals',
      payloadMapping: {
        orderNumber: { title: 'Номер заказа', fieldName: 'action_param1', type: 'string' },
        buyerName: { title: 'Имя заказчика', fieldName: 'action_param2', type: 'string' },
        buyerPhone: { title: 'Телефон', fieldName: 'action_param3', type: 'string' },
        totalPrice: { title: 'Сумма заказа', fieldName: 'action_param1_float', type: 'number' },
      },
    },
  ]
})