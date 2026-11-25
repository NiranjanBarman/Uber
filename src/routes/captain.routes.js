const express = require("express");
const captainRouter = express.Router();
const { captainRegisterMiddleware, captainAccessSessionMiddleware, captainRefrshSessionMiddleware } = require("../Middleware/captain.middleware");
const {captainResgister, otpVerifyCaptain, captainLogin, captainRefreshToken, captainLogout, logoutAll, captainProfile }= require("../controllers/captain.controller");
const { captainRegisterValid, verifyCaptainOtpValid, captainLoginValid } = require("../validators/captainValidator");
const { handleValidation } = require("../Middleware/validate");

captainRouter.post("/register", captainRegisterValid, handleValidation, captainRegisterMiddleware, captainResgister);
captainRouter.post("/verify-otp", verifyCaptainOtpValid, handleValidation, otpVerifyCaptain);
captainRouter.post("/login", captainLoginValid, handleValidation, captainLogin);
captainRouter.get("/refresh-token", captainRefrshSessionMiddleware, captainRefreshToken);
captainRouter.get("/logout", captainRefrshSessionMiddleware, captainLogout);
captainRouter.get("/logout-all", captainRefrshSessionMiddleware, logoutAll);


captainRouter.get("/captain-profile", captainAccessSessionMiddleware, captainProfile);


module.exports = captainRouter;