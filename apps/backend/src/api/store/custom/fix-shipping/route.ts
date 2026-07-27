import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Client } from "pg"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return res.status(500).json({ error: "No DATABASE_URL found" })
    }

    const client = new Client({
      connectionString: dbUrl
    })
    
    await client.connect()

    // Get default shipping profile
    const profileRes = await client.query(`SELECT id FROM shipping_profile WHERE type = 'default' LIMIT 1`)
    if (profileRes.rowCount === 0) {
      await client.end()
      return res.status(404).json({ error: "No default shipping profile found" })
    }
    const profileId = profileRes.rows[0].id

    // Find products without a shipping profile
    const missingProducts = await client.query(`
      SELECT p.id 
      FROM product p
      LEFT JOIN product_shipping_profile psp ON p.id = psp.product_id
      WHERE psp.shipping_profile_id IS NULL
        AND p.deleted_at IS NULL
    `)

    let fixedCount = 0
    if (missingProducts.rowCount > 0) {
      for (const row of missingProducts.rows) {
        await client.query(`
          INSERT INTO product_shipping_profile (id, product_id, shipping_profile_id, created_at, updated_at)
          VALUES (md5(random()::text || clock_timestamp()::text), $1, $2, now(), now())
          ON CONFLICT DO NOTHING
        `, [row.id, profileId])
        fixedCount++
      }
    }

    await client.end()

    return res.json({ 
      success: true, 
      message: `Fixed ${fixedCount} products by assigning them to default shipping profile ${profileId}.` 
    })
  } catch (error) {
    return res.status(500).json({ error: error.message, stack: error.stack })
  }
}
