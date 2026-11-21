const crypto = require("node:crypto");
const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const sessionModel = require("../models/session.model");
const { generateRefreshToken, generateAccessToken } = require("../utils/token");
const { sendLoginAlertMail, sendOtpMail } = require("../services/email.service");
const { setRefreshTokenCookie, clearRefreshTokenCookie } = require("../services/cookie.service");
const generateOTP = require("../utils/generateOtp");


const registerUser = async (req, res) => {
    const { name, email, password } = req.cleanData;

    let user;

    try {
        user = await userModel.createUser({
            name,
            email,
            password
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "User Already Exist" });
        }
        throw error;
    }

    const { otp, otpHash } = generateOTP();
    await otpModel.create({
        email: user.email,
        user: user._id,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendOtpMail(user.email, user.name, otp);

    return res.status(201).json({
        message: "User Registered Successfully!",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified
        }
    });
};

const verifyUserOtp = async (req, res) => {

    const { email, otp } = req.cleanData;
    
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpEntry = await otpModel.findOne({
        email,
        otpHash,
        expiresAt: { $gt: new Date() }
    });

    if (!otpEntry) {
        return res.status(400).json({ message: "Invalid or Expired OTP!" });
    }

    const user = await userModel.findByIdAndUpdate(
        otpEntry.user,
        { verified: true },
        { new: true }
    );

    if (!user) {
        return res.status(400).json({ message: "Invalid or Expired OTP!" });
    }

    await otpModel.deleteMany({ email: user.email });

    const refreshToken = generateRefreshToken(user._id);
    const session = await sessionModel.createSession({
        userId: user._id,
        refreshToken,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        role: user.role
    });
    const accessToken = generateAccessToken(user._id, session._id, user.role);

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
        message: "OTP Verified Successfully!",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified
        },
        accessToken
    });
};

const userLogin = async (req, res) => {
    const { email, password } = req.cleanData;
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
        return res.status(401).json({ message: "Invalid Email or Password!" });
    }

    if (!user.verified) {
        return res.status(403).json({ message: "Email not verified." });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid Email or Password!" });
    }

    const refreshToken = generateRefreshToken(user._id);
    const session = await sessionModel.createSession({
        userId: user._id,
        refreshToken,
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "Unknown",
        role: user.role
    });
    const accessToken = generateAccessToken(user._id, session._id, user.role);

    setRefreshTokenCookie(res, refreshToken);

    await sendLoginAlertMail(user.email, user.name, {
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "Unknown"
    });

    return res.status(200).json({
        message: "Login Successfully!",
        user: {
            name: user.name,
            email: user.email
        },
        accessToken
    });
};

const userLogout = async (req, res) => {
    
    req.userSession.session.revoked = true;
    await req.userSession.session.save();

    clearRefreshTokenCookie(res);
    return res.status(200).json({
        message: "Logout Successfully!" 
    });
};

const logoutAll = async (req, res) => {
    await sessionModel.updateMany(
        { user: req.userSession.decoded.userId, revoked: false },
        { $set: { revoked: true } }
    );

    clearRefreshTokenCookie(res);
    return res.status(200).json({
        message: "Logout from all sessions successfully!"
    });
};

const refreshUserToken = async (req, res) => {
    const { session, decoded } = req.userSession;
    const refreshToken = generateRefreshToken(decoded.userId);
    const role = session.role || "user";

    await session.rotateRefreshToken(refreshToken);
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
        message: "Access Token Generated Successfully!",
        accessToken: generateAccessToken(decoded.userId, session._id, role)
    });
};

const getUserProfile = async (req, res) => {
    const user = await userModel.findById(req.user.userId)
        .select("name email verified");

    if (!user) {
        return res.status(401).json({
            message: "Unauthorized Access!"
        });
    }

    return res.status(200).json({
        message: "User Information Fetched Successfully!",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            verified: user.verified
        }
    });
};

module.exports = {
    registerUser,
    verifyUserOtp,
    userLogin,
    refreshUserToken,
    userLogout,
    logoutAll,
    getUserProfile
};
