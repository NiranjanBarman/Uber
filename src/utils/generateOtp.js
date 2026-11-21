const crypto = require("node:crypto");

const generateOTP = () => {
    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    return {
        otp,
        otpHash
    };
};

module.exports = generateOTP;