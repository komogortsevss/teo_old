import { jsx } from "@app/html-jsx"
import { StylesHead, YandexMapsScript } from './styles'
import DeliveryPage from './pages/DeliveryPage.vue'

export const deliveryPageRoute = app.get('/', async (ctx, req) => {
  return (
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>Доставка и оплата — ТЕО | Доставка цветов по Москве</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Бесплатная доставка цветов по Москве в пределах МКАД. Ежедневная доставка с 09:00 до 21:00. Оплата банковской картой на сайте." />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" href="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <link rel="canonical" href="https://teo2you.chatium.ru/v-2/delivery" />
        <meta property="og:title" content="Доставка и оплата — ТЕО" />
        <meta property="og:description" content="Бесплатная доставка цветов по Москве в пределах МКАД. Ежедневно с 09:00 до 21:00." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://teo2you.chatium.ru/v-2/delivery" />
        <meta property="og:image" content="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:site_name" content="ТЕО" />
        <script src="/s/metric/clarity.js" async></script>
        <StylesHead />
        <YandexMapsScript />
      </head>
      <body>
        <DeliveryPage />
      </body>
    </html>
  )
})
