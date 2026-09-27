import { ProviderEnum } from "../../common/enum/user.enum.js";
import { BadExceptions, ConflictExceptions, NotFoundExceptions } from "../../common/exceptions/index.js"
import { createOne, findOne } from "../../common/repository/index.js"
import { compare, createTokenCredentials, decryption, encryption, hash } from "../../common/security/index.js"
import { WEB_CLIENT_IDS } from "../../config.js";
import { UserModel } from "../../DB/model/index.js"
import { OAuth2Client } from 'google-auth-library';

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

export const signup = async ({ email, password, userName, phone, DOB, gender }) => {
    const account = await findOne({
        model: UserModel,
        filter: { email },
        options: {}
    })
    if (account) throw ConflictExceptions('Email Already Exist')
    const user = await createOne({
        model: UserModel,
        data: { email, password: await hash(password), userName, phone: await encryption(phone), DOB, gender }
    })
    return user
}

export const signin = async ({ email, password }, issuer) => {
    const account = await findOne({
        model: UserModel,
        filter: {
            email,
            provider: ProviderEnum.SYSTEM
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

