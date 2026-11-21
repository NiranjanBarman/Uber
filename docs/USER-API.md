# User API

Base URL: `http://localhost:3000/api/user`

User and Captain endpoints are documented separately. User registration, OTP verification, and login are public. The profile endpoint uses an access token; logout, logout-all, and refresh use the refresh-token cookie.

All endpoints have no path or query parameters.

## `POST /register`

Creates an unverified User, stores an OTP hash, and sends an OTP email.

**Authentication:** None  
**Headers:** `Content-Type: application/json`

### Request body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Validation

| Field | Rules |
| --- | --- |
| `name` | Required; trimmed; 2–60 characters |
| `email` | Required; valid email; normalized |
| `password` | Required; minimum 8 characters; at least one uppercase letter and one digit |

The registration middleware rejects an already verified account with `409`. If the existing account is unverified, it deletes that account and its OTP before allowing a new registration.

### Success — `201 Created`

```json
{
  "message": "User Registered Successfully!",
  "user": {
    "_id": "<user-id>",
    "name": "John Doe",
    "email": "john@example.com",
    "verified": false
  }
}
```

### Errors

- `400 Bad Request` — validation failure; response uses the validation-error shape in [Error Codes](./ERROR-CODES.md#400-bad-request).
- `409 Conflict` — verified email already exists or a duplicate-key race is detected:

  ```json
  { "message": "User Already Exist" }
  ```

- `500 Internal Server Error` — an unhandled database or awaited email-service error.

## `POST /verify-otp`

Verifies the emailed OTP, marks the User verified, creates a session, and returns an access token.

**Authentication:** None  
**Headers:** `Content-Type: application/json`  
**Cookie:** On success, sets `refreshToken`.

### Request body

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Validation

| Field | Rules |
| --- | --- |
| `email` | Required; valid email; normalized |
| `otp` | Must be exactly six digits |

### Success — `200 OK`

```json
{
  "message": "OTP Verified Successfully!",
  "user": {
    "_id": "<user-id>",
    "name": "John Doe",
    "email": "john@example.com",
    "verified": true
  },
  "accessToken": "<JWT access token>"
}
```

The refresh cookie settings are listed in [API Overview](./API-OVERVIEW.md#refresh-token-cookie).

### Errors

- `400 Bad Request` — validation failure or an invalid, expired, or unmatched OTP:

  ```json
  { "message": "Invalid or Expired OTP!" }
  ```

- `500 Internal Server Error` — an unhandled database error.

## `POST /login`

Authenticates a verified User and creates a session.

**Authentication:** None  
**Headers:** `Content-Type: application/json`  
**Cookie:** On success, sets `refreshToken`.

### Request body

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

### Validation

| Field | Rules |
| --- | --- |
| `email` | Required; valid email; normalized |
| `password` | Required |

### Success — `200 OK`

```json
{
  "message": "Login Successfully!",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "accessToken": "<JWT access token>"
}
```

### Errors

- `400 Bad Request` — validation failure.
- `401 Unauthorized` — email not found or password does not match:

  ```json
  { "message": "Invalid Email or Password!" }
  ```

- `403 Forbidden` — account exists but is not verified:

  ```json
  { "message": "Email not verified." }
  ```

- `500 Internal Server Error` — an unhandled database or login-alert email error. The session and cookie may already have been created before a login-alert email failure.

## `GET /logout`

Revokes the session identified by the refresh-token cookie.

**Authentication:** Refresh-token cookie required  
**Headers:** `Cookie: refreshToken=<refresh-token>`

### Success — `200 OK`

```json
{
  "message": "Logout Successfully!"
}
```

### Errors

- `401 Unauthorized` — cookie is missing, JWT is invalid/expired, or no active session matches:

  ```json
  { "message": "Unauthorized Access! Please Login" }
  ```

- `500 Internal Server Error` — an unhandled database error.

The controller attempts to clear the cookie. Because the clear operation omits the cookie's configured `/api/user` path, successful browser-side removal is **not confirmed**.

## `GET /logout-all`

Revokes all active sessions associated with the User ID in the refresh token.

**Authentication:** Refresh-token cookie required  
**Headers:** `Cookie: refreshToken=<refresh-token>`

### Success — `200 OK`

```json
{
  "message": "Logout from all sessions successfully!"
}
```

### Errors

- `401 Unauthorized` — missing/invalid refresh token or no active matching session:

  ```json
  { "message": "Unauthorized Access! Please Login" }
  ```

- `500 Internal Server Error` — an unhandled database error.

## `GET /refresh-token`

Rotates the refresh token for the current session and returns a new access token.

**Authentication:** Refresh-token cookie required  
**Headers:** `Cookie: refreshToken=<refresh-token>`  
**Cookie:** On success, replaces `refreshToken`.

### Success — `200 OK`

```json
{
  "message": "Access Token Generated Successfully!",
  "accessToken": "<new JWT access token>"
}
```

### Errors

- `401 Unauthorized` — missing/invalid refresh token or no active matching session:

  ```json
  { "message": "Unauthorized Access! Please Login" }
  ```

- `500 Internal Server Error` — an unhandled database or token-generation error.

## `GET /profile`

Returns the authenticated User's profile fields.

**Authentication:** Access token in the `Authorization` header  
**Headers:** `Authorization: Bearer <access-token>`

### Success — `200 OK`

```json
{
  "message": "User Information Fetched Successfully!",
  "user": {
    "_id": "<user-id>",
    "name": "John Doe",
    "email": "john@example.com",
    "verified": true
  }
}
```

### Errors and implementation notes

- `401 Unauthorized` — no token segment is present or the User record is not found:

  ```json
  { "message": "Unauthorized Access!" }
  ```

- Invalid/expired JWT errors are passed to the global error handler and currently default to `500`.
- The middleware's session lookup is not awaited and does not check `revoked`; active-session enforcement is **not confirmed in code**.

## User account fields

The User schema stores `name`, `email`, a bcrypt-hashed password, `verified`, and `role` (default `user`). The password field is excluded from normal queries. The documented User responses return only the fields explicitly selected or constructed by the controllers.
