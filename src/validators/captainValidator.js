const { body } = require("express-validator");

const captainRegisterValid = [
    body("fullName.firstname")
        .trim()
        .notEmpty().withMessage("Firstname is required")
        .isLength({ min: 3 }).withMessage("Firstname must be at least 3 characters long")
        .escape(),

    body("fullName.lastname")
        .optional({ nullable: true })
        .trim()
        .isLength({ min: 3 }).withMessage("Lastname must be at least 3 characters long")
        .escape(),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email is invalid")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
        .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/)
        .withMessage("Password must contain an uppercase letter, a lowercase letter, a number, and a special character"),

    body("vehicle.color")
        .trim()
        .notEmpty().withMessage("Vehicle color is required")
        .isLength({ min: 3 }).withMessage("Vehicle color must be at least 3 characters long")
        .escape(),

    body("vehicle.plate")
        .trim()
        .notEmpty().withMessage("Vehicle plate is required")
        .isLength({ min: 3 }).withMessage("Vehicle plate must be at least 3 characters long")
        .escape(),

    body("vehicle.capcity")
        .notEmpty().withMessage("Vehicle capacity is required")
        .isFloat({ min: 1 }).withMessage("Vehicle capacity must be at least 1")
        .toFloat(),

    body("vehicle.vihacleType")
        .trim()
        .toLowerCase()
        .isIn(["car", "motorcycle", "auto"])
        .withMessage("Vehicle type must be car, motorcycle, or auto"),

    body("vehicle.location.lat")
        .optional({ nullable: true })
        .isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90")
        .toFloat(),

    body("vehicle.location.lng")
        .optional({ nullable: true })
        .isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180")
        .toFloat()
];

const captainLoginValid = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email is invalid")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
];

const verifyCaptainOtpValid = [
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
    captainRegisterValid,
    captainLoginValid,
    verifyCaptainOtpValid
};