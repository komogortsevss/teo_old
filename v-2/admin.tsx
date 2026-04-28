import { jsx } from '@app/html-jsx'
import { requireAccountRole } from '@app/auth'
import AdminPage from './pages/AdminPage.vue'

const ADMIN_PASSWORD = 'teo-admin-2025'

export const adminPageRoute = app.get('/')
  .query(s => ({
    access: s.string().optional(),
  }))
  .handle(async (ctx, req) => {
    requireAccountRole(ctx, 'Admin')
    
    // Проверка пароля
    if (req.query.access !== ADMIN_PASSWORD) {
      return (
        <html lang="ru">
          <head>
            <meta charset="utf-8" />
            <title>Доступ запрещён — ТЕО</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>{`
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #f5f5f5;
              }
              .login-box {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 90%;
              }
              h1 { margin: 0 0 24px; font-size: 24px; color: #2B2233; }
              input {
                width: 100%;
                padding: 12px 16px;
                font-size: 16px;
                border: 2px solid #e5e5e5;
                border-radius: 8px;
                box-sizing: border-box;
                margin-bottom: 16px;
              }
              input:focus {
                outline: none;
                border-color: #A88BC8;
              }
              button {
                width: 100%;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: 600;
                color: white;
                background: #A88BC8;
                border: none;
                border-radius: 8px;
                cursor: pointer;
              }
              button:hover { background: #8E6FB2; }
              .error { color: #ef4444; margin-top: 12px; font-size: 14px; }
            `}</style>
          </head>
          <body>
            <div class="login-box">
              <h1>🔐 Админка ТЕО</h1>
              <form method="get" action="">
                <input 
                  type="password" 
                  name="access" 
                  placeholder="Введите пароль" 
                  required
                  autofocus
                />
                <button type="submit">Войти</button>
              </form>
              {req.query.access && <div class="error">Неверный пароль</div>}
            </div>
          </body>
        </html>
      )
    }

    return (
      <html lang="ru">
        <head>
          <meta charset="utf-8" />
          <title>Админка — ТЕО</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="robots" content="noindex,nofollow" />
          <link rel="icon" type="image/png" href="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
          <link href="/s/static/lib/fontawesome/6.7.2/css/all.min.css" rel="stylesheet" />
        </head>
        <body>
          <AdminPage />
        </body>
      </html>
    )
  })
