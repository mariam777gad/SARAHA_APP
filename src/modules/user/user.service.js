import { UserModel } from "../../DB/model/user.model.js"
import { LogOutEnum } from "../../common/enum/security.enum.js"
import { ConflictExceptions } from "../../common/exceptions/index.js"
import { findByIdAndUpdate } from "../../common/repository/index.js"
import { createRevokedToken, createTokenCredentials, userBaseRevokedTokenId } from "../../common/security/index.js"
import { Del, Keys } from "../../common/service/index.js"
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

export const routateToken = async (payload, user, issuer) => {
    const AccessExpiresIn = (payload.iat + ACCESS_TOKEN_EXPIRES_IN) * 1000
    const CurrentTime = Date.now() + (30 * 60000)
    if (CurrentTime < AccessExpiresIn) throw ConflictExceptions('WE can not create new access credential while the current access token is still in valid duration')
    const data = await createTokenCredentials({ user, issuer })
    await createRevokedToken({ payload })
    return data
}

export const logOut = async (payload, user, { action = LogOutEnum.DEVICE }) => {
    switch (action) {
        case LogOutEnum.ALL:
            user.changeCredentialTime = new Date()
            await user.save()
            await Del({ key: await Keys({ prefix: userBaseRevokedTokenId({ userId: payload.sub }) }) })
            break;
        default:
            await createRevokedToken({ payload })
            break;
    }
    return
}
