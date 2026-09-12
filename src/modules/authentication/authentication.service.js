
import { ConflictExceptions, NotFoundExceptions } from "../../common/exceptions/index.js"
import { create, createOne, findOne } from "../../common/repository/index.js"
import { UserModel } from "../../DB/model/index.js"

export const signup = async ({ email, password, userName, DOB, gender }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email },
        options: {}
    })
    if (account) throw ConflictExceptions('Email Already Exist')
    const user = await createOne({
        model: UserModel,
        data: { email, password, userName, DOB, gender }
    })
    return user
}

export const signin = async ({ email, password }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, password },
        options: {},
        select: '-password'
    })
    if (!account) throw NotFoundExceptions('Invalid Email Or Password')
    return account
}