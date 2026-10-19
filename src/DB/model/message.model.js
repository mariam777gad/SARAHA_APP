import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: function () { return this.attachments?.length > 0 ? false : true },
        minLength: 2,
        maxLength: 50000
    },
    attachments: [String],
    senderId: { type: mongoose.Types.ObjectId, ref: 'User' },
    receiverId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: mongoose.Types.ObjectId, ref: 'Conversation' }

}, {
    collection: 'SARAHA_APP_MESSAGES',
    timestamps: true,
    autoIndex: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    validateBeforeSave: true,
})

export const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema)