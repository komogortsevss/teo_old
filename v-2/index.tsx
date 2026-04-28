import { jsx } from "@app/html-jsx"
import HomePage from './pages/HomePage.vue'
import { StylesHead } from './styles.tsx'
import Hero from './tables/hero.table'
import Stories from './tables/stories.table'
import Banners from './tables/banners.table'
import Products from './tables/products.table'
import { getThumbnailUrl } from '@app/storage'

export const indexPageRoute = app.get('/', async (ctx, req) => {
  const [heroes, stories, banners, availableCount] = await Promise.all([
    Hero.findAll(ctx, {
      where: { isActive: true },
      order: [{ sortOrder: 'asc' }],
      limit: 10
    }),
    Stories.findAll(ctx, {
      where: { isActive: true },
      order: [{ sortOrder: 'asc' }],
      limit: 20
    }),
    Banners.findAll(ctx, {
      where: { isActive: true },
      order: [{ sortOrder: 'asc' }],
      limit: 10
    }),
    Products.select({
      count: { $count: ['id'] }
    }).where({
      isAvailable: true
    }).run(ctx).then(r => r?.[0]?.count || 0)
  ])

  const firstHero = heroes[0]

  const orgJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ТЕО",
    "description": "Доставка свежих цветов из Эквадора по Москве. Прямые поставки по честной цене.",
    "url": "https://teo2you.chatium.ru/v-2",
    "telephone": "80000000000",
    "email": "s@teo2you.ru",
    "address": { "@type": "PostalAddress", "addressLocality": "Москва", "addressCountry": "RU" },
    "areaServed": { "@type": "City", "name": "Москва" },
    "priceRange": "₽₽",
    "openingHours": "Mo-Su 09:00-21:00",
    "image": "https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png"
  })

  return (
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>ТЕО — доставка свежих цветов из Эквадора в Москве</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="Доставка свежих цветов из Эквадора по Москве. Прямые поставки роз, альстромерий и букетов по честной цене. Бесплатная доставка в пределах МКАД." />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" href="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <link rel="canonical" href="https://teo2you.chatium.ru/v-2" />

        <link rel="preconnect" href="https://chatium.ru" />
        <link rel="preconnect" href="https://fs.chatium.ru" crossorigin="anonymous" />
        <link rel="preconnect" href="https://sel.cdn-chatium.io" crossorigin="anonymous" />
        <link rel="dns-prefetch" href="https://chatium.ru" />
        <link rel="dns-prefetch" href="https://fs.chatium.ru" />
        <link rel="dns-prefetch" href="https://sel.cdn-chatium.io" />
        <link rel="dns-prefetch" href="https://start.chatium.ru" />

        {firstHero?.mobileImageHash && (
          <link rel="preload" as="image" href={getThumbnailUrl(firstHero.mobileImageHash, 414, undefined)} fetchpriority="high" media="(max-width: 767px)" />
        )}
        {firstHero?.imageHash && (
          <link rel="preload" as="image" href={getThumbnailUrl(firstHero.imageHash, 800, undefined)} fetchpriority="high" media="(min-width: 768px)" />
        )}

        <meta property="og:title" content="ТЕО — доставка свежих цветов из Эквадора в Москве" />
        <meta property="og:description" content="Прямые поставки свежих цветов из Эквадора по честной цене. Бесплатная доставка по Москве в пределах МКАД." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://teo2you.chatium.ru/v-2" />
        <meta property="og:image" content="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:site_name" content="ТЕО" />
        <script src="/s/metric/clarity.js" async></script>
        <link rel="prefetch" href="/v-2/catalog" as="document" fetchpriority="low" />
        <StylesHead />
        <script type="application/ld+json">{orgJsonLd}</script>
      </head>
      <body>
        <h1 style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;">ТЕО — доставка свежих цветов из Эквадора в Москве</h1>

        <HomePage
          initialHeroes={heroes}
          initialStories={stories}
          initialBanners={banners}
          initialUser={ctx.user}
          initialAvailableCount={availableCount}
        />
      </body>
    </html>
  )
})