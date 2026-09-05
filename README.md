# 🗂️ Mini Kanban Board

A full-stack, multi-user Kanban board with board sharing, role-based access control, and real-time-feeling drag-and-drop task management — built for **Webbriks' Full-Stack Engineering Technical Assessment**.

> **Role:** Full-Stack Engineer &nbsp;•&nbsp; **Timeframe:** 4 Days &nbsp;•&nbsp; **Stack:** Next.js · Express · TypeScript · PostgreSQL · Prisma

🔗 **Live App:** `https://frontend-jade-nine-foi3gwpvmc.vercel.app/`
🔗 **Live API:** `https://kanban-backend-eta.vercel.app/`
📦 **Repository:** `https://github.com/mdyhakash/kanban_web_briks`

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Design (ERD)](#database-design-erd)
5. [Authentication & Access Control](#authentication--access-control)
6. [Task Ordering Algorithm](#task-ordering-algorithm)
7. [API Reference](#api-reference)
8. [Backend Deep Dive](#backend-deep-dive)
9. [Frontend Deep Dive](#frontend-deep-dive)
10. [Project Structure](#project-structure)
11. [Getting Started (Local Setup)](#getting-started-local-setup)
12. [Environment Variables](#environment-variables)
13. [Deployment](#deployment)
14. [Screenshots](#screenshots)
15. [Requirements Checklist](#requirements-checklist-from-the-assessment)
16. [Known Limitations & Next Steps](#known-limitations--next-steps)
17. [Challenges & What I Learned](#challenges--what-i-learned)

---

## Overview

This project implements the **Mini Kanban Board** brief from Webbriks: users register/log in, create boards, share them with other registered users, organize work into columns, and manage tasks with full drag-and-drop reordering — both within a column and across columns to a specific position — with conflict-free, stable ordering on the backend.

The backend is a modular Express + TypeScript REST API (controller → service → route → validation per feature), backed by PostgreSQL via Prisma. The frontend is a Next.js (App Router) client that talks to the API almost entirely through **Server Actions**, with a `dnd-kit`-powered board for drag-and-drop.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Drag & Drop | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma 7 (multi-file schema, `@prisma/adapter-pg` driver adapter) |
| Auth | JWT (access + refresh tokens) in `httpOnly` cookies |
| Validation | Zod |
| Deployment | Vercel (frontend as a standard Next.js app, backend as serverless functions via `vercel.json`) — **no Docker used** for this submission, despite it being listed as "preferable" |

## System Architecture
![System Workflow Digram](./public/system-workflow-diagram.png)


## Database Design (ERD)

Designed the schema myself around one core idea: a **Board** has **Members** (join table with a role), and everything else (`Column`, `Task`) hangs off the `Board` by ownership chain, so authorization can always be resolved back up to a single `boardId`.

![ER Digram](./public/erd.png)


## Authentication & Access Control

- **Registration/Login** (`auth.service.ts`): passwords hashed with `bcryptjs` before storage; login issues a short-lived **access token** (15 min) and a longer-lived **refresh token** (7 days), both signed with separate secrets.
- **Token delivery**: tokens are set as `httpOnly` cookies (`authCookies.ts`) so they're inaccessible to client-side JS (XSS-resistant), with `secure` + `sameSite: "none"` in production and `sameSite: "lax"` in development. The login response also returns the raw tokens in the JSON body for clients that want to use the `Authorization: Bearer` header instead.
- **`checkAuth` middleware**: reads the token from the cookie *or* an `Authorization: Bearer` header, verifies it, re-fetches the user from the DB, and attaches a minimal `req.user` object to the request.
- **`checkBoardAccess` middleware** — this is the core of the authorization model, and it's written as a configurable factory rather than one hardcoded function:
  - By default it resolves the board from `req.params.boardId` or `req.body.boardId`.
  - For nested resources (a column or a task doesn't carry a `boardId` in its URL), each route passes a custom `resolveBoardId(req)` function that walks the relationship up to the board (e.g. `taskService.getTaskBoardId(taskId)` → `task.column.boardId`).
  - It then checks for a `BoardMember` row for `(boardId, userId)` — no row, no access, regardless of whether the resource exists.
  - An optional `requireOwner: true` flag additionally checks `membership.role === "OWNER"`, used to gate destructive/administrative actions (rename/delete board, share board, remove a member).
- This means the **same middleware protects boards, columns, and tasks** — I didn't have to write separate authorization logic per resource type, just a resolver function per route.

## Task Ordering Algorithm

The trickiest requirement was: *reordering must stay stable, accurate, and conflict-free* when tasks move within or across columns.

Instead of storing an integer index per task and re-numbering every sibling on every move (which is `O(n)` writes and a race-condition minefield if two people drag at once), I store `position` as a **float** and always insert a new task/column **between its two neighbors' positions**:

```ts
// task.service.ts — moveTask
const before = siblings[index - 1];
const after  = siblings[index];

let position: number;
if (!before && !after) position = 1;                              // first item in an empty column
else if (!before)      position = after.position / 2;              // moving to the very top
else if (!after)       position = before.position + 1;             // moving to the very bottom
else                    position = (before.position + after.position) / 2; // between two tasks
```

- Moving a task is a **single-row update** (`columnId` + `position`) — no other row is touched.
- Cross-column moves are validated to ensure the destination column actually belongs to the same board as the task, so you can't drag a task into a column on a board you don't have access to.
- New tasks/columns are appended with `lastItem.position + 1`.
- **Trade-off (see [Known Limitations](#known-limitations--next-steps))**: because positions are floats being repeatedly halved, extremely long-lived boards with thousands of reorders into the same slot could theoretically hit floating-point precision limits — a periodic rebalance job would fix this in a real production system.

## API Reference

Base URL: `{BACKEND_API_URL}/api` — all endpoints return a consistent envelope: `{ success, statusCode, message, data, meta }` (see `sendResponse.ts`).

### Auth — `/auth`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `{ name, email, password }` | Creates a user (Zod-validated: 8+ char password with upper/lower/number/symbol) |
| POST | `/auth/login` | Public | `{ email, password }` | Verifies credentials, sets `accessToken` + `refreshToken` cookies, returns both tokens |
| POST | `/auth/refresh-token` | Refresh cookie | — | Issues a new access token from a valid refresh token |
| GET | `/auth/me` | Bearer/cookie | — | Returns the logged-in user's profile |
| POST | `/auth/logout` | Public | — | Clears both auth cookies |

### Boards — `/board`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/board` | Logged in | `{ title, description? }` | Creates a board; creator is auto-added as `OWNER` in `BoardMember` (done in one Prisma `$transaction`) |
| GET | `/board` | Logged in | — | Lists every board the user is a member of (owner or shared) |
| GET | `/board/:boardId` | Member | — | Full board with owner, members, and columns → tasks (ordered by `position`) |
| PATCH | `/board/:boardId` | Owner only | `{ title?, description? }` | Renames/updates a board |
| DELETE | `/board/:boardId` | Owner only | — | Deletes a board (cascades columns + tasks + memberships) |
| POST | `/board/:boardId/share` | Owner only | `{ email }` | Adds an existing registered user as a `MEMBER` by email |
| DELETE | `/board/:boardId/members/:memberId` | Owner only | — | Revokes a member's access (owner can't be removed) |

### Columns — `/column`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/column` | Member of `body.boardId` | `{ boardId, title }` | Creates a column, appended at the end |
| PATCH | `/column/:columnId` | Member (resolved via column → board) | `{ title }` | Renames a column |
| DELETE | `/column/:columnId` | Member (resolved via column → board) | — | Deletes a column (cascades its tasks) |

### Tasks — `/task`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/task` | Member (resolved via `columnId` → board) | `{ columnId, title, description? }` | Creates a task, appended at the end of the column |
| PATCH | `/task/:taskId` | Member (resolved via task → column → board) | `{ title?, description? }` | Edits a task |
| DELETE | `/task/:taskId` | Member (resolved via task → column → board) | — | Deletes a task |
| PATCH | `/task/:taskId/move` | Member (resolved via task → column → board) | `{ columnId, index }` | **Core drag-and-drop endpoint** — reorders within a column or moves across columns to a specific index |

## Backend Deep Dive

**Pattern per feature module** (`auth`, `board`, `column`, `task`): `*.route.ts` → `*.controller.ts` → `*.service.ts`, plus `*.validation.ts` (Zod schemas) and `*.interface.ts` (TS types). Routes wire up middleware + validation + controller; controllers only translate HTTP ↔ service calls; services hold all the Prisma/business logic. This keeps each file small and each layer independently testable.

**Utilities I built to keep the codebase DRY:**

- **`catchAsync.ts`** — wraps every async route handler so I never have to write a `try/catch` in a controller; any thrown error is forwarded straight to `next(error)` and lands in the global error handler.
- **`sendResponse.ts`** — a single generic function that shapes every success response the same way (`success`, `statusCode`, `message`, `data`, optional `meta`), so the frontend can rely on one response contract everywhere.
- **`jwt.ts`** (`jwtUtils`) — thin wrapper around `jsonwebtoken`'s `sign`/`verify` that returns a `{ success, data }` / `{ success: false, error }` result instead of throwing, so calling code can branch without another try/catch.
- **`authToken.ts`** (`createUserTokens`) — builds the access + refresh token pair from one JWT payload shape in one call, used by both `register`-then-login flows and plain login.
- **`authCookies.ts`** (`setAuthCookie` / `clearAuthCookie`) — centralizes cookie policy (`httpOnly`, `secure`, `sameSite`, `maxAge`) in one place so it's never duplicated or drifts between login/refresh/logout.
- **`validateRequest.ts`** — a middleware *factory*: pass it any Zod schema and it validates `req.body`, replaces it with the parsed/typed data, or throws a clean validation error — one line per route instead of manual `schema.parse()` calls in every controller.
- **`checkBoardAccess.ts`** — described above; the `resolveBoardId` option is what let me reuse one authorization middleware across boards, columns, and tasks instead of writing three versions.
- **`globalErrorHandler.ts`** — maps Prisma's error classes/codes to sensible HTTP responses instead of leaking raw Prisma errors: `P2002` (duplicate key) → 400, `P2003` (FK constraint) → 400, `P2025` (record not found) → 400, `P1000`/`P1001` (DB auth/connection failures) → 401/400. In development it also logs and returns the raw error + stack; in production it only returns a generic message.
- **`notFound.ts`** — catch-all 404 handler for any route that doesn't match.

## Frontend Deep Dive

- **App Router + Server Components for reads**: `app/board/[boardId]/page.tsx` is a Server Component that fetches the board, the current user, and the sidebar's board list *in parallel* (`Promise.all`) directly on the server, so the page renders with data already in hand — no client-side loading spinner for the initial load.
- **Server Actions for every write**: `lib/actions/boardAction.ts`, `columnAction.ts`, `taskAction.ts` are all `"use server"` functions, several wired directly to `<form action={...}>` via `useActionState` (e.g. create board, rename board, share board) so form pending/error state comes for free from React, with no client-side fetch/JSON boilerplate.
- **`authFetch<T>()`** (`services/auth-fetch.ts`) — a small server-only fetch wrapper that reads the `accessToken` cookie via `next/headers`, forwards it to the API as a `Cookie` header, and normalizes every response into a discriminated union (`{ success: true, data }` or `{ success: false, message }`) so calling code never has to check `res.ok` manually.
- **Route protection** (`proxy.ts`) — edge middleware that redirects unauthenticated users to `/login` and redirects already-logged-in users away from `/login`/`/register`, based purely on the presence of the `accessToken` cookie.
- **Drag-and-drop** (`components/kanban/board.tsx`) built with `@dnd-kit/core` + `@dnd-kit/sortable`:
  - `PointerSensor` with a 5px activation distance so clicks on a task card aren't mistaken for drags.
  - `closestCorners` collision detection for natural cross-column dropping.
  - On drop, the UI **optimistically** re-slices its local `columns` state into the new order *before* the server responds (so the card visually snaps into place instantly), then calls `moveTaskAction`. If the server call fails, it falls back to `router.refresh()` to re-sync with the real server state.
  - A `DragOverlay` renders the dragged card following the cursor independent of the underlying list re-render.

## Project Structure

```
backend/
├── prisma/
│   ├── schema/           # multi-file schema: user, board, column, task, enums
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── config/       # env config loader
│   │   ├── lib/          # prisma client (with pg driver adapter)
│   │   ├── middleware/   # checkAuth, checkBoardAccess, validateRequest, error handlers
│   │   ├── module/
│   │   │   ├── auth/     # route · controller · service · validation · interface
│   │   │   ├── board/
│   │   │   ├── column/
│   │   │   └── task/
│   │   └── utils/        # catchAsync, sendResponse, jwt, authToken, authCookies
│   ├── app.ts            # express app + route mounting
│   └── server.ts         # entrypoint, DB connect, listen
└── vercel.json

frontend/
├── app/
│   ├── (auth)/login, (auth)/register
│   ├── board/[boardId]/
│   └── page.tsx
├── components/
│   ├── kanban/           # board, column, task-card, add/edit dialogs
│   └── ui/               # shadcn primitives
├── lib/actions/          # server actions: board, column, task
├── services/             # authFetch, logoutAction
├── types/types.ts        # shared FE types (Board, Column, Task, User, BoardMember)
└── proxy.ts              # edge middleware / route guard
```

## Getting Started (Local Setup)

No Docker was used for this submission — everything runs against a normal local/hosted PostgreSQL instance.

### Prerequisites
- Node.js 18+
- A PostgreSQL database (local install or a hosted one, e.g. Neon/Supabase)

### 1. Clone & install
```bash
git clone [ADD YOUR GITHUB REPO URL]
cd [repo-folder]

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables
Copy the examples below into `backend/.env` and `frontend/.env.local` (see [Environment Variables](#environment-variables)).

### 3. Set up the database
```bash
cd backend
npx prisma migrate deploy   # applies existing migrations
npx prisma generate         # generates the Prisma client (also runs on postinstall)
```

### 4. Run both apps
```bash
# terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# terminal 2 — frontend (http://localhost:3000)
cd frontend
npm run dev
```

Visit **http://localhost:3000**, register a user, and start creating boards.

## Environment Variables

**`backend/.env`**
```bash
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://user:password@localhost:5432/kanban_db"

JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=10

BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

**`frontend/.env.local`**
```bash
BACKEND_API_URL=http://localhost:5000/api
```

## Deployment

Both apps are deployed to **Vercel** — the frontend as a standard Next.js deployment, and the backend as a serverless Node function (see `backend/vercel.json`, which routes all traffic to the built `dist/server.js`). No containerization was used; `DATABASE_URL` points at a hosted Postgres instance and `FRONTEND_URL`/`BACKEND_API_URL` are set as Vercel project environment variables for each app.

`[Expand this section with your exact deployed URLs, and note the hosted Postgres provider you used, e.g. Neon/Supabase/Railway.]`

## Screenshots

![Boards Details](./public/boardDetailspage.png)
![Boards Details](./public/reordering.gif)

## Requirements Checklist (from the assessment)

| Requirement | Status |
|---|---|
| User registration & login with token-based auth | ✅ JWT access + refresh tokens |
| Boards have an owner, sharable with other registered users | ✅ `Board.ownerId` + `BoardMember` |
| Access control — only members can view/mutate a board's resources | ✅ `checkBoardAccess` on every board/column/task route |
| Full CRUD for Boards, Columns, Tasks | ✅ |
| Task movement — reorder within a column | ✅ `PATCH /task/:taskId/move` |
| Task movement — move across columns to a specific index | ✅ same endpoint, validates same-board constraint |
| Stable, conflict-free ordering | ✅ float midpoint positioning, single-row updates |
| Interactive drag-and-drop frontend | ✅ `@dnd-kit` with optimistic updates |
| Single repo with frontend + backend | `[confirm folder layout in your final repo]` |
| README with setup instructions + sample env vars | ✅ this file |
| `docker-compose.yml` | ❌ not used — ran against a plain hosted/local Postgres instance instead |
| Live deployment link | ✅ / `[fill in URLs above]` |

## Known Limitations & Next Steps

Being upfront about what a longer timeline would let me improve:

- **No rate limiting** on `/auth/login` or `/auth/register`.
- **Float position rebalancing**: as noted above, positions are never re-normalized, so a pathological amount of repeated reordering into the same slot could theoretically approach floating-point precision limits — a background job to re-space positions as integers would close this gap.
- **No `docker-compose.yml`** was included, even though it was listed as "preferable" in the brief — I deployed directly instead; adding one would make local onboarding fully zero-config.
- **No pagination** on `GET /board` — fine for an assessment, but would need it for a user with hundreds of boards.

## Challenges & What I Learned

- **`@dnd-kit` was completely new to me.** This was my first time building drag-and-drop from scratch — learning the difference between `DndContext`, `useDroppable`, `SortableContext`, and how `DragOverlay` keeps the dragged card rendering smoothly independent of the underlying list re-render took real trial and error.
- **Drag-and-drop reordering itself was a first** — I'd never built a "reorder within a list + move across containers to a specific index" feature before. Figuring out `moveTask`'s position math (where to insert relative to `before`/`after` siblings, and when to just halve or add 1) was new territory and took a few iterations to get conflict-free.
- **`checkBoardAccess`'s `resolveBoardId` pattern took time to land on.** My first instinct was to write separate access-check logic for boards, columns, and tasks. Realizing I could pass in a custom resolver function per route (so a column or task route can trace its way back up to a `boardId`) — and reuse one middleware for all three resource types — took some back-and-forth before it clicked.
- **A real bug that cost me time:** removing a board member wasn't working because the frontend was sending the `BoardMember` row's own `id` in the delete request instead of the member's `userId` — and `removeBoardMember` looks up the membership by `(boardId, userId)`, not by the membership row's id. Took a bit of debugging to spot that mismatch and fix the frontend to send the correct identifier.
- **Another bug that cost me time:** The refresh-token flow wasn't working because the token payload used userId, while refreshToken() was trying to extract id. I traced the payload mismatch and fixed the backend to consistently use userId.


## Development Approach & AI Assistance

- Given the four-day assessment timeframe, I used AI assistance to accelerate the frontend UI implementation, particularly for initial UI scaffolding and styling with shadcn/ui. This allowed me to spend more of the limited development time on the core engineering requirements.
---

Built by **mdyhakash** ([@mdyhakash](https://github.com/mdyhakash))