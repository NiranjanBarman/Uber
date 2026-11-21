# Error Codes

This table lists status codes used by the mounted User and Captain controllers/middleware and the global error handler. Successful response bodies vary by endpoint; see [User API](./USER-API.md) and [Captain API](./CAPTAIN-API.md).

| HTTP status | Where it occurs | Actual response / meaning |
| --- | --- | --- |
| `200 OK` | User login, OTP verification, logout, logout-all, refresh-token, and profile; Captain OTP verification | Request completed. Response shapes are endpoint-specific. |
| `201 Created` | User and Captain registration | Account created; registration response differs between User and Captain. |
| `400 Bad Request` | `handleValidation` on all validated POST routes | `{ "success": false, "message": "Validation failed", "errors": [{ "field": "...", "message": "..." }] }` |
| `400 Bad Request` | User OTP verification | `{ "message": "Invalid or Expired OTP!" }` for unmatched/expired OTP or missing User record. |
| `400 Bad Request` | Captain OTP verification | `{ "message": "Invalid or Expired OTP!" }` if OTP exists but the Captain record is absent. |
| `401 Unauthorized` | User login | `{ "message": "Invalid Email or Password!" }` when the email is not found or password does not match. |
| `401 Unauthorized` | User refresh-cookie middleware | `{ "message": "Unauthorized Access! Please Login" }` when the cookie is missing, JWT invalid/expired, or no active session matches. |
| `401 Unauthorized` | User profile middleware | `{ "message": "Unauthorized Access!" }` when no token segment is present. The middleware's session lookup is not awaited, so active-session validation is not confirmed. |
| `401 Unauthorized` | User profile controller | `{ "message": "Unauthorized Access!" }` when the decoded User ID does not identify a User. |
| `401 Unauthorized` | Captain OTP verification | `{ "message": "Unauthorized Access!" }` when a matching, unexpired OTP record is not found. |
| `403 Forbidden` | User login | `{ "message": "Email not verified." }` when the account exists but is not verified. |
| `409 Conflict` | User registration | `{ "message": "User Already Exist" }` for an already verified account or duplicate-key race. An unverified account is deleted and re-registration continues. |
| `409 Conflict` | Captain registration | `{ "message": "Captain Already Exist" }` for an already verified Captain or duplicate-key race. An unverified Captain is deleted and re-registration continues. |
| `409 Conflict` | User/Captain registration middleware | `{ "message": "Registration is already in progress. Please try again." }` when a concurrent registration leaves another unverified account in place. |
| `500 Internal Server Error` | Global error middleware | `{ "success": false, "message": "<error message or Internal Server Error>" }` for errors without an explicit `statusCode`. |
| `404 Not Found` | No matching Express route | The app does not define a custom 404 JSON handler; Express default not-found behavior applies. |

## Important status-code caveats

- Invalid or expired access-token verification errors in the User profile middleware are not converted to `401`; they are forwarded to the global error handler and currently default to `500`.
- Mongoose validation, connection, and other unhandled errors have no explicit status mapping in the global error middleware and therefore normally become `500`.
- Captain OTP email sending is not awaited by the registration controller, so email-delivery errors are not represented by a reliable API response.
- Cookie clearing omits the configured cookie path. The endpoint may return success even though the browser does not remove the `/api/user` cookie.
