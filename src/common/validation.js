import * as zod from 'zod'
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from '../common/enum/user.enum.js'

const ValidationMessages = {
    100: {
        ar: 'اسم المستخدم يجب ان يكون أكثر من 2 حرف',
        en: 'UserName must be at least 2 characters long'
    },
    101: {
        ar: 'اسم المستخدم يجب ان يكون أقل من 16 حرف',
        en: 'UserName must be at most 16 characters long'
    },
    102: {
        ar: 'البريد الإلكتروني غير صحيح',
        en: 'Please Enter Valid Email Formate like: example@any.com'
    },
    103: {
        ar: 'كلمة المرور يجب ان تكون على الأقل 8 أحرف، تحتوي على حرف كبير واحد على الأقل، وحرف صغير واحد على الأقل، ورقم واحد على الأقل، وحرف خاص واحد على الأقل',
        en: 'Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character'
    },
}

const getValidationMessage = (code, lang) => {
    return lang === LanguageEnum.AR ? ValidationMessages[code].ar : ValidationMessages[code].en
}

const matchedFields = ({ original, copy, data, ctx, lang }) => {
    if (data[original] !== data[copy]) {
        ctx.addIssue({
            code: 'custom',
            path: [copy],
            message: lang === LanguageEnum.AR ? `${copy} لا يطابق ${original}` : `${copy} does not match ${original}`,
        });
    }
}
export const GeneralValidationFields = {
    email: (lang) => zod.email({ message: getValidationMessage(102, lang) }),
    password: (lang) => zod.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: getValidationMessage(103, lang)
    }),
    userName: (lang) => zod.string().min(2, {
        message: getValidationMessage(100, lang)
    }).max(16, {
        message: getValidationMessage(101, lang)
    }),
    confirmPassword: (lang) => zod.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: getValidationMessage(103, lang)
    }),
    phone: zod.e164(),
    gender: zod.enum(GenderEnum),
    role: zod.enum(RoleEnum),
    provider: zod.enum(ProviderEnum),
    DOB: zod.iso.date(),
    matchedFields
}