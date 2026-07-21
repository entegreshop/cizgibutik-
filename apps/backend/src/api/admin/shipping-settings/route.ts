import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"
import fs from "fs"
import path from "path"
import os from "os"

const configFilePath = path.join(process.cwd(), ".xoox-shipping-settings.json")

const defaultData = {
  systemType: "advanced", // "advanced" | "simple"
  standardShippingEnabled: true,
  standardShippingFee: 100,
  standardShippingCurrency: "TL",
  standardShippingCartType: "Tüm sepetlere ekle",
  freeShippingEnabled: true,
  freeShippingThreshold: 500,
  freeShippingCurrency: "TL",
  regions: [
    {
      id: "reg_tr",
      countryCode: "tr",
      countryName: "Türkiye",
      name: "Asya 1",
      cities: ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"]
    }
  ],
  carriers: [
    {
      id: "carrier_aras",
      key: "aras",
      general: {
        name: "ARAS KARGO",
        active: true,
        description: "Aras kargo ile hızlı teslimat.",
        sortOrder: 4,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: true,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: true,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "PA4RQ2XMfG1DgwLrYO8pW3zs9tZ7yjvhINJd6FSk",
        apiFrom: "info@giyimbox.com",
        branchName: "MNG"
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_interline",
      key: "interline",
      general: {
        name: "INTERLINE KARGO",
        active: true,
        description: "",
        sortOrder: 0,
        taxNumber: "11111111111",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: true,
        autoGenerateBarcode: true,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "gvC8kSXzRBHMaW1Ucnls53N6KAZ0TFb7YGphm4QE",
        apiFrom: "modoskop@interlinekargo.com",
        branchName: "582"
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_kargoist",
      key: "kargoist",
      general: {
        name: "KARGOİST",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_ptt",
      key: "ptt",
      general: {
        name: "PTT Kargo",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    },
    {
      id: "carrier_nova",
      key: "kargonova",
      general: {
        name: "KargoNOVA",
        active: false,
        description: "",
        sortOrder: 0,
        taxNumber: "",
        customerType: "Hepsi",
        companyCode: "",
        logoUrl: "",
        customDeliveryTime: false,
        limitCartTotal: false,
        limitVolumetricWeight: false,
        limitProductQuantity: false
      },
      api: {
        apiActive: false,
        autoGenerateBarcode: false,
        generateBarcodeForNonCarrier: false,
        markAsShippedOnBranchReceive: false,
        barcodeGenerationStage: "Yeni Sipariş",
        sendFixedVolumetricWeight: false,
        apiAuthorization: "",
        apiFrom: "",
        branchName: ""
      },
      regions: {
        deliveryType: "all",
        countries: []
      }
    }
  ],
  generalShippingFees: [],
  productSpecificFees: []
}

export function readConfig() {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, "utf-8")
      const parsed = JSON.parse(content)
      return {
        ...defaultData,
        ...parsed,
        regions: parsed.regions || defaultData.regions,
        carriers: parsed.carriers || defaultData.carriers,
        generalShippingFees: parsed.generalShippingFees || defaultData.generalShippingFees,
        productSpecificFees: parsed.productSpecificFees || defaultData.productSpecificFees
      }
    }
  } catch (err) {
    console.error("Error reading shipping config in admin api:", err)
  }
  return defaultData
}

function writeConfig(data: any) {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(data, null, 2), "utf-8")
    return true
  } catch (err) {
    console.error("Error writing shipping config in admin api:", err)
    return false
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = readConfig()
  res.json({ config })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const success = writeConfig(body)
  
  if (success) {
    try {
      // Background Sync with Medusa Core
      const query = req.scope.resolve("query")
      
      // 1. Fetch all existing shipping options
      const { data: shippingOptions } = await query.graph({
        entity: "shipping_option",
        fields: ["id", "name", "price_type", "prices.*"]
      })

      if (shippingOptions && shippingOptions.length > 0) {
        const flatOptions = (shippingOptions as any[]).filter(so => so.price_type === "flat")
        
        if (flatOptions.length > 0) {
          const updateData = flatOptions.map(option => {
            // Find existing try price or create one
            const existingTryPrice = option.prices?.find((p: any) => p.currency_code === "try" || p.currency_code === "TL")
            const priceAmount = Number(body.standardShippingFee || 0)
            
            return {
              id: option.id,
              prices: [
                {
                  id: existingTryPrice?.id, // if id exists, it will update, else create
                  currency_code: "try",
                  amount: priceAmount
                }
              ]
            }
          })

          await updateShippingOptionsWorkflow(req.scope).run({
            input: updateData
          })
          console.log("Successfully synced shipping option prices to Medusa Core.")
        }
      }
    } catch (syncError) {
      console.error("Error syncing shipping options with Medusa Core:", syncError)
      // We don't fail the request if sync fails, but log it.
    }

    res.json({ success: true, config: body })
  } else {
    res.status(500).json({ success: false, message: "Could not write shipping configuration" })
  }
}

