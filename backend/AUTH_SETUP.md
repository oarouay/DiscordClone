# Discord Clone - Auth System Setup Guide

## Backend Setup (Spring Boot)

### Dependencies Added
- Spring Boot Security
- JWT (jjwt)
- Spring Data JPA
- PostgreSQL Driver

### Database Setup

#### Prerequisites
- PostgreSQL 12+ installed and running on your system
- Download: https://www.postgresql.org/download/windows/

#### Installation Steps

1. **Download PostgreSQL Installer**
   - Go to https://www.postgresql.org/download/windows/
   - Download the latest version (15.x or higher)

2. **Install PostgreSQL**
   - Run the installer
   - Set postgres user password (remember this!)
   - Keep default settings (port 5432)
   - Complete installation

3. **Create Database**
   ```bash
   psql -U postgres
   # Enter password when prompted
   ```
   
   Then in psql:
   ```sql
   CREATE DATABASE discord_clone;
   \q
   ```

4. **Verify Installation**
   ```bash
   psql -U postgres -d discord_clone -c "SELECT 1;"
   # Should return (1 row)
   ```

The database connection is configured in `application.yaml`:
- **URL**: `jdbc:postgresql://localhost:5432/discord_clone`
- **Username**: `postgres`
- **Password**: *your postgres password* (set during installation)

**IMPORTANT: Update `application.yaml` with your PostgreSQL password:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/discord_clone
    username: postgres
    password: your-actual-postgres-password-here
```

Change the database URL and credentials in `application.yaml` for production.
1. **User Entity** - Persists user data with JPA to PostgreSQL
2. **Automatic Migrations** - Tables created automatically by Hibernate
3. **Authentication Endpoints**
   - `POST /api/auth/login` - Login with email & password
   - `POST /api/auth/register` - Register new user
4. **User Endpoints**
   - `GET /api/users/me` - Get current authenticated user
   - `GET /api/users/{id}` - Get user by ID
5. **JWT Security**
   - JWT token generation and validation
   - Bearer token authentication
   - CORS configured for frontend (localhost:3000 & localhost:3001)
6. **Password Encoding** - BCrypt hashing

### Running the Backend

1. **Ensure PostgreSQL is running**
   - Check: `psql -U postgres`
   - If not running, start via Services (Windows) or terminal

2. **Build the project**
   ```bash
   cd backend
   .\mvnw clean package
   ```

3. **Run the application**
   ```bash
   $env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"
   .\mvnw spring-boot:run
   ```
   Or just:
   ```bash
   cd backend
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```

The backend will start on `http://localhost:8081`

### Environment Variables (optional)
Set in `application.yaml`:
- `app.jwt.secret` - JWT signing key (change in production!)
- `app.jwt.expiration` - Token expiration time in milliseconds (default: 24 hours)

---

## Frontend Configuration

### API Integration
The frontend is already configured with:
- Base URL: `http://localhost:8081/api`
- JWT stored in localStorage as `discord_clone_token`
- Bearer token sent in Authorization header

### Current Setup
1. Login page accepts email & password
2. Register page accepts username, displayName, email & password
3. Auth context manages token and user state
4. Protected routes require authentication

---

## Testing the Auth System

### Prerequisites for Testing
- PostgreSQL running with `discord_clone` database
- Backend running on `http://localhost:8081`

### Test Workflow

**Step 1: Register a new user**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "displayName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "displayName": "John Doe",
    "email": "john@example.com",
    "status": "offline",
    "avatarUrl": null
  }
}
```

**Step 2: Save the token** (shell/PowerShell)
```bash
# Bash/Linux
TOKEN="eyJhbGciOiJIUzI1NiJ9..."

# PowerShell
$TOKEN="eyJhbGciOiJIUzI1NiJ9..."
```

**Step 3: Login with credentials**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

**Step 4: Get current authenticated user**
```bash
curl -X GET http://localhost:8081/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "displayName": "John Doe",
  "email": "john@example.com",
  "status": "offline",
  "avatarUrl": null
}
```

### Error Responses

**Invalid Email/Password:**
```
HTTP 401 Unauthorized
{
  "message": "Invalid password"
}
```

**Email Already Registered:**
```
HTTP 400 Bad Request
{
  "message": "Email already registered"
}
```

**Missing Token:**
```
HTTP 401 Unauthorized
{
  "message": "Unauthorized",
  "details": "Full authentication is required..."
}
```

### Browser Testing

1. Open `http://localhost:3000/register`
2. Fill in registration form
3. Click "Create Account"
4. You'll be automatically logged in and redirected to `/channels/me`
5. Token is stored in localStorage as `discord_clone_token`

---

## Matching Frontend & Backend

### Response Format
Both auth endpoints return the same format the frontend expects:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "username": "testuser",
    "displayName": "Test User",
    "email": "test@example.com",
    "status": "offline",
    "avatarUrl": null
  }
}
```

### Error Handling
The API returns appropriate HTTP status codes and error messages:

| Scenario | Status | Response |
|----------|--------|----------|
| Login success | 200 | `{token, user}` |
| Login failed | 401 | `{message: "Invalid password"}` |
| Registration success | 201 | `{token, user}` |
| Email exists | 400 | `{message: "Email already registered"}` |
| User not found | 404 | `{message: "User not found"}` |
| Unauthorized access | 401 | `{message: "Unauthorized"}` |

---

## Troubleshooting

### Backend Issues

**Port 8081 already in use**
```bash
# Find process using port
netstat -ano | findstr :8081

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port in application.yaml
server:
  port: 8082
```

**PostgreSQL connection refused**
```
ERROR: The postmaster has shut down
```
Solutions:
- Ensure PostgreSQL is running: `psql -U postgres`
- Check credentials in `application.yaml`
- Verify database exists: `psql -l` should show `discord_clone`

**Hibernate error: "No appropriate protocol"**
- Update JDBC URL to use `jdbc:postgresql://` (not `jdbc:mysql://`)
- Verify PostgreSQL driver is in pom.xml

### Frontend Issues

**"Redirected to non-existent page"**
- Verify backend is running: `curl http://localhost:8081/api/health`
- Check browser console for API errors (F12 > Console)
- Ensure token is being saved in localStorage

**Stuck on login page after registration**
- Check DevTools Console for API errors
- Verify backend responded with token and user
- Check if `/channels/me` page exists in frontend

**CORS errors**
- Backend logs should show: "Allowing CORS for localhost:3000"
- Update `SecurityConfig.java` if using different frontend URL

### Database Issues

**"database discord_clone does not exist"**
```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE discord_clone;

-- Verify
\l
-- Should show discord_clone in list
```

**"password authentication failed"**
- Check credentials in `application.yaml`
- Ensure PostgreSQL user `postgres` has password set

---

## Security Notes

⚠️ **Important**: The JWT secret in `application.yaml` is a placeholder. Change it to a strong, random value in production!

Example:
```bash
openssl rand -base64 32
```

---

## All Generated Files

### Entities
- `src/main/java/com/example/backend/entity/User.java`

### DTOs
- `src/main/java/com/example/backend/dto/LoginRequest.java`
- `src/main/java/com/example/backend/dto/RegisterRequest.java`
- `src/main/java/com/example/backend/dto/UserResponse.java`
- `src/main/java/com/example/backend/dto/AuthResponse.java`

### Repositories
- `src/main/java/com/example/backend/repository/UserRepository.java`

### Services
- `src/main/java/com/example/backend/service/AuthService.java`
- `src/main/java/com/example/backend/service/UserService.java`

### Controllers
- `src/main/java/com/example/backend/controller/AuthController.java`
- `src/main/java/com/example/backend/controller/UserController.java`

### Security
- `src/main/java/com/example/backend/security/JwtUtil.java`
- `src/main/java/com/example/backend/security/JwtAuthenticationFilter.java`
- `src/main/java/com/example/backend/security/JwtAuthenticationEntryPoint.java`

### Configuration
- `src/main/java/com/example/backend/config/SecurityConfig.java`

### Resources
- `src/main/resources/application.yaml` - Updated with DB & JWT config
