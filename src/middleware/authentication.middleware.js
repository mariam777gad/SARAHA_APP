import { TokenTypeEnum } from "../common/enum/index.js"
import { ForbiddenExceptions, UnauthorizedExceptions } from "../common/exceptions/index.js"
import { BasicAuth, decodeToken } from "../common/security/index.js"

export const authentication = (tokenType = TokenTypeEnum.ACCESS) => {
    return async (req, res, next) => {

        const { authorization } = req.headers
        if (!authorization) throw UnauthorizedExceptions('Unauthorized account')

        //Bearer & Basic  token validation 
        const [key, credential] = authorization?.split(' ') || []

        switch (key) {
            case "Bearer":
                const { user, payload } = await decodeToken({ authorization: credential, tokenType })
                req.user = user
                req.payload = payload
                break;
            case "Basic":
                const [email, password] = Buffer.from(credential, 'base64').toString().split(':')
                req.user = await BasicAuth({ email, password })
                break;
            default:
                next(new Error('Invalid authentication schema ', { cause: { status: 400 } }))
                break;
        }
        next()
    }
}

export const autharization = (accessRole) => {
    return async (req, res, next) => {
        if (req.user.role < accessRole) throw ForbiddenExceptions('Forbidden account')
        next()
    }
}
