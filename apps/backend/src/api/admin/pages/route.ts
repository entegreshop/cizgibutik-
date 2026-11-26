import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"
import os from "os"

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
    content: `Almış olduğunuz ürünleri kullanılmamış, etiketleri sökülmemiş ve tekrar satılabilirlik özelliğini kaybetmemiş olması şartıyla teslimat tarihinden itibaren 14 gün içerisinde iade edebilir veya değişim talep edebilirsiniz.

İade Talebi & Adres:
Firma: ÖZSE MODA TEKSTİL KAFE GIDA İNŞAAT SAN. TİC. LTD. ŞTİ. (Çizgi Butik)
Adres: Merkez Mah. Muallim Naci Sk. No: 9 Güngören / İstanbul
Müşteri Hizmetleri: 0532 337 00 81 | info@cizgibutik.com`
  },
  "teslimat-kargo": {
    title: "Teslimat ve Kargo Şartları",
    content: `Hafta içi saat 16:00'a kadar verilen tüm siparişleriniz aynı gün özenle hazırlanarak kargoya teslim edilmektedir. Teslimat süresi Türkiye geneli ortalama 1-3 iş günüdür. Kargonuz yola çıktığında takip numaranız SMS ve e-posta ile tarafınıza iletilir.`
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

function readConfig() {
  try {
    const legacyHome = path.join(os.homedir(), ".xoox-pages-config.json")
    const legacyCwd = path.join(process.cwd(), ".xoox-pages-config.json")
    const targetPath = fs.existsSync(configFilePath)
      ? configFilePath
      : fs.existsSync(legacyHome)
        ? legacyHome
        : fs.existsSync(legacyCwd)
          ? legacyCwd
          : null

    if (targetPath) {
      const content = fs.readFileSync(targetPath, "utf-8")
      return { ...defaultPages, ...JSON.parse(content) }
    }
  } catch (err) {
    console.error("Error reading pages config:", err)
  }
  return defaultPages
}

function writeConfig(data: any) {
  try {
    const dir = path.dirname(configFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing pages config:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pages = readConfig()
  res.json({ pages })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  
  if (!body.pages) {
    return res.status(400).json({ success: false, message: "Missing pages data" })
  }

  const success = writeConfig(body.pages)
  if (success) {
    res.json({ success: true, message: "Pages updated successfully" })
  } else {
    res.status(500).json({ success: false, message: "Failed to update pages" })
  }
}
