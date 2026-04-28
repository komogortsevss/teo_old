import { jsx } from "@app/html-jsx"
import { StylesHead } from './styles'
import ProductPage from './pages/ProductPage.vue'
import ProductsTable from './tables/products.table'
import CategoriesTable from './tables/categories.table'
import StockTable from './tables/stock.table'
import { mapProductToDto, calcMaxBouquets } from './shared/mapProduct'
import { catalogPageRoute } from './catalog'

export const productSeoPageRoute = app.get('/', async (ctx, req) => {
  const categorySlug = req.query.category as string
  const productSlug = req.query.slug as string

  let product: any = null
  let categoryName = ''
  let pageTitle = 'Букет — ТЕО'
  let pageDescription = 'Свежие цветы из Эквадора с доставкой по Москве. Прямые поставки лучших букетов по честной цене.'
  let ogImage = ''
  let productJsonLd = ''
  let canonicalUrl = ''

  if (categorySlug && productSlug) {
    // Находим категорию по slug
    const category = await CategoriesTable.findOneBy(ctx, { slug: categorySlug })
    
    if (category) {
      categoryName = category.name
      
      // Находим товар по slug и категории
      const p = await ProductsTable.findOneBy(ctx, {
        slug: productSlug,
        category: category.id,
      })

      if (p) {
        const [stock] = await Promise.all([
          StockTable.findAll(ctx, { limit: 1000 }),
        ])
        
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
        canonicalUrl = `https://teo2you.chatium.ru/v-2/catalog/${categorySlug}/${productSlug}`

        productJsonLd = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": p.name,
          "description": p.description || 'Свежие цветы из Эквадора',
          "image": ogImage || undefined,
          "url": canonicalUrl,
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
  }

  const productJson = JSON.stringify(product)
  const categoryJson = JSON.stringify({ slug: categorySlug, name: categoryName })

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
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:site_name" content="ТЕО" />
        <link rel="canonical" href={canonicalUrl} />
        <script src="/s/metric/clarity.js" async></script>
        <StylesHead />
        <script>{`window.__INITIAL_PRODUCT__ = ${productJson}`}</script>
        <script>{`window.__CATEGORY__ = ${categoryJson}`}</script>
        {productJsonLd ? <script type="application/ld+json">{productJsonLd}</script> : <></>}
      </head>
      <body>
        <ProductPage />
      </body>
    </html>
  )
})
