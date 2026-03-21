# Discord Clone - Complete Setup

This is a Discord-like application with:
- **Frontend**: Next.js + React + TypeScript
- **Backend**: Spring Boot 4.0.3 (Java 21)
- **Database**: PostgreSQL
- **Authentication**: JWT + BCrypt

---

## 📋 Pre-Setup Checklist

Before starting, ensure you have installed:
- ✅ Java JDK 21 (not JRE) - https://adoptium.net/temurin/releases/?version=21
- ✅ Node.js 18+ - https://nodejs.org
- ✅ PostgreSQL 12+ - https://www.postgresql.org/download/windows/

Verify installations:
```bash
java -version        # Should show Java 21
javac -version       # Should show Java 21
node -version        # Should show 18 or higher
psql --version       # Should show PostgreSQL 12+
```

---

## 🚀 Getting Started (5 Steps)

### Step 1: Set Up PostgreSQL

**Create Database**
```bash
psql -U postgres
# Enter your postgres password when prompted

CREATE DATABASE discord_clone;
\q
```

**Update Backend Config**
- Open: `backend/src/main/resources/application.yaml`
- Find: `password: postgres  # CHANGE THIS to your actual PostgreSQL password!`
- Change `postgres` to your actual password

**Verify Connection**
```bash
psql -U postgres -d discord_clone -c "SELECT 1;"
# Should return: 1 row
```

### Step 2: Build Backend

```bash
$env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"
cd backend
.\mvnw clean package
```

This downloads dependencies and builds the JAR (takes 2-5 minutes first time).

### Step 3: Run Backend

```bash
# In backend directory
.\mvnw spring-boot:run
```

**✅ Backend ready when you see**: `Started BackendApplication in X.XXX seconds`

Backend API: `http://localhost:8081/api`

### Step 4: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 5: Run Frontend

```bash
# In frontend directory
npm run dev
```

**✅ Frontend ready at**: `http://localhost:3000`

---

## 🧪 Test It Out

### In Browser
1. Go to `http://localhost:3000/register`
2. Create an account
3. Fill form and submit
4. Should redirect to `/channels/me` (logged in)

### With curl
```bash
# Register
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myuser",
    "displayName": "My User",
    "email": "me@example.com",
    "password": "MyPassword123"
  }'

# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"MyPassword123"}'

# Get current user (copy token from above)
curl -X GET http://localhost:8081/api/users/me \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 📚 Documentation

- **README.md** - Full setup & development guide
- **QUICKSTART.md** - Quick reference for common commands
- **backend/AUTH_SETUP.md** - Authentication system details

---

## 🔧 Common Commands

```bash
# Backend
cd backend
.\mvnw clean package              # Build
.\mvnw spring-boot:run            # Run
.\mvnw clean install              # Clean build

# Frontend
cd frontend
npm install                       # Install deps
npm run dev                       # Dev server
npm run build                     # Production build
npm run start                     # Start production

# Database
psql -U postgres                  # Connect to PostgreSQL
psql -U postgres -d discord_clone # Connect to app database
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 8081 in use** | `netstat -ano \| findstr :8081` then `taskkill /PID <id> /F` |
| **PostgreSQL won't connect** | Check: `psql -U postgres` and verify password in `application.yaml` |
| **"No compiler found"** | Ensure JDK (not JRE) installed and `$env:JAVA_HOME` set correctly |
| **Stuck on login** | Check browser console (F12) for API errors |
| **Database doesn't exist** | Run: `psql -U postgres` then `CREATE DATABASE discord_clone;` |
| **Port 3000 in use** | Change in `frontend/next.config.ts` or kill the process |

---

## 🔐 Security

**Before Production:**
- [ ] Change JWT secret in `application.yaml` (`app.jwt.secret`)
- [ ] Change database credentials
- [ ] Enable HTTPS
- [ ] Update CORS in `SecurityConfig.java`
- [ ] Set `hibernate.ddl-auto` to `validate`

---

## 📂 Project Layout

```
backend/
├── src/main/java/com/example/backend/
│   ├── BackendApplication.java
│   ├── controller/         # REST endpoints
│   ├── service/            # Business logic
│   ├── entity/             # User JPA entity
│   ├── repository/         # Database queries
│   ├── security/           # JWT + Spring Security
│   └── config/             # SecurityConfig
├── src/main/resources/
│   └── application.yaml    # Database & JWT config
└── pom.xml                 # Dependencies

frontend/
├── app/
│   ├── (auth)/            # Login/Register pages
│   └── (app)/             # Protected routes
├── components/            # UI components
├── context/
│   └── AuthContext.tsx    # Auth state
├── lib/
│   ├── api.ts             # API client (port 8081)
│   └── auth.ts            # JWT utilities
└── types/
    └── index.ts           # TypeScript types
```

---

## 🎯 Next Steps

1. **Customize UI**: Modify components in `frontend/components/`
2. **Add Features**: Implement guilds, channels, messaging
3. **Database**: Add more entities and API endpoints
4. **WebSocket**: Real-time updates (messaging, presence)
5. **Deployment**: Deploy to production server

---

## 🚀 Running on Different Ports

**Backend on port 8082:**
- Edit: `backend/src/main/resources/application.yaml`
- Change: `server: port: 8081` → `8082`
- Update: `frontend/lib/api.ts` BASE_URL

**Frontend on port 3001:**
- Run: `npm run dev -- -p 3001`

---

## 📞 Support

Check these files for detailed information:
- All issues: See README.md Troubleshooting section
- Auth details: See backend/AUTH_SETUP.md
- Quick commands: See QUICKSTART.md

---

**Everything is configured and ready to run!** Start with Step 1 above. 🎉
