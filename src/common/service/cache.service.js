import { client } from "../../DB/redis.connection.js"

export const Set = async ({ key, value, ttl = undefined } = {}) => {
    if (typeof value == 'object') {
        value = JSON.stringify(value)
    }
    return client.set(key, value, { EX: ttl })
}

export const Get = async ({ key } = {}) => {
    let value = client.get(key)
    try {
        return value = JSON.parse(value)
    } catch (error) {
        return value
    }
}

export const MGet = async ({ key1, key2 } = {}) => {
    return client.mGet([key1, key2])
}

export const Exist = async ({ key } = {}) => {
    return client.exists(key)
}

export const Update = async ({ key, value, ttl = undefined } = {}) => {
    if (!await Exist({ key })) {
        return 0
    }
    return client.set(key, value, { EX: ttl })
}

export const Del = async ({ key } = {}) => {
    return client.del(key)
}

export const Keys = async ({ prefix } = {}) => {
    return client.keys(`${prefix}*`)
}

export const Ttl = async ({ key } = {}) => {
    return client.ttl(key)
}

export const Expire = async ({ key, ttl } = {}) => {
    return client.expire(key, ttl)
}

export const Incr = async ({ key } = {}) => {
    return client.incr(key)
}

export const IncrBy = async ({ key, incrby } = {}) => {
    return client.incr(key, incrby)
}

export const Decr = async ({ key } = {}) => {
    return client.decr(key)
}