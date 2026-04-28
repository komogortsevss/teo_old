import { jsx } from "@app/html-jsx"

export const authPageRoute = app.get('/', async (ctx, req) => {
  const back = req.query.back || '/v-2'
  return ctx.resp.redirect(`/s/auth/signin?back=${encodeURIComponent(back)}`)
})
