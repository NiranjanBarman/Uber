const crypto = require("node:crypto");
const captainModel = require("../models/captain.model");
const otpModel = require("../models/otp.model");
const sessionModel = require("../models/session.model");
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require("../services/cookie.service");
const { sendOtpMail } = require("../services/email.service");
const generateOTP = require("../utils/generateOtp");
const { generateRefreshToken, generateAccessToken } = require("../utils/token");

const captainResgister = async (req, res) => {

    const { fullName, email, password, vehicle } = req.cleanData;
    let captain;

    try{
        captain = await captainModel.createCaptain(
            fullName, email, password, vehicle
        );
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Captain Already Exist" });
        }
        throw error;
    }
    
    const { otp, otpHash } = generateOTP();
    await otpModel.create({
        email: captain.email,
        user: captain._id,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const captainName = `${captain.fullName.firstname} ${captain.fullName.lastname}`;
    sendOtpMail(captain.email, captainName, otp);
    return res.status(201).json({
        message: "Captain Registered Successfully!",
        captain: captain
    });
}

const otpVerifyCaptain = async (req, res) => {

    const { email, otp } = req.cleanData;
    
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpEntry = await otpModel.findOne({
        email,
        otpHash,
        expiresAt: { $gt: new Date() }
    });

    if(!otpEntry){
        return res.status(401).json({
            message: "Unauthorized Access!"
        });
    }

    const captain = await captainModel.findByIdAndUpdate(
        otpEntry.user, {verified: true}, {new: true}
    );

    if (!captain) {
        return res.status(400).json({ message: "Invalid or Expired OTP!" });
    }   

    const refreshToken = generateRefreshToken(captain._id);

    const session = await sessionModel.createSession({
        userId: captain._id,
        refreshToken,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        role: captain.role
    });

    const accessToken = generateAccessToken(captain._id, session._id, captain.role);

    await otpModel.deleteMany({ email: captain.email });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
        message: "Captain Verified Successfully!",
        captain: captain,
        accessToken: accessToken,
    });

}

const captainLogin = async (req, res) => {
    const { email, password } = req.cleanData;

    if(!email || !password){
        return res.status(400).json({
            meaage: "Email And Password Are Requires!"
        });
    }

    const captain = await captainModel.findOne({ email }).select("+password");

    if(!captain){
        return res.status(401).json({
            message: "Unauthorized Access!"
        });
    }

    const isPasswordValid = await captain.comparePassword(password);

    if(!isPasswordValid){
        return res.status(401).json({
            message: "Invalid Email or Password!"
        });
    }

    const refreshToken = generateRefreshToken(captain._id);

    const session = await sessionModel.createSession({
        userId: captain._id,
        refreshToken,
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "Unknown",
        role: captain.role
    });

    const accessToken = generateAccessToken(captain._id, session._id, captain.role);

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
        message: "Captain Login Successfully!",
        captain,
        accessToken: accessToken
    });
}

const captainProfile = async (req, res) => {
    
    const captain = await captainModel.findOne({_id: req.captain});

    if(!captain){
        return res.status(400).json({
            message: "Captain Not Found!"
        });
    }

    res.status(200).json({
        meaage: "Captain Featched Successfully!",
        captain: captain
    });
}

const captainLogout = async (req, res) => {
    req.captainSession.session.revoked = true;
    await req.captainSession.session.save();

    clearRefreshTokenCookie(res);
    return res.status(200).json({
        message: "Logout Successfully!" 
    });
}

const logoutAll = async (req, res) => {
    await sessionModel.updateMany(
        { user: req.captainSession.decoded.userId, role: "captain", revoked: false },
        { $set: { revoked: true } }
    );

    clearRefreshTokenCookie(res);
    return res.status(200).json({
        message: "Logout from all sessions successfully!"
    });
};

const captainRefreshToken = async (req, res) => {
    const { session, decoded } = req.captainSession;
    const refreshToken = generateRefreshToken(decoded.userId);

    await session.rotateRefreshToken(refreshToken);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
        message: "Access Token Generated Successfully!",
        accessToken: generateAccessToken(decoded.userId, session._id, session.role)
    });
};

module.exports = {
    captainResgister,
    otpVerifyCaptain,
    captainLogin,
    captainRefreshToken,
    captainLogout,
    logoutAll,
    captainProfile
};