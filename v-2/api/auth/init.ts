import { createBucket } from '@sender/sdk'

const TELEGRAM_CHANNEL_ID = 'Bv4lCADTguGdgPFfg8K0teo2y'
const MAX_CHANNEL_ID = '7bCUb4uV5MZCXvKyhGL0teo2y'
const TELEGRAM_BOT_USERNAME = 'teo2you_bot'

function generateCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export const apiAuthInitRoute = app.post('/', async (ctx, req) => {
  const { messenger } = req.body as { messenger: 'telegram' | 'max' }

  if (!messenger || !['telegram', 'max'].includes(messenger)) {
    return { success: false, error: 'Invalid messenger' }
  }

  const code = generateCode()
  const channelId = messenger === 'telegram' ? TELEGRAM_CHANNEL_ID : MAX_CHANNEL_ID

  const bucket = await createBucket(ctx, {
    type: 'auth',
    code,
    messenger,
    channelId,
    verified: false,
    userId: null,
    createdAt: Date.now(),
  })

  ctx.account.log('Auth init', {
    level: 'info',
    json: { bucketId: bucket.id, messenger, code },
  })

  let deepLink = ''
  let instructions = ''
  if (messenger === 'telegram') {
    deepLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=auth-${bucket.id}`
    instructions = 'Нажмите кнопку ниже, откроется Telegram. Нажмите «START» и код придёт автоматически.'
  } else {
    deepLink = `https://max.me/messages/id750801815863_1_bot?start=auth-${bucket.id}`
    instructions = 'Нажмите кнопку ниже, откроется Max. Если код не пришёл автоматически — напишите в чат слово «start» и код будет отправлен.'
  }

  return {
    success: true,
    bucketId: bucket.id,
    deepLink,
    instructions,
  }
})
