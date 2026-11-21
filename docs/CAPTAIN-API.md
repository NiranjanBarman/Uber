# Captain API

Base URL: `http://localhost:3000/api/captain`

Captain APIs are separate from User APIs. The only Captain endpoints currently mounted are registration and OTP verification. Captain login and protected Captain resource endpoints are **not implemented**.

All endpoints have no path or query parameters.

## `POST /register`

Creates a Captain, stores a registration OTP hash, and starts sending an OTP email.

**Authentication:** None  
**Headers:** `Content-Type: application/json`

### Request body

```json
{
  "fullName": {
    "firstname": "Aman",
    "lastname": "Sharma"
  },
  "email": "aman.sharma@example.com",
  "password": "Captain@123",
  "vehicle": {
    "color": "White",
    "plate": "DL01AB1234",
    "capcity": 4,
    "vihacleType": "car",
    "location": {
      "lat": 28.6139,
      "lng": 77.209
    }
  }
}
```

The field spellings `capcity` and `vihacleType` match the current Mongoose schema and validator.

### Validation

| Field | Rules |
| --- | --- |
| `fullName.firstname` | Required; trimmed; at least 3 characters |
| `fullName.lastname` | Optional/null; if provided, at least 3 characters |
| `email` | Required; valid email; normalized |
| `password` | Required; at least 6 characters; must include lowercase, uppercase, digit, and one of `@$!%*?&`; only the regex's listed characters are allowed |
| `vehicle.color` | Required; trimmed; at least 3 characters |
| `vehicle.plate` | Required; trimmed; at least 3 characters |
| `vehicle.capcity` | Required; numeric; at least 1 |
| `vehicle.vihacleType` | Required; one of `car`, `motorcycle`, `auto` (input is lowercased) |
| `vehicle.location.lat` | Optional/null; if provided, numeric and between -90 and 90 |
| `vehicle.location.lng` | Optional/null; if provided, numeric and between -180 and 180 |

Although the location coordinates are individually optional in validation, the controller directly reads `vehicle.location.lat` and `.lng`. Omitting the `vehicle.location` object can therefore cause an unhandled error; include it in requests.

The registration middleware rejects an already verified Captain with `409`. If an unverified Captain with the email exists, its OTP and account are deleted before continuing.

### Success — `201 Created`

The controller returns the full Mongoose Captain document. Since the Captain password field is not excluded from serialization, the returned `password` is the bcrypt hash, not the submitted plaintext password.

```json
{
  "message": "Captain Registered Successfully!",
  "captain": {
    "_id": "<captain-id>",
    "fullName": {
      "firstname": "Aman",
      "lastname": "Sharma"
    },
    "email": "aman.sharma@example.com",
    "password": "<bcrypt hash>",
    "soketId": null,
    "status": "inactive",
    "vehicle": {
      "color": "White",
      "plate": "DL01AB1234",
      "capcity": 4,
      "vihacleType": "car",
      "location": {
        "lat": 28.6139,
        "lng": 77.209
      }
    },
    "role": "captain",
    "verified": false,
    "__v": 0
  }
}
```

**Security note:** Returning a password hash is sensitive and should be fixed in the backend before production. This documentation reflects the current controller response.

### Errors

- `400 Bad Request` — validation failure.
- `409 Conflict` — verified Captain already exists or MongoDB reports a duplicate key:

  ```json
  { "message": "Captain Already Exist" }
  ```

- `409 Conflict` — a concurrent registration is still in progress:

  ```json
  { "message": "Registration is already in progress. Please try again." }
  ```

- `500 Internal Server Error` — unhandled database or controller error. The OTP email send is not awaited, so delivery success/failure is **not confirmed** before the `201` response.

## `POST /verify-otp`

Verifies the Captain's registration OTP, marks the Captain verified, creates a Captain session, and returns an access token.

**Authentication:** None  
**Headers:** `Content-Type: application/json`  
**Cookie:** On success, sets `refreshToken`; the cookie service configures `Path=/api/user`.

### Request body

```json
{
  "email": "aman.sharma@example.com",
  "otp": "123456"
}
```

### Validation

| Field | Rules |
| --- | --- |
| `email` | Required; valid email; normalized |
| `otp` | Exactly six digits |

### Success — `200 OK`

The controller returns the full Captain document, which currently includes the bcrypt password hash.

```json
{
  "message": "Captain Verified Successfully!",
  "captain": {
    "_id": "<captain-id>",
    "fullName": {
      "firstname": "Aman",
      "lastname": "Sharma"
    },
    "email": "aman.sharma@example.com",
    "password": "<bcrypt hash>",
    "role": "captain",
    "verified": true
  },
  "accessToken": "<JWT access token>"
}
```

Other fields from the Captain document may also be present. The access-token payload includes `userId`, `sessionId`, and `role`.

### Errors

- `400 Bad Request` — validation failure or the OTP refers to a Captain record that no longer exists:

  ```json
  { "message": "Invalid or Expired OTP!" }
  ```

- `401 Unauthorized` — OTP is missing from storage, invalid, expired, or does not match:

  ```json
  { "message": "Unauthorized Access!" }
  ```

- `500 Internal Server Error` — unhandled database or token-generation error.

## Not implemented

- Captain login route (although `captainLoginValid` and `comparePassword` exist)
- Captain access-token/session middleware
- Captain profile, logout, logout-all, or refresh-token routes
- Ride, trip, vehicle-management, and payment APIs
