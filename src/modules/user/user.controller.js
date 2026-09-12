import { Router } from "express";
import { getUserById, updateUserInfo } from "./user.service.js";
import { successResponse } from "../../common/utils/success.response.js";

const router = Router();

router.get("/:userId", async (req, res) => {
    const result = await getUserById(req.params)
    return successResponse({ res, message: 'User Found ', data: result })
})


router.patch("/:userId", async (req, res) => {
    const result = await updateUserInfo(req.params, req.body)
    return successResponse({ res, message: 'User Data Updated Successfully ', data: result })
})


export default router;