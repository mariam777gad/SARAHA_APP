import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/index.js";

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLingth: [2, `FirstName must be more than 2 char`],
        mixLingth: [25, `LastName must be less than 25 char `]
    },
    lastName: {
        type: String,
        required: true,
        minLingth: [2, `FirstName must be more than 2 char`],
        mixLingth: [25, `LastName must be less than 25 char `]
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: Number,
        enum: Object.values(GenderEnum),
        default: GenderEnum.MALE
    },
    password: {
        type: String,
        require: () => {
            return this.provider === ProviderEnum.SYSTEM
        }
    },
    DOB: Date,
    confirmEmail: Date,
    confirmPassword: Date,
    phone: String,
    image: String,
    changeCredentialTime:Date,
    role: {
        type: Number,
        enum: Object.values(RoleEnum),
        default: RoleEnum.USER
    },
    provider: {
        type: Number,
        enum: Object.values(ProviderEnum),
        default: ProviderEnum.SYSTEM
    }
}, {
    collection: 'SARAHA_APP_USERS',
    timestamps: true,
    autoIndex: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    validateBeforeSave: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

UserSchema.virtual('userName').set(function (value) {
    const [firstName, lastName] = value?.split(' ')
    this.set({ firstName, lastName })
}).get(function () {
    return `${this.firstName} ${this.lastName}`
})


export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema)