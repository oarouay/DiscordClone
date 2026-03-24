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

- H2 in-memory DB
- JWT secret from `JWT_SECRET` env var (or safe local default)
- JWT expiration from `JWT_EXPIRATION_MS` (default 86400000 ms)

## Run

```powershell
./mvnw.cmd spring-boot:run
```

## Test

```powershell
./mvnw.cmd test
```

If Maven reports "No compiler is provided", install a JDK (Java 21) and set `JAVA_HOME`.

