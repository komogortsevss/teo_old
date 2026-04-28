import { jsx } from "@app/html-jsx"
import { StylesHead } from './styles'
import AboutPage from './pages/AboutPage.vue'

export const aboutPageRoute = app.get('/', async (ctx, req) => {
  return (
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>О нас — история ТЕО | Свежие цветы из Эквадора</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="ТЕО — сервис доставки свежих цветов из Эквадора в Москве. Прямые поставки без посредников по честной цене. Узнайте историю нашего основателя." />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" href="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <link rel="canonical" href="https://teo2you.chatium.ru/v-2/about" />
        <meta property="og:title" content="О нас — история ТЕО" />
        <meta property="og:description" content="Сервис доставки свежих цветов из Эквадора. Прямые поставки без посредников по честной цене." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://teo2you.chatium.ru/v-2/about" />
        <meta property="og:image" content="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:site_name" content="ТЕО" />
        <script src="/s/metric/clarity.js" async></script>
        <StylesHead />
      </head>
      <body>
        <AboutPage />
      </body>
    </html>
  )
})
