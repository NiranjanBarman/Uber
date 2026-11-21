const express = require("express");
const captainRouter = express.Router();
const { captainRegisterMiddleware } = require("../Middleware/captain.middleware");
const {captainResgister, otpVerifyCaptain }= require("../controllers/captain.controller");
const { captainRegisterValid, verifyCaptainOtpValid } = require("../validators/captainValidator");
const { handleValidation } = require("../Middleware/validate");

captainRouter.post("/register", captainRegisterValid, handleValidation, captainRegisterMiddleware, captainResgister);
captainRouter.post("/verify-otp", verifyCaptainOtpValid, handleValidation, otpVerifyCaptain);


module.exports = captainRouter;