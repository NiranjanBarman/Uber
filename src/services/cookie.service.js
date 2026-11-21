const REFRESH_COOKIE_NAME = "refreshToken";
const isProduction = process.env.NODE_ENV === "production";

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/api/user",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const getRefreshTokenCookie = (req) =>
    req.cookies?.[REFRESH_COOKIE_NAME];

const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshTokenCookie = (res) => {
    const { httpOnly, secure, sameSite } = REFRESH_COOKIE_OPTIONS;
    res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly, secure, sameSite });
};

module.exports = {
    getRefreshTokenCookie,
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
};
