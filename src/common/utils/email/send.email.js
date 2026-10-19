import nodemailer from "nodemailer"
import { APP_EMAIL, APP_NAME, APP_PASSWORD } from '../../../config.js';
import { BadExceptions } from "../../exceptions/index.js";

export const UserEmailKey = ({ email, subject }) => {
    return `User::${email}::${subject}::OTP`
}

export const UserEmailTrialsKey = ({ email, subject }) => {
    return `${UserEmailKey({ email, subject })}::Trials`
}

export const loginBanKey = ({ email }) => {
    return `User::${email}::Login::Ban`
};

export const loginTrialsKey = ({ email }) => {
    return `User::${email}::Login::Trials`
};

export const confirmLoginKey = ({ email }) => {
    return `otp:${email}:LOGIN_2SV`
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: APP_EMAIL,
        pass: APP_PASSWORD,
    },
});
export const sendEmail = async ({
    to,
    subject,
    cc,
    bcc,
    text,
    html,
    attachments = []
}) => {
    try {
        if (!to?.length && !cc?.length && !bcc?.length) {
            throw BadExceptions('Missing Email recipients')
        }
        if (!text?.length && !html?.length && !attachments?.length) {
            throw BadExceptions('Missing Email content')
        }
        const info = await transporter.sendMail({
            from: `"${APP_NAME}" <${APP_EMAIL}>`, // sender address
            to,// list of recipients
            subject, // subject line
            cc,
            bcc,
            text, // plain text body
            html, // HTML body
        });

        console.log("Message sent: %s", info.messageId);
        // Preview URL is only available when using an Ethereal test account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}