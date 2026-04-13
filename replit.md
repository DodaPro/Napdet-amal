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
- **donations** — Donations linked to cases; extended with paymentMethod (vodafone_cash/null), paymentStatus (pending/approved/rejected), transferScreenshotUrl, senderPhone
- **votes** — Community votes on extra expenses per case (yes/no counts, open/closed)
- **users** — Platform users with roles: super_admin, sub_admin, moderator, donor
- **case_submissions** — Public case submission requests (submitterName, phone, address, caseDetails, status: pending/approved/rejected)
- **notifications** — Admin/user notifications (type, title, message, recipientId null=admin broadcast, relatedId, isRead)

## UI/UX Design

- Language: Arabic (RTL, `dir="rtl"`)
- Currency: جنيه (EGP)
- Color palette: Deep Trust Blue (primary), Emerald Green (secondary/success), White background
- Font: Tajawal (Arabic-first)
- No emojis in the UI

## Authentication & Authorization

- **Session-based auth** — express-session, not Firebase Auth
- Roles: `super_admin`, `sub_admin`, `moderator`, `donor`
- Super admin email: `mahmoudalgdawy@gmail.com` (auto-assigned on registration)
- `ProtectedRoute` component guards admin pages (redirects to `/login` if unauthenticated)
- `isAdminRole()` returns true for super_admin, sub_admin, admin, moderator
- Auth context: `src/contexts/AuthContext.tsx`
- Firebase is still used for: Firestore messages (community board), Firestore news, Firebase Storage (legacy upload)
- Cloudinary used for donation screenshot uploads (env: VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)

## Pages

- `/` — الرئيسية: Hero + Active Case Cards grid + "إضافة حالة" public submission modal
- `/cases/:id` — تفاصيل الحالة: Case story, share selector, Vodafone Cash multi-step payment modal, share button
- `/transparency` — الشفافية: Funded cases
- `/community` — لجنة المجتمع: Community voting board
- `/news` — الأخبار: News/announcements from Firestore
- `/login` — تسجيل الدخول
- `/register` — إنشاء حساب
- `/admin` — لوحة التحكم: Stats overview
- `/admin/notifications` — الإشعارات: SQL-based; pending case submissions (accept/reject + case creation form) + pending Vodafone donations (screenshot preview + verify/reject)
- `/admin/cases` — إدارة الحالات: Cases table with create/edit/delete
- `/admin/cases/new` — إضافة حالة: Create case form
- `/admin/donations` — التبرعات: "Pending Verification" tab (Vodafone Cash) + "All Donations" tab
- `/admin/users` — المستخدمون: User listing
- `/admin/staff` — إدارة الفريق: SQL-based role management (super_admin only)

## API Endpoints

- `GET/POST /api/cases` — List/create cases
- `GET/PATCH/DELETE /api/cases/:id` — Case CRUD
- `POST /api/cases/:id/donate` — Donate (direct, updates case totals immediately)
- `POST /api/cases/:id/donate-vodafone` — Vodafone Cash donation (paymentStatus=pending, creates admin notification)
- `GET /api/donations` — List all donations
- `GET/POST /api/votes` — List/create votes
- `POST /api/votes/:id/cast` — Cast a vote
- `GET /api/stats/overview` — Platform-wide statistics
- `GET /api/stats/recent-activity` — Recent donation feed
- `GET/PATCH /api/users` / `GET/PATCH /api/users/:id` — User CRUD
- `POST /api/auth/register|login|logout` — Session auth
- `GET /api/auth/me` — Current session user
- `POST /api/case-submissions` — Public case submission (creates admin notification)
- `GET /api/case-submissions` — List all submissions (admin only)
- `POST /api/case-submissions/:id/approve` — Approve + create case (admin, takes full case fields in body)
- `POST /api/case-submissions/:id/reject` — Reject submission (admin)
- `GET /api/admin/pending-donations` — List pending Vodafone Cash donations (admin)
- `POST /api/admin/donations/:id/verify` — Verify donation, update case totals (admin)
- `POST /api/admin/donations/:id/reject` — Reject donation (admin)
- `GET /api/notifications` — List notifications (role-filtered: admins see broadcast, users see personal)
- `GET /api/notifications/unread-count` — Count for bell badge (returns 0 for unauthenticated)
- `PATCH /api/notifications/:id/read` — Mark one as read
- `PATCH /api/notifications/read-all` — Mark all as read

## Notification Bell (Navbar)

- Visible for logged-in users only
- Polls every 30 seconds via React Query
- Shows red badge with unread count (9+ if more than 9)
- Dropdown shows last 8 notifications; click navigates admin to /admin/notifications
- "قراءة الكل" marks all as read

## Admin Sidebar (AdminLayout)

- Shows unread notification count badge on "الإشعارات" menu item
- Polls every 30 seconds

## Notification Types

- `admin_case_submission` — fired when public user submits a case request
- `admin_vodafone_donation` — fired when user submits a Vodafone Cash donation
- `case_approved` — broadcast when admin approves a case submission
- `donation_verified` — broadcast when admin verifies a donation

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
