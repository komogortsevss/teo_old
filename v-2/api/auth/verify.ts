import { findBucketById, updateOrCreateBucket } from '@sender/sdk'

export const apiAuthVerifyRoute = app.post('/', async (ctx, req) => {
  const { bucketId, code } = req.body as { bucketId: string; code: string }

  if (!bucketId || !code) {
    return { success: false, error: 'Missing data' }
  }

  const bucket = await findBucketById(ctx, bucketId)
  if (!bucket || !bucket.data || bucket.data.type !== 'auth') {
    return { success: false, error: 'Session not found' }
  }

  if (bucket.data.verified) {
    return { success: true, alreadyVerified: true }
  }

  const elapsed = Date.now() - (bucket.data.createdAt || 0)
  if (elapsed > 10 * 60 * 1000) {
    return { success: false, error: 'Code expired' }
  }

  if (bucket.data.code !== code) {
    return { success: false, error: 'Wrong code' }
  }

  await updateOrCreateBucket(ctx, bucketId, {
    ...bucket.data,
    verified: true,
  })

  return { success: true }
})
