# Discord Clone

A real-time chat application inspired by Discord, built with a Spring Boot backend and Next.js frontend.

## Tech Stack

- **Backend:** Spring Boot 3, Hibernate 7, PostgreSQL, WebSocket (STOMP)
- **Frontend:** Next.js 16 (App Router, Turbopack), React 19
- **Auth:** JWT-based authentication

## Features

- Guild/server creation with auto-generated default channel
- Real-time messaging in guild channels and DMs
- Friend system (send, accept, decline, remove)
- Encrypted direct messages
- Member roles (Owner, Admin, Moderator, Member)

## Prerequisites

- Java 21+
- Node.js 20+
- PostgreSQL running on `localhost:5432`

## Setup

### Backend

```bash
cd backend
# Create a PostgreSQL database called "discord"
createdb discord

# Configure DB credentials in src/main/resources/application.properties
# Default: spring.datasource.url=jdbc:postgresql://localhost:5432/discord
#          spring.datasource.username=postgres
#          spring.datasource.password=postgres

./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── backend/
│   └── src/main/java/com/example/backend/
│       ├── auth/          # JWT security, filters, user principal
│       ├── dm/            # Direct messages (encrypted)
│       ├── friend/        # Friend requests, friendships
│       ├── guild/         # Guilds, channels, members, roles
│       ├── user/          # User registration, profiles
│       ├── message/       # Guild messages
│       └── websocket/     # STOMP WebSocket config
└── frontend/
    └── src/
        ├── app/           # Next.js App Router pages
        ├── components/    # React components
        ├── context/       # Auth, DM contexts
        ├── hooks/         # WebSocket hooks
        ├── lib/           # API client, types
        └── types/         # TypeScript interfaces
