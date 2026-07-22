import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { readConfig } from "../../../admin/shipping-settings/route"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const config = readConfig()
    res.json({ shipping_carriers: config.carriers || [] })
  } catch (e) {
    res.json({ shipping_carriers: [] })
  }
}
