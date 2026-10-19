import { Router } from 'express'
import { createMessage, deleteMessage, getAllMessages, getConversationMessages, getMessage, getMyRequests, handleRequestIdentity, requestSenderIdentity, sendConversationMessage } from './message.service.js';
import { fileValidation, loclFileUpload, successResponse } from '../../common/utils/index.js';
import * as validator from './message.validation.js'
import { authentication, BeareAuth, uploadMiddleware, validation } from '../../middleware/index.js';

const router = Router({ caseSensitive: true, strict: true })

router.post('/',
    async (req, res, next) => {
        if (req.headers['authorization']) {
            await BeareAuth({ req })
        }
        next()
    },
    uploadMiddleware({
        multerMiddelware: loclFileUpload({}).any('attachments', 2),
        validation: fileValidation.image,
        customPath: 'messages',
        isRequired: false
    }),
    validation(validator.createMessage),
    async (req, res, next) => {
        const result = await createMessage(req.body, req.files, req.user)
        return successResponse({ res, status: 201, data: result })
    }
)

router.get('/',
    authentication(),
    validation(validator.allMessages),
    async (req, res, next) => {
        const result = await getAllMessages(req.validation.query, req.user)
        return successResponse({ res, status: 200, data: result })
    }
)

router.get('/:messageId',
    authentication(),
    validation(validator.deleteMessage),
    async (req, res, next) => {
        const result = await getMessage(req.validation.params, req.user)
        return successResponse({ res, status: 200, data: result })
    }
)

router.delete('/:messageId',
    authentication(),
    validation(validator.deleteMessage),
    async (req, res, next) => {
        const result = await deleteMessage(req.validation.params, req.user)
        return successResponse({ res, status: 200, data: result })
    }
)

router.post('/:messageId/request-identity',
    authentication(),
    validation(validator.deleteMessage),
    async (req, res, next) => {
        const result = await requestSenderIdentity(req.validation.params, req.user)
        return successResponse({ res, status: 201, data: result })
    }
)

router.get('/requests/my-requests',
    authentication(),
    async (req, res, next) => {
        const result = await getMyRequests(req.user, req.validation?.query)
        return successResponse({ res, status: 200, data: result })
    }
)

router.patch('/requests/:requestId',
    authentication(),
    validation(validator.updateRequestStatus),
    async (req, res, next) => {
        const result = await handleRequestIdentity(req.validation.params, req.validation.body, req.user)
        return successResponse({ res, status: 200, data: result })
    }
)

router.post('/conversations/:conversationId/messages',
    authentication(),
    uploadMiddleware({
        multerMiddelware: loclFileUpload({}).any('attachments', 2),
        validation: fileValidation.image,
        customPath: 'conversations',
        isRequired: false
    }),
    validation(validator.sendConversationMessage),
    async (req, res, next) => {
        const result = await sendConversationMessage(req.validation.params, req.body, req.files, req.user)
        return successResponse({ res, status: 201, data: result })
    }
)

router.get('/conversations/:conversationId/messages',
    authentication(),
    validation(validator.conversationAllMessages),
    async (req, res, next) => {
        const result = await getConversationMessages(req.validation.params, req.validation.query, req.user)
        return successResponse({ res, status: 200, data: result })
    }
)

export default router