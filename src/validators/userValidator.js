const { body } = require("express-validator");

const userRegisterValid = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2, max: 60 }).withMessage("Name must be 2-60 characters")
        .escape(),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/).withMessage("Password must include at least one uppercase letter")
        .matches(/[0-9]/).withMessage("Password must include at least one number")
];

const userLoginValid = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
];

const verifyUserOtpValid = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail(),

    body("otp")
        .trim()
        .matches(/^\d{6}$/).withMessage("OTP must be a 6-digit code")
];

module.exports = {
    userRegisterValid,
    userLoginValid,
    verifyUserOtpValid
};
