const express = require("express");
const { userRegisterMiddleware, requireUserRefreshSession, userAccessSessionMiddleware } = require("../Middleware/user.middleware");
const { registerUser, verifyUserOtp, userLogin, refreshUserToken, userLogout, logoutAll, getUserProfile } = require("../controllers/user.controller");
const { userRegisterValid, userLoginValid, verifyUserOtpValid } = require("../validators/userValidator");
const { handleValidation } = require("../Middleware/validate");


const userRouter = express.Router();


userRouter.post("/register", userRegisterValid, handleValidation, userRegisterMiddleware, registerUser);
userRouter.post("/verify-otp", verifyUserOtpValid, handleValidation, verifyUserOtp);
userRouter.post("/login", userLoginValid, handleValidation, userLogin);
userRouter.get("/logout", requireUserRefreshSession, userLogout);
userRouter.get("/logout-all", requireUserRefreshSession, logoutAll);
userRouter.get("/refresh-token", requireUserRefreshSession, refreshUserToken);

userRouter.get("/profile", userAccessSessionMiddleware, getUserProfile);

module.exports = userRouter;