import { BadExceptions } from "../common/exceptions/error.exceptions.js"

export const validation = (schema) => {
    return (req, res, next) => {
        const validationResult = schema.safeParse(req.body)
        if (!validationResult.success) { throw BadExceptions('validation Error', validationResult.error.issues) }
        req.validation = validationResult.data
        next()
    }
}