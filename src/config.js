import { config } from 'dotenv'
import { resolve } from 'node:path'

config({ path: resolve(`.env.${process.env.NODE_ENV ?? "development"}`) })


export const PORT = parseInt(process.env.PORT ?? 9000)
export const DB_URI = process.env.DB_URI
export const DB_URI_LOCAL = process.env.DB_URI_LOCAL
export const REDIS_URI = process.env.REDIS_URI

export const ENC_IV = parseInt(process.env.ENC_IV) ?? 16
export const ENC_KEY = process.env.ENC_KEY

export const ACCESS_ADMIN_TOKEN_SEGNATURE = process.env.ACCESS_ADMIN_TOKEN_SEGNATURE
export const ACCESS_USER_TOKEN_SEGNATURE = process.env.ACCESS_USER_TOKEN_SEGNATURE
export const ACCESS_TOKEN_EXPIRES_IN = parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN) ?? 1800

export const REFRESH_ADMIN_TOKEN_SEGNATURE = process.env.REFRESH_ADMIN_TOKEN_SEGNATURE
export const REFRESH_USER_TOKEN_SEGNATURE = process.env.REFRESH_USER_TOKEN_SEGNATURE
export const REFRESH_TOKEN_EXPIRES_IN = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) ?? 31536000

export const WEB_CLIENT_IDS = process.env.WEB_CLIENT_IDS