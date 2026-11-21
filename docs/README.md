# Uber-Like Backend API

This documentation describes the HTTP API currently implemented by the Node.js backend in `server/`. The routes currently cover User and Captain registration and OTP verification, User login/session operations, and a User profile endpoint. Ride booking, trip management, payments, Captain login, and other ride operations are **not implemented** in the inspected route files.

## Technology

- Node.js and Express 5
- MongoDB with Mongoose
- `express-validator` for request-body validation
- `bcryptjs` for password hashing and comparison
- `jsonwebtoken` for access and refresh tokens
- Nodemailer/Gmail transport for email notifications
- `cookie-parser`, CORS, Morgan, and dotenv

The Node.js version is not pinned in `package.json`.

## Documentation index

- [API overview](./API-OVERVIEW.md)
- [Authentication](./AUTHENTICATION.md)
- [User API](./USER-API.md)
- [Captain API](./CAPTAIN-API.md)
- [Error codes](./ERROR-CODES.md)

## Local setup

The following steps are based on `server/package.json`, `server.js`, `src/config/config.js`, and the environment-variable names read by the application. No `.env.example` file is present.

1. Open a terminal in `server/` and install the dependencies:

   ```sh
   npm install
   ```

2. Create `server/.env` with the required settings:

   ```dotenv
   MONGO_URI=<MongoDB connection string>
   JWT_ACCESS_SECRET=<long random secret>
   JWT_REFRESH_SECRET=<different long random secret>

   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d

   EMAIL_USER=<Gmail sender address>
   EMAIL_PASS=<Gmail app password>
   ```

   `MONGO_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET` are checked when the configuration module loads. Token expiry variables are read by the token utility but are not validated at startup. Email credentials are used by the email service and are not validated at startup.

3. Start the server:

   ```sh
   npm run dev
   ```

   Or use `npm start` for `node server.js`. The server listens on port `3000`; `PORT` exists in configuration but `server.js` currently hardcodes port `3000`.

`npm test` is currently a placeholder script that exits with an error; no test suite is configured by the package script.

## Current API scope

| API group | Implemented endpoints |
| --- | --- |
| User | Register, verify OTP, login, logout, logout from all sessions, refresh token, profile |
| Captain | Register, verify OTP |

Captain login validation rules exist in the source, but a Captain login route is **not implemented**.
