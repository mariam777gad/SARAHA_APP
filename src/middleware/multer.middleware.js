import { BadExceptions } from "../common/exceptions/error.exceptions.js"
import { processMulterUpload } from "../common/utils/index.js"

export const uploadMiddleware = ({ isRequired = true, multerMiddelware, customPath = 'general', validation = [] }) => {

    return (req, res, next) => {
        multerMiddelware(req, res, async (error) => {
            if (error) {
                next(new Error(error.message, { cause: { status: 400 } }))
                return
            }

            try {
                if (isRequired &&
                    (!req.file) &&
                    !(Array.isArray(req.files) && req.files.length) &&
                    !(typeof req.files == 'object' && Object.keys(req.files).length)) {
                    next(BadExceptions('File is required'))
                    return;
                }

                await processMulterUpload({ customPath, validation, req })
                next()
            } catch (error) {
                next(new Error(error.message, { cause: { status: 400 } }))
            }
        })
    }
}
