const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const BRAND = {
    name: "Uber",
    wordmark: "Uber",
    tagline: "Go anywhere. Get anything.",
    primary: "#000000",
    accent: "#06C167",
    softBg: "#F6F6F6",
    softBorder: "#E2E2E2",
    textDark: "#141414",
    textMuted: "#545454"
};

const emailTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${BRAND.name}</title>
</head>
<body style="margin:0; padding:0; background-color:#F4F4F5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:${BRAND.textDark}; -webkit-font-smoothing:antialiased;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F4F5; padding:36px 14px;">
        <tr>
            <td align="center">

                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                    style="max-width:520px; background-color:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow:0 6px 24px rgba(0,0,0,0.06); border:1px solid #EAEAEA;">

                    <!-- Header -->
                    <tr>
                        <td align="left" style="background-color:${BRAND.primary}; padding:26px 32px;">
                            <div style="color:#FFFFFF; font-size:28px; font-weight:700; letter-spacing:-0.8px; line-height:1.1;">
                                ${BRAND.wordmark}<span style="color:${BRAND.accent};">.</span>
                            </div>
                            <p style="margin:6px 0 0; color:#B8B8B8; font-size:12px; letter-spacing:0.3px;">
                                ${BRAND.tagline}
                            </p>
                        </td>
                    </tr>

                    <!-- Accent Stripe -->
                    <tr>
                        <td style="background-color:${BRAND.accent}; height:3px; font-size:0; line-height:0;">&nbsp;</td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:32px 32px 28px;">
                            ${content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color:#FAFAFA; padding:20px 32px; border-top:1px solid #EFEFEF;">
                            <p style="margin:0; color:#767676; font-size:12px; line-height:1.5;">
                                This is an automated message from ${BRAND.name}. Please do not reply to this email.
                            </p>
                            <p style="margin:6px 0 0; color:#9E9E9E; font-size:11px;">
                                &copy; ${new Date().getFullYear()} ${BRAND.name} Technologies. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
`;

const sendOtpMail = async (email, name, otp) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Uber - Verify Your Email",
        html: emailTemplate(`
            <h2 style="margin:0 0 12px; color:${BRAND.textDark}; font-size:21px; font-weight:700;">
                Hey ${name},
            </h2>

            <p style="margin:0 0 22px; color:${BRAND.textMuted}; font-size:15px; line-height:1.6;">
                Welcome to Uber! Enter the verification code below to confirm your email address.
            </p>

            <div style="background-color:${BRAND.softBg}; border:1px solid ${BRAND.softBorder}; border-left:4px solid ${BRAND.primary}; border-radius:10px; padding:22px 16px; text-align:center; margin:0 0 22px;">
                <p style="margin:0 0 8px; color:#6B6B6B; font-size:11px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase;">
                    Your Verification Code
                </p>
                <div style="margin:0; color:${BRAND.textDark}; font-size:34px; font-weight:700; letter-spacing:9px; font-family:'Courier New',Courier,monospace;">
                    ${otp}
                </div>
            </div>

            <p style="margin:0; color:${BRAND.textMuted}; font-size:13px; line-height:1.6;">
                This code is valid for <strong style="color:${BRAND.textDark};">5 minutes</strong>. For your security, please do not share it with anyone.
            </p>
        `)
    });
};

const sendPasswordResetMail = async (email, name, resetLink) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Uber - Password Reset",
        html: emailTemplate(`
            <h2 style="margin:0 0 12px; color:${BRAND.textDark}; font-size:21px; font-weight:700;">
                Hey ${name},
            </h2>

            <p style="margin:0 0 24px; color:${BRAND.textMuted}; font-size:15px; line-height:1.6;">
                We received a request to reset your Uber account password. Click the button below to choose a new one.
            </p>

            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 26px;">
                <tr>
                    <td align="center" style="background-color:${BRAND.primary}; border-radius:8px;">
                        <a href="${resetLink}"
                            style="display:inline-block; padding:14px 32px; color:#FFFFFF; text-decoration:none; font-size:15px; font-weight:600; letter-spacing:0.2px;">
                            Reset Password
                        </a>
                    </td>
                </tr>
            </table>

            <p style="margin:0 0 14px; color:#767676; font-size:13px; line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email—your password will remain unchanged.
            </p>

            <p style="margin:0; color:#8E8E8E; font-size:12px; line-height:1.5; word-break:break-all;">
                Button not working? Paste this link into your browser:<br>
                <a href="${resetLink}" style="color:${BRAND.textDark}; text-decoration:underline;">${resetLink}</a>
            </p>
        `)
    });
};

const sendLoginAlertMail = async (email, name, deviceInfo) => {
    const loginTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Uber - New Login Detected",
        html: emailTemplate(`
            <h2 style="margin:0 0 12px; color:${BRAND.textDark}; font-size:21px; font-weight:700;">
                Hey ${name},
            </h2>

            <p style="margin:0 0 22px; color:${BRAND.textMuted}; font-size:15px; line-height:1.6;">
                We noticed a new sign-in to your Uber account. Here are the session details:
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background-color:${BRAND.softBg}; border:1px solid ${BRAND.softBorder}; border-radius:10px; padding:6px 18px; margin:0 0 22px;">
                <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #E6E6E6; font-size:13px; color:#6B6B6B; width:105px; vertical-align:top;">
                        <strong>IP Address</strong>
                    </td>
                    <td style="padding:12px 0; border-bottom:1px solid #E6E6E6; font-size:13px; color:${BRAND.textDark}; font-family:'Courier New',Courier,monospace; vertical-align:top;">
                        ${deviceInfo.ip}
                    </td>
                </tr>
                <tr>
                    <td style="padding:12px 0; border-bottom:1px solid #E6E6E6; font-size:13px; color:#6B6B6B; vertical-align:top;">
                        <strong>Device</strong>
                    </td>
                    <td style="padding:12px 0; border-bottom:1px solid #E6E6E6; font-size:13px; color:${BRAND.textDark}; line-height:1.5; word-break:break-word; vertical-align:top;">
                        ${deviceInfo.userAgent}
                    </td>
                </tr>
                <tr>
                    <td style="padding:12px 0; font-size:13px; color:#6B6B6B; vertical-align:top;">
                        <strong>Login Time</strong>
                    </td>
                    <td style="padding:12px 0; font-size:13px; color:${BRAND.textDark}; vertical-align:top;">
                        ${loginTime}
                    </td>
                </tr>
            </table>

            <p style="margin:0; color:${BRAND.textMuted}; font-size:14px; line-height:1.6;">
                If this wasn't you, secure your account right away by updating your password.
            </p>
        `)
    });
};

module.exports = {
    sendOtpMail,
    sendPasswordResetMail,
    sendLoginAlertMail
};