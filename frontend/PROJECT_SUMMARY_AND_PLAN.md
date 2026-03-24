# DiscordClone Frontend - Summary and Plan

Date: March 22, 2026

## 1) Technologies Used

- Framework: Next.js (App Router) + React 19 + TypeScript
- Styling/UI: Tailwind CSS v4, custom global CSS design system, shadcn/Radix setup
- Icons and UX libraries: lucide-react, emoji-picker-react
- State management: React Context + custom hooks
- Realtime: WebSocket hook + WebRTC hook scaffold
- API/Auth: fetch wrapper in `lib/api.ts`, JWT token helpers in `lib/auth.ts`

Key files:
- `package.json`
- `app/layout.tsx`
- `app/globals.css`
- `context/AuthContext.tsx`
- `context/ThemeContext.tsx`
- `hooks/useWebSocket.ts`
- `hooks/useWebRTC.ts`
- `lib/api.ts`
- `lib/auth.ts`

## 2) Architecture Overview

### Routing/Layout Structure
- `app/(auth)` route group for auth pages (`/login`, `/register`)
- `app/(app)` route group for main app shell (guilds, channels, DMs)
- `app/invite/[code]` for invite flow

### Provider Layer
- `ThemeProvider` and `AuthProvider` are mounted at root in `app/layout.tsx`
- Auth and theme state are globally available through context hooks

### UI Composition
- Main shell: Guild sidebar + Channel/DM sidebar + Main content panel
- Chat and voice are split into modular components
- Shared user controls live in reusable components (e.g., user panel, theme toggle)

### Data/Domain Layer
- Type definitions are centralized in `types/index.ts`
- Mock data is centralized in `lib/mock.ts`
- API requests are centralized in `lib/api.ts`

## 3) Current Implementation Status (What You Need to Know)

- The project is currently **frontend-first** with **mock-first data**.
- Many important actions still use TODO placeholders and local state mutation instead of real backend integration.
- WebSocket and WebRTC are scaffolded, but backend signaling/integration is incomplete.
- Auth token handling is implemented, but auth fallback still uses mock user behavior in some cases.
- UI and layout are significantly developed and already resemble a Discord-like experience.

Examples of mock/TODO integration points:
- `app/(app)/channels/me/page.tsx`
- `app/(app)/guilds/[guildId]/[channelId]/page.tsx`
- `app/(app)/guilds/[guildId]/settings/page.tsx`
- `components/guild/InviteModal.tsx`
- `components/voice/VoiceChannel.tsx`
- `context/AuthContext.tsx`

## 4) What I Am Going To Do Next

1. Replace mock reads/writes with real backend API endpoints in chat, DM, guild settings, and invites.
2. Complete auth flow hardening:
   - remove mock fallback user behavior,
   - centralize unauthorized handling,
   - improve login/register error states.
3. Finalize realtime message flow:
   - standardize WS message protocol,
   - subscribe/unsubscribe by channel/DM,
   - reconcile optimistic UI with server ack/failure.
4. Complete voice signaling integration:
   - route WebRTC signaling through proper backend WS events,
   - manage join/leave/mute/deafen sync for all participants.
5. Improve data model consistency:
   - avoid direct mutation of imported mock objects,
   - normalize local state updates and IDs,
   - align frontend types with backend DTOs/contracts.
6. Add reliability checks:
   - loading/empty/error states across key screens,
   - route guards and edge cases,
   - basic test coverage for critical hooks/components.
7. Prepare production readiness:
   - environment variables validation,
   - remove remaining TODO/mock code paths,
   - update README with setup and architecture documentation.

## 5) Quick Priority Order

- Priority 1: Backend wiring for auth + messages + guild CRUD
- Priority 2: Realtime contract stabilization (WebSocket)
- Priority 3: Voice signaling completion (WebRTC)
- Priority 4: Testing + cleanup + documentation

## 6) Suggested Deliverable Milestones

- Milestone A: Real auth and message APIs fully connected
- Milestone B: Realtime text chat stable (multi-client)
- Milestone C: Voice channels stable (join/leave/signal)
- Milestone D: Production cleanup and release notes
