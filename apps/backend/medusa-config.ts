import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: process.env.DATABASE_SSL === "true" ? {
      ssl: { rejectUnauthorized: false },
      connection: { ssl: { rejectUnauthorized: false } }
    } : {},
    sessionOptions: {
      name: "medusa.sid",
      secret: process.env.COOKIE_SECRET || "supersecret",
      resave: false,
      saveUninitialized: false,
    },
    cookieOptions: {
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
    http: {
      storeCors: process.env.STORE_CORS! + (process.env.COOLIFY_URL ? `,${process.env.COOLIFY_URL},http://cizgibutik.com,https://cizgibutik.com,http://www.cizgibutik.com,https://www.cizgibutik.com` : ""),
      adminCors: process.env.ADMIN_CORS! + (process.env.COOLIFY_URL ? `,${process.env.COOLIFY_URL},http://cizgibutik.com,https://cizgibutik.com,http://www.cizgibutik.com,https://www.cizgibutik.com` : ""),
      authCors: process.env.AUTH_CORS! + (process.env.COOLIFY_URL ? `,${process.env.COOLIFY_URL},http://cizgibutik.com,https://cizgibutik.com,http://www.cizgibutik.com,https://www.cizgibutik.com` : ""),
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    path: "/app",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "https://api.cizgibutik.com",
  },
  modules: {
    [Modules.PAYMENT]: {
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/custom-payment",
            id: "custom-payment",
            options: {},
          },
          {
            resolve: "./src/modules/payment-integrations/providers/paytr",
            id: "paytr",
            options: {},
          },
          {
            resolve: "./src/modules/payment-integrations/providers/cod",
            id: "cod",
            options: {},
          },
          {
            resolve: "./src/modules/payment-integrations/providers/bank-transfer",
            id: "bank-transfer",
            options: {},
          }
        ],
      },
    },
    multiPaymentModuleService: {
      resolve: "./src/modules/payment-integrations"
    },
    ...(process.env.REDIS_URL ? {
      [Modules.EVENT_BUS]: {
        resolve: "@medusajs/event-bus-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
        },
      },
      [Modules.CACHE]: {
        resolve: "@medusajs/cache-redis",
        options: {
          redisUrl: process.env.REDIS_URL,
        },
      },
      [Modules.WORKFLOW_ENGINE]: {
        resolve: "@medusajs/workflow-engine-redis",
        options: {
          redis: {
            url: process.env.REDIS_URL,
          },
        },
      },
    } : {}),
    xml_import: {
      resolve: "./src/modules/xml_import",
    },
    [Modules.FILE]: {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "uploads",
              backend_url: process.env.MEDUSA_BACKEND_URL || (process.env.COOLIFY_URL ? "https://api.cizgibutik.com/uploads" : "http://localhost:9001/uploads"),
            },
          },
        ],
      },
    },
  }
})
