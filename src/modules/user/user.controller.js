import { Router } from "express";
import { profile, routateToken, updateUserInfo } from "./user.service.js";
import { successResponse } from "../../common/utils/success.response.js";
import { autharization, authentication } from "../../middleware/index.js";
import { RoleEnum,  TokenTypeEnum } from "../../common/enum/index.js";

const router = Router();

router.get("/", authentication(), async (req, res, next) => {
    const result = await profile(req.user)
    return successResponse({ res, message: 'User Found ', data: result })
})

router.patch("/", authentication(), autharization(RoleEnum.ADMIN), async (req, res) => {
    const result = await updateUserInfo(req.user, req.body)
    return successResponse({ res, message: 'User Data Updated Successfully ', data: result })
})

router.post("/routate-token", authentication(TokenTypeEnum.REFRESH), async (req, res) => {
    const result = await routateToken(req.payload, req.user, `${req.protocol}://${req.get('host')}`)
    return successResponse({ res, message: 'User Token Rotated Successfully ', data: result })
})


export default router;