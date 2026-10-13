import { Router } from "express";
import { signup, signin, signUpWithGmail, confirmEmail, reSendConfirmEmail, requestForgetPassword, verifyForgetPassword, reSetForgetPassword, enableTwoStepVerification, verifyAndEnableTwoStepVerification, signinWithProtection, confirmLoginWith2SV } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";
import * as validator from './authentiction.validation.js'
import { validation } from "../../middleware/validation.middleware.js";
import { authentication } from '../../middleware/index.js'
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

router.post("/signin-secure", validation(validator.login), async (req, res) => {
        const result = await signinWithProtection(req.validation.body, `${req.protocol}://${req.host}`);
        return successResponse({ res, message: "Login processed", data: result, status: 200 });
});

router.patch("/enable-2sv", authentication(), async (req, res) => {
        const result = await enableTwoStepVerification(req.user._id);
        return successResponse({ res, status: 200, data: result });
});

router.patch("/verify-enable-2sv", authentication(), async (req, res) => {
        const result = await verifyAndEnableTwoStepVerification(req.user._id, req.body.otp);
        return successResponse({ res, data: result, status: 200 });
});

router.post("/login-confirmation", validation(validator.confirmEmail), async (req, res) => {
        const tokens = await confirmLoginWith2SV(req.validation.body, `${req.protocol}://${req.host}`);
        return successResponse({ res, message: "Login confirmed successfully", data: tokens, status: 200 });
});

export default router;


