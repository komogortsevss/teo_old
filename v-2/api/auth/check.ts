import { findBucketById } from '@sender/sdk'
import { getOrCreateUserChatLinkToken } from '@sender/sdk'
import { findUserById } from '@app/auth'

export const apiAuthCheckRoute = app.post('/', async (ctx, req) => {
  const { bucketId } = req.body as { bucketId: string }

  if (!bucketId) {
    return { success: false, error: 'Missing bucketId' }
  }

  const bucket = await findBucketById(ctx, bucketId)
  if (!bucket) {
    return { success: false, error: 'Session not found' }
  }

  const data = bucket.data
  if (!data || data.type !== 'auth') {
    return { success: false, error: 'Invalid session' }
  }

  if (!data.verified || !data.userId) {
    return { success: false, status: 'pending' }
  }

  const user = await findUserById(ctx, data.userId)
  if (!user) {
    return { success: false, error: 'User not found' }
  }

  const tokenObj = await getOrCreateUserChatLinkToken(ctx, user.id, {
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  })

  const tokenId = tokenObj?.id || ''

  ctx.account.log('Auth check: token result', {
    level: 'info',
    json: { tokenType: typeof tokenObj, tokenId, keys: tokenObj ? Object.keys(tokenObj) : [] },
  })

  return {
    success: true,
    status: 'verified',
    userId: user.id,
    displayName: user.displayName,
    loginUrl: `/s/auth/token-login?token=${tokenId}&back=/v-2`,
  }
})
