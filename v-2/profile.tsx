import { jsx } from "@app/html-jsx"
import { StylesHead } from './styles'
import ProfilePage from './pages/ProfilePage.vue'
import { requireRealUser } from '@app/auth'

export const profilePageRoute = app.get('/', async (ctx, req) => {
  requireRealUser(ctx)
  return (
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>Личный кабинет — ТЕО</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="robots" content="noindex,nofollow" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" href="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <StylesHead />
      </head>
      <body>
        <ProfilePage />
      </body>
    </html>
  )
})
