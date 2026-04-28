import { jsx } from "@app/html-jsx"
import { StylesHead } from './styles'
import CatalogPage from './pages/CatalogPage.vue'

export const catalogPageRoute = app.get('/', async (ctx, req) => {
  return (
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>Каталог букетов — свежие цветы из Эквадора | ТЕО</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Каталог букетов ТЕО — моно, дуо, трио, кватро и охапки. Свежие эквадорские цветы с бесплатной доставкой по Москве в пределах МКАД." />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" href="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <link rel="canonical" href="https://teo2you.chatium.ru/v-2/catalog" />
        <meta property="og:title" content="Каталог букетов — свежие цветы из Эквадора | ТЕО" />
        <meta property="og:description" content="Моно, дуо, трио, кватро и охапки. Свежие эквадорские цветы с доставкой по Москве." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://teo2you.chatium.ru/v-2/catalog" />
        <meta property="og:image" content="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:site_name" content="ТЕО" />
        <script src="/s/metric/clarity.js" async></script>
        <StylesHead />
      </head>
      <body>
        <CatalogPage />
      </body>
    </html>
  )
})
