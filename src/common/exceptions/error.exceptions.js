export const ApplicationExceptions = (
    { message = 'Error',
        options = {
            cause: { status: 400 }
        } }) => {
    throw new Error(message, options)
}

export const ConflictExceptions = (
    message = 'conflict',
    issues = {}
) => {
    return ApplicationExceptions({ message, options: { cause: { status: 409, issues } } })
}

export const NotFoundExceptions = (
    message = 'Not Found',
    issues = {}
) => {
    return ApplicationExceptions({ message, options: { cause: { status: 404, issues } } })
}

export const UnauthorizedExceptions = (
    message = 'Unauthorized',
    issues = {}
) => {
    return ApplicationExceptions({ message, options: { cause: { status: 401, issues } } })
}

export const forbiddenExceptions = (
    message = 'Forbidden',
    issues = {}
) => {
    return ApplicationExceptions({ message, options: { cause: { status: 403, issues } } })
}