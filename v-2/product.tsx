import { jsx } from "@app/html-jsx"
import { StylesHead } from './styles'
import ProductPage from './pages/ProductPage.vue'
import ProductsTable from './tables/products.table'
import StockTable from './tables/stock.table'
import { mapProductToDto, calcMaxBouquets } from './shared/mapProduct'

export const productPageRoute = app.get('/', async (ctx, req) => {
  const id = req.query.id as string

  let product: any = null
  let pageTitle = 'Букет — ТЕО'
  let pageDescription = 'Свежие цветы из Эквадора с доставкой по Москве. Прямые поставки лучших букетов по честной цене.'
  let ogImage = ''
  let productJsonLd = ''

  if (id) {
    const [p, stock] = await Promise.all([
      ProductsTable.findById(ctx, id),
      StockTable.findAll(ctx, { limit: 1000 }),
    ])
    if (p) {
      const stockMap = new Map<string, number>()
      for (const s of stock) {
        const fid = typeof s.flower === 'string' ? s.flower : s.flower?.id
        if (fid) stockMap.set(fid, s.quantity || 0)
      }
      const comp = p.composition as Array<{ flowerId: string; quantity: number }> | null
      const maxBouquets = calcMaxBouquets(comp, stockMap)

      product = mapProductToDto(ctx, p, maxBouquets, stockMap)

      pageTitle = `${p.name} — купить с доставкой по Москве | ТЕО`
      pageDescription = p.description
        ? `${p.description}. Свежие цветы из Эквадора с доставкой по Москве.`
        : 'Свежие цветы из Эквадора с доставкой по Москве. Прямые поставки лучших букетов.'
      ogImage = product.imageHash ? `https://fs.chatium.ru/thumbnail/${product.imageHash}/s/800x1067` : ''

      productJsonLd = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": p.name,
        "description": p.description || 'Свежие цветы из Эквадора',
        "image": ogImage || undefined,
        "url": `https://teo2you.chatium.ru/v-2/product?id=${id}`,
        "brand": {
          "@type": "Brand",
          "name": "ТЕО"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "RUB",
          "price": product.priceAmount,
          "availability": product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "ТЕО"
          },
          "areaServed": {
            "@type": "City",
            "name": "Москва"
          }
        }
      })
    }
  }

  const productJson = JSON.stringify(product)

  return (
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content={pageDescription} />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" href="https://fs.chatium.ru/get/image_msk_Q2skoMs5iq.48x48.png" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="product" />
        {ogImage ? <meta property="og:image" content={ogImage} /> : <></>}
        <meta property="og:url" content={`https://teo2you.chatium.ru/v-2/product?id=${id}`} />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:site_name" content="ТЕО" />
        <link rel="canonical" href={`https://teo2you.chatium.ru/v-2/product?id=${id}`} />
        <script src="/s/metric/clarity.js" async></script>
        <StylesHead />
        <script>{`window.__INITIAL_PRODUCT__ = ${productJson}`}</script>
        {productJsonLd ? <script type="application/ld+json">{productJsonLd}</script> : <></>}
      </head>
      <body>
        <ProductPage />
      </body>
    </html>
  )
})
