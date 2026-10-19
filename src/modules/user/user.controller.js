import { Router } from "express";
import { logOut, profile, routateToken, updateUserInfo } from "./user.service.js";
import { autharization, authentication, hostMiddleware, uploadMiddleware } from "../../middleware/index.js";
import { RoleEnum, TokenTypeEnum } from "../../common/enum/index.js";
import { fileValidation, loclFileUpload, successResponse } from "../../common/utils/index.js";

const router = Router({ caseSensitive: true, strict: true });

router.get("/", authentication(), async (req, res, next) => {
    const result = await profile(req.user)
    return successResponse({ res, message: 'User Found ', data: result })
})

router.patch("/", authentication(), autharization(RoleEnum.ADMIN), async (req, res) => {
    const result = await updateUserInfo(req.user, req.body)
    return successResponse({ res, message: 'User Data Updated Successfully ', data: result })
})

router.post("/routate-token", authentication(TokenTypeEnum.REFRESH), hostMiddleware, async (req, res) => {
    const result = await routateToken(req.payload, req.user, req.domain)
    return successResponse({ res, message: 'User Token Rotated Successfully ', data: result })
})

router.post("/logout", authentication(), async (req, res) => {
    const result = await logOut(req.payload, req.user, req.body)
    return successResponse({ res, message: 'User Loged Out Successfully ', data: result })
})

router.patch("/profile-image",
    authentication(),
    uploadMiddleware({
        isRequired: true,
        multerMiddelware: loclFileUpload({ maxFileSize: 5 }).single('attachment'),
        customPath: "local",
        validation: fileValidation.image
    })
    , async (req, res) => {
        req.user.image = req.file.path
        await req.user.save()
        return successResponse({ res, message: 'User Image Added Successfully ', data: { user: req.user } })
    }
)

export default router;