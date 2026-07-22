import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { readConfig as readPaymentConfig } from "../../../admin/payment-settings/route"
import { readConfig as readShippingConfig } from "../../../admin/shipping-settings/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const storeModule = req.scope.resolve(Modules.STORE)
  const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
  const store = stores[0]
  
  const settings = store?.metadata || {}
  
  const pConfig = readPaymentConfig()
  const sConfig = readShippingConfig()
          
  settings.payment_bank = { active: pConfig.bank_transfer?.active }
  settings.payment_paytr = { active: pConfig.paytr?.active }
  settings.payment_cod_cc = {
      is_active: pConfig.card_on_delivery?.active,
      additional_fee: pConfig.card_on_delivery?.adjustment_value,
      min_amount: pConfig.card_on_delivery?.max_total // quick-checkout uses min_amount for the max_total limit
  }
  settings.shipping_settings = {
      standard_rate: sConfig.standardShippingFee || 60,
      free_shipping_limit: sConfig.freeShippingEnabled ? sConfig.freeShippingThreshold : 1000000,
      free_shipping_enabled: sConfig.freeShippingEnabled
  }
  
  // Enforce the requested copyright string text from user payload
  settings["footer-telif"] = "Tüm bilgileriniz 256bit SSL Sertifikası ile korunmaktadır.\n© 2026 XOOX.com Tüm Hakları Saklıdır"

  res.json({ settings })
}
