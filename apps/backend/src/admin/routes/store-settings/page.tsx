import { defineRouteConfig } from "@medusajs/admin-sdk"
import React, { useEffect, useState } from "react"

type StoreTabId =
  | "store"
  | "rules"
  | "marketing"
  | "prints"
  | "currencies"
  | "taxes"
  | "locations"
  | "api"
  | "staff"
  | "licence"

type StoreMenuItemId =
  | "store_general"
  | "store_logo"
  | "store_contact"
  | "store_orders"
  | "store_returns"
  | "store_products"
  | "store_customers"
  | "store_affiliate"
  | "store_quicksale"
  | "store_dealer"
  | "store_dealer_xml"
  | "store_dealer_api"
  | "store_security"
  | "store_maintenance"

interface StoreConfigState {
  storeTitle: string
  logoUrl: string
  faviconUrl: string
  footerDescription: string
  copyrightText: string
  phone: string
  whatsapp: string
  email: string
  address: string
  workingHours: string
  socialLinks: {
    instagram: string
    facebook: string
    youtube: string
    tiktok: string
  }
}

const DEFAULT_CONFIG: StoreConfigState = {
  storeTitle: "Çizgi Butik | Kadın Giyim, Elbise, Takım ve Yeni Sezon Kombinler",
  logoUrl: "/images/logo-main.png",
  faviconUrl: "/favicon.ico",
  footerDescription: "Yeni sezon kadın giyim, elbise, ikili takım, dış giyim ve kombin modellerini en uygun fiyatlarla keşfedin.",
  copyrightText: "© 2026 Çizgi Butik. Tüm hakları saklıdır.",
  phone: "0532 337 00 81",
  whatsapp: "905323370081",
  email: "hakkisahin9@gmail.com",
  address: "MERKEZ MAH. MUALLİM NACİ SK. MERVE NO: 9 GÜNGÖREN/ İSTANBUL",
  workingHours: "Pzt - Cmt: 09:00 - 19:00",
  socialLinks: {
    instagram: "https://instagram.com/cizgibutik",
    facebook: "https://facebook.com/cizgibutik",
    youtube: "https://youtube.com/@cizgibutik",
    tiktok: "https://tiktok.com/@cizgibutik",
  },
}

const STORE_SIDEBAR_ITEMS: Array<{ id: StoreMenuItemId; label: string }> = [
  { id: "store_general", label: "Genel Bilgiler" },
  { id: "store_logo", label: "Logo ve İkonlar" },
  { id: "store_contact", label: "İletişim & Sosyal Medya" },
  { id: "store_orders", label: "Sipariş Ayarları" },
  { id: "store_returns", label: "İptal ve İade Ayarları" },
  { id: "store_products", label: "Ürün & Katalog Ayarları" },
  { id: "store_customers", label: "Üye ve Müşteri Ayarları" },
  { id: "store_affiliate", label: "Satış Ortaklığı (Affiliate)" },
  { id: "store_quicksale", label: "Hızlı Satış (POS)" },
  { id: "store_dealer", label: "Bayilik (B2B) Ayarları" },
  { id: "store_dealer_xml", label: "Bayi XML Çıktısı" },
  { id: "store_dealer_api", label: "Bayi API" },
  { id: "store_security", label: "Güvenlik" },
  { id: "store_maintenance", label: "Bakım Modu" },
]

const RULES_TABS = [
  "Üyelik Sözleşmesi",
  "Mesafeli Satış Sözleşmesi",
  "Ön Bilgilendirme Formu",
  "İptal ve İade Koşulları",
  "Gizlilik ve Güvenlik Politikası",
  "KVKK Aydınlatma Metni",
  "Çerez (Cookie) Politikası",
]

const CURRENCY_ROWS = [
  { id: 1, name: "Türk Lirası", code: "TL", symbol: "₺", rate: "1.0000", updatedAt: "Varsayılan Para Birimi", isDefault: true, active: true },
  { id: 2, name: "Amerikan Doları", code: "USD", symbol: "$", rate: "34.2540", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: true },
  { id: 3, name: "Euro", code: "EUR", symbol: "€", rate: "37.1890", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: true },
  { id: 4, name: "İngiliz Sterlini", code: "GBP", symbol: "£", rate: "44.6200", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: true },
  { id: 5, name: "İsviçre Frangı", code: "CHF", symbol: "CHF", rate: "39.4100", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: false },
  { id: 6, name: "Suudi Arabistan Riyali", code: "SAR", symbol: "﷼", rate: "9.1300", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: false },
  { id: 7, name: "BAE Dirhemi", code: "AED", symbol: "د.إ", rate: "9.3260", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: false },
  { id: 8, name: "Rus Rublesi", code: "RUB", symbol: "₽", rate: "0.3580", updatedAt: "Bugün 15:30 (TCMB)", isDefault: false, active: false },
]

const StoreSettingsPage = () => {
  const getInitialTab = (): StoreTabId => {
    if (typeof window === "undefined") return "store"
    const params = new URLSearchParams(window.location.search)
    const t = params.get("tab") as StoreTabId | null
    if (
      t &&
      [
        "store",
        "rules",
        "marketing",
        "prints",
        "currencies",
        "taxes",
        "locations",
        "api",
        "staff",
        "licence",
      ].includes(t)
    ) {
      return t
    }
    return "store"
  }

  const [activeTab, setActiveTab] = useState<StoreTabId>(getInitialTab)
  const [activeStoreMenu, setActiveStoreMenu] = useState<StoreMenuItemId>("store_general")
  const [activeRuleIndex, setActiveRuleIndex] = useState<number>(1)
  const [config, setConfig] = useState<StoreConfigState>(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  type MarketingSubTabId =
    | "search_engines"
    | "meta_pixel"
    | "google_analytics"
    | "google_ads"
    | "google_tag_manager"
    | "openai_ads"
    | "tiktok_pixel"
    | "yandex_metrica"
    | "robots_txt"
    | "llms_txt"
    | "custom_scripts"
    | "verification_files"

  const [activeMarketingMenu, setActiveMarketingMenu] = useState<MarketingSubTabId>("search_engines")
  const [pixelConfig, setPixelConfig] = useState<Record<string, any>>({
    search_engines: {
      active: true,
      google_verification: "",
      facebook_verification: "",
      yandex_verification: "",
      bing_verification: "",
      pinterest_verification: "",
    },
    meta_pixel: {
      active: true,
      pixel_id: "538418662598444",
      access_token: "",
      test_event_code: "",
      advanced_matching: true,
    },
    google_analytics: {
      active: false,
      measurement_id: "",
      property_id: "",
      service_account_json: "",
      enhanced_ecommerce: true,
    },
    google_ads: {
      active: false,
      conversion_id: "",
      conversion_label: "",
      add_to_cart_label: "",
      remarketing: true,
    },
    google_tag_manager: {
      active: false,
      gtm_id: "",
    },
    openai_ads: {
      active: false,
      pixel_id: "",
      allow_shopping_bot: true,
    },
    tiktok_pixel: {
      active: false,
      pixel_id: "",
      access_token: "",
    },
    yandex_metrica: {
      active: false,
      counter_id: "",
      webvisor: true,
    },
    robots_txt: {
      active: true,
      content: "User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /account\nSitemap: https://cizgibutik.com/sitemap.xml",
    },
    llms_txt: {
      active: true,
      content: "# Çizgi Butik (cizgibutik.com)\n> Kadın giyim, ikili takım, kombin, jean pantolon, tayt, sweat, mont & kürk, t-shirt, gözlük ve çanta koleksiyonları.\n\n- Mağaza: https://cizgibutik.com/tr\n- Tüm Ürünler: https://cizgibutik.com/tr/store",
    },
    custom_scripts: {
      active: true,
      head_scripts: "",
      body_start_scripts: "",
      body_end_scripts: "",
    },
    verification_files: [],
  })

  const updatePixelGroup = (group: string, key: string, value: any) => {
    setPixelConfig((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [key]: value,
      },
    }))
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev))
    }, 3200)
  }

  useEffect(() => {
    const syncTabFromUrl = () => {
      const next = getInitialTab()
      setActiveTab((prev) => (prev !== next ? next : prev))
    }
    window.addEventListener("popstate", syncTabFromUrl)
    const interval = setInterval(syncTabFromUrl, 250)
    return () => {
      window.removeEventListener("popstate", syncTabFromUrl)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    fetch("/admin/logo-config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setConfig({
            ...DEFAULT_CONFIG,
            ...data.config,
            socialLinks: {
              ...DEFAULT_CONFIG.socialLinks,
              ...(data.config.socialLinks || {}),
            },
          })
        }
      })
      .catch(() => {})

    fetch("/admin/pixel-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setPixelConfig((prev) => ({
            ...prev,
            ...data.config,
            search_engines: { ...prev.search_engines, ...(data.config.search_engines || {}) },
            meta_pixel: { ...prev.meta_pixel, ...(data.config.meta_pixel || {}) },
            google_analytics: { ...prev.google_analytics, ...(data.config.google_analytics || {}) },
            google_ads: { ...prev.google_ads, ...(data.config.google_ads || {}) },
            google_tag_manager: { ...prev.google_tag_manager, ...(data.config.google_tag_manager || {}) },
            openai_ads: { ...prev.openai_ads, ...(data.config.openai_ads || {}) },
            tiktok_pixel: { ...prev.tiktok_pixel, ...(data.config.tiktok_pixel || {}) },
            yandex_metrica: { ...prev.yandex_metrica, ...(data.config.yandex_metrica || {}) },
            robots_txt: { ...prev.robots_txt, ...(data.config.robots_txt || {}) },
            llms_txt: { ...prev.llms_txt, ...(data.config.llms_txt || {}) },
            custom_scripts: { ...prev.custom_scripts, ...(data.config.custom_scripts || {}) },
            verification_files: Array.isArray(data.config.verification_files)
              ? data.config.verification_files
              : prev.verification_files,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const [resLogo, resPixel] = await Promise.all([
        fetch("/admin/logo-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config }),
        }),
        fetch("/admin/pixel-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pixelConfig),
        }),
      ])
      if (resLogo.ok || resPixel.ok) {
        showToast("Pazarlama, Pixel ve Mağaza ayarları başarıyla kaydedildi! ✔")
      } else {
        showToast("Kaydedilirken bir hata oluştu.")
      }
    } catch {
      showToast("Bağlantı hatası oluştu.")
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (field: "logoUrl" | "faviconUrl", file: File) => {
    setUploadingField(field)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ""))
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
      })
      const res = await fetch("/admin/logo-config/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          filetype: file.type,
          base64,
        }),
      })
      const data = await res.json()
      if (data?.url) {
        setConfig((prev) => ({ ...prev, [field]: data.url }))
        showToast("Görsel başarıyla yüklendi.")
      } else {
        showToast("Görsel yüklenemedi.")
      }
    } catch {
      showToast("Görsel yükleme sırasında hata oluştu.")
    } finally {
      setUploadingField(null)
    }
  }

  const scrollToStoreSection = (id: StoreMenuItemId) => {
    setActiveStoreMenu(id)
    const el = document.getElementById(`preview-card-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const footerLabelMap: Record<StoreTabId, string> = {
    store: "Mağaza Ayarları",
    rules: "Sözleşmeler ve Metinler",
    marketing: "Pazarlama ve Doğrulama",
    prints: "Yazdırma Etiketleri",
    currencies: "Para Birimleri",
    taxes: "Vergiler",
    locations: "Diller & Lokalizasyon",
    api: "Web Servis (API)",
    staff: "Personeller",
    licence: "Lisans Yönetimi",
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "24px 32px 100px 32px",
        color: "#0f172a",
      }}
    >
      <style>{`
        .quka-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 22px 24px;
          margin-bottom: 18px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        }
        .quka-card h5 {
          margin: 0 0 16px 0;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }
        .quka-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        .quka-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 6px;
        }
        .quka-input, .quka-select, .quka-textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 13px;
          color: #0f172a;
          background: #fff;
          outline: none;
          box-sizing: border-box;
        }
        .quka-input:focus, .quka-select:focus, .quka-textarea:focus {
          border-color: #2196f3;
          box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.12);
        }
        .quka-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .quka-table th {
          text-align: left;
          padding: 11px 14px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }
        .quka-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
          vertical-align: middle;
        }
        .quka-badge-success {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #dcfce7;
          color: #15803d;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .quka-badge-muted {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 999px;
        }
        .quka-btn-primary {
          background: #2196f3;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .quka-btn-outline {
          background: #ffffff;
          color: #334155;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 7px 14px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>

      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: "#0f172a",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
          }}
        >
          ✓ {toastMessage}
        </div>
      )}

      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* 1. MAĞAZA AYARLARI */}
        {activeTab === "store" && (
          <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 22, alignItems: "start" }}>
            <div
              className="quka-card"
              style={{
                padding: "10px",
                position: "sticky",
                top: 20,
                marginBottom: 0,
              }}
            >
              {STORE_SIDEBAR_ITEMS.map((item) => {
                const isActive = activeStoreMenu === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToStoreSection(item.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "9px 12px",
                      border: "none",
                      borderRadius: 6,
                      background: isActive ? "#eff6ff" : "transparent",
                      color: isActive ? "#2196f3" : "#334155",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontSize: 11, opacity: isActive ? 1 : 0.4 }}>›</span>
                  </button>
                )
              })}
            </div>

            <div>
              {/* Genel Bilgiler */}
              <div id="preview-card-store_general" className="quka-card">
                <h5>Genel Bilgiler</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Mağaza Adı / Site Başlığı</label>
                    <input
                      className="quka-input"
                      value={config.storeTitle}
                      onChange={(e) => setConfig({ ...config, storeTitle: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>Alan Adı (Domain)</label>
                    <input className="quka-input" defaultValue="https://www.cizgibutik.com" />
                  </div>
                  <div className="quka-field" style={{ gridColumn: "span 2" }}>
                    <label>Footer Açıklama Metni</label>
                    <textarea
                      className="quka-textarea"
                      rows={2}
                      value={config.footerDescription}
                      onChange={(e) => setConfig({ ...config, footerDescription: e.target.value })}
                    />
                  </div>
                  <div className="quka-field" style={{ gridColumn: "span 2" }}>
                    <label>Telif Hakkı (Copyright) Metni</label>
                    <input
                      className="quka-input"
                      value={config.copyrightText}
                      onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Logo ve İkonlar */}
              <div id="preview-card-store_logo" className="quka-card">
                <h5>Logo ve İkonlar</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Site Üst Logo (Header Logo)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="quka-input"
                        value={config.logoUrl}
                        onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                      />
                      <label className="quka-btn-outline" style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                        {uploadingField === "logoUrl" ? "Yükleniyor..." : "Yükle"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFileUpload("logoUrl", f)
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="quka-field">
                    <label>Tarayıcı İkonu (Favicon)</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="quka-input"
                        value={config.faviconUrl}
                        onChange={(e) => setConfig({ ...config, faviconUrl: e.target.value })}
                      />
                      <label className="quka-btn-outline" style={{ whiteSpace: "nowrap", marginBottom: 0 }}>
                        {uploadingField === "faviconUrl" ? "Yükleniyor..." : "Yükle"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const f = e.target.files?.[0]
                            if (f) handleFileUpload("faviconUrl", f)
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* İletişim & Sosyal Medya */}
              <div id="preview-card-store_contact" className="quka-card">
                <h5>İletişim & Sosyal Medya</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Müşteri Hizmetleri Telefon</label>
                    <input
                      className="quka-input"
                      value={config.phone}
                      onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>WhatsApp Sipariş & Destek Hattı</label>
                    <input
                      className="quka-input"
                      value={config.whatsapp}
                      onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>Kurumsal E-Posta</label>
                    <input
                      className="quka-input"
                      value={config.email}
                      onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>Çalışma Saatleri</label>
                    <input
                      className="quka-input"
                      value={config.workingHours}
                      onChange={(e) => setConfig({ ...config, workingHours: e.target.value })}
                    />
                  </div>
                  <div className="quka-field" style={{ gridColumn: "span 2" }}>
                    <label>Merkez / Mağaza Açık Adresi</label>
                    <input
                      className="quka-input"
                      value={config.address}
                      onChange={(e) => setConfig({ ...config, address: e.target.value })}
                    />
                  </div>
                  <div className="quka-field">
                    <label>Instagram Adresi</label>
                    <input
                      className="quka-input"
                      value={config.socialLinks.instagram}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, instagram: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="quka-field">
                    <label>Facebook Adresi</label>
                    <input
                      className="quka-input"
                      value={config.socialLinks.facebook}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, facebook: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="quka-field">
                    <label>YouTube Kanalı</label>
                    <input
                      className="quka-input"
                      value={config.socialLinks.youtube}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, youtube: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="quka-field">
                    <label>TikTok Hesabı</label>
                    <input
                      className="quka-input"
                      value={config.socialLinks.tiktok}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          socialLinks: { ...config.socialLinks, tiktok: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Sipariş Ayarları */}
              <div id="preview-card-store_orders" className="quka-card">
                <h5>Sipariş Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Minimum Sepet Tutarı (TL)</label>
                    <input className="quka-input" defaultValue="0.00" />
                  </div>
                  <div className="quka-field">
                    <label>Üyeliksiz Alışveriş</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (Misafir Alışverişine İzin Ver)</option>
                      <option value="passive">Pasif (Zorunlu Üyelik)</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Sipariş Numarası Ön Eki (Prefix)</label>
                    <input className="quka-input" defaultValue="BKM-" />
                  </div>
                  <div className="quka-field">
                    <label>WhatsApp ile Sipariş Butonu</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (Ürün Detayında Göster)</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* İptal ve İade Ayarları */}
              <div id="preview-card-store_returns" className="quka-card">
                <h5>İptal ve İade Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Müşteri Panelinden İade Talebi Süresi (Gün)</label>
                    <input className="quka-input" type="number" defaultValue={14} />
                  </div>
                  <div className="quka-field">
                    <label>Kargoya Verilmeden Sipariş İptali</label>
                    <select className="quka-select" defaultValue="auto">
                      <option value="auto">Müşteri Otomatik İptal Edebilir</option>
                      <option value="approval">Yönetici Onayı İle İptal Edilir</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ürün & Katalog Ayarları */}
              <div id="preview-card-store_products" className="quka-card">
                <h5>Ürün & Katalog Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Stokta Olmayan Ürünler</label>
                    <select className="quka-select" defaultValue="show_bottom">
                      <option value="show_bottom">Listelerin En Altında Göster ("Tükendi" Etiketiyle)</option>
                      <option value="hide">Sitede Gizle</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Sayfa Başına Ürün Gösterim Sayısı</label>
                    <select className="quka-select" defaultValue="24">
                      <option value="12">12 Ürün</option>
                      <option value="24">24 Ürün</option>
                      <option value="36">36 Ürün</option>
                      <option value="48">48 Ürün</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Üye ve Müşteri Ayarları */}
              <div id="preview-card-store_customers" className="quka-card">
                <h5>Üye ve Müşteri Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Yeni Üyelikte SMS Doğrulama (OTP)</label>
                    <select className="quka-select" defaultValue="passive">
                      <option value="passive">Pasif</option>
                      <option value="active">Aktif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>TC Kimlik Numarası Zorunluluğu</label>
                    <select className="quka-select" defaultValue="checkout">
                      <option value="checkout">Ödeme Adımında Zorunlu</option>
                      <option value="optional">İsteğe Bağlı</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Satış Ortaklığı (Affiliate) */}
              <div id="preview-card-store_affiliate" className="quka-card">
                <h5>Satış Ortaklığı (Affiliate)</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Affiliate Sistemi Durumu</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Varsayılan Komisyon Oranı (%)</label>
                    <input className="quka-input" type="number" defaultValue={5} />
                  </div>
                </div>
              </div>

              {/* Hızlı Satış (POS) */}
              <div id="preview-card-store_quicksale" className="quka-card">
                <h5>Hızlı Satış (POS)</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Mağaza İçi Barkodlu Hızlı Satış Ekranı</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Varsayılan POS Kasa</label>
                    <input className="quka-input" defaultValue="Merkez Mağaza Kasa #1" />
                  </div>
                </div>
              </div>

              {/* Bayilik (B2B) Ayarları */}
              <div id="preview-card-store_dealer" className="quka-card">
                <h5>Bayilik (B2B) Ayarları</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>B2B Bayi Girişi ve Başvurusu</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (Yönetici Onaylı)</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Bayi Özel İskonto Grubu</label>
                    <input className="quka-input" defaultValue="Toptan / Oto Aksesuar Bayi (%20 İskonto)" />
                  </div>
                </div>
              </div>

              {/* Bayi XML Çıktısı */}
              <div id="preview-card-store_dealer_xml" className="quka-card">
                <h5>Bayi XML Çıktısı</h5>
                <div className="quka-form-grid">
                  <div className="quka-field" style={{ gridColumn: "span 2" }}>
                    <label>Standart Ürün & Stok XML Paylaşım Bağlantısı</label>
                    <input
                      className="quka-input"
                      readOnly
                      defaultValue="https://api.cizgibutik.com/feeds/b2b-products.xml"
                    />
                  </div>
                </div>
              </div>

              {/* Bayi API */}
              <div id="preview-card-store_dealer_api" className="quka-card">
                <h5>Bayi API</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>B2B REST API Erişimi</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Rate Limit (Dakika Başına İstek)</label>
                    <input className="quka-input" type="number" defaultValue={120} />
                  </div>
                </div>
              </div>

              {/* Güvenlik */}
              <div id="preview-card-store_security" className="quka-card">
                <h5>Güvenlik</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>SSL (HTTPS) Zorunlu Yönlendirme</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (256-Bit SSL Zorunlu)</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Google reCAPTCHA v3 Koruması</label>
                    <select className="quka-select" defaultValue="active">
                      <option value="active">Aktif (Form ve Giriş Koruması)</option>
                      <option value="passive">Pasif</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bakım Modu */}
              <div id="preview-card-store_maintenance" className="quka-card">
                <h5>Bakım Modu</h5>
                <div className="quka-form-grid">
                  <div className="quka-field">
                    <label>Site Yayın Durumu</label>
                    <select className="quka-select" defaultValue="live">
                      <option value="live">Yayında (Tüm Ziyaretçilere Açık)</option>
                      <option value="maintenance">Bakım Modunda (Sadece Yöneticiler Görebilir)</option>
                    </select>
                  </div>
                  <div className="quka-field">
                    <label>Bakım Modu Başlığı</label>
                    <input className="quka-input" defaultValue="Sitemiz güncelleniyor, çok yakında tekrar yayındayız." />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SÖZLEŞMELER VE METİNLER */}
        {activeTab === "rules" && (
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 22, alignItems: "start" }}>
            <div className="quka-card" style={{ padding: 10, marginBottom: 0 }}>
              {RULES_TABS.map((title, idx) => {
                const isActive = activeRuleIndex === idx
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => setActiveRuleIndex(idx)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      border: "none",
                      borderRadius: 6,
                      background: isActive ? "#eff6ff" : "transparent",
                      color: isActive ? "#2196f3" : "#334155",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span>{title}</span>
                    <span style={{ fontSize: 11, opacity: isActive ? 1 : 0.4 }}>›</span>
                  </button>
                )
              })}
            </div>

            <div className="quka-card" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h5 style={{ margin: 0 }}>{RULES_TABS[activeRuleIndex]}</h5>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Dinamik etiketler: <code>{"{ALICI_AD_SOYAD}"}</code>, <code>{"{SIPARIS_NO}"}</code>, <code>{"{SIPARIS_TUTARI}"}</code>
                </span>
              </div>
              <textarea
                className="quka-textarea"
                rows={16}
                defaultValue={`MADDE 1 - TARAFLAR\n\n1.1. SATICI BİLGİLERİ:\nUnvanı: Çizgi Butik Otomotiv Aksesuar San. ve Tic. Ltd. Şti.\nAdres: ${config.address}\nTelefon: ${config.phone}\nE-Posta: ${config.email}\n\n1.2. ALICI BİLGİLERİ:\nAdı Soyadı / Unvanı: {ALICI_AD_SOYAD}\nTeslimat Adresi: {TESLIMAT_ADRESI}\nTelefon: {ALICI_TELEFON}\nE-Posta: {ALICI_EPOSTA}\n\nMADDE 2 - SÖZLEŞMENİN KONUSU\nİşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait www.cizgibutik.com internet sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.`}
              />
            </div>
          </div>
        )}

        {/* 3. PAZARLAMA VE DOĞRULAMA (SILA BUTİK STİLİ 12 SEKMELİ YAN MENÜ & DETAY PANELİ) */}
        {activeTab === "marketing" && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: "22px",
              maxWidth: "1080px",
              margin: "0 auto",
            }}
          >
            {/* Sol Dikey Menü (Sıla Butik Stili) */}
            <div
              style={{
                width: "250px",
                flexShrink: 0,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
              }}
            >
              {(
                [
                  {
                    id: "search_engines" as MarketingSubTabId,
                    label: "Arama Motorları",
                    active: pixelConfig.search_engines?.active !== false,
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="10.5" cy="10.5" r="6.5" stroke="#111827" strokeWidth="2.4" />
                        <path d="M15.5 15.5 21 21" stroke="#111827" strokeWidth="2.8" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    id: "meta_pixel" as MarketingSubTabId,
                    label: "Facebook Pixel",
                    active: Boolean(pixelConfig.meta_pixel?.active && pixelConfig.meta_pixel?.pixel_id),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="11" fill="#1877F2" />
                        <path
                          d="M15.36 15.28l.49-3.18h-3.05V10.04c0-.87.43-1.72 1.8-1.72h1.39V5.61s-1.26-.22-2.47-.22c-2.52 0-4.17 1.53-4.17 4.29v2.42H6.55v3.18h2.8v7.58a11.1 11.1 0 003.45 0v-7.58h2.56z"
                          fill="#ffffff"
                        />
                      </svg>
                    ),
                  },
                  {
                    id: "google_analytics" as MarketingSubTabId,
                    label: "Google Analytics",
                    active: Boolean(pixelConfig.google_analytics?.active && pixelConfig.google_analytics?.measurement_id),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="16" y="3" width="4.5" height="18" rx="2.25" fill="#F9AB00" />
                        <rect x="9.5" y="9.5" width="4.5" height="11.5" rx="2.25" fill="#E37400" />
                        <circle cx="5.25" cy="18.75" r="2.25" fill="#E37400" />
                      </svg>
                    ),
                  },
                  {
                    id: "google_ads" as MarketingSubTabId,
                    label: "Google Ads",
                    active: Boolean(pixelConfig.google_ads?.active && pixelConfig.google_ads?.conversion_id),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M3.4 16.4 9.7 5.5a2.6 2.6 0 0 1 4.5 2.6L7.9 19a2.6 2.6 0 0 1-4.5-2.6Z"
                          fill="#FBBC04"
                        />
                        <path
                          d="M14.2 5.5 20.6 16.4a2.6 2.6 0 0 1-4.5 2.6L9.7 8.1a2.6 2.6 0 0 1 4.5-2.6Z"
                          fill="#4285F4"
                        />
                        <circle cx="5.65" cy="17.7" r="2.6" fill="#34A853" />
                      </svg>
                    ),
                  },
                  {
                    id: "google_tag_manager" as MarketingSubTabId,
                    label: "Google Tag Manager",
                    active: Boolean(pixelConfig.google_tag_manager?.active && pixelConfig.google_tag_manager?.gtm_id),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M13.7 3.3 20.7 10.3 13.7 17.3 10.2 13.8 17.2 6.8 13.7 3.3Z" fill="#8AB4F8" />
                        <path d="M13.7 3.3 10.2 6.8 6.7 10.3 10.2 13.8 13.7 10.3 10.2 6.8 13.7 3.3Z" fill="#4285F4" />
                        <path d="M3.3 10.3 10.3 3.3 13.8 6.8 6.8 13.8 3.3 10.3Z" fill="#4285F4" />
                        <path d="M6.8 13.8 13.8 20.8 17.3 17.3 10.3 10.3 6.8 13.8Z" fill="#246FDB" />
                        <circle cx="12" cy="19" r="2.2" fill="#8AB4F8" />
                      </svg>
                    ),
                  },
                  {
                    id: "openai_ads" as MarketingSubTabId,
                    label: "OpenAI Ads",
                    active: Boolean(pixelConfig.openai_ads?.active),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#111827">
                        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z" />
                      </svg>
                    ),
                  },
                  {
                    id: "tiktok_pixel" as MarketingSubTabId,
                    label: "TikTok Pixel",
                    active: Boolean(pixelConfig.tiktok_pixel?.active && pixelConfig.tiktok_pixel?.pixel_id),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z"
                          fill="#FE2C55"
                          transform="translate(0.7, 0.7)"
                        />
                        <path
                          d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z"
                          fill="#25F4EE"
                          transform="translate(-0.7, -0.7)"
                        />
                        <path
                          d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z"
                          fill="#000000"
                        />
                      </svg>
                    ),
                  },
                  {
                    id: "yandex_metrica" as MarketingSubTabId,
                    label: "Yandex Metrika",
                    active: Boolean(pixelConfig.yandex_metrica?.active && pixelConfig.yandex_metrica?.counter_id),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="12.5" width="4.8" height="8.5" rx="1.2" fill="#FF2600" />
                        <rect x="9.6" y="7.5" width="4.8" height="13.5" rx="1.2" fill="#FFCC00" />
                        <rect x="16.2" y="3" width="4.8" height="18" rx="1.2" fill="#0066FF" />
                      </svg>
                    ),
                  },
                  {
                    id: "robots_txt" as MarketingSubTabId,
                    label: "Robots.txt",
                    active: Boolean(pixelConfig.robots_txt?.active !== false),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.9">
                        <rect x="4" y="7" width="16" height="12" rx="3" />
                        <circle cx="9" cy="13" r="1.4" fill="#1e293b" />
                        <circle cx="15" cy="13" r="1.4" fill="#1e293b" />
                        <path d="M12 3v4M9 3h6M2 11v4M22 11v4" strokeLinecap="round" />
                      </svg>
                    ),
                  },
                  {
                    id: "llms_txt" as MarketingSubTabId,
                    label: "LLMs.txt",
                    active: Boolean(pixelConfig.llms_txt?.active !== false),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.9">
                        <circle cx="6" cy="6" r="2.3" />
                        <circle cx="18" cy="6" r="2.3" />
                        <circle cx="6" cy="18" r="2.3" />
                        <circle cx="18" cy="18" r="2.3" />
                        <circle cx="12" cy="12" r="2.5" fill="#1e293b" />
                        <path d="M8 7.5 10.2 10.2M16 7.5 13.8 10.2M8 16.5 10.2 13.8M16 16.5 13.8 13.8" />
                      </svg>
                    ),
                  },
                  {
                    id: "custom_scripts" as MarketingSubTabId,
                    label: "Scriptler",
                    active: Boolean(pixelConfig.custom_scripts?.active !== false),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m8 8-5 4 5 4M16 8l5 4-5 4M13.5 6l-3 12" />
                      </svg>
                    ),
                  },
                  {
                    id: "verification_files" as MarketingSubTabId,
                    label: "Dosyalar",
                    active: Boolean((pixelConfig.verification_files || []).length > 0),
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6M8 13h8M8 17h6" />
                      </svg>
                    ),
                  },
                ]
              ).map((item, idx, arr) => {
                const isSelected = activeMarketingMenu === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveMarketingMenu(item.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 15px",
                      background: isSelected ? "#f1f5f9" : "#ffffff",
                      border: "none",
                      borderBottom: idx < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                      borderLeft: isSelected ? "3px solid #2563eb" : "3px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                      <span style={{ width: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.icon}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? "#0f172a" : "#334155",
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {item.active && (
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#10b981",
                          }}
                          title="Aktif"
                        />
                      )}
                      <span style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 600 }}>›</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Sağ İçerik Kartı (Sıla Butik Stili) */}
            <div
              style={{
                flex: 1,
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "26px 28px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
              }}
            >
              {/* 1. ARAMA MOTORLARI */}
              {activeMarketingMenu === "search_engines" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    Arama Motorları
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    E-ticaret sitenizin Google, Facebook, Yandex, Bing, Alexa ve Pinterest platformlarında doğrulanmasını ve daha hızlı indekslenebilmesini sağlar.
                  </div>

                  {/* Durum Toggle */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                      Durum
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updatePixelGroup("search_engines", "active", !(pixelConfig.search_engines?.active !== false))
                      }
                      style={{
                        width: "48px",
                        height: "26px",
                        borderRadius: "999px",
                        background: pixelConfig.search_engines?.active !== false ? "#10b981" : "#cbd5e1",
                        border: "none",
                        padding: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: pixelConfig.search_engines?.active !== false ? "flex-end" : "flex-start",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>

                  {[
                    {
                      key: "google_verification",
                      label: "Google Doğrulama Kodu",
                      metaName: "google-site-verification",
                      placeholder: "Google Search Console doğrulama kodunu veya meta etiketini yapıştırın",
                    },
                    {
                      key: "facebook_verification",
                      label: "Facebook Doğrulama Kodu",
                      metaName: "facebook-domain-verification",
                      placeholder: "Facebook Business domain doğrulama kodunu yapıştırın",
                    },
                    {
                      key: "yandex_verification",
                      label: "Yandex Doğrulama Kodu",
                      metaName: "yandex-verification",
                      placeholder: "Yandex Webmaster doğrulama kodunu yapıştırın",
                    },
                    {
                      key: "bing_verification",
                      label: "Bing Doğrulama Kodu",
                      metaName: "msvalidate.01",
                      placeholder: "Bing Webmaster Tools doğrulama kodunu yapıştırın",
                    },
                    {
                      key: "pinterest_verification",
                      label: "Pinterest Doğrulama Kodu",
                      metaName: "p:domain_verify",
                      placeholder: "Pinterest domain doğrulama kodunu yapıştırın",
                    },
                  ].map((item) => (
                    <div key={item.key} style={{ marginBottom: "18px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                        <span>{item.label}</span>
                        <span style={{ width: 15, height: 15, borderRadius: "50%", border: "1px solid #94a3b8", color: "#64748b", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                          ?
                        </span>
                      </label>
                      <input
                        className="quka-input"
                        value={pixelConfig.search_engines?.[item.key] || ""}
                        onChange={(e) => updatePixelGroup("search_engines", item.key, e.target.value)}
                        placeholder={item.placeholder}
                      />
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "5px", fontFamily: "monospace" }}>
                        {`<meta name="${item.metaName}" content="`}
                        <strong style={{ color: "#0f172a" }}>
                          {pixelConfig.search_engines?.[item.key] || "DOĞRULAMA KODU"}
                        </strong>
                        {`" />`}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 2. FACEBOOK (META) PIXEL & CONVERSIONS API */}
              {activeMarketingMenu === "meta_pixel" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                      Facebook (Meta) Pixel &amp; Conversions API (CAPI)
                    </h4>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        background:
                          pixelConfig.meta_pixel?.active && pixelConfig.meta_pixel?.pixel_id
                            ? "#dcfce7"
                            : "#f1f5f9",
                        color:
                          pixelConfig.meta_pixel?.active && pixelConfig.meta_pixel?.pixel_id
                            ? "#15803d"
                            : "#64748b",
                      }}
                    >
                      {pixelConfig.meta_pixel?.active && pixelConfig.meta_pixel?.pixel_id
                        ? `● Pixel Aktif (${pixelConfig.meta_pixel.pixel_id})`
                        : "Pasif"}
                    </span>
                  </div>

                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Facebook ve Instagram reklamlarınızın dönüşümlerini (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase) hem tarayıcı (Browser Pixel) hem de sunucu tabanlı <strong>Meta Conversions API (CAPI)</strong> üzerinden iOS 14+ veri kaybı olmadan takip etmenizi sağlar.
                  </div>

                  {/* Durum Toggle */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                      Durum
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updatePixelGroup("meta_pixel", "active", !pixelConfig.meta_pixel?.active)
                      }
                      style={{
                        width: "48px",
                        height: "26px",
                        borderRadius: "999px",
                        background: pixelConfig.meta_pixel?.active ? "#10b981" : "#cbd5e1",
                        border: "none",
                        padding: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: pixelConfig.meta_pixel?.active ? "flex-end" : "flex-start",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      <span>Facebook (Meta) Pixel Kodu (Pixel ID)</span>
                      <span style={{ width: 15, height: 15, borderRadius: "50%", border: "1px solid #94a3b8", color: "#64748b", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        ?
                      </span>
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.meta_pixel?.pixel_id || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim()
                        updatePixelGroup("meta_pixel", "pixel_id", val)
                        if (val && !pixelConfig.meta_pixel?.active) {
                          updatePixelGroup("meta_pixel", "active", true)
                        }
                      }}
                      placeholder="Örn: 538418662598444"
                    />
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "5px", fontFamily: "monospace" }}>
                      {`fbq('init', '`}
                      <strong style={{ color: "#0f172a" }}>
                        {pixelConfig.meta_pixel?.pixel_id || "PIXEL_ID"}
                      </strong>
                      {`'); fbq('track', 'PageView');`}
                    </div>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      <span>Meta Conversions API (CAPI) Erişim Anahtarı (Access Token)</span>
                      <span style={{ width: 15, height: 15, borderRadius: "50%", border: "1px solid #94a3b8", color: "#64748b", fontSize: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                        ?
                      </span>
                    </label>
                    <textarea
                      className="quka-textarea"
                      rows={3}
                      value={pixelConfig.meta_pixel?.access_token || ""}
                      onChange={(e) => updatePixelGroup("meta_pixel", "access_token", e.target.value)}
                      placeholder="EAAODcHOQT6cBTPcsXqjdbloqYaOLKRXU7tszmQGVxX06418Tz9gzyEvzbXQh3mYVQccmBTZBCQm..."
                    />
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "5px" }}>
                      Meta Olay Yöneticisi (Events Manager) &gt; Ayarlar &gt; Dönüşümler API&apos;si &gt; Erişim Anahtarı Oluştur bölümünden aldığınız EAA... ile başlayan token.
                    </div>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      <span>Meta Test Etkinlik Kodu (Test Event Code - İsteğe Bağlı)</span>
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.meta_pixel?.test_event_code || ""}
                      onChange={(e) => updatePixelGroup("meta_pixel", "test_event_code", e.target.value)}
                      placeholder="Örn: TEST49281 (Sadece Olay Yöneticisinde test ederken doldurun)"
                    />
                  </div>
                </div>
              )}

              {/* 3. GOOGLE ANALYTICS (GA4) */}
              {activeMarketingMenu === "google_analytics" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    Google Analytics (GA4)
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Ziyaretçi trafiğinizi, gerçek zamanlı aktif kullanıcıları ve e-ticaret dönüşümlerini Google Analytics 4 (GA4) üzerinden izlemenizi sağlar.
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                      Durum
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updatePixelGroup("google_analytics", "active", !pixelConfig.google_analytics?.active)
                      }
                      style={{
                        width: "48px",
                        height: "26px",
                        borderRadius: "999px",
                        background: pixelConfig.google_analytics?.active ? "#10b981" : "#cbd5e1",
                        border: "none",
                        padding: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: pixelConfig.google_analytics?.active ? "flex-end" : "flex-start",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Google Analytics 4 (GA4) Ölçüm Kimliği (Measurement ID)
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.google_analytics?.measurement_id || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim()
                        updatePixelGroup("google_analytics", "measurement_id", val)
                        if (val && !pixelConfig.google_analytics?.active) {
                          updatePixelGroup("google_analytics", "active", true)
                        }
                      }}
                      placeholder="G-XXXXXXXXXX"
                    />
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "5px", fontFamily: "monospace" }}>
                      {`gtag('config', '`}
                      <strong style={{ color: "#0f172a" }}>
                        {pixelConfig.google_analytics?.measurement_id || "G-XXXXXXXXXX"}
                      </strong>
                      {`');`}
                    </div>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      GA4 Mülk Kimliği (Property ID - İsteğe Bağlı)
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.google_analytics?.property_id || ""}
                      onChange={(e) => updatePixelGroup("google_analytics", "property_id", e.target.value)}
                      placeholder="Örn: 412983712"
                    />
                  </div>
                </div>
              )}

              {/* 4. GOOGLE ADS */}
              {activeMarketingMenu === "google_ads" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    Google Ads
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Google Arama, Alışveriş (Shopping) ve Performance Max reklam kampanyalarınızın satış dönüşümlerini ve ROAS değerini ölçmenizi sağlar.
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                      Durum
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updatePixelGroup("google_ads", "active", !pixelConfig.google_ads?.active)
                      }
                      style={{
                        width: "48px",
                        height: "26px",
                        borderRadius: "999px",
                        background: pixelConfig.google_ads?.active ? "#10b981" : "#cbd5e1",
                        border: "none",
                        padding: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: pixelConfig.google_ads?.active ? "flex-end" : "flex-start",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Google Ads Dönüşüm Kimliği (AW-ID)
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.google_ads?.conversion_id || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim()
                        updatePixelGroup("google_ads", "conversion_id", val)
                        if (val && !pixelConfig.google_ads?.active) {
                          updatePixelGroup("google_ads", "active", true)
                        }
                      }}
                      placeholder="AW-XXXXXXXXX"
                    />
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Satın Alma (Purchase) Dönüşüm Etiketi (Conversion Label)
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.google_ads?.conversion_label || ""}
                      onChange={(e) => updatePixelGroup("google_ads", "conversion_label", e.target.value)}
                      placeholder="Örn: AbCdEfGhIjKlMnOpQr"
                    />
                  </div>
                </div>
              )}

              {/* 5. GOOGLE TAG MANAGER */}
              {activeMarketingMenu === "google_tag_manager" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    Google Tag Manager
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Tüm izleme etiketlerinizi ve gelişmiş e-ticaret `dataLayer` olaylarını Google Tag Manager (GTM) konteyneri üzerinden yönetmenizi sağlar.
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                      Durum
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updatePixelGroup("google_tag_manager", "active", !pixelConfig.google_tag_manager?.active)
                      }
                      style={{
                        width: "48px",
                        height: "26px",
                        borderRadius: "999px",
                        background: pixelConfig.google_tag_manager?.active ? "#10b981" : "#cbd5e1",
                        border: "none",
                        padding: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: pixelConfig.google_tag_manager?.active ? "flex-end" : "flex-start",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      GTM Konteyner Kimliği (Container ID)
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.google_tag_manager?.gtm_id || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim()
                        updatePixelGroup("google_tag_manager", "gtm_id", val)
                        if (val && !pixelConfig.google_tag_manager?.active) {
                          updatePixelGroup("google_tag_manager", "active", true)
                        }
                      }}
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>
                </div>
              )}

              {/* 6. OPENAI ADS */}
              {activeMarketingMenu === "openai_ads" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    OpenAI Ads &amp; ChatGPT Shopping
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Ürünlerinizin OpenAI / ChatGPT Shopping aramalarında önerilmesini ve yapay zeka kaynaklı alışveriş dönüşümlerinin izlenmesini sağlar.
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                      Durum
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updatePixelGroup("openai_ads", "active", !pixelConfig.openai_ads?.active)
                      }
                      style={{
                        width: "48px",
                        height: "26px",
                        borderRadius: "999px",
                        background: pixelConfig.openai_ads?.active ? "#10b981" : "#cbd5e1",
                        border: "none",
                        padding: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: pixelConfig.openai_ads?.active ? "flex-end" : "flex-start",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      OpenAI Reklam / İzleme Kimliği (Pixel ID)
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.openai_ads?.pixel_id || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim()
                        updatePixelGroup("openai_ads", "pixel_id", val)
                        if (val && !pixelConfig.openai_ads?.active) {
                          updatePixelGroup("openai_ads", "active", true)
                        }
                      }}
                      placeholder="Örn: OAI-XXXXXXXXXX"
                    />
                  </div>
                </div>
              )}

              {/* 7. TIKTOK PIXEL */}
              {activeMarketingMenu === "tiktok_pixel" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    TikTok Pixel
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    TikTok reklam kampanyalarınızdan gelen ziyaretçilerin ürün inceleme, sepete ekleme ve satın alma davranışlarını izlemenizi sağlar.
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                      Durum
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updatePixelGroup("tiktok_pixel", "active", !pixelConfig.tiktok_pixel?.active)
                      }
                      style={{
                        width: "48px",
                        height: "26px",
                        borderRadius: "999px",
                        background: pixelConfig.tiktok_pixel?.active ? "#10b981" : "#cbd5e1",
                        border: "none",
                        padding: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: pixelConfig.tiktok_pixel?.active ? "flex-end" : "flex-start",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      TikTok Pixel Kodu (Pixel ID)
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.tiktok_pixel?.pixel_id || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim()
                        updatePixelGroup("tiktok_pixel", "pixel_id", val)
                        if (val && !pixelConfig.tiktok_pixel?.active) {
                          updatePixelGroup("tiktok_pixel", "active", true)
                        }
                      }}
                      placeholder="Örn: C8H2N9PL019283"
                    />
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      TikTok Events API Erişim Anahtarı (Access Token - İsteğe Bağlı)
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.tiktok_pixel?.access_token || ""}
                      onChange={(e) => updatePixelGroup("tiktok_pixel", "access_token", e.target.value)}
                      placeholder="TikTok Events API Access Token"
                    />
                  </div>
                </div>
              )}

              {/* 8. YANDEX METRİKA */}
              {activeMarketingMenu === "yandex_metrica" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    Yandex Metrika
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Yandex Metrika ve Webvisor ile ziyaretçilerinizin tıklama ısı haritalarını (heatmap) ve oturum video kayıtlarını izlemenizi sağlar.
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
                      Durum
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        updatePixelGroup("yandex_metrica", "active", !pixelConfig.yandex_metrica?.active)
                      }
                      style={{
                        width: "48px",
                        height: "26px",
                        borderRadius: "999px",
                        background: pixelConfig.yandex_metrica?.active ? "#10b981" : "#cbd5e1",
                        border: "none",
                        padding: "3px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: pixelConfig.yandex_metrica?.active ? "flex-end" : "flex-start",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                    </button>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Yandex Metrika Sayaç Numarası (Counter ID)
                    </label>
                    <input
                      className="quka-input"
                      value={pixelConfig.yandex_metrica?.counter_id || ""}
                      onChange={(e) => {
                        const val = e.target.value.trim()
                        updatePixelGroup("yandex_metrica", "counter_id", val)
                        if (val && !pixelConfig.yandex_metrica?.active) {
                          updatePixelGroup("yandex_metrica", "active", true)
                        }
                      }}
                      placeholder="Örn: 94827165"
                    />
                  </div>
                </div>
              )}

              {/* 9. ROBOTS.TXT */}
              {activeMarketingMenu === "robots_txt" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    Robots.txt
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Arama motoru botlarının (`Googlebot`, `Bingbot`, `YandexBot`) mağazanızdaki hangi sayfaları tarayıp indeksleyeceğini belirleyen `/robots.txt` dosyasını yönetin.
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      Robots.txt İçeriği (https://cizgibutik.com/robots.txt)
                    </label>
                    <textarea
                      className="quka-textarea"
                      rows={8}
                      style={{ fontFamily: "monospace", fontSize: "12.5px" }}
                      value={pixelConfig.robots_txt?.content || ""}
                      onChange={(e) => updatePixelGroup("robots_txt", "content", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* 10. LLMS.TXT */}
              {activeMarketingMenu === "llms_txt" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    LLMs.txt (Yapay Zeka Motorları Tanıtım Dosyası)
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    ChatGPT, Claude, Gemini ve Perplexity gibi büyük dil modellerinin mağazanızı ve kategorilerinizi doğru tanımasını sağlayan `/llms.txt` standardı.
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      LLMs.txt İçeriği (https://cizgibutik.com/llms.txt)
                    </label>
                    <textarea
                      className="quka-textarea"
                      rows={8}
                      style={{ fontFamily: "monospace", fontSize: "12.5px" }}
                      value={pixelConfig.llms_txt?.content || ""}
                      onChange={(e) => updatePixelGroup("llms_txt", "content", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* 11. SCRİPTLER */}
              {activeMarketingMenu === "custom_scripts" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    Özel Scriptler &amp; Canlı Destek Kodları
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Mağazanızın `&lt;head&gt;` veya `&lt;body&gt;` etiketleri arasına harici doğrulama kodları, canlı destek widget&apos;ları veya özel izleme scriptleri ekleyebilirsiniz.
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      {"<head> ... </head>"} Arasına Eklenecek Özel Kodlar
                    </label>
                    <textarea
                      className="quka-textarea"
                      rows={5}
                      style={{ fontFamily: "monospace", fontSize: "12px" }}
                      value={pixelConfig.custom_scripts?.head_scripts || ""}
                      onChange={(e) => updatePixelGroup("custom_scripts", "head_scripts", e.target.value)}
                      placeholder="<!-- Özel Head Script veya Meta Etiketleri -->"
                    />
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                      {"</body>"} Öncesine Eklenecek Özel Kodlar (Canlı Destek vb.)
                    </label>
                    <textarea
                      className="quka-textarea"
                      rows={5}
                      style={{ fontFamily: "monospace", fontSize: "12px" }}
                      value={pixelConfig.custom_scripts?.body_end_scripts || ""}
                      onChange={(e) => updatePixelGroup("custom_scripts", "body_end_scripts", e.target.value)}
                      placeholder="<!-- Canlı Destek veya Özel İzleme Scriptleri -->"
                    />
                  </div>
                </div>
              )}

              {/* 12. DOSYALAR */}
              {activeMarketingMenu === "verification_files" && (
                <div>
                  <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: 700, color: "#1e293b" }}>
                    Doğrulama Dosyaları (HTML / TXT)
                  </h4>
                  <div
                    style={{
                      background: "#f1f5f9",
                      borderRadius: "6px",
                      padding: "12px 15px",
                      fontSize: "12.5px",
                      color: "#475569",
                      lineHeight: 1.5,
                      marginBottom: "20px",
                    }}
                  >
                    Google, Facebook, Yandex veya ödeme kuruluşlarının kök dizine yüklenmesini istediği `.html` veya `.txt` doğrulama dosyalarını buradan ekleyebilirsiniz.
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 16px",
                        borderRadius: "6px",
                        background: "#2563eb",
                        color: "#fff",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <span>📄 Doğrulama Dosyası Seç (.html / .txt)</span>
                      <input
                        type="file"
                        accept=".html,.htm,.txt,.xml"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const content = String(reader.result || "")
                            const nextFiles = [
                              ...(pixelConfig.verification_files || []),
                              {
                                filename: file.name,
                                content,
                                uploaded_at: new Date().toLocaleDateString("tr-TR"),
                              },
                            ]
                            setPixelConfig((prev) => ({ ...prev, verification_files: nextFiles }))
                            showToast(`${file.name} eklendi. Kaydet butonuna basarak yayınlayın.`)
                          }
                          reader.readAsText(file)
                        }}
                      />
                    </label>
                  </div>

                  {(pixelConfig.verification_files || []).length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {(pixelConfig.verification_files || []).map((f: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "6px",
                            border: "1px solid #e2e8f0",
                            background: "#f8fafc",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "13px", color: "#0f172a" }}>{f.filename}</strong>
                            <span style={{ fontSize: "11.5px", color: "#64748b", marginLeft: "10px" }}>
                              {f.uploaded_at}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const next = (pixelConfig.verification_files || []).filter((_: any, idx: number) => idx !== i)
                              setPixelConfig((prev) => ({ ...prev, verification_files: next }))
                            }}
                            style={{
                              border: "none",
                              background: "#fee2e2",
                              color: "#dc2626",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "12.5px", color: "#64748b" }}>
                      Henüz yüklenmiş bir doğrulama dosyası bulunmuyor.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. YAZDIRMA ETİKETLERİ */}
        {activeTab === "prints" && (
          <div>
            <div
              className="quka-card"
              style={{
                background: "#eff6ff",
                borderColor: "#bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1e3a8a", marginBottom: 4 }}>
                  Kargo Barkod, Sipariş Fişi ve Fatura Yazdırma Şablonları
                </div>
                <div style={{ fontSize: 12.5, color: "#1e40af" }}>
                  Termal barkod yazıcı (100x100mm) veya standart A4 / A5 lazer yazıcılar için çıktı şablonlarını özelleştirebilirsiniz.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Test şablonu yazdırma penceresi hazırlandı.")}
              >
                🖨️ Test Çıktısı Al
              </button>
            </div>

            <div className="quka-form-grid">
              {[
                {
                  title: "Kargo Barkod Etiketi (100x100mm Termal)",
                  desc: "Yurtiçi, Aras, MNG, Sürat ve HepsiJet barkodlu termal kargo etiketi.",
                  size: "100mm x 100mm (Zebra / Argox Uyumlu)",
                },
                {
                  title: "Sipariş Hazırlama / Toplama Fişi (A4)",
                  desc: "Depo personeli için ürün raf kodu, fotoğraf, varyant ve adet listesi.",
                  size: "A4 Dikey (210mm x 297mm)",
                },
                {
                  title: "Kutu İçi Sevk ve İade Bilgi Fişi (A5)",
                  desc: "Müşteri paketinin içine konulan sipariş özeti ve kolay iade kodu fişi.",
                  size: "A5 Yatay (148mm x 210mm)",
                },
                {
                  title: "Raf & Ürün Barkod Etiketi (60x40mm)",
                  desc: "Depo rafları ve ürün paketleri için EAN-13 / Code-128 barkod etiketi.",
                  size: "60mm x 40mm Termal",
                },
              ].map((tpl) => (
                <div key={tpl.title} className="quka-card" style={{ marginBottom: 0 }}>
                  <h5>{tpl.title}</h5>
                  <p style={{ fontSize: 12.5, color: "#475569", margin: "0 0 12px 0" }}>{tpl.desc}</p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingTop: 12,
                      borderTop: "1px solid #f1f5f9",
                    }}
                  >
                    <span className="quka-badge-muted">{tpl.size}</span>
                    <button
                      type="button"
                      className="quka-btn-outline"
                      onClick={() => showToast(`${tpl.title} düzenleme ekranı açıldı.`)}
                    >
                      Şablonu Düzenle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PARA BİRİMLERİ */}
        {activeTab === "currencies" && (
          <div className="quka-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h5 style={{ margin: 0 }}>Para Birimleri ve Döviz Kurları</h5>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
                  TCMB (Türkiye Cumhuriyet Merkez Bankası) üzerinden günlük otomatik kur güncellemesi aktiftir.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Döviz kurları TCMB üzerinden güncellendi!")}
              >
                ↻ TCMB Kurlarını Şimdi Güncelle
              </button>
            </div>

            <table className="quka-table">
              <thead>
                <tr>
                  <th>Para Birimi</th>
                  <th>Kodu</th>
                  <th>Sembol</th>
                  <th>Kur Değeri (TL)</th>
                  <th>Son Güncelleme</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {CURRENCY_ROWS.map((c) => (
                  <tr key={c.code}>
                    <td style={{ fontWeight: 600 }}>
                      {c.name}{" "}
                      {c.isDefault && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: 10.5,
                            background: "#eff6ff",
                            color: "#2196f3",
                            padding: "2px 7px",
                            borderRadius: 4,
                            fontWeight: 700,
                          }}
                        >
                          Varsayılan
                        </span>
                      )}
                    </td>
                    <td>{c.code}</td>
                    <td style={{ fontWeight: 700 }}>{c.symbol}</td>
                    <td>
                      <input
                        className="quka-input"
                        style={{ width: 120 }}
                        defaultValue={c.rate}
                        disabled={c.isDefault}
                      />
                    </td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>{c.updatedAt}</td>
                    <td>
                      {c.active ? (
                        <span className="quka-badge-success">✓ Aktif</span>
                      ) : (
                        <span className="quka-badge-muted">Pasif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. VERGİLER */}
        {activeTab === "taxes" && (
          <div>
            <div className="quka-card">
              <h5>Vergi (KDV) Ayarları</h5>
              <div className="quka-form-grid">
                <div className="quka-field">
                  <label>Ürün Fiyatlarına KDV Dahil mi?</label>
                  <select className="quka-select" defaultValue="included">
                    <option value="included">Evet, Ürün Fiyatları KDV Dahildir</option>
                    <option value="excluded">Hayır, KDV Sepette Artı Olarak Eklenir</option>
                  </select>
                </div>
                <div className="quka-field">
                  <label>Kargo Ücretleri KDV Oranı</label>
                  <select className="quka-select" defaultValue="20">
                    <option value="20">%20 KDV (Standart)</option>
                    <option value="10">%10 KDV</option>
                    <option value="0">%0 KDV</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="quka-card">
              <h5>Tanımlı Vergi Oranları</h5>
              <table className="quka-table">
                <thead>
                  <tr>
                    <th>Vergi Adı</th>
                    <th>Oran (%)</th>
                    <th>Uygulama Alanı</th>
                    <th>Varsayılan</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Genel KDV (%20)</td>
                    <td>%20</td>
                    <td>Oto Aksesuar, Body Kit, Elektronik, Kargo</td>
                    <td><span className="quka-badge-success">Varsayılan</span></td>
                    <td><span className="quka-badge-success">✓ Aktif</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>İndirimli KDV (%10)</td>
                    <td>%10</td>
                    <td>Tekstil, Çanta ve Seçili Aksesuarlar</td>
                    <td>-</td>
                    <td><span className="quka-badge-success">✓ Aktif</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Temel Gıda / Özel KDV (%1)</td>
                    <td>%1</td>
                    <td>Özel Muafiyetli Ürün Grupları</td>
                    <td>-</td>
                    <td><span className="quka-badge-success">✓ Aktif</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>KDV Muaf / İhracat (%0)</td>
                    <td>%0</td>
                    <td>Mikro İhracat (ETGB) ve Yurt Dışı Satışlar</td>
                    <td>-</td>
                    <td><span className="quka-badge-success">✓ Aktif</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. DİLLER & LOKALİZASYON */}
        {activeTab === "locations" && (
          <div className="quka-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h5 style={{ margin: 0 }}>Mağaza Dilleri & Çoklu Dil (Lokalizasyon)</h5>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
                  E-İhracat ve çok dilli vitrin için aktif dilleri ve çeviri oranlarını yönetebilirsiniz.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Yapay zeka hızlı çeviri kuyruğu başlatıldı.")}
              >
                ✨ Yapay Zeka Hızlı Çeviri
              </button>
            </div>

            <table className="quka-table">
              <thead>
                <tr>
                  <th>Dil</th>
                  <th>ISO Kodu</th>
                  <th>Yön</th>
                  <th>Çeviri Tamamlanma</th>
                  <th>Varsayılan</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇹🇷 Türkçe</td>
                  <td>tr-TR</td>
                  <td>LTR</td>
                  <td>%100</td>
                  <td><span className="quka-badge-success">Ana Dil</span></td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇬🇧 İngilizce (English)</td>
                  <td>en-US</td>
                  <td>LTR</td>
                  <td>%96</td>
                  <td>-</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇩🇪 Almanca (Deutsch)</td>
                  <td>de-DE</td>
                  <td>LTR</td>
                  <td>%88</td>
                  <td>-</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇸🇦 Arapça (العربية)</td>
                  <td>ar-SA</td>
                  <td>RTL</td>
                  <td>%75</td>
                  <td>-</td>
                  <td><span className="quka-badge-muted">Pasif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>🇷🇺 Rusça (Русский)</td>
                  <td>ru-RU</td>
                  <td>LTR</td>
                  <td>%70</td>
                  <td>-</td>
                  <td><span className="quka-badge-muted">Pasif</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 8. WEB SERVİS (API) */}
        {activeTab === "api" && (
          <div className="quka-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h5 style={{ margin: 0 }}>Web Servis (REST & SOAP API Hesapları)</h5>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
                  ERP, Muhasebe, Pazaryeri ve Mobil Uygulama entegrasyonları için API erişim anahtarları.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Yeni API kullanıcısı oluşturma penceresi açıldı.")}
              >
                + Yeni API Hesabı Ekle
              </button>
            </div>

            <table className="quka-table">
              <thead>
                <tr>
                  <th>Uygulama / Entegrasyon Adı</th>
                  <th>API Kullanıcı Kodu</th>
                  <th>Yetki Kapsamı</th>
                  <th>IP Kısıtlaması</th>
                  <th>Son Erişim</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>EntegreShop ERP & E-Fatura Köprüsü</td>
                  <td><code>api_erp_prod_01</code></td>
                  <td>Ürün, Sipariş, Stok, Cari (Tam Yetki)</td>
                  <td>Tüm IP'ler</td>
                  <td>2 dakika önce</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Pazaryeri Senkronizasyon Servisi</td>
                  <td><code>api_mp_sync_02</code></td>
                  <td>Ürün, Fiyat, Stok, Sipariş</td>
                  <td>Tüm IP'ler</td>
                  <td>5 dakika önce</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Mobil Uygulama (iOS & Android)</td>
                  <td><code>api_mobile_storefront</code></td>
                  <td>Katalog, Sepet, Müşteri</td>
                  <td>Tüm IP'ler</td>
                  <td>12 dakika önce</td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 9. PERSONELLER */}
        {activeTab === "staff" && (
          <div className="quka-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h5 style={{ margin: 0 }}>Yönetici Kullanıcılar & Personel Yetkileri</h5>
                <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
                  Yönetim paneline erişebilen personelleri ve departman bazlı yetki gruplarını yönetin.
                </div>
              </div>
              <button
                type="button"
                className="quka-btn-primary"
                onClick={() => showToast("Yeni personel ekleme formu açıldı.")}
              >
                + Yeni Personel Ekle
              </button>
            </div>

            <table className="quka-table">
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>E-Posta Adresi</th>
                  <th>Telefon</th>
                  <th>Yetki Grubu</th>
                  <th>2FA Güvenlik</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>Çizgi Butik Admin</td>
                  <td>info@cizgibutik.com</td>
                  <td>0552 001 99 66</td>
                  <td>Süper Yönetici (Tam Yetki)</td>
                  <td><span className="quka-badge-success">SMS + E-Posta</span></td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Depo & Kargo Operasyon</td>
                  <td>depo@cizgibutik.com</td>
                  <td>0552 001 99 67</td>
                  <td>Sipariş ve Kargo Sorumlusu</td>
                  <td><span className="quka-badge-muted">Standart</span></td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>Katalog & Pazaryeri Uzmanı</td>
                  <td>katalog@cizgibutik.com</td>
                  <td>0552 001 99 68</td>
                  <td>Ürün, Kategori ve Pazaryeri</td>
                  <td><span className="quka-badge-muted">Standart</span></td>
                  <td><span className="quka-badge-success">✓ Aktif</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 10. LİSANS */}
        {activeTab === "licence" && (
          <div>
            <div
              className="quka-card"
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                color: "#ffffff",
                border: "none",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#93c5fd", fontWeight: 700 }}>
                    AKTİF E-TİCARET & PAZARYERİ LİSANSI
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
                    EntegreShop Enterprise Плюс (Tam Paket)
                  </div>
                  <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4 }}>
                    Lisans Anahtarı: <code>ENT-BKM-2026-PRO-99482</code> • Alan Adı: <strong>cizgibutik.com</strong>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#38bdf8" }}>227 Gün Kaldı</div>
                  <div style={{ fontSize: 12, color: "#cbd5e1" }}>Yenileme Tarihi: 01.07.2027</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  background: "rgba(255,255,255,0.12)",
                  height: 8,
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "65%", height: "100%", background: "#38bdf8" }} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                {[
                  { label: "Ürün Limiti", val: "Sınırsız" },
                  { label: "Trafik / Bant Genişliği", val: "Sınırsız CDN" },
                  { label: "Çift Yönlü Pazaryeri", val: "10 Pazaryeri Aktif" },
                  { label: "E-Fatura & ERP", val: "Aktif (Sınırsız)" },
                  { label: "Yönetici / Personel", val: "10 Kullanıcı" },
                ].map((box) => (
                  <div
                    key={box.label}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ fontSize: 11.5, color: "#cbd5e1" }}>{box.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{box.val}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18 }}>
              {[
                {
                  name: "Başlangıç (Starter)",
                  price: "14.900 TL / Yıl",
                  features: ["5.000 Ürün Limiti", "Standart E-Ticaret Vitrini", "Sanal POS & Kargo Entegrasyonu", "E-Posta ve SMS Bildirimleri"],
                  current: false,
                },
                {
                  name: "Profesyonel (Pazaryeri)",
                  price: "24.900 TL / Yıl",
                  features: ["25.000 Ürün Limiti", "Trendyol, Hepsiburada, N11 Entegrasyonu", "E-Fatura & Muhasebe Entegrasyonu", "Gelişmiş Kampanya Kurguları"],
                  current: false,
                },
                {
                  name: "Enterprise (Tam Paket)",
                  price: "39.900 TL / Yıl",
                  features: ["Sınırsız Ürün & Varyant", "Tüm Pazaryerleri + B2B Bayilik", "Rocket Önbellek + Çoklu Dil (E-İhracat)", "7/24 Öncelikli VIP Destek"],
                  current: true,
                },
              ].map((pkg) => (
                <div
                  key={pkg.name}
                  className="quka-card"
                  style={{
                    borderColor: pkg.current ? "#2196f3" : "#e2e8f0",
                    borderWidth: pkg.current ? 2 : 1,
                    marginBottom: 0,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h5 style={{ margin: 0 }}>{pkg.name}</h5>
                    {pkg.current && <span className="quka-badge-success">Mevcut Paketiniz</span>}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "12px 0" }}>
                    {pkg.price}
                  </div>
                  <ul style={{ paddingLeft: 18, margin: "0 0 16px 0", fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
                    {pkg.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className={pkg.current ? "quka-btn-primary" : "quka-btn-outline"}
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => showToast(`${pkg.name} lisans detayları görüntülendi.`)}
                  >
                    {pkg.current ? "✓ Aktif Lisansınız" : "Paketi İncele"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STICKY BOTTOM SAVE BAR */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          padding: "12px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 90,
          boxShadow: "0 -4px 12px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
          Ayarlar › <span style={{ color: "#0f172a", fontWeight: 700 }}>{footerLabelMap[activeTab]}</span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "#2ecc71",
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            padding: "9px 24px",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: saving ? "wait" : "pointer",
            boxShadow: "0 2px 6px rgba(46, 204, 113, 0.28)",
          }}
        >
          {saving ? "Kaydediliyor..." : "✓ Kaydet"}
        </button>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Mağaza Ayarları",
})

export default StoreSettingsPage
