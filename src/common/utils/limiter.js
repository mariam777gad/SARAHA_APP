import geoip from 'geoip-lite';
import { client } from '../../DB/redis.connection.js';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { successResponse } from './success.response.js';

async function fromWhere(ip) {
    try {
        return geoip.lookup(ip);
    } catch (error) {
        console.log(`Fail to detect req origin : ${error}`);
    }
}

export const generateLimiter = ({
    ttl = 5,
    limit = 5,
    legacyHeaders = true,
    standardHeaders = 'draft-8',
    message = "TOO MANY REQUESTS",
    statusCode = 429,
    skipSuccessfulRequests,
    skipFailedRequests

}) => {
    return rateLimit({
        windowMs: ttl * 60000,
        skipSuccessfulRequests,
        skipFailedRequests,
        handler: function (req, res, next) {
            return successResponse({ res, message, status: statusCode })
        },
        limit: async function (req) {
            const country = await fromWhere(req.ip)
            return country?.country == "EG" ? limit : 0
        },
        keyGenerator: function (req) {
            const ip = ipKeyGenerator(req.ip, 52)
            return `${ip}::${req.path}`
        },
        store: {
            async incr(key, cb) {
                // called by keyGenerator
                try {
                    const count = await client.incr(key);

                    if (count === 1) {
                        await client.expire(key, 60);
                    }

                    cb(null, count);
                } catch (err) {
                    cb(err);
                }
            },
            async decrement(key) {
                // called by skipFailedRequests: true,
                // skipsuccessfulRequests: true
                if (await client.exists(key)) {
                    await client.decr(key);
                }
            }
        },
        legacyHeaders, // Disable the `X-RateLimit-*` headers.
        standardHeaders, // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    })
}

