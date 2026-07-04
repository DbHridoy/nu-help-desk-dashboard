# NU Student Help Admin Dashboard

Admin-only dashboard for the MVP of the NU Student Help Website. This repository contains the internal content management interface only. It does not include the public student-facing website.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- REST API integration
- JWT-based admin authentication

## Features

- Admin login at `/login`
- Protected admin routes with middleware and client-side auth guard
- Dashboard overview with key resource counts and recent resources
- CRUD screens for:
  - courses
  - departments
  - academic years
  - subjects
  - notices
  - routines
  - syllabus
  - previous questions
  - resources
- Student request management with status updates
- Upload flow for PDFs and images through `/api/admin/uploads`
- Reusable tables, badges, modal forms, and confirm dialog
- Mock mode for previewing the UI when the backend is unavailable

## Routes

Public:

- `/login`

Protected admin:

- `/dashboard`
- `/courses`
- `/departments`
- `/academic-years`
- `/subjects`
- `/notices`
- `/routines`
- `/syllabus`
- `/questions`
- `/resources`
- `/student-requests`
- `/uploads`

## Environment

Copy the example values into `.env.local`:

```bash
cp .env.example .env.local
```

Variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_USE_MOCKS=false
```

## Mock Mode

Set `NEXT_PUBLIC_USE_MOCKS=true` to preview the full dashboard without the Express backend.

Mock credentials:

- Email: `admin@nuhelp.local`
- Password: `password123`

## Expected Backend Endpoints

- `POST /api/admin/login`
- `GET /api/admin/me`
- `GET /api/admin/dashboard`
- `GET|POST /api/admin/courses`
- `PATCH|DELETE /api/admin/courses/:id`
- `GET|POST /api/admin/departments`
- `PATCH|DELETE /api/admin/departments/:id`
- `GET|POST /api/admin/academic-years`
- `PATCH|DELETE /api/admin/academic-years/:id`
- `GET|POST /api/admin/subjects`
- `PATCH|DELETE /api/admin/subjects/:id`
- `GET|POST /api/admin/notices`
- `PATCH|DELETE /api/admin/notices/:id`
- `GET|POST /api/admin/routines`
- `PATCH|DELETE /api/admin/routines/:id`
- `GET|POST /api/admin/syllabus`
- `PATCH|DELETE /api/admin/syllabus/:id`
- `GET|POST /api/admin/questions`
- `PATCH|DELETE /api/admin/questions/:id`
- `GET|POST /api/admin/resources`
- `PATCH|DELETE /api/admin/resources/:id`
- `GET|POST /api/admin/student-requests`
- `PATCH /api/admin/student-requests/:id`
- `POST /api/admin/uploads`

## Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Validation

The project is expected to pass:

```bash
npm run lint
npm run build
```

## Notes

- JWT is stored in `localStorage` for API requests and mirrored into a cookie for route protection.
- The CRUD pages are config-driven to keep the MVP maintainable without adding heavy state-management libraries.
- Uploaded files are attached inside form state after the upload endpoint returns file metadata.
