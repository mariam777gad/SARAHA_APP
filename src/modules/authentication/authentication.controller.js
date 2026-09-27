import { Router } from "express";
import { signup, signin, signUpWithGmail } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";
import * as validator from './authentiction.validation.js'
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();

router.post("/signup", validation(validator.signUpSchema), async (req, res) => {
        const result = await signup(req.validation)
        return successResponse({ res, message: 'User Account Created Successfully', data: result, status: 201 })
})

router.post("/loginWithGmail", async (req, res) => {
        const { tokens, status } = await signUpWithGmail(req.body, `${req.protocol}://${req.host}`)
        return successResponse({ res, message: 'User Login With Gmail successfully', data: tokens, status })
})

router.post("/signin", validation(validator.loginSchema), async (req, res) => {

        const result = await signin(req.validation, `${req.protocol}://${req.host}`)
        return successResponse({ res, message: 'login successfully', data: result })
})

export default router;


