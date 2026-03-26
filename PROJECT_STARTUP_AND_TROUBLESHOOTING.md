# Project Startup and Troubleshooting Guide

Date: 2026-03-25  
Project: DiscordClone

## 1) Prerequisites
- Java 21 installed and available in terminal.
- Node.js and npm installed.
- Access to PostgreSQL credentials used by backend.

## 2) Start Backend (Spring Boot)
Open a terminal and run:

```powershell
Set-Location D:\DiscordClone\backend
$env:DATABASE_URL="jdbc:postgresql://ep-royal-frost-an0bni8o-pooler.c-6.us-east-1.aws.neon.tech:5432/neondb?sslmode=require&channelBinding=require"
$env:DATABASE_USERNAME="neondb_owner"
$env:DATABASE_PASSWORD="<your-neon-password>"
$env:DM_ENCRYPTION_KEY="replace-with-your-32-char-minimum-key"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

Expected:
- Backend listens on `http://localhost:8081`.
- APIs are under `http://localhost:8081/api`.

## 3) Start Frontend (Next.js)
Open a second terminal and run:

```powershell
Set-Location D:\DiscordClone\frontend
$env:NEXT_PUBLIC_API_URL="http://localhost:8081/api"
npm --prefix D:\DiscordClone\frontend run dev
```

Expected:
- Frontend available on `http://localhost:3000`.
- If 3000 is busy, Next will auto-pick another port (for example 3001).

## 4) Open in Browser
- Open the URL printed by Next.js terminal (usually `http://localhost:3000`).
- Register/login and use DM/friend features.

## 5) Quick Health Checks
- Backend test suite:

```powershell
Set-Location D:\DiscordClone\backend
.\mvnw.cmd test
```

- Frontend production build:

```powershell
Set-Location D:\DiscordClone\frontend
npm run build
```

## 6) Troubleshooting

### A) Frontend error: Unable to acquire lock at .next/dev/lock
Cause:
- Another `next dev` process is already running.

Fix:
1. Stop the old frontend terminal with `Ctrl + C`.
2. Start frontend again:

```powershell
Set-Location D:\DiscordClone\frontend
$env:NEXT_PUBLIC_API_URL="http://localhost:8081/api"
npm --prefix D:\DiscordClone\frontend run dev
```

### B) Frontend starts on 3001 instead of 3000
Cause:
- Port 3000 is already in use.

Fix:
- Open the URL printed by Next.js (for example `http://localhost:3001`).
- Or stop the process using 3000 and restart frontend.

### C) Backend Maven run exits with code 1
Common causes:
- Backend process already running.
- Port conflict.
- Incorrect/missing environment variables.

Fix:
1. Ensure only one backend instance is running.
2. Keep backend on 8081 for local runs.
3. Re-run with required env vars:

```powershell
Set-Location D:\DiscordClone\backend
$env:DATABASE_URL="..."
$env:DATABASE_USERNAME="..."
$env:DATABASE_PASSWORD="..."
$env:DM_ENCRYPTION_KEY="replace-with-your-32-char-minimum-key"
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

### D) WebSocket error in browser console: [WebSocket] Error: {}
Cause:
- Generic browser WS error event.
- Usually backend URL/port mismatch or backend not running.

Fix:
1. Confirm backend is running on 8081.
2. Confirm frontend uses:
   - `NEXT_PUBLIC_API_URL=http://localhost:8081/api`
3. Restart frontend after setting env var.

### E) API response: {"message":"Unauthorized"}
Meaning:
- Endpoint is protected and token is missing/expired/invalid.

Fix:
1. Login/register first.
2. Retry request with valid Bearer token.

### F) DM encryption key issues
Cause:
- `DM_ENCRYPTION_KEY` missing or too short.

Fix:
- Set `DM_ENCRYPTION_KEY` to at least 32 characters before starting backend.
- Keep this key stable; changing it later prevents decrypting old stored DM rows.

## 7) Recommended Startup Order
1. Start backend first.
2. Start frontend second.
3. Open browser and test auth, friend requests, and DMs.

## 8) Browser Test Guide (Realtime DM)

### A) Open two independent sessions
1. Open normal browser window at `http://localhost:3000`.
2. Open an incognito/private window at the same URL.

### B) Login with two different users
1. In normal window: login/register as User A.
2. In private window: login/register as User B.

### C) Verify friend request flow
1. User A searches User B in DM friends panel and sends request.
2. User B sees incoming request and clicks Accept.
3. Both windows should now show each other in DM conversation list.

### D) Verify realtime message delivery (no refresh)
1. Keep both windows on the same DM conversation.
2. User A sends a message.
3. Expected immediately (without refresh):
   - User A sees sent message appear.
   - User B receives message instantly.
4. User B replies and confirm User A gets it instantly.

### E) Verify persistence
1. Refresh one window.
2. DM history should still be present (loaded from backend API).

### F) If realtime still fails
1. Confirm backend is up on `8081`.
2. Confirm frontend was started with:
   - `NEXT_PUBLIC_API_URL=http://localhost:8081/api`
3. Restart frontend and backend once, then repeat section D.
