# DiscordClone Backend Auth

Spring Boot backend authentication API for the DiscordClone frontend contract.

## Implemented Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`

## Response Contracts

- Auth success (`register` and `login`):
  - `{ "token": "<jwt>", "user": { ... } }`
- Error response:
  - `{ "message": "Human-readable error" }`

The `user` payload includes:

- `id` (string, format: `u_<16 chars>`)
- `username`
- `displayName`
- `email`
- `status` (`online`, `idle`, `offline`)
- `avatarUrl` (optional, omitted when null)

## Local Configuration

Default settings in `src/main/resources/application.yaml`:

- Neon PostgreSQL DB
- JWT secret from `JWT_SECRET` env var (or safe local default)
- JWT expiration from `JWT_EXPIRATION_MS` (default 86400000 ms)

Database env vars:

- `DATABASE_URL` (JDBC URL)
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DM_ENCRYPTION_KEY` (at least 32 chars, used to encrypt DM content at rest)

## Run

```powershell
 $env:DATABASE_URL="jdbc:postgresql://ep-royal-frost-an0bni8o-pooler.c-6.us-east-1.aws.neon.tech:5432/neondb?sslmode=require&channelBinding=require"
 $env:DATABASE_USERNAME="neondb_owner"
 $env:DATABASE_PASSWORD="<your-neon-password>"
 $env:DM_ENCRYPTION_KEY="replace-with-your-32-char-minimum-key"
./mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

If `8080` is occupied on your machine, keep backend on `8081` and point frontend to:

```powershell
$env:NEXT_PUBLIC_API_URL="http://localhost:8081/api"
npm --prefix D:\DiscordClone\frontend run dev
```

## Test

```powershell
./mvnw.cmd test
```

If Maven reports "No compiler is provided", install a JDK (Java 21) and set `JAVA_HOME`.

