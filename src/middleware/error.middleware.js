// export const globalErrorHandler = (error, req, res, next) => {
//     return res.status(error.cause?.status ?? 500).json({
//         error_message: process.env.NODE_ENV === "development" ? error.message || "Server Error" : undefined,
//         cause: process.env.NODE_ENV === "development" ? error.cause : undefined,
//         error: process.env.NODE_ENV === "development" ? error : undefined,
//         stack: process.env.NODE_ENV === "development" ? error.stack : undefined,

//     })
// }

export const globalErrorHandler = (error, req, res, next) => {
    return res.status(error.cause?.status ?? 500).json({
        error_message: error.message || "Server Error",
         cause: error.cause,
        // issues: error.cause.issues,
        error: error,
        stack: error.stack,

    })
}


