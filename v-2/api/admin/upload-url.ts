import { requireAccountRole } from '@app/auth'
import { obtainStorageFilePutUrl } from '@app/storage'

export const apiAdminUploadUrlRoute = app.get('/', async (ctx, req) => {
  requireAccountRole(ctx, 'Admin')

  const uploadUrl = await obtainStorageFilePutUrl(ctx)

  return { uploadUrl }
})
