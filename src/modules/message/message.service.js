import { BadExceptions, NotFoundExceptions } from '../../common/exceptions/index.js';
import * as messageRepository from '../../common/repository/message.repository.js';
import * as userRepository from '../../common/repository/user.repository.js';
import * as requestRepository from '../../common/repository/request.repository.js';
import * as conversationRepository from '../../common/repository/conversation.repositorty.js';

export const createMessage = async ({ content, receiverId } = {}, files = [], user = undefined) => {

    const checkReceiverExist = await userRepository.findById({ id: receiverId })
    if (!checkReceiverExist) throw NotFoundExceptions('User Not Exist')

    const message = await messageRepository.createOne({
        data: {
            receiverId,
            content,
            attachments: files.map((file) => file.path),
            ...(user ? { senderId: user._id } : {})
        }
    })

    return message
}

export const getAllMessages = async ({ type, page, limit } = {}, user) => {

    let filter = {};
    if (type === '0') {
        filter = { senderId: user._id }
    } else if (type === '1') {
        filter = { receiverId: user._id }
    } else {
        filter = {
            $or: [
                { senderId: user._id },
                { receiverId: user._id }
            ],
        }
    }

    const data = await messageRepository.paginate({ filter, page, limit, options: { sort: { createdAt: -1 } } })

    return data
}

export const getMessage = async ({ messageId }, user) => {

    const message = await messageRepository.findOne({
        filter: {
            receiverId: user._id,
            _id: messageId
        }
    })
    if (!message) throw NotFoundExceptions("Invalid Message Id")

    return message
}

export const deleteMessage = async ({ messageId }, user) => {

    const data = await messageRepository.deleteOne({
        filter: {
            receiverId: user._id,
            _id: messageId
        }
    })

    if (!data.deletedCount) throw NotFoundExceptions("Invalid Message Id")

    return data
}

export const requestSenderIdentity = async ({ messageId }, user) => {

    const message = await messageRepository.findOne({
        filter: { _id: messageId, receiverId: user._id }
    })
    if (!message) throw NotFoundExceptions("Message not found")

    const existingRequest = await requestRepository.findOne({
        filter: { messageId, receiverId: user._id }
    })
    if (existingRequest) throw BadExceptions("Identity request already sent")

    const request = await requestRepository.createOne({
        data: {
            messageId,
            receiverId: user._id,
            senderId: message.senderId,
            status: 'pending'
        }
    })

    return request
}

export const getMyRequests = async (user, { page, limit } = {}) => {
    const data = await requestRepository.paginate({
        filter: { senderId: user._id },
        page,
        limit,
        options: { sort: { createdAt: -1 }, populate: [{ path: 'messageId' }, { path: 'receiverId' }] }
    })
    return data
}

export const handleRequestIdentity = async ({ requestId }, { status }, user) => {

    const request = await requestRepository.findOne({
        filter: { _id: requestId, senderId: user._id, status: 'pending' }
    })
    if (!request) throw NotFoundExceptions("Request not found or already processed")

    request.status = status;
    await request.save();

    let conversation = null;
    if (status === 'accepted') {
        conversation = await conversationRepository.createOne({
            data: {
                participants: [request.senderId, request.receiverId],
                messageId: request.messageId
            }
        })
    }

    return { request, conversation }
}

export const sendConversationMessage = async ({ conversationId }, { content }, files = [], user) => {
    const conversation = await conversationRepository.findOne({
        filter: { _id: conversationId, participants: user._id }
    })
    if (!conversation) throw UnauthorizedException("Conversation not found or access denied")

    const receiverId = conversation.participants.find(
        (id) => id.toString() !== user._id.toString()
    )
    if (!receiverId) {
        throw BadExceptions("Receiver not found in this conversation")
    }

    const chatMessage = await messageRepository.createOne({
        data: {
            senderId: user._id,
            receiverId,
            content,
            attachments: files?.map((file) => file.path) || [],
            conversationId
        }
    })

    return chatMessage
}

export const getConversationMessages = async ({ conversationId }, { page = 1, limit = 10 } = {}, user) => {
    const conversation = await conversationRepository.findOne({
        filter: { _id: conversationId, participants: user._id }
    })
    if (!conversation) throw UnauthorizedException("Conversation not found or access denied")

    const messages = await messageRepository.paginate({
        filter: { conversationId },
        page,
        limit,
        options: { sort: { createdAt: 1 } }
    })

    return messages
}