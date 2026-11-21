const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({

    email: {
        type: String,
        required: [true, "Email Required"],
        unique: [true, "Email Must Unique"]
    },
    
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "User Required"]
    },

    otpHash: {
        type: String,
        required: [true, "OTP Required"]
    },

    expiresAt: {
        type: Date,
        required: [true, "Expiration Time Required"]
    }
},{
    timestamps: true
})

const otpModel = mongoose.model("otp", otpSchema, "otps");

module.exports = otpModel;