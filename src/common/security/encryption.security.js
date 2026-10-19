import crypto from 'node:crypto'
import { ENC_IV, ENC_KEY } from '../../config.js'

export const encryption = async (plainText) => {
    const iv = crypto.randomBytes(ENC_IV)
    const cipherText = crypto.createCipheriv("aes-256-cbc", ENC_KEY, iv)
    let encryptedData = cipherText.update(plainText, "utf-8", 'hex')
    encryptedData += cipherText.final('hex')
    return `${iv.toString('hex')}::${encryptedData}`
}

export const decryption = async (cipherText) => {
    const [iv, encryptedData] = cipherText.split('::')
    const IV = Buffer.from(iv, 'hex')
    const plainText = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV)
    let decryptedData = plainText.update(encryptedData, 'hex', 'utf-8')
    decryptedData += plainText.final('utf-8')
    return decryptedData
}