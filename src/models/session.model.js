const mongoose = require("mongoose");
const { hashRefreshToken } = require("../utils/token");

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [ true, "User Reference Required"]
    },

    refreshTokenHash: {
        type: String,
        required: [ true, "Refresh Token Hash Required" ]
    },

    ip: {
        type: String,
        required: [ true, "IP Address Required" ]
    },

    userAgent: {
        type: String,
        required: [ true, "User Agent Required" ]
    },

    role: {
        type: String,
        enum: ["user", "captain"]
    },

    revoked: {
        type: Boolean,
        default: false  
    }
},{
    timestamps: true
});

sessionSchema.statics.createSession = function ({ userId, refreshToken, ip, userAgent, role }) {
    return this.create({
        user: userId,
        refreshTokenHash: hashRefreshToken(refreshToken),
        ip,
        userAgent,
        role
    });
};

sessionSchema.statics.findActiveByRefreshToken = function (userId, refreshToken) {
    return this.findOne({
        user: userId,
        refreshTokenHash: hashRefreshToken(refreshToken),
        revoked: false
    });
};

sessionSchema.methods.rotateRefreshToken = function (refreshToken) {
    this.refreshTokenHash = hashRefreshToken(refreshToken);
    return this.save();
};

const sessionModel = mongoose.model("Session", sessionSchema, "sessions");
module.exports = sessionModel;