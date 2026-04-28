import { jsx } from "@app/html-jsx"
import { StylesHead } from './styles'
import PrivacyPage from './pages/PrivacyPage.vue'

export const privacyPageRoute = app.get('/', async (ctx, req) => {
  return (
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>Политика конфиденциальности — ТЕО</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Политика конфиденциальности интернет-магазина цветов ТЕО. Обработка и защита персональных данных." />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" href="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <link rel="canonical" href="https://teo2you.chatium.ru/v-2/privacy" />
        <meta name="robots" content="noindex,follow" />
        <script src="/s/metric/clarity.js" async></script>
        <StylesHead />
      </head>
      <body>
        <PrivacyPage />
      </body>
    </html>
  )
})
