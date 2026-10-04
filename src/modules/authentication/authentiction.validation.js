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
        }).superRefine((data, ctx ,lang) => {
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