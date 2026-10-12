import { OAuth2Client } from "google-auth-library";
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { BadExceptions, ConflictExceptions, NotFoundExceptions, TooManyRequestExceptions } from "../../common/exceptions/index.js"
import { createOne, findOne } from "../../common/repository/index.js"
import { compare, createTokenCredentials, decryption, encryption, hash, userBaseRevokedTokenId } from "../../common/security/index.js"
import { WEB_CLIENT_IDS } from "../../config.js";
import { UserModel } from "../../DB/model/index.js"
import { emailEvent } from '../../common/utils/email/email.event.js';
import { EmailSubjectEnum } from "../../common/enum/email.enum.js";
import { createOtp } from '../../common/utils/email/otp.js';
import { Del, Expire, Get, IncrBy, Keys, Set, Ttl } from "../../common/service/cache.service.js";
import { UserEmailKey, UserEmailTrialsKey } from "../../common/utils/email/send.email.js";

const client = new OAuth2Client();
async function verifyGoogleAccount(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: WEB_CLIENT_IDS,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) throw BadExceptions('Email Not Verified')
    return payload
}

export const signUpWithGmail = async ({ idToken }, issuer) => {
    try {
        const { name, email, picture } = await verifyGoogleAccount(idToken)
        const existingAccount = await findOne({
            model: UserModel,
            filter: { email }
        })
        if (existingAccount) {

            if (existingAccount.provider != ProviderEnum.GOOGLE) {
                throw ConflictExceptions('Invalid Account Provider')
            }
            return { status: 200, tokens: await createTokenCredentials({ user: existingAccount, issuer }) }

        }
        const user = await createOne({
            model: UserModel,
            data: {
                userName: name,
                email,
                confirmEmail: new Date(),
                provider: ProviderEnum.GOOGLE,
                image: picture
            }
        })
        return { status: 201, tokens: await createTokenCredentials({ user, issuer }) }

    } catch (error) {
        console.error("LOGIN WITH GMAIL ERROR:", error);
        throw error;
    }
}

const sendEmailOtp = async ({ email, subject, expiresIn = 120, maxTrials = 3, blockInSeconds = 300, title }) => {
    const existOtpTTL = await Ttl({ key: UserEmailKey({ email, subject }) })
    if (existOtpTTL > 0) throw ConflictExceptions(`Please wait for ${existOtpTTL} seconds before requesting a new OTP.`)

    const oldTrials = await Get({ key: UserEmailTrialsKey({ email, subject }) }) ?? 0
    if (oldTrials >= maxTrials) {
        throw TooManyRequestExceptions(`You have exceeded the maximum number of OTP requests. Please try again later.`)
    }

    const code = createOtp()
    await Set({
        key: UserEmailKey({ email, subject }),
        value: await hash(code.toString()),
        ttl: expiresIn
    })

    const currentTrials = await IncrBy({ key: UserEmailTrialsKey({ email, subject }) })
    if (currentTrials === 3) {
        await Expire({ key: UserEmailTrialsKey({ email, subject }), ttl: blockInSeconds })
    }

    emailEvent.emit('sendEmail', {
        recipients: { to: email },
        subject: EmailSubjectEnum.CONFIRM_EMAIL,
        data: { code, title: title ?? subject }
    })

}

export const signup = async ({ email, password, userName, phone, DOB, gender }) => {
    const duplicateAccount = await findOne({
        model: UserModel,
        filter: { email },
        options: {}
    })
    if (duplicateAccount) throw ConflictExceptions('Email Already Exist')

    const account = await createOne({
        model: UserModel,
        data: { email, password: await hash(password), userName, phone: await encryption(phone), DOB, gender }
    })

    await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })

    return account
}

export const confirmEmail = async ({ email, otp }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
        options: {}
    })
    if (!account) throw NotFoundExceptions('Invalid account')

    const hashOtp = await Get({ key: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) })
    if (!hashOtp || !await compare(otp, hashOtp)) throw BadExceptions('Invalid OTP')

    account.confirmEmail = new Date()
    await account.save()

    await Del({ key: await Keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL }) }) })
    return account
}

export const reSendConfirmEmail = async ({ email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: false } },
        options: {}
    })
    if (!account) throw NotFoundExceptions('Invalid account')

    await sendEmailOtp({ email, subject: EmailSubjectEnum.CONFIRM_EMAIL })

    return account
}

export const requestForgetPassword = async ({ email }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
        options: {}
    })
    if (!account) throw NotFoundExceptions('Invalid account')

    await sendEmailOtp({ email, subject: EmailSubjectEnum.FORGET_PASSWORD })

    return account
}

export const verifyForgetPassword = async ({ email, otp }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
        options: {}
    })
    if (!account) throw NotFoundExceptions('Invalid account')

    const hashOtp = await Get({ key: UserEmailKey({ email, subject: EmailSubjectEnum.FORGET_PASSWORD }) })
    if (!hashOtp || !await compare(otp, hashOtp)) throw BadExceptions('Invalid OTP')

    return account
}

export const reSetForgetPassword = async ({ email, otp,password }) => {

    const account = await verifyForgetPassword({ email, otp })
    account.password = await hash(password)
    account.changeCredentialTime = new Date()
    await account.save()

    const result = await Promise.all([
        Keys({ prefix: UserEmailKey({ email, subject: EmailSubjectEnum.FORGET_PASSWORD }) }),
        Keys({ prefix: userBaseRevokedTokenId({ userId: account._id }) })
    ])

    await Del({ key: [...result[1], ...result[0]] })

    return account
}

export const signin = async ({ email, password }, issuer) => {
    const account = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProviderEnum.SYSTEM,
            confirmEmail: { $exists: true }
        },
        options: {},
    })
    if (!account) throw NotFoundExceptions('Invalid Email Or Password')

    //hash
    const match = await compare(password, account.password)
    if (!match) throw NotFoundExceptions('Invalid Email Or Password')

    //encryption    
    account.phone = await decryption(account.phone)

    //token access and refresh
    return await createTokenCredentials({ user: account, issuer })
}

