
import { UserModel } from "../../DB/model/user.model.js"
import { ConflictExceptions } from "../../common/exceptions/index.js"
import { findByIdAndUpdate } from "../../common/repository/index.js"
import { createTokenCredentials } from "../../common/security/index.js"
import { toObjectId } from "../../common/utils/index.js"
import { ACCESS_TOKEN_EXPIRES_IN } from "../../config.js"

export const profile = async (account) => {
    return account
}

export const updateUserInfo = async (account, inputs) => {
    const user = await findByIdAndUpdate({
        model: UserModel,
        id: { _id: toObjectId(account._id) },
        update: inputs,
    })
    if (!user) throw new Error('User Not Found')
    return user
}

export const routateToken = async (payload ,user ,issuer) => {
    const AccessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const CurrentTime = Date.now() + (30 * 60000)
    if (CurrentTime < AccessExpiresIn) throw ConflictExceptions('WE can not create new access credential while the current access token is still in valid duration')
    return await createTokenCredentials({ user, issuer })
}
