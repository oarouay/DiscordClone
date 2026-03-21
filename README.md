# Discord Clone - Setup & Development Guide

A Discord-like application built with **Next.js** (frontend) and **Spring Boot** (backend) with PostgreSQL database and JWT authentication.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([download](https://nodejs.org/))
- **Java JDK 21** ([Eclipse Temurin](https://adoptium.net/temurin/releases/?version=21))
- **PostgreSQL** 12+ ([download](https://www.postgresql.org/download/windows/))

### 1️⃣ Database Setup

**Install PostgreSQL** (if not already installed)
- Download from: https://www.postgresql.org/download/windows/
- During installation, remember the password you set for the `postgres` user
- Install with default settings (port 5432)

**Create Database**
```bash
# Open Command Prompt or PowerShell
psql -U postgres

# Enter your postgres password when prompted

# In psql, run:
CREATE DATABASE discord_clone;
\q

# Verify connection
psql -U postgres -d discord_clone -c "SELECT 1;"
```

### 2️⃣ Backend Setup & Run

```bash
cd backend

# Windows - set Java home
$env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"

# Build
.\mvnw clean package

# Run (starts on http://localhost:8081)
.\mvnw spring-boot:run
```

**✅ Backend running on** `http://localhost:8081/api`

### 3️⃣ Frontend Setup & Run

```bash
cd frontend

# Install dependencies
npm install

# Run dev server (starts on http://localhost:3000)
npm run dev
```

**✅ Frontend running on** `http://localhost:3000`

---

## 📝 Testing Authentication

### Register New User
Visit `http://localhost:3000/register`
- Username: any unique username
- Display Name: your name
- Email: any email
- Password: any password

You'll be redirected to `/channels/me` after successful registration.

### API Testing with curl

**Register:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "displayName": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Get Current User (requires token):**
```bash
curl -X GET http://localhost:8081/api/users/me \
  -H "Authorization: Bearer <TOKEN_FROM_LOGIN>"
```

---

## 🗄️ Database Configuration

Database credentials are in `backend/src/main/resources/application.yaml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/discord_clone
    username: postgres
    password: <your-postgres-password>
```

**⚠️ Important**: 
- Replace `<your-postgres-password>` with the password you set during PostgreSQL installation
- Change these credentials in production!

**Tables created automatically:**
- `users` - Stores user accounts, passwords (bcrypt), status, avatars

---

## 🔐 JWT Authentication

- **Token Storage**: Browser localStorage as `discord_clone_token`
- **Token Format**: Bearer token in `Authorization` header
- **Expiration**: 24 hours (configurable in `application.yaml`)
- **JWT Secret**: Change in production (`app.jwt.secret` in `application.yaml`)

---

## 🐛 Troubleshooting

### Backend won't start
**Error: "Port 8081 already in use"**
- Kill existing process: `netstat -ano | findstr :8081` then `taskkill /PID <pid> /F`
- Or use different port in `application.yaml`

**Error: "No compiler found" (JRE vs JDK)**
- Ensure you installed **JDK 21**, not JRE
- Verify: `javac -version` should show Java 21

**Error: "Cannot connect to database"**
- Verify PostgreSQL is running: `psql -U postgres`
- Check credentials in `application.yaml`
- Restart PostgreSQL service

### Frontend redirects to non-existent page
- This is fixed! After login/register, you redirect to `/channels/me`
- Ensure backend is running on port 8081
- Check browser console for API errors

### CORS errors
- Backend CORS is configured for `localhost:3000` and `localhost:3001`
- Update `SecurityConfig.java` if using different URL

---

## 📁 Project Structure

```
discord-clone/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/example/backend/
│   │   ├── entity/User.java         # User JPA entity
│   │   ├── controller/              # REST endpoints
│   │   ├── service/                 # Business logic
│   │   ├── security/                # JWT & Spring Security
│   │   └── config/                  # SecurityConfig
│   ├── src/main/resources/
│   │   └── application.yaml         # DB & JWT config
│   └── pom.xml                      # Maven dependencies
│
├── frontend/                        # Next.js React app
│   ├── app/
│   │   ├── (auth)/                 # Login/Register pages
│   │   ├── (app)/                  # Protected routes
│   │   └── [dynamic routes]
│   ├── components/                 # UI components
│   ├── context/AuthContext.tsx      # Auth state management
│   ├── lib/auth.ts                 # JWT token handling
│   ├── lib/api.ts                  # API client
│   └── package.json
│
└── README.md                        # This file
```

---

## 🔄 Development Workflow

### Adding New Auth Features

1. **Backend** - Add endpoint in `Controller`
2. **Service** - Add business logic in `Service`
3. **Database** - Update `User` entity if needed (hibernate auto-migrates)
4. **Frontend** - Add API call in `lib/api.ts`
5. **Context** - Update `AuthContext.tsx` if needed

### Database Changes

Tables are auto-created/updated by Hibernate. To force recreate:
- Set `ddl-auto: create-drop` in `application.yaml` (development only!)
- Restart backend

---

## 📦 Dependencies

### Backend
- Spring Boot 4.0.3
- Spring Security
- Spring Data JPA
- JWT (JJWT 0.12.3)
- PostgreSQL Driver
- BCrypt (password hashing)

### Frontend
- Next.js 14+
- React 18+
- TypeScript
- TailwindCSS

---

## 🔒 Security Notes

**Production Checklist:**
- [ ] Change `app.jwt.secret` to a strong random value
- [ ] Change database credentials
- [ ] Enable HTTPS
- [ ] Update CORS allowed origins
- [ ] Set `spring.jpa.hibernate.ddl-auto` to `validate`
- [ ] Add rate limiting
- [ ] Enable HTTP security headers

Generate secure JWT secret:
```bash
openssl rand -base64 32
```

---

## 🚢 Deployment

### Deploying Backend
```bash
# Build JAR
.\mvnw clean package

# Deploy JAR to server
java -jar backend-0.0.1-SNAPSHOT.jar
```

### Deploying Frontend
```bash
# Build Next.js
npm run build

# Deploy to Vercel, Netlify, or Node.js server
npm run start
```

---

## 📚 Additional Resources

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Guide](https://jwt.io/introduction)
- [Spring Security](https://spring.io/projects/spring-security)

---

## 📝 API Documentation

See [AUTH_SETUP.md](backend/AUTH_SETUP.md) for detailed API endpoints and testing.

---

## 💡 Next Steps

1. Add guild/channel management endpoints
2. Implement WebSocket for real-time messaging
3. Add file upload for avatars
4. Implement voice channels
5. Add rate limiting & security headers
6. Set up CI/CD pipeline

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review backend logs: `.\mvnw spring-boot:run` output
3. Check frontend console: `F12` > Console tab
4. Verify database connection: `psql -U postgres -d discord_clone`

---

**Happy coding! 🚀**
