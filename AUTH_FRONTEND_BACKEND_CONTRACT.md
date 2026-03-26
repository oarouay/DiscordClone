# Frontend Auth Contract (Backend Handoff)

Date: 2026-03-24  
Project: DiscordClone

## Goal
This document describes exactly what the current frontend expects from the backend authentication layer.

## Base API URL
The frontend calls:
- `process.env.NEXT_PUBLIC_API_URL`
- local default (current team setup): `http://localhost:8081/api`
- optional fallback: `http://localhost:8080/api`

So all endpoints below are expected under `/api`.

---

## Endpoints Required

### 1) Login
**Endpoint**: `POST /api/auth/login`

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "plain-password"
}
```

**Success Response** (`200`)
```json
{
  "token": "<jwt>",
  "user": {
    "id": "u_123",
    "username": "john",
    "displayName": "John Doe",
    "email": "user@example.com",
    "status": "online",
    "avatarUrl": "https://...optional..."
  }
}
```

---

### 2) Register
**Endpoint**: `POST /api/auth/register`

**Request Body**
```json
{
  "username": "john",
  "displayName": "John Doe",
  "email": "user@example.com",
  "password": "plain-password"
}
```

**Success Response** (`200` or `201`)
```json
{
  "token": "<jwt>",
  "user": {
    "id": "u_123",
    "username": "john",
    "displayName": "John Doe",
    "email": "user@example.com",
    "status": "online",
    "avatarUrl": "https://...optional..."
  }
}
```

---

### 3) Current User
**Endpoint**: `GET /api/users/me`

**Headers**
- `Authorization: Bearer <jwt>`

**Success Response** (`200`)
```json
{
  "id": "u_123",
  "username": "john",
  "displayName": "John Doe",
  "email": "user@example.com",
  "status": "online",
  "avatarUrl": "https://...optional..."
}
```

---

## User DTO Contract
The frontend `User` type is:

```ts
type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  status: "online" | "idle" | "offline";
  avatarUrl?: string;
};
```

### Important
- Keep `status` exactly one of: `online`, `idle`, `offline`
- `avatarUrl` is optional

---

## JWT Requirements
Frontend token logic expects:
1. JWT string format (`header.payload.signature`)
2. `exp` claim in payload (Unix seconds)
3. `exp * 1000 < Date.now()` means expired

If token is missing, malformed, or expired, frontend clears token and considers user unauthenticated.

---

## Error Handling Contract
For non-2xx responses, frontend tries to parse JSON and read:

```json
{ "message": "Some error text" }
```

### Recommended error behavior
- `400`: validation errors (bad email/password format, etc.)
- `401`: invalid credentials / invalid token / expired token
- `409`: email or username already exists (register)

### Critical frontend behavior on `401`
Any `401` from API request causes frontend to:
1. clear local token
2. redirect to `/login`

So only return `401` when session should be treated as unauthenticated.

---

## Frontend Auth Lifecycle (for backend awareness)
1. App starts
2. Frontend reads token from localStorage (`discord_clone_token`)
3. Frontend decodes JWT and checks `exp`
4. If valid, frontend calls `GET /api/users/me`
5. If `/users/me` succeeds, user is authenticated
6. If `/users/me` fails with `401`, user is logged out client-side

---

## Route Expectations
- Auth pages: `/login`, `/register`
- Protected app area redirects to `/login` when user is not authenticated
- Root `/` redirects:
  - authenticated -> `/channels/me`
  - unauthenticated -> `/login`

---

## Notes / Current Frontend Temporary Behavior
There is still a temporary mock fallback in auth context during backend transition. Once backend auth is fully live, this fallback should be removed to enforce strict real-auth behavior.

---

## Suggested Backend Response DTOs

### AuthResponse
```json
{
  "token": "<jwt>",
  "user": { ...User }
}
```

### ErrorResponse
```json
{
  "message": "Human-readable error"
}
```

---

## Quick Checklist for Backend Dev
- [ ] Implement `POST /api/auth/login`
- [ ] Implement `POST /api/auth/register`
- [ ] Implement `GET /api/users/me`
- [ ] Return JWT with `exp`
- [ ] Accept `Authorization: Bearer <token>`
- [ ] Return `401` on invalid/expired token
- [ ] Return `{ "message": "..." }` for errors
- [ ] Return `user` fields matching frontend type exactly
