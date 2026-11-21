const captainModel = require("../models/captain.model");
const otpModel = require("../models/otp.model");

const captainRegisterMiddleware = async (req, res, next) => {
    const { email } = req.cleanData;
    const existingCaptain = await captainModel.findOne({ email });

    if (!existingCaptain) {
        return next();
    }

    if (existingCaptain.verified) {
        return res.status(409).json({
            message: "Captain Already Exist"
        });
    }

    await otpModel.deleteMany({ user: existingCaptain._id });

    const deletedCaptain = await captainModel.findOneAndDelete({
        _id: existingCaptain._id,
        verified: false
    });

    if (!deletedCaptain) {
        const currentCaptain = await captainModel.findOne({ email });

        if (currentCaptain && currentCaptain.verified) {
            return res.status(409).json({
                message: "Captain Already Exist"
            });
        }

        if (currentCaptain) {
            return res.status(409).json({
                message: "Registration is already in progress. Please try again."
            });
        }
    }

    return next();
};

module.exports = { captainRegisterMiddleware };
