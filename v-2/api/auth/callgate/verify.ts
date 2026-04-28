// @ts-nocheck
import { request } from '@app/request'
import { createRealUser, findIdentities, normalizeIdentityKey, findUserById } from '@app/auth'
import { getOrCreateUserChatLinkToken } from '@sender/sdk'

const SMSPROFI_TOKEN = 'dgr65o10az8yd62d0ubu2swnhzcw10swm9ctj87wpen8twlzybv738o15uip21x3'
const SMSPROFI_API_URL = 'https://lcab.smsprofi.ru/json/v1.0'

export const apiCallGateVerifyRoute = app.post('/', async (ctx, req) => {
  const { phone, sessionId } = req.body

  if (!phone || !/^\+7\d{10}$/.test(phone)) {
    return { success: false, error: 'Некорректный номер телефона' }
  }

  if (!sessionId) {
    return { success: false, error: 'Не указан идентификатор сессии' }
  }

  try {
    const response = await request({
      method: 'post',
      url: `${SMSPROFI_API_URL}/callgate/check`,
      headers: {
        'X-Token': SMSPROFI_TOKEN,
        'Content-Type': 'application/json'
      },
      json: { id: sessionId },
      throwHttpErrors: false,
      responseType: 'text'
    })

    let rawBody = String(response.body).slice(0, 1000)

    let body: any
    try {
      body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body
    } catch (parseErr) {
      ctx.account.log('CallGate check: parse error', {
        level: 'error',
        json: { rawBody, error: String(parseErr) }
      })
      return { success: false, pending: true }
    }

    ctx.account.log('CallGate check response', {
      level: 'info',
      json: { phone, sessionId, statusCode: response.statusCode, body }
    })

    // Ожидание: error.code 501 = "Клиент ещё не звонил"
    if (body?.success === false && body?.error?.code === 501) {
      return { success: false, pending: true }
    }

    // Успешная верификация: success === true
    if (body?.success === true) {
      ctx.account.log('CallGate: verified! Creating user...', {
        level: 'info',
        json: { phone }
      })

      try {
        const normalizedPhone = normalizeIdentityKey('Phone', phone)

        const identities = await findIdentities(ctx, {
          where: {
            type: 'Phone',
            key: normalizedPhone
          },
          limit: 1
        })

        ctx.account.log('CallGate: identities found', {
          level: 'info',
          json: { phone, normalizedPhone, count: identities.length }
        })

        let user
        if (identities.length > 0) {
          user = await findUserById(ctx, identities[0].userId)
          ctx.account.log('CallGate: existing user found', {
            level: 'info',
            json: { userId: identities[0].userId, found: !!user }
          })
        } else {
          user = await createRealUser(ctx, {
            unconfirmedIdentities: {
              Phone: normalizedPhone
            }
          })
          ctx.account.log('CallGate: new user created', {
            level: 'info',
            json: { userId: user?.id }
          })
        }

        if (!user) {
          return { success: false, error: 'Не удалось создать пользователя' }
        }

        const tokenObj = await getOrCreateUserChatLinkToken(ctx, user.id, {
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        })
        const tokenId = tokenObj?.id || ''

        ctx.account.log('CallGate: login token created', {
          level: 'info',
          json: { userId: user.id, tokenId }
        })

        return {
          success: true,
          token: tokenId,
          userId: user.id
        }
      } catch (userErr) {
        ctx.account.log('CallGate: user creation error', {
          level: 'error',
          json: { phone, error: String(userErr), stack: userErr?.stack?.slice?.(0, 500) }
        })
        return { success: false, error: 'Ошибка создания пользователя: ' + String(userErr) }
      }
    }

    // Любая другая ошибка от API
    ctx.account.log('CallGate check: unexpected response', {
      level: 'warn',
      json: { body }
    })

    return {
      success: false,
      pending: false,
      error: body?.error?.descr || 'Ошибка проверки'
    }
  } catch (error) {
    ctx.account.log('CallGate verify exception', {
      level: 'error',
      json: { phone, sessionId, error: String(error), stack: error?.stack?.slice?.(0, 300) }
    })
    return { success: false, pending: true }
  }
})
