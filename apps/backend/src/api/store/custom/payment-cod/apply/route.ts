import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"
import { readConfig as readPaymentConfig } from "../../../../admin/payment-settings/route"
import { syncCartShippingMethods } from "../../../../admin/shipping-settings/route"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cartModule = req.scope.resolve<ICartModuleService>(Modules.CART)

    const body = req.body as { cart_id: string; method_id: string; coupon_code?: string }

    if (!body.cart_id) {
      return res.status(400).json({ error: "cart_id is required" })
    }

    const hasCoupon = Boolean(body.coupon_code && body.coupon_code.trim() !== "")

    // 1. Ensure no promotions are applied automatically without customer coupon code
    try {
      const promotionModule = req.scope.resolve<any>(Modules.PROMOTION)
      if (promotionModule) {
        const autoPromos = await promotionModule.listPromotions({ is_automatic: true })
        if (autoPromos && autoPromos.length > 0) {
          for (const ap of autoPromos) {
            try {
              await promotionModule.updatePromotions({ id: ap.id, is_automatic: false })
              console.log(`[AutoPromo] Disabled auto promo: ${ap.code || ap.id}`)
            } catch (uErr) {
              try {
                await (promotionModule as any).updatePromotions(ap.id, { is_automatic: false })
              } catch {}
            }
          }
        }
      }
    } catch (promoErr) {
      console.warn("Promotion auto check note:", promoErr)
    }

    // 1.1. Get Payment settings from admin config (with fallback defaults)
    const paymentConfig = readPaymentConfig()
    const codSettings = {
      is_active: Boolean(paymentConfig.cash_on_delivery?.active),
      additional_fee: Number(paymentConfig.cash_on_delivery?.adjustment_value ?? 0),
      max_amount: Number(paymentConfig.cash_on_delivery?.max_total ?? 10000)
    }
    const codCcSettings = {
      is_active: Boolean(paymentConfig.card_on_delivery?.active),
      additional_fee: Number(paymentConfig.card_on_delivery?.adjustment_value ?? 0),
      max_amount: Number(paymentConfig.card_on_delivery?.max_total ?? 10000)
    }

    // 2. Fetch the cart
    const cart = await cartModule.retrieveCart(body.cart_id, {
      relations: ["items", "items.adjustments", "shipping_methods", "shipping_methods.adjustments"]
    })

    // If customer has NOT entered a coupon code, purge any rogue automatic discounts/adjustments
    if (!hasCoupon) {
      try {
        const itemAdjIds: string[] = []
        for (const it of cart.items || []) {
          for (const adj of (it as any).adjustments || []) {
            if (adj.id) itemAdjIds.push(adj.id)
          }
        }
        if (itemAdjIds.length > 0) {
          await (cartModule as any).deleteLineItemAdjustments(itemAdjIds)
          console.log(`[AutoPromo] Purged ${itemAdjIds.length} item adjustments because no coupon was provided`)
        }

        const shipAdjIds: string[] = []
        for (const sm of cart.shipping_methods || []) {
          for (const adj of (sm as any).adjustments || []) {
            if (adj.id) shipAdjIds.push(adj.id)
          }
        }
        if (shipAdjIds.length > 0) {
          await (cartModule as any).deleteShippingMethodAdjustments(shipAdjIds)
        }
      } catch (adjErr) {
        console.warn("Adjustment purge note in payment-cod/apply:", adjErr)
      }
    }

    const COD_ITEM_TITLE = "Kapıda Ödeme Ek Hizmet Bedeli"
    const COD_CC_ITEM_TITLE = "Kapıda Kredi Kartı Ek Hizmet Bedeli"

    // Remove any existing COD fee items first to avoid duplicates or wrong type
    const existingCodItems = cart.items?.filter((i: any) => i.title?.includes("Kapıda") || i.metadata?.is_cod_fee) || []
    if (existingCodItems.length > 0) {
      for (const item of existingCodItems) {
        await cartModule.deleteLineItems(item.id)
      }
    }

    // 3. Evaluate logic (COD Fee should NOT be a line item product, it is stored in metadata)
    const isCodMethod = body.method_id === "cod" || body.method_id === "cash_on_delivery" || body.method_id === "cod_cash"
    const isCodCcMethod = body.method_id === "cod_cc" || body.method_id === "cash_on_delivery_cc" || body.method_id === "card_on_delivery"

    let feeTL = 0
    let feeKurus = 0

    if ((isCodMethod && codSettings.is_active) || (isCodCcMethod && codCcSettings.is_active)) {
      const activeSettings = isCodCcMethod ? codCcSettings : codSettings
      feeTL = Number(activeSettings.additional_fee || 0)
      feeKurus = Math.round(feeTL * 100)
    }

    try {
      await (cartModule as any).updateCarts(cart.id, {
        metadata: {
          ...(cart.metadata || {}),
          is_cod: isCodMethod || isCodCcMethod,
          payment_fee: feeTL,
          cod_fee_amount: feeKurus,
          shipping_fee: 150,
          coupon_code: body.coupon_code ? body.coupon_code.trim() : "",
          payment_option: isCodCcMethod ? "card_on_delivery" : isCodMethod ? "cash_on_delivery" : (cart.metadata?.payment_option || body.method_id),
          secilen_odeme_yontemi: isCodCcMethod ? "Kapıda Kredi Kartı ile Ödeme" : isCodMethod ? "Kapıda Nakit Ödeme" : (cart.metadata?.secilen_odeme_yontemi || body.method_id)
        }
      })
    } catch (metaErr) {
      console.warn("Cart metadata update note in payment-cod/apply:", metaErr)
    }

    // 4. Sync cart shipping methods amount with effective shipping settings (150 TL for COD, or free threshold for online)
    const effectiveShippingKurus = await syncCartShippingMethods(req.scope, body.cart_id, body.method_id)

    // 5. If a payment collection already exists for this cart, sync its amount with the updated cart total
    try {
      const { ContainerRegistrationKeys } = await import("@medusajs/framework/utils")
      const paymentModule = req.scope.resolve<any>(Modules.PAYMENT)
      const query = req.scope.resolve<any>(ContainerRegistrationKeys.QUERY)
      const { data: cartData } = await query.graph({
        entity: "cart",
        fields: ["id", "total", "payment_collection.id", "payment_collection.amount"],
        filters: { id: body.cart_id }
      })
      const paymentCol = cartData?.[0]?.payment_collection
      const cartTotal = cartData?.[0]?.total
      if (paymentCol && cartTotal !== undefined && Number(paymentCol.amount) !== Number(cartTotal)) {
        await paymentModule.updatePaymentCollections(paymentCol.id, {
          amount: Number(cartTotal)
        })
      }
    } catch (paySyncErr) {
      console.warn("Payment collection amount sync note:", paySyncErr)
    }

    res.json({ success: true, effective_shipping_kurus: effectiveShippingKurus })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}
