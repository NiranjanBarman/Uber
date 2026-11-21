# API Overview

## Base URL

For local development, the server listens on:

```text
http://localhost:3000
```

| API group | Prefix |
| --- | --- |
| User | `/api/user` |
| Captain | `/api/captain` |

## Implemented endpoints

| Method | Path | API group | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/user/register` | User | None |
| `POST` | `/api/user/verify-otp` | User | None |
| `POST` | `/api/user/login` | User | None |
| `GET` | `/api/user/logout` | User | Refresh-token cookie |
| `GET` | `/api/user/logout-all` | User | Refresh-token cookie |
| `GET` | `/api/user/refresh-token` | User | Refresh-token cookie |
| `GET` | `/api/user/profile` | User | Access token in `Authorization` |
| `POST` | `/api/captain/register` | Captain | None |
| `POST` | `/api/captain/verify-otp` | Captain | None |

No path parameters or query parameters are used by these routes. Captain login, Captain profile, and ride-booking endpoints are **not implemented**.

## Request and response conventions

- JSON request bodies are parsed by Express. Send `Content-Type: application/json` for `POST` requests with a body.
- Current routes use only `POST` and `GET`.
- Successful response shapes vary by controller; there is no common success envelope.
- Validation errors use the shape shown below. Most direct controller errors return only a `message`; the global error handler returns `success` and `message`.

Validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

Controller error:

```json
{
  "message": "Invalid or Expired OTP!"
}
```

Unhandled error:

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

The unhandled-error message uses the thrown error's message when one is available.

## Request processing

For registration, OTP verification, and login, the route runs the corresponding `express-validator` chains, then `handleValidation`, then any route-specific middleware, and finally the controller. Unhandled async errors are passed to the global error middleware by Express 5.

## Authentication overview

### User routes

- Registration, OTP verification, and login are public.
- Logout, logout-all, and refresh-token require a valid refresh-token cookie linked to an active session.
- Profile expects an access token in the `Authorization` header, conventionally `Bearer <accessToken>`.
- The profile middleware currently attempts a session lookup without awaiting it and does not check the session's `revoked` state. See [Authentication](./AUTHENTICATION.md#access-token-validation).

### Captain routes

- Captain registration and OTP verification are public.
- Captain OTP verification returns an access token and sets the refresh-token cookie.
- Captain login and protected Captain routes are **not implemented**.

## Refresh-token cookie

The cookie service configures:

| Attribute | Current value |
| --- | --- |
| Name | `refreshToken` |
| `HttpOnly` | `true` |
| `Secure` | `true` in production; `false` otherwise |
| `SameSite` | `strict` in production; `lax` otherwise |
| `Path` | `/api/user` |
| Maximum age | 7 days |

The Captain OTP endpoint uses the same cookie service, so its cookie also has `Path=/api/user`, not `/api/captain`.

The clear-cookie operation does not pass the cookie's configured `Path`; browser removal of the `/api/user` cookie is therefore **not confirmed**.

## CORS

The app calls `cors()` with default options; credentials are not enabled in the CORS configuration. Cross-origin browser requests that rely on cookies may therefore require additional configuration that is **not implemented**.
