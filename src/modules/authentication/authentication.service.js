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
import { confirmLoginKey, loginBanKey, loginTrialsKey, UserEmailKey, UserEmailTrialsKey } from "../../common/utils/email/send.email.js";

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

const sendEmailOtp = async ({ customKey, email, subject, expiresIn = 120, maxTrials = 3, blockInSeconds = 300, title }) => {
    const key = customKey ?? UserEmailKey({ email, subject });

    const existOtpTTL = await Ttl({ key })
    if (existOtpTTL > 0) throw ConflictExceptions(`Please wait for ${existOtpTTL} seconds before requesting a new OTP.`)

    const oldTrials = await Get({ key: UserEmailTrialsKey({ email, subject }) }) ?? 0
    if (oldTrials >= maxTrials) {
        throw TooManyRequestExceptions(`You have exceeded the maximum number of OTP requests. Please try again later.`)
    }

    const code = createOtp()
    await Set({
        key,
        value: await hash(code.toString()),
        ttl: expiresIn
    })

    const currentTrials = await IncrBy({ key: UserEmailTrialsKey({ email, subject }) })
    if (currentTrials === 3) {
        await Expire({ key: UserEmailTrialsKey({ email, subject }), ttl: blockInSeconds })
    }

    emailEvent.emit('sendEmail', {
        recipients: { to: email },
        subject,
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

export const reSetForgetPassword = async ({ email, otp, password }) => {

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

export const signinWithProtection = async ({ email, password }, issuer) => {
    const isBaned = await Ttl({ key: loginBanKey({ email }) });
    if (isBaned > 0) {
        throw TooManyRequestExceptions(`Account is temporarily blocked due to multiple failed login attempts. Try again after ${Math.ceil(isBaned / 60)} minutes.`);
    }

    const account = await findOne({
        model: UserModel,
        filter: { email, provider: ProviderEnum.SYSTEM, confirmEmail: { $exists: true } },
        options: {},
    });
    if (!account) {
        throw NotFoundExceptions('Invalid Email Or Password');
    }

    const match = await compare(password, account.password);
    if (!match) {
        await handleFailedLoginPassword(email);
        throw NotFoundExceptions('Invalid Email Or Password');
    }

    await Del({ key: loginTrialsKey({ email }) });

    if (account.isTwoFactorEnabled) {
        await sendEmailOtp({
            email,
            subject: EmailSubjectEnum.LOGIN_2SV,
            title: "Login Verification Code",
            customKey: confirmLoginKey({ email })
        });
        return { message: "OTP sent to your email for 2-step verification", requireTwoFactor: true };
    }

    account.phone = await decryption(account.phone);
    return { tokens: await createTokenCredentials({ user: account, issuer }), requireTwoFactor: false };
};

async function handleFailedLoginPassword(email) {
    const trials = await IncrBy({ key: loginTrialsKey({ email }) });
    if (trials === 1) {
        await Expire({ key: loginTrialsKey({ email }), ttl: 300 });
    }
    if (trials >= 5) {
        await Set({ key: loginBanKey({ email }), value: "BANNED", ttl: 300 });
        await Del({ key: loginTrialsKey({ email }) });
    }
}

export const enableTwoStepVerification = async (userId) => {
    const account = await findOne({ model: UserModel, filter: { _id: userId } });
    if (!account) throw NotFoundExceptions('Account not found');

    const code = createOtp();
    await Set({
        key: UserEmailKey({ email: account.email, subject: "ENABLE_2SV" }),
        value: await hash(code.toString()),
        ttl: 120
    });

    emailEvent.emit('sendEmail', {
        recipients: { to: account.email },
        subject: EmailSubjectEnum.LOGIN_2SV,
        data: { code, title: "Enable 2-Step Verification" }
    });
    return { message: "OTP sent to verify and enable 2-step verification" };
};

export const verifyAndEnableTwoStepVerification = async (userId, otp) => {
    const account = await findOne({ model: UserModel, filter: { _id: userId } });
    if (!account) throw NotFoundExceptions('Account not found');

    const hashOtp = await Get({ key: UserEmailKey({ email: account.email, subject: "ENABLE_2SV" }) });
    if (!hashOtp || !await compare(otp, hashOtp)) throw BadExceptions('Invalid OTP');

    account.isTwoFactorEnabled = true;
    await account.save();

    await Del({ key: UserEmailKey({ email: account.email, subject: "ENABLE_2SV" }) });
    return { message: "2-Step verification enabled successfully" };
};

export const confirmLoginWith2SV = async ({ email, otp }, issuer) => {
    const account = await findOne({ model: UserModel, filter: { email } });
    if (!account) throw NotFoundExceptions('Account not found')

    const hashOtp = await Get({ key: confirmLoginKey({ email }) });

    if (!hashOtp || !await compare(otp, hashOtp)) throw BadExceptions('Invalid OTP');

    await Del({ key: confirmLoginKey({ email }) });

    account.phone = await decryption(account.phone);
    return await createTokenCredentials({ user: account, issuer });
};