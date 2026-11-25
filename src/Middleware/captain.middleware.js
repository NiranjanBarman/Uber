const config  = require("../config/config");
const captainModel = require("../models/captain.model");
const otpModel = require("../models/otp.model");
const jwt = require("jsonwebtoken");
const sessionModel = require("../models/session.model");
const { getRefreshTokenCookie } = require("../services/cookie.service");


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

const captainRefrshSessionMiddleware = async (req, res, next) => {

    const refreshToken = getRefreshTokenCookie(req);

    if (!refreshToken) {
        return res.status(401).json({
            message: "Unauthorized Access! Please Login"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    } catch (error) {
        if (["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
            return res.status(401).json({
                message: "Unauthorized Access! Please Login"
            });
        }

        return next(error);
    }

    if (!decoded || !decoded.userId) {
        return res.status(401).json({
            message: "Unauthorized Access! Please Login"
        });
    }

    const session = await sessionModel.findActiveByRefreshToken(decoded.userId, refreshToken);
    
    if (!session || session.role !== "captain") {
        return res.status(401).json({
            message: "Unauthorized Access! Please Login"
        });
    }

    req.captainSession = { refreshToken, decoded, session };
    return next();
}

const captainAccessSessionMiddleware = async (req, res, next) => {
    
    const accessToken = req.headers.authorization?.split(" ")[1];

    if(!accessToken){
        return res.status(401).json({
            message: "Unauthorized Access!"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
    } catch (error) {
        if (["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(error.name)) {
            return res.status(401).json({
                message: "Invalid or Expired Token"
            });
        }
        return next(error);
    }

    const session = await sessionModel.findOne({ 
        _id: decoded.sessionId,
        user: decoded.userId,
        revoked: false,
        role: "captain"
    });

    if(!session){
        return res.status(401).json({
            message: "Session Not Found! or Unauthorized Access!"
        });
    }

    req.captain = decoded.userId;

    next();

}

module.exports = { captainRegisterMiddleware, captainRefrshSessionMiddleware, captainAccessSessionMiddleware };
