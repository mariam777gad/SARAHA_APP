export const create = async ({ model, data = [], options = {} } = {}) => {
    return await model.create(data, options)
}

export const createOne = async ({ model, data, options = {} } = {}) => {
    const doc = await model.create([data], options)
    return doc
}

export const find = async ({ model, filter = {}, options = {} } = {}) => {
    const doc = model.find(filter)
    if (options.select) { doc.select(options.select) }
    if (options.populate) { doc.populate(options.populate) }
    if (options.skip) { doc.skip(options.skip) }
    if (options.sort) { doc.sort(options.sort) }
    if (options.limit) { doc.limit(options.limit) }
    if (options.lean) { doc.lean(options.lean) }
    return await doc.exec()
}

export const findOne = async ({ model, filter = {}, options = {} } = {}) => {
    const doc = model.findOne(filter, options)
    if (options.populate) { doc.populate(options.populate) }
    if (options.select) { doc.select(options.select) }
    if (options.lean) { doc.lean(options.lean) }
    return await doc.exec()
}

export const findById = async ({ model, id = {}, options = {} } = {}) => {
    const doc = model.findById(id, options)
    if (options.populate) { doc.populate(options.populate) }
    if (options.select) { doc.select(options.select) }
    if (options.lean) { doc.lean(options.lean) }
    return await doc.exec()
}

export const deleteOne = async ({ model, filter = {} } = {}) => {
    return await model.deleteOne(filter || {})
}

export const deleteMany = async ({ model, filter = {} } = {}) => {
    return await model.deleteMany(filter || {})
}

export const findOneAndDelete = async ({ model, filter = {} } = {}) => {
    return await model.findOneAndDelete(filter || {})
}

export const updateOne = async ({ model, filter = {}, update = {}, options = {} } = {}) => {
    return await model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options)
}

export const findOneAndUpdate = async ({ model, filter = {}, update = {}, options = {} } = {}) => {
    return await model.findOneAndUpdate(
        filter,
        { ...update, $inc: { __v: 1 } },
        { ...options, returnDocument: 'after', runValidators: true }
    )
}

export const findByIdAndUpdate = async ({ model, id = {}, update = {}, options = {} } = {}) => {
    return await model.findByIdAndUpdate(
        id,
        { ...update, $inc: { __v: 1 } },
        { ...options, returnDocument: 'after', runValidators: true }
    )
}

export const insertMany = async ({ model, data = [], options = {} } = {}) => {
    return await model.insertMany(data, options)
}

export const countDocument = async ({ model, filter = {} } = {}) => {
    return await model.countDocuments(filter)
}

export const paginate = async ({ model, filter = {}, options = {}, page = 1, limit = 5 } = {}) => {
    const skip = (page - 1) * limit
    const count = await countDocument({ model, filter })
    const pages = Math.ceil(count / limit)

    const docs = await find({
        model,
        filter,
        options: {
            ...options,
            skip,
            limit
        }
    })

    return { count, limit, page, pages, docs }
}