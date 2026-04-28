import { readWorkspaceFile } from "@start/sdk"

export const apiConfigGetRoute = app.get('/', async (ctx, req) => {
  const configRaw = await readWorkspaceFile(ctx, "config.json") || "{}"
  try {
    return JSON.parse(configRaw)
  } catch (e) {
    ctx.account.log('Error config reading')
    return {}
  }
})