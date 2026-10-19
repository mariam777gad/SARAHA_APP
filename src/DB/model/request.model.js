import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
    messageId: { 
        type: mongoose.Types.ObjectId, 
        ref: 'Message', 
        required: true 
    },
    receiverId: { 
        type: mongoose.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    senderId: { 
        type: mongoose.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    collection: 'SARAHA_APP_REQUESTS',
    timestamps: true,
    autoIndex: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    validateBeforeSave: true,
})

export const RequestModel = mongoose.models.Request || mongoose.model('Request', RequestSchema)