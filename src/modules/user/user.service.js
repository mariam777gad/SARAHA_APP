import mongoose from "mongoose"
import { UserModel } from "../../DB/model/user.model.js"
import { findById, findOneAndUpdate } from "../../common/repository/index.js"
import { toObjectId } from "../../common/utils/index.js"

export const getUserById = async ({ userId }) => {
    const user = await findById({
        model: UserModel,
        id: { _id: toObjectId(userId) }
    })
    if (!user) throw new Error('User Not Found')
    return user
}

export const updateUserInfo = async ({ userId }, inputs) => {
    const user = await findOneAndUpdate({
        model: UserModel,
        filter: { _id: toObjectId(userId) },
        update: { gender: inputs.gender }
    })
    if (!user) throw new Error('User Not Found')
    return user
}
