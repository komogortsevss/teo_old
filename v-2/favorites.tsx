import { jsx } from "@app/html-jsx"
import { StylesHead } from './styles'
import FavoritesPage from './pages/FavoritesPage.vue'

export const favoritesPageRoute = app.get('/', async (ctx, req) => {
  return (
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>Избранные букеты — ТЕО</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Ваши избранные букеты. Свежие цветы из Эквадора с доставкой по Москве." />
        <meta name="robots" content="noindex,nofollow" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" href="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <StylesHead />
      </head>
      <body>
        <FavoritesPage />
      </body>
    </html>
  )
})
