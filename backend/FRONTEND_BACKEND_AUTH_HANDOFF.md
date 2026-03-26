# Frontend Handoff: Backend Auth Integration

Date: 2026-03-24
Project: DiscordClone
Backend base URL: `http://localhost:8081/api` (local default, or your deployed API URL)

## Checklist
- [x] Auth endpoints are implemented
- [x] JWT bearer auth is enforced for protected routes
- [x] Error shape matches `{ "message": "..." }`
- [x] Contract status codes are in place (`200/201`, `401`, `409`)
- [x] Backend is connected to Neon PostgreSQL (not H2)

## What Was Implemented

### 1) Register
- Endpoint: `POST /api/auth/register`
- Request body:

```json
{
  "username": "john",
  "displayName": "John Doe",
  "email": "user@example.com",
  "password": "plain-password"
}
```

- Success: `201 Created`
- Response shape:

```json
{
  "token": "<jwt>",
  "user": {
    "id": "u_123...",
    "username": "john",
    "displayName": "John Doe",
    "email": "user@example.com",
    "status": "online"
  }
}
```

- Duplicate behavior:
  - Duplicate email -> `409` with `{ "message": "Email already exists" }`
  - Duplicate username -> `409` with `{ "message": "Username already exists" }`

### 2) Login
- Endpoint: `POST /api/auth/login`
- Request body:

```json
{
  "email": "user@example.com",
  "password": "plain-password"
}
```

- Success: `200 OK`
- Response shape: same as register (`token` + `user`)
- Invalid credentials (including unknown email): `401` with:

```json
{ "message": "Invalid credentials" }
```

### 3) Current User
- Endpoint: `GET /api/users/me`
- Header required:

```http
Authorization: Bearer <jwt>
```

- Success: `200 OK`

```json
{
  "id": "u_123...",
  "username": "john",
  "displayName": "John Doe",
  "email": "user@example.com",
  "status": "online"
}
```

- Missing/invalid/expired token -> `401` with:

```json
{ "message": "Unauthorized" }
```

## User DTO Notes (Frontend Contract)

Returned `user` fields:
- `id: string`
- `username: string`
- `displayName: string`
- `email: string`
- `status: "online" | "idle" | "offline"`
- `avatarUrl?: string` (optional, omitted when null)

Current behavior:
- New users are created with `status: "online"`
- `avatarUrl` is optional and may be omitted

## JWT Notes
- Backend returns a standard JWT (`header.payload.signature`)
- JWT includes `exp` claim (Unix seconds)
- Frontend expiration logic using `exp * 1000 < Date.now()` is compatible

## Error Handling Contract
For API errors, backend returns:

```json
{ "message": "Human-readable error" }
```

Expected key cases:
- `400` -> validation errors
- `401` -> unauthenticated/invalid credentials/invalid token
- `409` -> conflicts (duplicate email/username)

## Database / Persistence Update
- Backend moved from H2 in-memory DB to Neon PostgreSQL
- Data is now persistent (not reset each restart like H2 mem mode)

## Smoke-Tested Behaviors (Validated)
The following flows were manually verified:
- Register returns `201` + token + user
- Login returns `200` + token + user
- `/users/me` with bearer token returns `200`
- `/users/me` without token returns `401`
- Duplicate register returns `409`
- Invalid login returns `401`

## Frontend Integration Tips
- Keep API base URL under `/api`
- Send `Authorization: Bearer <token>` for protected requests
- On `401`, clear local token and redirect to `/login`
- Parse `message` from non-2xx JSON responses

## Quick Curl Samples

```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","displayName":"John Doe","email":"user@example.com","password":"password123"}'

curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

curl http://localhost:8081/api/users/me \
  -H "Authorization: Bearer <jwt>"
```

