import { Router } from "express";
import { signup, signin } from "./authentication.service.js";
import { successResponse } from "../../common/utils/index.js";
const router = Router();

router.post("/signup", async (req, res) => {    
        const result = await signup(req.body)
        return successResponse({ res, message: 'user created successfully', data: result, status: 201 })
})
router.post("/signin", async (req, res) => {
        const result = await signin(req.body)
        return successResponse({ res, message: 'login successfully', data: result })
})

export default router;


