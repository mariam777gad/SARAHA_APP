import { RequestModel } from '../../DB/model/index.js'
import * as base from './db.repository.js'

export const create = async ({ data = [], options = {} } = {}) => {
    return await base.create({
        model: RequestModel,
        data,
        options
    })
}

export const createOne = async ({ data, options = {} } = {}) => {
    return await base.createOne({
        model: RequestModel,
        data,
        options
    })
}

export const find = async ({ filter = {}, options = {} } = {}) => {
    return await base.find({
        model: RequestModel,
        filter,
        options,
    })
}

export const findOne = async ({ filter = {}, options = {} } = {}) => {
    return await base.findOne({
        model: RequestModel,
        filter,
        options
    })
}

export const findById = async ({ id = {}, options = {} } = {}) => {
    return await base.findById({
        model: RequestModel,
        id,
        options,
    })
}

export const deleteOne = async ({ filter = {} } = {}) => {
    return await base.deleteOne({ model: RequestModel, filter })
}

export const deleteMany = async ({ filter = {} } = {}) => {
    return await base.deleteMany({ model: RequestModel, filter })
}

export const findOneAndDelete = async ({ filter = {} } = {}) => {
    return await base.findOneAndDelete({ model: RequestModel, filter })
}

export const updateOne = async ({ filter = {}, update = {}, options = {} } = {}) => {
    return await base.updateOne({ model: RequestModel, filter, update, options })
}

export const findOneAndUpdate = async ({ filter = {}, update = {}, options = {} } = {}) => {
    return await base.findOneAndUpdate({
        model: RequestModel,
        filter,
        update,
        options,
    })
}

export const findByIdAndUpdate = async ({ id = {}, update = {}, options = {} } = {}) => {
    return await base.findByIdAndUpdate({
        model: RequestModel,
        id,
        update,
        options,
    })
}

export const insertMany = async ({ data = [], options = {} } = {}) => {
    return await base.insertMany({ model: RequestModel, data, options })
}

export const countDocument = async ({ filter = {} } = {}) => {
    return await base.countDocument({ model: RequestModel, filter })
}

export const paginate = async ({ filter = {}, options = {}, page = 1, limit = 5 } = {}) => {
    return await base.paginate({
        model: RequestModel,
        filter,
        options,
        page,
        limit
    })
}