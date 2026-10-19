import * as zod from 'zod'
import { GeneralValidationFields } from '../../common/validation.js'

export const createMessage = (lang) => {
    return zod.object({
        body: zod.strictObject({
            receiverId: GeneralValidationFields.id(lang),
            content: zod.string().min(2).max(50000).optional(),
        }),
        files: zod.array(
            GeneralValidationFields.file(lang)
        ).max(2).optional()
    }).superRefine((data, ctx) => {

        if (!data.body.content && !data.files.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'Missing Message Content'
            })
        }
    })
}

export const allMessages = (lang) => {
    return zod.object({
        query: zod.strictObject({
            type: zod.enum(['0', '1']).optional(),
            page: zod.coerce.number().default(1),
            limit: zod.coerce.number().default(5)
        })
    })
}

export const deleteMessage = (lang) => {
    return zod.object({
        params: zod.strictObject({
            messageId: GeneralValidationFields.id(lang)
        })
    })
}

export const updateRequestStatus = (lang) => {
    return zod.object({
        params: zod.strictObject({
            requestId: GeneralValidationFields.id(lang)
        }),
        body: zod.strictObject({
            status: zod.enum(['accepted', 'rejected'])
        })
    })
}

export const sendConversationMessage = (lang) => {
    return zod.object({
        body: zod.strictObject({
            content: zod.string().min(2).max(50000).optional(),
        }),
        files: zod.array(
            GeneralValidationFields.file(lang)
        ).max(2).optional(),
        params: zod.strictObject({
            conversationId: GeneralValidationFields.id(lang)
        }),
    }).superRefine((data, ctx) => {

        if (!data.body.content && !data.files.length) {
            ctx.addIssue({
                code: 'custom',
                path: ['content'],
                message: 'Missing Message Content'
            })
        }
    })
}

export const conversationAllMessages = (lang) => {
    return zod.object({
        params: zod.strictObject({
            conversationId: GeneralValidationFields.id(lang)
        })
    })
}
