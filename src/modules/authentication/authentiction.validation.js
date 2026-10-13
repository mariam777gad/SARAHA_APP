import * as zod from 'zod'
import { GeneralValidationFields } from '../../common/validation.js'

export const loginSchema = (lang) => {
    return zod.strictObject({
        email: GeneralValidationFields.email(lang),
        password: GeneralValidationFields.password(lang)
    })
}
export const login = (lang) => {
    return zod.object({
        body: loginSchema(lang),
        //query: zod.strictObject({ language: zod.enum(['ar', 'en']).default('en'), })
    })
}

export const signUpSchema = (lang) => {
    return zod.object({
        body: loginSchema(lang).safeExtend({
            userName: GeneralValidationFields.userName(lang),
            phone: GeneralValidationFields.phone,
            confirmPassword: GeneralValidationFields.confirmPassword(lang),
            gender: GeneralValidationFields.gender,
            role: GeneralValidationFields.role,
            provider: GeneralValidationFields.provider,
            DOB: GeneralValidationFields.DOB,
            isTwoFactorEnabled:GeneralValidationFields.isTwoFactorEnabled
        }).superRefine((data, ctx, lang) => {
            GeneralValidationFields.matchedFields({ original: 'password', copy: 'confirmPassword', data, ctx, lang })

            if (!data.userName?.includes(" ")) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['userName'],
                    message: 'UserName must contain spaces'
                });
            }
        })
    })
}

export const confirmEmail = (lang) => {
    return zod.object({
        body: zod.strictObject({
            email: GeneralValidationFields.email(lang),
            otp: GeneralValidationFields.otp(lang)
        })
    })
}

export const reSendConfirmEmail = (lang) => {
    return zod.object({
        body: zod.strictObject({
            email: GeneralValidationFields.email(lang),
        })
    })
}

export const reSetForgetPassword = (lang) => {
    return zod.object({
        body: zod.strictObject({
            email: GeneralValidationFields.email(lang),
            otp: GeneralValidationFields.otp(lang),
            password: GeneralValidationFields.password(lang),
            confirmPassword: GeneralValidationFields.confirmPassword(lang),
        }).superRefine((data, ctx, lang) => {
            GeneralValidationFields.matchedFields({ original: 'password', copy: 'confirmPassword', data, ctx, lang })
        })
    })
}

