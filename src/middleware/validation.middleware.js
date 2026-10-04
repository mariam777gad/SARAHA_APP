import { LanguageEnum } from "../common/enum/user.enum.js"
import { BadExceptions } from "../common/exceptions/error.exceptions.js"

export const validation = (schema) => {
    return (req, res, next) => {
        const lang=Number(req.headers['accept-language'] ?? LanguageEnum.EN)
        const validationResult = schema(lang).safeParse({
            body: req.body,
            query: req.query,
            params: req.params,
        })
        if (!validationResult.success) { throw BadExceptions('validation Error', validationResult.error.issues) }
        req.validation = validationResult.data
        next()
    }
}