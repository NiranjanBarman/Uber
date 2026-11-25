const REFRESH_COOKIE_NAME = "refreshToken";
const isProduction = process.env.NODE_ENV === "production";
const LEGACY_REFRESH_COOKIE_PATH = "/api/user";

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/api",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const getClearCookieOptions = (path) => ({
    httpOnly: REFRESH_COOKIE_OPTIONS.httpOnly,
    secure: REFRESH_COOKIE_OPTIONS.secure,
    sameSite: REFRESH_COOKIE_OPTIONS.sameSite,
    path,
});

const getRefreshTokenCookie = (req) =>
    req.cookies?.[REFRESH_COOKIE_NAME];

const setRefreshTokenCookie = (res, refreshToken) => {
    res.clearCookie(
        REFRESH_COOKIE_NAME,
        getClearCookieOptions(LEGACY_REFRESH_COOKIE_PATH)
    );
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
};

const clearRefreshTokenCookie = (res) => {
    res.clearCookie(
        REFRESH_COOKIE_NAME,
        getClearCookieOptions(REFRESH_COOKIE_OPTIONS.path)
    );
    res.clearCookie(
        REFRESH_COOKIE_NAME,
        getClearCookieOptions(LEGACY_REFRESH_COOKIE_PATH)
    );
};

module.exports = {
    getRefreshTokenCookie,
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
};
