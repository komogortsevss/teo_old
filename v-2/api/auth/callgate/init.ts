// @ts-nocheck
import { request } from '@app/request'

const SMSPROFI_TOKEN = 'dgr65o10az8yd62d0ubu2swnhzcw10swm9ctj87wpen8twlzybv738o15uip21x3'
const SMSPROFI_API_URL = 'https://lcab.smsprofi.ru/json/v1.0'

export const apiCallGateInitRoute = app.post('/', async (ctx, req) => {
  const { phone } = req.body

  if (!phone || !/^\+7\d{10}$/.test(phone)) {
    return { success: false, error: 'Некорректный номер телефона' }
  }

  try {
    const response = await request({
      method: 'post',
      url: `${SMSPROFI_API_URL}/callgate/create`,
      headers: {
        'X-Token': SMSPROFI_TOKEN,
        'Content-Type': 'application/json'
      },
      json: {
        recipient: phone
      },
      throwHttpErrors: false
    })

    ctx.account.log('SMSProfi Call Gate init response', {
      level: 'info',
      json: { phone, statusCode: response.statusCode, body: response.body }
    })

    if (response.statusCode === 200 && response.body?.success) {
      const result = response.body.result
      return {
        success: true,
        callNumber: result.mobile,
        sessionId: result.id,
        message: 'Позвоните на указанный номер'
      }
    } else {
      ctx.account.log('Call Gate init error', {
        level: 'error',
        json: { phone, response: response.body }
      })
      return {
        success: false,
        error: response.body?.error?.descr || 'Не удалось получить номер для звонка'
      }
    }
  } catch (error) {
    ctx.account.log('Call Gate init exception', {
      level: 'error',
      json: { phone, error: String(error) }
    })
    return {
      success: false,
      error: 'Ошибка соединения с сервисом авторизации'
    }
  }
})
