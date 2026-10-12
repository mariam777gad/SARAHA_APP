import multer from "multer";
import { randomUUID } from 'node:crypto'
import { resolve } from "node:path";
import { mkdir, writeFile } from 'node:fs/promises'
import { fileTypeFromBuffer } from 'file-type'
import { BadExceptions } from "../../exceptions/error.exceptions.js";

export const fileValidation = {
    image: ['image/png', 'image/jpeg', 'image/gif'],
    files: ['application/pdf', 'application/json']
}

export const loclFileUpload = ({ maxFileSize = 5, validation = [] } = {}) => {
    const storage = multer.memoryStorage()
    return multer({ storage, limits: { fileSize: maxFileSize * 1024 * 1024 } })
}

export const processFile = async ({ customPath = 'general', file, validation = [] }) => {

    const result = await fileTypeFromBuffer(file.buffer)

    if (!result || !validation.includes(result.mime)) {
        throw BadExceptions("Invalid File Formate")
    } else {
        await mkdir(resolve(`./assets/${customPath}`), { recursive: true })
        const uniqueFilePath = `assets/${customPath}/${randomUUID()}.${result.ext}`
        await writeFile(resolve(`./${uniqueFilePath}`), file.buffer)
        file.finalPath = uniqueFilePath
        return file
    }
}

export const processFiles = async ({ customPath, files = [], validation = [] }) => {
    const assets = []
    for (const file of files) {
        const uploadedFile = await processFile({ customPath, file, validation })
        assets.push(uploadedFile)
    }
    return assets
}

export const processFilelds = async ({ customPath, fields = {}, validation = [] }) => {
    const assets = []
    for (const field of Object.keys(fields)) {
        const files = await processFiles({ customPath, files: fields[field], validation })
        assets.push(field, files)
    }
    return assets
}

export const processMulterUpload = async ({ req, customPath = 'general', validation = [] }) => {


    if (req.file) {
        await processFile({ customPath, file: req.file, validation })
    } else if (Array.isArray(req.files)) {
        await processFiles({ customPath, files: req.files, validation })
    } else if (typeof req.files === 'object' && Object.keys(req.files).length) {
        await processFilelds({ customPath, fields: req.files, validation })
    }

}

