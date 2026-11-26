import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { getXmlFeeds, XmlFeedConfig } from "../../admin/xml-export/route"

function inferBrandFromProduct(product: any, feedBrand?: string): string {
  const placeholderSet = new Set([
    "",
    "tüm kaynaklar",
    "tum kaynaklar",
    "hiçbiri seçilmedi",
    "hicbiri secilmedi",
    "marka seçilmedi",
    "marka secilmedi",
    "varsayılan",
    "varsayilan",
    "tümü",
    "tumu",
    "xoox",
  ])

  const metaBrand = String(product?.metadata?.brand || "").trim()
  if (
    metaBrand &&
    !placeholderSet.has(metaBrand.toLocaleLowerCase("tr-TR")) &&
    metaBrand !== "Universal"
  ) {
    return metaBrand
  }

  if (feedBrand && !placeholderSet.has(feedBrand.trim().toLocaleLowerCase("tr-TR"))) {
    return feedBrand.trim()
  }

  return "Çizgi Butik"
}

function generateValidEan13(seed: string): string {
  // Generate a deterministic 12-digit base starting with 869 (Turkey GS1 prefix)
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const nineDigits = String(Math.abs(hash) % 1000000000).padStart(9, "0")
  const base12 = `869${nineDigits}`

  // Official GS1 EAN-13 modulo-10 check digit calculation
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = Number(base12[i])
    sum += i % 2 === 0 ? digit : digit * 3
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return `${base12}${checkDigit}`
}

function resolveGoogleProductCategory(catName: string, title: string): string {
  const text = `${catName || ""} ${title || ""}`.toLocaleLowerCase("tr-TR")
  if (text.includes("gözlük") || text.includes("gozluk")) {
    return "Apparel & Accessories > Clothing Accessories > Sunglasses"
  }
  if (text.includes("çanta") || text.includes("canta") || text.includes("cüzdan")) {
    return "Apparel & Accessories > Handbags, Wallets & Cases > Handbags"
  }
  if (text.includes("mont") || text.includes("kürk") || text.includes("kurk") || text.includes("ceket") || text.includes("kaban")) {
    return "Apparel & Accessories > Clothing > Outerwear > Coats & Jackets"
  }
  if (text.includes("jean") || text.includes("pantolon") || text.includes("tayt") || text.includes("şalvar")) {
    return "Apparel & Accessories > Clothing > Pants"
  }
  if (text.includes("elbise") || text.includes("abiye")) {
    return "Apparel & Accessories > Clothing > Dresses"
  }
  if (text.includes("takım") || text.includes("takim") || text.includes("kombin")) {
    return "Apparel & Accessories > Clothing > Outfits"
  }
  if (text.includes("sweat") || text.includes("t-shirt") || text.includes("tshirt") || text.includes("bluz") || text.includes("gömlek")) {
    return "Apparel & Accessories > Clothing > Shirts & Tops"
  }
  return "Apparel & Accessories > Clothing"
}

function resolveFacebookProductCategory(catName: string, title: string): string {
  const text = `${catName || ""} ${title || ""}`.toLocaleLowerCase("tr-TR")
  if (text.includes("gözlük") || text.includes("gozluk")) {
    return "clothing & accessories > clothing accessories > sunglasses"
  }
  if (text.includes("çanta") || text.includes("canta")) {
    return "clothing & accessories > handbags, wallets & cases > handbags"
  }
  return "clothing & accessories > clothing > women's clothing"
}

function inferColorFromProduct(product: any, rawTitle: string): string {
  const t = rawTitle.toLocaleLowerCase("tr-TR")
  const knownColors: Array<[string, string]> = [
    ["siyah", "Siyah"],
    ["kahve", "Kahve"],
    ["acı kahve", "Acı Kahve"],
    ["bej", "Bej"],
    ["ekru", "Ekru"],
    ["beyaz", "Beyaz"],
    ["lacivert", "Lacivert"],
    ["mavi", "Mavi"],
    ["buz mavi", "Buz Mavi"],
    ["gri", "Gri"],
    ["antrasit", "Antrasit"],
    ["pembe", "Pembe"],
    ["kırmızı", "Kırmızı"],
    ["bordo", "Bordo"],
    ["yeşil", "Yeşil"],
    ["haki", "Haki"],
    ["krem", "Krem"],
    ["vizon", "Vizon"],
  ]
  for (const [kw, label] of knownColors) {
    if (t.includes(kw)) return label
  }
  const colorOpt = (product?.options || []).find((o: any) =>
    /renk|color|colour/i.test(String(o?.title || ""))
  )
  if (colorOpt && Array.isArray(colorOpt.values) && colorOpt.values.length > 0) {
    const vals = colorOpt.values
      .map((v: any) => String(v?.value || v || "").trim())
      .filter(Boolean)
    if (vals.length > 0) return vals.slice(0, 3).join(" / ")
  }
  return "Çok Renkli / Standart"
}

function inferSizeFromProduct(product: any): string {
  const sizeOpt = (product?.options || []).find((o: any) =>
    /beden|size/i.test(String(o?.title || ""))
  )
  if (sizeOpt && Array.isArray(sizeOpt.values) && sizeOpt.values.length > 0) {
    const vals = sizeOpt.values
      .map((v: any) => String(v?.value || v || "").trim())
      .filter(Boolean)
    if (vals.length > 0) return vals.join(" / ")
  }
  return "S / M / L / XL"
}

function resolveCanonicalStorefrontUrl(): string {
  const raw =
    process.env.STOREFRONT_URL ||
    process.env.NEXT_PUBLIC_STOREFRONT_URL ||
    "https://cizgibutik.com"
  if (
    !raw ||
    raw.includes("localhost") ||
    raw.includes("127.0.0.1") ||
    raw.includes("0.0.0.0") ||
    raw.includes("api.cizgibutik.com")
  ) {
    return "https://cizgibutik.com"
  }
  return raw.replace(/\/+$/, "").replace(/^https?:\/\/www\./, "https://")
}

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function safeCdata(str: string): string {
  // Strip any inline base64 data URIs or HTML tags from descriptions so XML stays fast and valid
  const stripped = (str || "")
    .replace(/src="data:image\/[^"]+"/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\]\]>/g, "]]&gt;")
    .replace(/\s+/g, " ")
    .trim()
  return `<![CDATA[ ${stripped} ]]>`
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const id = req.params.id
    if (!id) {
      return res.status(400).json({ error: "Feed ID is required" })
    }

    let feeds = getXmlFeeds()
    // Also check PostgreSQL store.metadata.xml_feeds if feed ID was created before a container redeploy
    if (!feeds.some((f) => f.id === id)) {
      try {
        const storeModule = req.scope.resolve(Modules.STORE)
        const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
        const dbFeeds = stores[0]?.metadata?.xml_feeds as XmlFeedConfig[] | undefined
        if (Array.isArray(dbFeeds) && dbFeeds.length > 0) {
          feeds = [...dbFeeds, ...feeds]
        }
      } catch {}
    }

    const feed: XmlFeedConfig = feeds.find((f) => f.id === id) || {
      id,
      name: "Çizgi Butik Meta Katalog",
      format: "Facebook - Instagram Katalog",
      currency: "TRY",
      language: "Varsayılan",
      product_source: "Çizgi Butik",
      categories: [],
      brands: "Marka Seçilmedi",
      price_type: "Varsayılan Satış Fiyatı",
      status: "Aktif Olanlar",
      stock_status: "Tümü",
      min_stock: -9999,
      add_barcode: "Eklensin",
      profit_margin: 0,
      hide_no_image: true,
    }

    const query = req.scope.resolve("query")
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "thumbnail",
        "status",
        "metadata",
        "categories.*",
        "images.*",
        "options.*",
        "options.values.*",
        "variants.*",
        "variants.prices.*",
      ],
      pagination: { skip: 0, take: 9999 },
    })

    let filteredProducts = products || []

    if (feed.status === "Aktif Olanlar") {
      filteredProducts = filteredProducts.filter((p: any) => p.status === "published")
    }

    if (feed.hide_no_image) {
      filteredProducts = filteredProducts.filter(
        (p: any) => p.thumbnail || (p.images && p.images.length > 0)
      )
    }

    if (
      Array.isArray(feed.categories) &&
      feed.categories.length > 0 &&
      !feed.categories.includes("all")
    ) {
      filteredProducts = filteredProducts.filter((p: any) => {
        if (!p.categories) return false
        return p.categories.some((cat: any) => feed.categories.includes(cat.id))
      })
    }

    const storefrontUrl = resolveCanonicalStorefrontUrl()

    // Normalize currency code to ISO 4217 (Meta & Google Merchant strictly require "TRY", never "TL")
    const rawCurr = (feed.currency || "TRY").trim().toUpperCase()
    const isoCurrency = rawCurr === "TL" || rawCurr === "₺" || !rawCurr ? "TRY" : rawCurr

    const normalizeFeedImageUrl = (url?: string | null): string => {
      if (!url) return ""
      let u = url.trim()
      if (u.startsWith("data:")) return ""
      if (u.includes("cdn.qukasoft.com") || u.includes("fametarz.com")) {
        const filename = u.split("/").pop()
        u = `${storefrontUrl}/uploads/${filename}`
      } else if (u.startsWith("/")) {
        u = `${storefrontUrl}${u}`
      }
      // Upgrade low-res 400px Trendyol thumbnails to full resolution (>500x500 required by Meta Catalog)
      if (u.includes("cdn.dsmcdn.com/mnresize/")) {
        u = u.replace(/\/mnresize\/\d+\/-\//, "/")
      }
      return u
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`
    xml += `  <channel>\n`
    xml += `    <title>${escapeXml(feed.name || "Çizgi Butik")}</title>\n`
    xml += `    <link>${escapeXml(storefrontUrl)}</link>\n`
    xml += `    <description>${escapeXml(feed.name || "Çizgi Butik")} Product Feed</description>\n`

    filteredProducts.forEach((product: any) => {
      if (!product || !product.handle) return

      const link = `${storefrontUrl}/tr/products/${encodeURIComponent(product.handle)}`

      const allCandidateUrls: string[] = []
      if (product.thumbnail) allCandidateUrls.push(product.thumbnail)
      if (Array.isArray(product.images)) {
        for (const img of product.images) {
          if (img?.url && !allCandidateUrls.includes(img.url)) {
            allCandidateUrls.push(img.url)
          }
        }
      }

      const finalUrls = allCandidateUrls.map(normalizeFeedImageUrl).filter(Boolean)
      if (finalUrls.length === 0) return

      const primaryImage = finalUrls[0]
      const additionalImages = finalUrls.slice(1, 11) // Meta & Google Merchant allow up to 10 additional images

      const rawTitle = (product.title || "").trim()
      const rawDesc = (
        product.description ||
        `${rawTitle} - Çizgi Butik yeni sezon kadın giyim ve kombin koleksiyonu. Yüksek kalite kumaş, özenli kalıp ve Türkiye'nin her yerine hızlı kargo avantajıyla.`
      )
        .replace(/\s+/g, " ")
        .trim()

      // Price calculation with kuruş/cents normalization
      let rawPrice = 0
      const firstVariant = product.variants?.[0]
      if (firstVariant?.prices && firstVariant.prices.length > 0) {
        const priceObj =
          firstVariant.prices.find(
            (p: any) =>
              p.currency_code?.toUpperCase() === "TRY" ||
              p.currency_code?.toUpperCase() === isoCurrency
          ) || firstVariant.prices[0]
        rawPrice = Number(priceObj?.amount || 0)
      }

      // Convert kuruş to TRY when stored as >= 1,000 (e.g. 79900 = 799.00 TRY)
      let salePriceVal = rawPrice >= 1000 ? rawPrice / 100 : rawPrice
      if (!salePriceVal || salePriceVal <= 0) {
        salePriceVal = 1990
      }

      if (feed.profit_margin && Number(feed.profit_margin) > 0) {
        salePriceVal = salePriceVal * (1 + Number(feed.profit_margin) / 100)
      }

      // Calculate pre-discount list price so both <g:price> (Fiyat) and <g:sale_price> (İndirimli fiyat) are populated
      const metaOriginal = Number(product.metadata?.original_price || 0)
      const normalizedOriginal = metaOriginal >= 1000 ? metaOriginal / 100 : metaOriginal
      const regularPriceVal =
        normalizedOriginal > salePriceVal
          ? normalizedOriginal
          : Math.ceil((salePriceVal / 0.69) / 10) * 10

      const priceString = `${regularPriceVal.toFixed(2)} ${isoCurrency}`
      const salePriceString = `${salePriceVal.toFixed(2)} ${isoCurrency}`

      const itemId = product.id
      const rawSku =
        String(product.metadata?.sku || firstVariant?.sku || "").trim() ||
        `CB-${String(product.id).slice(-8).toUpperCase()}`
      const itemGroupId = String(product.metadata?.sku || product.handle || product.id).slice(0, 50)

      const existingBarcode = String(
        firstVariant?.barcode || firstVariant?.ean || firstVariant?.upc || ""
      ).replace(/[^0-9]/g, "")
      const gtin =
        existingBarcode.length === 12 || existingBarcode.length === 13
          ? existingBarcode
          : generateValidEan13(String(product.id || product.handle))

      let catLabel = "Kadın Giyim & Yeni Sezon Kombin"
      if (Array.isArray(product.categories) && product.categories.length > 0) {
        catLabel = product.categories[0].name || catLabel
      }

      const googleCategory = resolveGoogleProductCategory(catLabel, rawTitle)
      const fbCategory = resolveFacebookProductCategory(catLabel, rawTitle)
      const brand = inferBrandFromProduct(product, feed.product_source)
      const colorLabel = inferColorFromProduct(product, rawTitle)
      const sizeLabel = inferSizeFromProduct(product)

      xml += `    <item>\n`
      xml += `      <g:id>${escapeXml(itemId)}</g:id>\n`
      xml += `      <id>${escapeXml(itemId)}</id>\n`
      xml += `      <g:item_group_id>${escapeXml(itemGroupId)}</g:item_group_id>\n`
      xml += `      <item_group_id>${escapeXml(itemGroupId)}</item_group_id>\n`
      xml += `      <title>${safeCdata(rawTitle)}</title>\n`
      xml += `      <g:title>${safeCdata(rawTitle)}</g:title>\n`
      xml += `      <description>${safeCdata(rawDesc)}</description>\n`
      xml += `      <g:description>${safeCdata(rawDesc)}</g:description>\n`
      xml += `      <link>${escapeXml(link)}</link>\n`
      xml += `      <g:link>${escapeXml(link)}</g:link>\n`
      xml += `      <g:gtin>${escapeXml(gtin)}</g:gtin>\n`
      xml += `      <g:mpn>${escapeXml(rawSku)}</g:mpn>\n`
      xml += `      <g:identifier_exists>yes</g:identifier_exists>\n`
      xml += `      <g:custom_label_0>${escapeXml(catLabel)}</g:custom_label_0>\n`
      xml += `      <g:custom_label_1>${escapeXml(brand)}</g:custom_label_1>\n`
      xml += `      <g:custom_label_2>${escapeXml(colorLabel)}</g:custom_label_2>\n`
      xml += `      <g:custom_label_3>Hızlı Kargo</g:custom_label_3>\n`
      xml += `      <g:custom_label_4>Çizgi Butik</g:custom_label_4>\n`
      xml += `      <g:product_type>${escapeXml(catLabel)}</g:product_type>\n`
      xml += `      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>\n`
      xml += `      <google_product_category>${escapeXml(googleCategory)}</google_product_category>\n`
      xml += `      <g:fb_product_category>${escapeXml(fbCategory)}</g:fb_product_category>\n`
      xml += `      <g:price>${priceString}</g:price>\n`
      xml += `      <price>${priceString}</price>\n`
      xml += `      <sale_price>${salePriceString}</sale_price>\n`
      xml += `      <g:sale_price>${salePriceString}</g:sale_price>\n`
      xml += `      <g:brand>${escapeXml(brand)}</g:brand>\n`
      xml += `      <brand>${escapeXml(brand)}</brand>\n`
      xml += `      <g:condition>new</g:condition>\n`
      xml += `      <condition>new</condition>\n`
      xml += `      <availability>in_stock</availability>\n`
      xml += `      <g:availability>in_stock</g:availability>\n`
      xml += `      <g:quantity>100</g:quantity>\n`
      xml += `      <g:gender>female</g:gender>\n`
      xml += `      <g:age_group>adult</g:age_group>\n`
      xml += `      <g:size>${escapeXml(sizeLabel)}</g:size>\n`
      xml += `      <size>${escapeXml(sizeLabel)}</size>\n`
      xml += `      <g:color>${escapeXml(colorLabel)}</g:color>\n`
      xml += `      <g:material>1. Sınıf Modal / Pamuklu Kumaş</g:material>\n`
      xml += `      <g:image_link>${escapeXml(primaryImage)}</g:image_link>\n`
      xml += `      <image_link>${escapeXml(primaryImage)}</image_link>\n`

      for (const addImg of additionalImages) {
        xml += `      <g:additional_image_link>${escapeXml(addImg)}</g:additional_image_link>\n`
        xml += `      <additional_image_link>${escapeXml(addImg)}</additional_image_link>\n`
      }

      const shippingCost = salePriceVal >= 3000 ? "0.00" : "60.00"
      xml += `      <g:shipping>\n`
      xml += `        <g:country>TR</g:country>\n`
      xml += `        <g:service>Standart Kargo</g:service>\n`
      xml += `        <g:price>${shippingCost} ${isoCurrency}</g:price>\n`
      xml += `        <g:min_handling_time>0</g:min_handling_time>\n`
      xml += `        <g:max_handling_time>1</g:max_handling_time>\n`
      xml += `        <g:min_transit_time>0</g:min_transit_time>\n`
      xml += `        <g:max_transit_time>3</g:max_transit_time>\n`
      xml += `      </g:shipping>\n`
      xml += `    </item>\n`
    })

    xml += `  </channel>\n`
    xml += `</rss>`

    res.setHeader("Content-Type", "application/xml; charset=utf-8")
    res.setHeader("Cache-Control", "public, max-age=300")
    res.send(xml)
  } catch (error) {
    console.error("Error generating XML feed:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
