import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

const configFilePath = path.join(process.cwd(), "uploads", "pages-config.json")

const defaultPages = {
  "mesafeli-satis": {
    title: "Mesafeli Satış Sözleşmesi",
    content: `MADDE 1 - TARAFLAR
1.1. SATICI:
Ticari Unvan: ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. (Çizgi Butik)
Adres: Merkez Mah. Muallim Naci Sk. No: 9 Güngören / İstanbul
Telefon: 0532 337 00 81
E-posta: info@cizgibutik.com
Mersis No: 0705060035500001
Vergi Dairesi & No: Güngören V.D. - 7050600355
Web Sitesi: https://cizgibutik.com

1.2. ALICI:
Web sitesi üzerinden sipariş veren, fatura ve teslimat bilgileri sipariş formunda belirtilen gerçek veya tüzel kişidir.

MADDE 2 - SÖZLEŞMENİN KONUSU
İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait https://cizgibutik.com internet sitesinden elektronik ortamda siparişini yaptığı ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.

MADDE 3 - CAYMA HAKKI
ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 (on dört) gün içinde hiçbir gerekçe göstermeksizin cayma hakkını kullanabilir. Cayma hakkının kullanılması için 14 gün içinde SATICI'ya yazılı bildirimde bulunulması şarttır.`
  },
  "iade-ve-degisim": {
    title: "İptal, İade ve Değişim Koşulları",
    content: `Almış olduğunuz ürünleri kullanılmamış, etiketleri sökülmemiş ve tekrar satılabilirlik özelliğini kaybetmemiş olması şartıyla teslimat tarihinden itibaren 14 gün içerisinde iade edebilir veya değişim talep edebilirsiniz. Hem kusurlu hem kusurlu olmayan ürünler için 14 gün iade kabul edilmektedir. İade gönderilerinde kargo ücreti müşterinin sorumluluğundadır (ayıplı ürünlerde kargo satıcıya aittir). Yeniden stoka ekleme ücreti alınmaz (Maliyet: 0 TL). Depomuza ulaşan iadelerin geri ödemesi 3 gün içinde tamamlanır.

İade Talebi & Adres:
Firma: ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. (Çizgi Butik)
Adres: Merkez Mah. Muallim Naci Sk. No: 9 Güngören / İstanbul
Müşteri Hizmetleri: 0532 337 00 81 | info@cizgibutik.com`
  },
  "teslimat-kargo": {
    title: "Teslimat ve Kargo Şartları",
    content: `Saat 14:00'e kadar verilen tüm siparişleriniz aynı gün (0-1 iş günü içinde) özenle hazırlanarak kargoya teslim edilmektedir. Nakliye süresi 0-3 iş günü, toplam teslimat süresi Türkiye geneli ortalama 0-4 iş günüdür. 3.000 TL ve üzeri siparişlerde kargo ücretsiz, altındaki siparişlerde sabit 60 TL kargo ücreti geçerlidir. Kargonuz yola çıktığında takip numaranız SMS ve e-posta ile iletilir.`
  },
  "iletisim": {
    title: "İletişim",
    content: `ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. (Çizgi Butik)
Adres: Merkez Mah. Muallim Naci Sk. No: 9 Güngören / İstanbul / Türkiye
Telefon / WhatsApp Destek: 0532 337 00 81
E-posta: info@cizgibutik.com
Mersis No: 0705060035500001
Güngören Vergi Dairesi No: 7050600355
Çalışma Saatleri: Hafta içi 09:00 - 19:00, Cumartesi 10:00 - 18:00`
  },
  "kvkk": {
    title: "Kişisel Verilerin Korunması (KVKK)",
    content: `6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca, ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. (Çizgi Butik) olarak kişisel verilerinizi sipariş işlemlerinin yürütülmesi ve yasal mevzuat gereklilikleri kapsamında güvenle işlemekteyiz. Kişisel verileriniz hiçbir üçüncü tarafla ticari amaçla paylaşılmaz.`
  },
  "kullanici-sozlesmesi": {
    title: "Kullanıcı Sözleşmesi",
    content: `https://cizgibutik.com web sitesini ziyaret eden ve alışveriş yapan tüm kullanıcılar bu sözleşmedeki şartları kabul etmiş sayılır. Sitedeki tüm görseller, tasarımlar ve içerikler ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ.'ye ait olup telif hakkı ile korunmaktadır.`
  },
  "gizlilik-sozlesmesi": {
    title: "Gizlilik Sözleşmesi",
    content: `Müşterilerimizin kişisel bilgilerinin gizliliği ve güvenliği 256-bit SSL güvenlik sertifikası ve 3D Secure protokolleri ile korunmaktadır. Kredi kartı bilgileriniz sistemlerimizde saklanmaz.`
  },
  "hakkimizda": {
    title: "Hakkımızda",
    content: `Çizgi Butik, kadın giyim modasında şıklığı, kaliteyi ve müşteri memnuniyetini bir araya getirmek amacıyla ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. çatısı altında kurulmuştur. En güncel koleksiyonları güvenilir ve hızlı e-ticaret altyapısıyla sizlere sunmaktan gurur duyuyoruz.`
  },
  "siparis-takip": {
    title: "Sipariş Takip",
    content: `Siparişlerinizi kargo takip numaranız ile anlık olarak takip edebilirsiniz. Takip kodunuz siparişiniz kargoya verildiğinde SMS ve e-posta olarak gönderilmektedir.`
  },
  "havale-bildirimleri": {
    title: "Havale Bildirimleri",
    content: `Banka havalesi / EFT ile gerçekleştirilen ödemelerde dekontunuzu 0532 337 00 81 numaralı WhatsApp hattımıza veya info@cizgibutik.com adresimize iletebilirsiniz.`
  }
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-publishable-api-key",
}

export async function OPTIONS() {
  return new Response("", { headers: corsHeaders })
}

function readConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      return { ...defaultPages, ...JSON.parse(content) }
    }
  } catch (err) {
    console.error("Error reading pages config:", err)
  }
  return defaultPages
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pages = readConfig()
  res.status(200).json({ pages })
}
