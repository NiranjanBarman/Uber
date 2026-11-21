const jwt = require("jsonwebtoken");
const config = require("../config/config");
const sessionModel = require("../models/session.model");
const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const { getRefreshTokenCookie } = require("../services/cookie.service");

const userRegisterMiddleware = async (req, res, next) => {
    const { email } = req.cleanData;
    const existingUser = await userModel.findOne({ email });

    if (!existingUser) {
        return next();
    }

    if (existingUser.verified) {
        return res.status(409).json({
            message: "User Already Exist"
        });
    }

    await otpModel.deleteMany({ user: existingUser._id });

    const deletedUser = await userModel.findOneAndDelete({
        _id: existingUser._id,
        verified: false
    });

    if (!deletedUser) {
        const currentUser = await userModel.findOne({ email });

        if (currentUser && currentUser.verified) {
            return res.status(409).json({
                message: "User Already Exist"
            });
        }

        if (currentUser) {
            return res.status(409).json({
                message: "Registration is already in progress. Please try again."
            });
        }
    }

    return next();
};

const requireUserRefreshSession = async (req, res, next) => {
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
    
    if (!session) {
        return res.status(401).json({
            message: "Unauthorized Access! Please Login"
        });
    }

    req.userSession = { refreshToken, decoded, session };
    next();
};

const userAccessSessionMiddleware = async (req, res, next) => {

    const accessToken = req.headers.authorization?.split(" ")[1];

    if(!accessToken){
        return res.status(401).json({
            message: "Unauthorized Access!"
        });
    }

    const decoded = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
    if(!decoded){
        return res.status(401).json({
            message: "Invalid Token"
        });
    }

    console.log(decoded.userId);
    console.log(decoded.sessionId);

    const session = sessionModel.findOne({
        _id: decoded.sessionId, user: decoded.userId 
    });

    if(!session){
        return res.status(401).json({
            message: "Unauthorized Access!"
        });
    }

    req.user = decoded;
    next();
}

module.exports = {
    userRegisterMiddleware,
    requireUserRefreshSession,
    userAccessSessionMiddleware
};