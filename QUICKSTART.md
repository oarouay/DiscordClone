# Discord Clone - Quick Reference

## ⚡ Start Everything

**Before starting, make sure PostgreSQL is running!**

```bash
# Terminal 1: Start Backend
cd backend
$env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"
.\mvnw spring-boot:run

# Terminal 2: Start Frontend  
cd frontend
npm run dev
```

Then open: http://localhost:3000

---

## 🎯 First Time Setup (PostgreSQL)

### 1. Install Prerequisites
- Java JDK 21 → https://adoptium.net/temurin/releases/?version=21
- Node.js 18+ → https://nodejs.org
- PostgreSQL → https://www.postgresql.org/download/windows/

### 2. Ensure PostgreSQL is Running
```bash
# Check PostgreSQL service status
Get-Service postgresql*

# If stopped, start it:
# Go to Services (services.msc) and start "postgresql-x64-15" or similar
# OR via command line:
net start postgresql-x64-15
```

### 3. Build Backend
```bash
cd backend
$env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"
.\mvnw clean package
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
```

---

## 🔗 Connection Strings

| Service | URL | Login |
|---------|-----|-------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8081/api | - |
| Backend Health Check | http://localhost:8081/api/health | - |
| PostgreSQL | localhost:5432 | postgres / *your-password* |
| Database | discord_clone | - |

---

## 🧪 Quick Tests

```bash
# Test Backend
curl http://localhost:8081/api/health

# Test Frontend
curl http://localhost:3000

# Test Database
psql -U postgres -d discord_clone -c "SELECT 1;"
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/src/main/resources/application.yaml` | Database & JWT config |
| `frontend/lib/api.ts` | API base URL (port 8081) |
| `frontend/context/AuthContext.tsx` | Auth state management |
| `frontend/app/(auth)/login/page.tsx` | Login page |
| `frontend/app/(auth)/register/page.tsx` | Register page |

---

## 🔄 Common Commands

```bash
# Kill backend (if stuck on port 8081)
# Windows: Ctrl+C in terminal or
taskkill /F /IM java.exe

# Check PostgreSQL service
Get-Service postgresql*

# Start PostgreSQL service
net start postgresql-x64-15

# Stop PostgreSQL service
net stop postgresql-x64-15

# Frontend build
npm run build

# Frontend test
npm run test

# Backend rebuild
.\mvnw clean install

# Check if port is in use
netstat -ano | findstr :8081
```

---

## ❌ Common Issues

| Problem | Solution |
|---------|----------|
| Port 8081 in use | `taskkill /F /IM java.exe` |
| No PostgreSQL | Run `.\start-postgres.bat` |
| "Cannot find jdk" | Set `$env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"` |
| Token not saving | Check localStorage in DevTools (F12) |
| Stuck on login | Check browser console (F12) for errors |
| 404 on /channels/me | Backend not running - check http://localhost:8081/api/health |

---

## 🔑 Authentication Flow

```
User fills register form
        ↓
POST /api/auth/register
        ↓
Backend returns: {token, user}
        ↓
Frontend stores token in localStorage
        ↓
AuthContext updates with user
        ↓
Router redirects to /channels/me
        ↓
Layout checks auth & shows app
```

---

## 📊 Data Flow

```
Frontend → HTTP → Backend API (port 8081)
            ↓
        Spring Security
            ↓
        JWT Validation
            ↓
        Business Logic
            ↓
        JPA → PostgreSQL

Response: JSON with status code
```

---

## 🔐 JWT Token Location

```javascript
// Stored in browser:
localStorage.getItem("discord_clone_token")

// Sent in requests:
Authorization: Bearer <token>

// Token expires:
24 hours (configurable in application.yaml)
```

---

## 📝 Useful Documentation

- Full setup: See `README.md`
- Auth details: See `AUTH_SETUP.md`
- Changes made: See `CHANGES.md`
- Spring Boot docs: https://spring.io/guides
- Next.js docs: https://nextjs.org/docs
- PostgreSQL docs: https://www.postgresql.org/docs/

---

## 🆘 Getting Help

1. Check logs in running terminal
2. Check browser DevTools: Press F12
3. Check this quick reference
4. Review `README.md` or `AUTH_SETUP.md`
5. Check `CHANGES.md` for what's new

---

**Once setup is complete, just run the start commands above! 🚀**
