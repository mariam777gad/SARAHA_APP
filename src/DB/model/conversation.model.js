import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    participants: [{ 
        type: mongoose.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }],
    messageId: { 
        type: mongoose.Types.ObjectId, 
        ref: 'Message', 
        required: true 
    }
}, {
    collection: 'SARAHA_APP_CONVERSATIONS',
    timestamps: true,
    autoIndex: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    validateBeforeSave: true,
})

export const ConversationModel = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema)