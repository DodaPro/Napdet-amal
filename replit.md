# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is a micro-donation charity platform called "نبضة أمل" (Pulse of Hope) — a platform for funding urgent medical operations via micro-donations (buying shares of a target amount in EGP).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Wouter (routing)

## Artifacts

- **charity-web** (`artifacts/charity-web/`) — Main Arabic RTL web app at `/`
- **api-server** (`artifacts/api-server/`) — Express API server at `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

- **cases** — Medical cases with target/collected amounts, shares, urgency level, status (active/funded/closed)
- **donations** — Donations linked to cases (donor, shares, amount, fees, anonymous)
- **votes** — Community votes on extra expenses per case (yes/no counts, open/closed)
- **users** — Platform users with roles: super_admin, sub_admin, moderator, donor

## UI/UX Design

- Language: Arabic (RTL, `dir="rtl"`)
- Currency: جنيه (EGP)
- Color palette: Deep Trust Blue (primary), Emerald Green (secondary/success), White background
- Font: Tajawal (Arabic-first)
- No emojis in the UI

## Authentication & Authorization

- **Firebase Auth** — Email/password sign-in and registration
- **Firestore** — User profiles, notifications, pending cases/donations, messages, news
- **Firebase Storage** — Donation payment screenshots
- **Roles**: `super_admin`, `admin`, `moderator`, `donor`
- Super admin email: `mahmoudalgdawy@gmail.com` (auto-assigned on registration)
- `ProtectedRoute` component guards admin pages (redirects to `/login` if unauthenticated or insufficient role)
- Auth context: `src/contexts/AuthContext.tsx` (AuthProvider + useAuth hook)

## Firebase Firestore Collections

- `users` — User profiles with roles
- `notifications` — Admin notification feed (case submissions, pending donations)
- `pending_cases` — Case submissions awaiting admin approval
- `pending_donations` — Donation screenshots awaiting admin verification
- `messages` — Community board messages per case
- `news` — Platform news/announcements

## Pages

- `/` — الرئيسية: Hero + Active Case Cards grid
- `/cases/:id` — تفاصيل الحالة: Case story, donation with share selector + fee toggle
- `/transparency` — الشفافية: Funded cases with "Mission Accomplished" stamp
- `/community` — لجنة المجتمع: Community voting board
- `/news` — الأخبار: News/announcements from Firestore
- `/login` — تسجيل الدخول: Firebase email/password login
- `/register` — إنشاء حساب: Firebase registration (auto-assigns role)
- `/admin` — لوحة التحكم: Admin dashboard with sidebar (requires admin role)
- `/admin/notifications` — الإشعارات: Review/approve pending cases & donations
- `/admin/cases` — إدارة الحالات: Cases management table
- `/admin/cases/new` — إضافة حالة: Create case form
- `/admin/donations` — التبرعات: Donations table
- `/admin/users` — المستخدمون: User listing
- `/admin/staff` — إدارة الفريق: Role management (super_admin only)

## API Endpoints

- `GET/POST /api/cases` — List/create cases
- `GET/PATCH/DELETE /api/cases/:id` — Case CRUD
- `POST /api/cases/:id/donate` — Donate to a case (updates collectedAmount, soldShares)
- `GET /api/donations` — List donations
- `GET/POST /api/votes` — List/create votes
- `GET /api/votes/:id` — Get vote
- `POST /api/votes/:id/cast` — Cast a vote
- `GET /api/stats/overview` — Platform-wide statistics
- `GET /api/stats/recent-activity` — Recent donation feed
- `GET/POST /api/users` — List/create users
- `GET/PATCH /api/users/:id` — User CRUD

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
