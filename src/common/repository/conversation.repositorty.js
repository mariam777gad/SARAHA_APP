import { ConversationModel } from '../../DB/model/index.js'
import * as base from './db.repository.js'

export const create = async ({ data = [], options = {} } = {}) => {
    return await base.create({
        model: ConversationModel,
        data,
        options
    })
}

export const createOne = async ({ data, options = {} } = {}) => {
    return await base.createOne({
        model: ConversationModel,
        data,
        options
    })
}

export const find = async ({ filter = {}, options = {} } = {}) => {
    return await base.find({
        model: ConversationModel,
        filter,
        options,
    })
}

export const findOne = async ({ filter = {}, options = {} } = {}) => {
    return await base.findOne({
        model: ConversationModel,
        filter,
        options
    })
}

export const findById = async ({ id = {}, options = {} } = {}) => {
    return await base.findById({
        model: ConversationModel,
        id,
        options,
    })
}

export const deleteOne = async ({ filter = {} } = {}) => {
    return await base.deleteOne({ model: ConversationModel, filter })
}

export const deleteMany = async ({ filter = {} } = {}) => {
    return await base.deleteMany({ model: ConversationModel, filter })
}

export const findOneAndDelete = async ({ filter = {} } = {}) => {
    return await base.findOneAndDelete({ model: ConversationModel, filter })
}

export const updateOne = async ({ filter = {}, update = {}, options = {} } = {}) => {
    return await base.updateOne({ model: ConversationModel, filter, update, options })
}

export const findOneAndUpdate = async ({ filter = {}, update = {}, options = {} } = {}) => {
    return await base.findOneAndUpdate({
        model: ConversationModel,
        filter,
        update,
        options,
    })
}

export const findByIdAndUpdate = async ({ id = {}, update = {}, options = {} } = {}) => {
    return await base.findByIdAndUpdate({
        model: ConversationModel,
        id,
        update,
        options,
    })
}

export const insertMany = async ({ data = [], options = {} } = {}) => {
    return await base.insertMany({ model: ConversationModel, data, options })
}

export const countDocument = async ({ filter = {} } = {}) => {
    return await base.countDocument({ model: ConversationModel, filter })
}

export const paginate = async ({ filter = {}, options = {}, page = 1, limit = 5 } = {}) => {
    return await base.paginate({
        model: ConversationModel,
        filter,
        options,
        page,
        limit
    })
}