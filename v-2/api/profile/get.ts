import ProfilesTable from '../../tables/profiles.table'
import { updateUser } from '@app/users'
import { findIdentities } from '@app/auth'

// Нормализация телефона (добавляем +7 если нужно)
function normalizePhone(phone: string): string {
  if (!phone) return ''
  let normalized = phone.replace(/[^\d+]/g, '')
  if (!normalized.startsWith('+') && normalized.startsWith('9')) {
    normalized = '+7' + normalized
  }
  if (!normalized.startsWith('+') && normalized.startsWith('7')) {
    normalized = '+' + normalized
  }
  return normalized
}

export const apiProfileGetRoute = app.get('/', async (ctx, req) => {
  if (!ctx.user) return { user: null, profile: null }

  // Получаем телефон из ctx.user (он уже SmartUser)
  let phone = ctx.user.confirmedPhone || (ctx.user as any).phone || ''
  let phoneSource = ctx.user.confirmedPhone ? 'ctx.user.confirmedPhone' : 'user.phone'
  
  // Нормализуем телефон
  phone = normalizePhone(phone)
  
  // Если confirmedPhone пустой, пытаемся найти Phone идентити
  if (!phone) {
    const identities = await findIdentities(ctx, {
      where: { userId: ctx.user.id, type: 'Phone' },
      order: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      limit: 1
    })
    if (identities.length > 0) {
      phone = identities[0].key
      phoneSource = 'identity'
    }
  }

  // Получаем email из ctx.user или идентитей
  let email = ctx.user.confirmedEmail || (ctx.user as any).email || ''
  let emailSource = ctx.user.confirmedEmail ? 'ctx.user.confirmedEmail' : 'user.email'
  
  // Если email пустой, пытаемся найти Email идентити
  if (!email) {
    const emailIdentities = await findIdentities(ctx, {
      where: { userId: ctx.user.id, type: 'Email' },
      order: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
      limit: 1
    })
    if (emailIdentities.length > 0) {
      email = emailIdentities[0].key
      emailSource = 'identity'
    }
  }

  const profile = await ProfilesTable.findOneBy(ctx, { userId: ctx.user.id })

  ctx.account.log('Profile get', {
    level: 'info',
    json: {
      userId: ctx.user.id,
      userType: ctx.user.type,
      displayName: ctx.user.displayName,
      phone,
      phoneSource,
      email,
      emailSource,
      hasSmartUserConfirmedPhone: !!ctx.user.confirmedPhone,
      smartUserConfirmedPhone: ctx.user.confirmedPhone,
      confirmedPhone: ctx.user.confirmedPhone,
      rawPhone: (ctx.user as any).phone,
      hasSmartUserConfirmedEmail: !!ctx.user.confirmedEmail,
      smartUserConfirmedEmail: ctx.user.confirmedEmail,
      rawEmail: (ctx.user as any).email,
      hasProfile: !!profile,
    }
  })

  return {
    user: {
      id: ctx.user.id,
      firstName: ctx.user.firstName || '',
      lastName: ctx.user.lastName || '',
      phone,
      email,
      imageUrl: ctx.user.imageUrl || '',
    },
    profile: profile ? {
      // Домашний адрес
      street: profile.street || '',
      house: profile.house || '',
      apartment: profile.apartment || '',
      entrance: profile.entrance || '',
      floor: profile.floor || '',
      intercom: profile.intercom || '',
      // Рабочий адрес
      workStreet: profile.workStreet || '',
      workHouse: profile.workHouse || '',
      workApartment: profile.workApartment || '',
      workEntrance: profile.workEntrance || '',
      workFloor: profile.workFloor || '',
      workIntercom: profile.workIntercom || '',
    } : null,
  }
})
