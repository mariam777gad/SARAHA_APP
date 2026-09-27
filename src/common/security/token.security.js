import jwt from 'jsonwebtoken'
import { BadExceptions, NotFoundExceptions } from '../exceptions/index.js'
import { findById, findOne } from '../repository/index.js'
import { UserModel } from '../../DB/model/user.model.js'
import { RoleEnum, TokenTypeEnum } from '../enum/index.js'
import { ACCESS_USER_TOKEN_SEGNATURE, REFRESH_USER_TOKEN_SEGNATURE, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, ACCESS_ADMIN_TOKEN_SEGNATURE, REFRESH_ADMIN_TOKEN_SEGNATURE } from '../../config.js'
import { compare ,decryption } from './index.js'

export const generateToken = async ({
    payload = {},
    secret = ACCESS_USER_TOKEN_SEGNATURE,
    options = {}
} = {}) => {
    const token = await jwt.sign(payload, secret, options)
    return token
}

export const verifyToken = async ({
    token = "",
    secret = ACCESS_USER_TOKEN_SEGNATURE
} = {}) => {
    const payload = await jwt.verify(token, secret)
    return payload
}

export const getSignature = async ({
    tokenType = TokenTypeEnum.ACCESS,
    role = RoleEnum.USER } = {}) => {
    const signature = await getTokenSignature({ role })
    return tokenType === TokenTypeEnum.ACCESS ? signature.accessSignature : signature.refreshSignature
}

export const getTokenSignature = async ({ role = RoleEnum.USER } = {}) => {
    let signature;
    switch (role) {
        case RoleEnum.ADMIN:
            signature = { accessSignature: ACCESS_ADMIN_TOKEN_SEGNATURE, refreshSignature: REFRESH_ADMIN_TOKEN_SEGNATURE }
            break;
        default:
            signature = { accessSignature: ACCESS_USER_TOKEN_SEGNATURE, refreshSignature: REFRESH_USER_TOKEN_SEGNATURE }
            break;
    }
    return signature
}

export const decodeToken = async ({
    authorization = '',
    tokenType = TokenTypeEnum.ACCESS
} = {}) => {

    const decode = jwt.decode(authorization)
    if (!decode?.aud?.length) throw BadExceptions('Invalid token payload')

    const payload = await verifyToken({
        token: authorization,
        secret: await getSignature({ tokenType, role: decode?.aud[0] })
    })
    if (!payload?.sub) throw BadExceptions('Invalid token payload')

    const user = await findById({
        id: payload.sub,
        model: UserModel
    })
    if (!user) throw NotFoundExceptions('Invalid token payload')

    return { user, payload }
}

export const createTokenCredentials = async ({
    user,
    issuer,
    options = {},
} = {}) => {
    const { accessSignature, refreshSignature } = await getTokenSignature({ role: user.role })

    const accessToken = await generateToken({
        payload: { sub: user._id },
        secret: accessSignature,
        options: {
            ...options,
            audience: [user.role],
            issuer,
            expiresIn: ACCESS_TOKEN_EXPIRES_IN
        }
    })

    const refreshToken = await generateToken({
        payload: { sub: user._id },
        secret: refreshSignature,
        options: {
            ...options,
            audience: [user.role],
            issuer,
            expiresIn: REFRESH_TOKEN_EXPIRES_IN
        },

    })

    return { accessToken, refreshToken }
}

export const BasicAuth = async ({ email, password }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email },
        options: {},
    })
    if (!account) throw NotFoundExceptions('Invalid Email Or Password')

    //hash
    const match = await compare(password, account.password)
    if (!match) throw NotFoundExceptions('Invalid Email Or Password')

    //encryption    
    account.phone = await decryption(account.phone)


    return account
}