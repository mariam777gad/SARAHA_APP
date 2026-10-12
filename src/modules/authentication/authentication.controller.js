import { Router } from "express";
import { signup, signin, signUpWithGmail, confirmEmail, reSendConfirmEmail, requestForgetPassword, verifyForgetPassword, reSetForgetPassword } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";
import * as validator from './authentiction.validation.js'
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/signup", validation(validator.signUpSchema), async (req, res) => {
        const result = await signup(req.validation.body)
        return successResponse({ res, message: 'User Account Created Successfully', data: result, status: 201 })
})

router.patch("/confirm_email", validation(validator.confirmEmail), async (req, res) => {
        const result = await confirmEmail(req.body)
        return successResponse({ res, message: 'User Email Confirmed Successfully', data: result, status: 200 })
})

router.patch("/resend-confirm_email", validation(validator.reSendConfirmEmail), async (req, res) => {
        const result = await reSendConfirmEmail(req.body)
        return successResponse({ res, message: 'Confirmation Email Resent Successfully', data: result, status: 200 })
})

router.post("/request-forget-password", validation(validator.reSendConfirmEmail), async (req, res) => {
        const result = await requestForgetPassword(req.body)
        return successResponse({ res, message: 'Forget Password Request Submitted Successfully', data: result, status: 201 })
})

router.post("/verify-forget-password", validation(validator.confirmEmail), async (req, res) => {
        const result = await verifyForgetPassword(req.body)
        return successResponse({ res, message: 'Forget Password Verified Successfully', data: result, status: 200 })
})

router.patch("/reset-forget-password", validation(validator.reSetForgetPassword), async (req, res) => {
        const result = await reSetForgetPassword(req.body)
        return successResponse({ res, message: 'Forget Password Verified Successfully', data: result, status: 200 })
})

router.post("/loginWithGmail", async (req, res) => {
        const { tokens, status } = await signUpWithGmail(req.body, `${req.protocol}://${req.host}`)
        return successResponse({ res, message: 'User Login With Gmail successfully', data: tokens, status })
})

router.post("/signin", validation(validator.login), async (req, res) => {
        const result = await signin(req.validation.body, `${req.protocol}://${req.host}`)
        return successResponse({ res, message: 'login successfully', data: result })
})

export default router;


