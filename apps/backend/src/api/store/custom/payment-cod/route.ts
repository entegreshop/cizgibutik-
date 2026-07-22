import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readConfig } from "../../../admin/payment-settings/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const config = readConfig()
    let codSettings = { is_active: false, additional_fee: "0", min_amount: "10000" }
    
    if (config.cash_on_delivery) {
      codSettings = {
          is_active: config.cash_on_delivery.active,
          additional_fee: config.cash_on_delivery.adjustment_value?.toString() || "0",
          min_amount: config.cash_on_delivery.max_total?.toString() || "10000"
      }
    }

    res.json({ success: true, settings: codSettings })

  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}
