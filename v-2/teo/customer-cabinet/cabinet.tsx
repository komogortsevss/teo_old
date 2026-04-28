import { jsx } from "@app/html-jsx"
import CabinetPage from './pages/CabinetPage.vue'

export const cabinetPageRoute = app.get('/', async (ctx, req) => {
  const customerId = req.query.customerId
  
  return (
    <html lang="ru">
      <head>
        <title>Личный кабинет | ТЕО</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <CabinetPage customerId={customerId} />
      </body>
    </html>
  )
})
