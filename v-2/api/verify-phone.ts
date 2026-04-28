import { normalizeIdentityKey, findIdentities, createRealUser } from '@app/auth'
import ProfilesTable from '../tables/profiles.table'
import { sendMessageToChat } from '@sender/sdk'

interface VerifyPhoneBody {
  phone: string
  code?: string
  name?: string
  address?: {
    street?: string
    apartment?: string
    entrance?: string
    floor?: string
    intercom?: string
  }
}

// Store codes temporarily (in production use Redis or DB with TTL)
const codeStore = new Map<string, { code: string; expires: number }>()

// Generate 4-digit code
function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

// Send SMS code
async function sendVerificationCode(ctx, phone: string) {
  const normalizedPhone = normalizeIdentityKey('Phone', phone)
  
  // Generate code
  const code = generateCode()
  const expires = Date.now() + 10 * 60 * 1000 // 10 minutes
  
  // Store code
  codeStore.set(normalizedPhone, { code, expires })
  
  // Send SMS via Max (for demo - also log to account)
  try {
    await sendMessageToChat(ctx, 'ZtOrWOsp2zCy58VGGVG0teo2y', {
      text: `Код подтверждения для оформления заказа: ${code}\nНомер: ${phone}`,
    })
  } catch (e) {
    // Ignore errors - code is also logged
  }
  
  // Log for debugging (in production remove this)
  ctx.account.log('SMS verification code', {
    level: 'info',
    json: { phone: normalizedPhone, code },
  })
  
  return { success: true }
}

// Verify code and create/login user
async function verifyAndCreateUser(ctx, phone: string, code: string, name?: string, address?: VerifyPhoneBody['address']) {
  const normalizedPhone = normalizeIdentityKey('Phone', phone)
  
  // Check code
  const stored = codeStore.get(normalizedPhone)
  if (!stored || stored.code !== code || Date.now() > stored.expires) {
    throw new Error('Invalid code')
  }
  
  // Clear used code
  codeStore.delete(normalizedPhone)
  
  // Check if user already exists with this phone
  const existingIdentities = await findIdentities(ctx, {
    where: {
      type: 'Phone',
      key: normalizedPhone,
    },
  })
  
  let userId: string | null = null
  let isNewUser = false
  
  if (existingIdentities.length > 0 && existingIdentities[0].userId) {
    // User exists - return existing user ID
    userId = existingIdentities[0].userId
  } else {
    // Create new user
    isNewUser = true
    const newUser = await createRealUser(ctx, {
      firstName: name || 'Пользователь',
      unconfirmedIdentities: {
        Phone: normalizedPhone,
      },
    })
    userId = newUser.id
    
    // Save address to profile
    if (address && address.street) {
      await ProfilesTable.create(ctx, {
        userId: newUser.id,
        street: address.street || '',
        apartment: address.apartment || '',
        entrance: address.entrance || '',
        floor: address.floor || '',
        intercom: address.intercom || '',
      })
    }
  }
  
  // Save/update address for existing user if provided
  if (!isNewUser && address && address.street && userId) {
    const existingProfile = await ProfilesTable.findOneBy(ctx, { userId })
    if (existingProfile) {
      await ProfilesTable.update(ctx, {
        id: existingProfile.id,
        street: address.street || existingProfile.street,
        apartment: address.apartment || existingProfile.apartment,
        entrance: address.entrance || existingProfile.entrance,
        floor: address.floor || existingProfile.floor,
        intercom: address.intercom || existingProfile.intercom,
      })
    } else {
      await ProfilesTable.create(ctx, {
        userId,
        street: address.street || '',
        apartment: address.apartment || '',
        entrance: address.entrance || '',
        floor: address.floor || '',
        intercom: address.intercom || '',
      })
    }
  }
  
  return { success: true, userId, isNewUser }
}

export const apiVerifyPhoneRoute = app.post('/', async (ctx, req) => {
  const body = req.body as VerifyPhoneBody
  const { phone, code, name, address } = body
  
  if (!phone) {
    return { success: false, error: 'Phone required' }
  }
  
  // If no code provided - send SMS
  if (!code) {
    try {
      await sendVerificationCode(ctx, phone)
      return { success: true, sent: true }
    } catch (e) {
      return { success: false, error: 'Failed to send SMS' }
    }
  }
  
  // Verify code
  try {
    const result = await verifyAndCreateUser(ctx, phone, code, name, address)
    return result
  } catch (e) {
    return { success: false, error: 'Invalid code' }
  }
})
