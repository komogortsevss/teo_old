import {
  findBucketById,
  updateOrCreateBucket,
  sendMessageByTypeAndExternalId,
  getPersonByChatId,
  findChatByExternalId,
} from '@sender/sdk'
import {
  findIdentities,
  normalizeIdentityKey,
  createRealUser,
  findUserById,
} from '@app/auth'

const TELEGRAM_CHANNEL_ID = 'Bv4lCADTguGdgPFfg8K0teo2y'
const MAX_CHANNEL_ID = '7bCUb4uV5MZCXvKyhGL0teo2y'

app.accountHook('@sender/webhook-received', async (ctx, params) => {
  const { channel, sourcePayload, chatId } = params

  if (channel.id !== TELEGRAM_CHANNEL_ID && channel.id !== MAX_CHANNEL_ID) return

  ctx.account.log('Auth webhook: raw payload received', {
    level: 'info',
    json: {
      channelId: channel.id,
      channelSource: channel.source,
      chatId,
      payloadKeys: sourcePayload ? Object.keys(sourcePayload) : [],
      payload: JSON.stringify(sourcePayload).slice(0, 3000),
    },
  })

  let messageText = ''
  let externalChatId = ''

  if (channel.id === TELEGRAM_CHANNEL_ID) {
    const msg = sourcePayload?.message
    if (!msg || !msg.text) return
    messageText = msg.text
    externalChatId = String(msg.chat?.id || msg.from?.id || '')
  } else {
    // Max Messenger (External channel) — payload может быть в разных форматах
    const payload = sourcePayload?.body || sourcePayload
    if (!payload) return

    // Извлекаем текст сообщения из всех возможных мест
    messageText = payload?.text
      || payload?.message?.text
      || payload?.body?.text
      || ''

    // Проверяем callback-кнопки
    if (!messageText && payload?.payload?.buttons) {
      messageText = payload.payload.buttons[0]?.callback_data || ''
    }

    // Извлекаем externalChatId из всех возможных мест
    externalChatId = String(
      payload?.from?.user_id
      || payload?.chat_id
      || payload?.user?.user_id
      || payload?.sender?.user_id
      || payload?.message?.from?.user_id
      || ''
    )

    // КРИТИЧНО: Max может передавать deep link start-параметр отдельно от текста
    // Ищем auth- паттерн в ЛЮБОМ месте payload
    const payloadStr = JSON.stringify(sourcePayload)
    const authMatch = payloadStr.match(/auth-([a-zA-Z0-9_-]+)/)
    if (authMatch && !messageText.includes('auth-')) {
      messageText = `/start auth-${authMatch[1]}`
    }

    ctx.account.log('Auth webhook MAX parsed', {
      level: 'info',
      json: { messageText, externalChatId },
    })
  }

  // Ищем bucketId в тексте
  let bucketId: string | null = null

  // Ищем auth-xxx паттерн в любом месте текста
  const authBucketMatch = messageText.match(/auth-(\S+)/)
  if (authBucketMatch) {
    bucketId = authBucketMatch[1]
  } else if (
    messageText.toLowerCase().trim() === 'start'
    || messageText.toLowerCase().trim() === '/start'
    || !messageText.trim()
  ) {
    ctx.account.log('Auth webhook: plain start or empty message', {
      level: 'info',
      json: { externalChatId, channelId: channel.id, messageText },
    })
    if (externalChatId) {
      try {
        await sendMessageByTypeAndExternalId(ctx, {
          type: channel.id === TELEGRAM_CHANNEL_ID ? 'Telegram' : 'External',
          id: externalChatId,
          channels: [channel.id],
          message: {
            text: '🌸 Для авторизации на сайте ТЕО перейдите на сайт и нажмите «Войти».',
          },
          createChatParams: {},
        })
      } catch (e) {
        ctx.account.log('Auth webhook: failed to send hint', {
          level: 'error',
          json: { error: String(e) },
        })
      }
    }
    return
  } else {
    // Сообщение не связано с авторизацией
    return
  }

  if (!bucketId) return

  ctx.account.log('Auth webhook: found bucketId', {
    level: 'info',
    json: { bucketId, externalChatId },
  })

  const bucket = await findBucketById(ctx, bucketId)

  if (!bucket || !bucket.data || bucket.data.type !== 'auth') {
    ctx.account.log('Auth webhook: invalid bucket', { level: 'warn', json: { bucketId } })
    return
  }

  if (bucket.data.verified) return

  const code = bucket.data.code
  const channelSource = channel.id === TELEGRAM_CHANNEL_ID ? 'Telegram' : 'External'

  try {
    await sendMessageByTypeAndExternalId(ctx, {
      type: channelSource,
      id: externalChatId,
      channels: [channel.id],
      message: {
        text: `🌸 Ваш код для входа на сайт ТЕО:\n\n🔑 ${code}\n\nВведите этот код на сайте для авторизации.`,
      },
      createChatParams: {},
    })
    ctx.account.log('Auth webhook: code sent successfully', {
      level: 'info',
      json: { bucketId, code, externalChatId },
    })
  } catch (e) {
    ctx.account.log('Auth webhook: failed to send code', {
      level: 'error',
      json: { bucketId, error: String(e) },
    })
  }

  let userId: string | null = null

  try {
    let person = null
    if (chatId) {
      person = await getPersonByChatId(ctx, chatId)
    }
    if (!person && externalChatId) {
      const chat = await findChatByExternalId(ctx, {
        chatExternalId: externalChatId,
        channelId: channel.id,
        getPerson: true,
      })
      if (chat && 'person' in chat) {
        person = chat.person
      }
    }

    if (person?.user) {
      userId = person.user
      ctx.account.log('Auth webhook: found existing user from person', {
        level: 'info',
        json: { userId, personId: person.id },
      })
    }

    if (!userId && person?.phone) {
      const normalized = normalizeIdentityKey('Phone', person.phone)
      const identities = await findIdentities(ctx, {
        where: { type: 'Phone', key: normalized },
      })
      if (identities.length > 0) {
        userId = identities[0].userId
      }
    }

    if (!userId && channel.id === TELEGRAM_CHANNEL_ID) {
      const tgId = sourcePayload?.message?.from?.id
      if (tgId) {
        const identities = await findIdentities(ctx, {
          where: { type: 'TelegramId', key: String(tgId) },
        })
        if (identities.length > 0) {
          userId = identities[0].userId
        }
      }
    }

    if (!userId) {
      const firstName = person?.firstName
        || sourcePayload?.message?.from?.first_name
        || 'Пользователь'
      const lastName = person?.lastName
        || sourcePayload?.message?.from?.last_name
        || ''

      const newUser = await createRealUser(ctx, {
        firstName,
        lastName: lastName || undefined,
      })
      userId = newUser.id
      ctx.account.log('Auth webhook: created new user', {
        level: 'info',
        json: { userId, firstName },
      })
    }
  } catch (e) {
    ctx.account.log('Auth webhook: user resolution error', {
      level: 'error',
      json: { error: String(e) },
    })
  }

  await updateOrCreateBucket(ctx, bucketId, {
    ...bucket.data,
    userId,
    externalChatId,
    channelId: channel.id,
  })

  ctx.account.log('Auth webhook: bucket updated, waiting verification', {
    level: 'info',
    json: { bucketId, userId, externalChatId },
  })
})

app.post('/', async (ctx, req) => {
  return { ok: true }
})
