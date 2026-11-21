const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

const generateRefreshToken = (userId) => {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

const generateAccessToken = (userId, sessionId, role) => {
    return jwt.sign(
        { userId, sessionId, role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

const hashRefreshToken = (refreshToken) => {
    return crypto.createHash("sha256").update(refreshToken).digest("hex");
}

module.exports = {generateRefreshToken, generateAccessToken, hashRefreshToken };