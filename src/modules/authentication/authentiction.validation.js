import * as zod from 'zod'

export const loginSchema = zod.object({
    email: zod.email(),
    password: zod.string()
})


export const signUpSchema = loginSchema.extend({
    userName: zod.string(),
    phone: zod.e164(),
    confirmPassword: zod.string()
}).refine(({ password, confirmPassword }) => {
    return password === confirmPassword
}, { message: "Password & ConfirmPassword Not Match" })