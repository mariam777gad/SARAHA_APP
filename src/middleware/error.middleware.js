import { NODE_ENV } from "../config.js"

export const globalErrorHandler = (error, req, res, next) => {
    return res.status(error.cause?.status ?? 500).json({
        error_message: error.message || "Server Error",
        cause: error.cause,
        error: error,
        stack: NODE_ENV === "production" ? undefined : error.stack,

    })
}


