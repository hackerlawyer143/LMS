# LMS with Payment Feature

A full-stack Learning Management System with user management (Admin/Faculty/Student), courses, enrollments, payment gateway integration (Razorpay), assignments, quizzes with auto-evaluation, results, and admin reports.

## Tech Stack

- **Backend:** Node.js, Express, MySQL (Sequelize), JWT, bcrypt, Razorpay, PDFKit
- **Frontend:** React 18, Vite, React Router

## Prerequisites

- Node.js 18+
- MySQL 8
- (Optional) Razorpay account for payments

## Setup

### 1. Database

Create a MySQL database:

```sql
CREATE DATABASE lms;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and optional Razorpay keys
npm install
npm run db:migrate
npm run dev
```

Server runs at `http://localhost:3000`. Health: `GET http://localhost:3000/api/health`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` and proxies `/api` and `/uploads` to the backend.

## First Run

1. Start MySQL, then backend, then frontend.
2. Run migrations and seed (optional): in backend run npm run db:migrate then npm run db:seed to create admin admin@lms.local / admin123. Otherwise register a user (Student or Faculty).
3. To get an Admin without seed: set role admin in DB for a user, or use Admin Add User after logging in as admin.

## Features

- **Auth:** Register, Login, JWT, role-based redirect (Admin/Faculty/Student).
- **Courses:** Catalog, create/edit (Faculty), delete (Admin), free/paid.
- **Enrollment:** Free courses enroll directly; paid courses require payment.
- **Payments:** Razorpay (create order, verify, webhook). Receipt via PDF or gateway URL.
- **Assignments:** Create (Faculty), submit file (Student), deadline, faculty can update marks.
- **Quizzes:** MCQ create (Faculty), attempt (Student), auto score.
- **Results:** View marks/grades (Student/Faculty), update assignment marks (Faculty).
- **Admin:** Manage users (add/block), revenue and payment history reports.

## API Overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/courses`, `GET /api/courses/:id`
- `GET /api/enrollments/my`, `POST /api/enrollments`
- `POST /api/payments/create-order`, `POST /api/payments/verify`, `POST /api/payments/webhook`
- `GET /api/transactions`, `GET /api/transactions/:id/receipt`
- `GET/POST /api/assignments/courses/:courseId/assignments`, `POST /api/assignments/:id/submit`, etc.
- `GET/POST /api/quizzes/courses/:courseId/quizzes`, `GET /api/quizzes/:id`, `POST /api/quizzes/:id/attempt`
- `GET /api/results/courses/:courseId/results`
- `GET /api/admin/reports/revenue`, `GET /api/admin/reports/payments`
- `GET /api/users` (Admin), etc.

All protected routes use `Authorization: Bearer <token>`.

## Environment

See `backend/.env.example`. Set `JWT_SECRET` and DB credentials. For payments, set Razorpay keys and (for webhooks) `RAZORPAY_WEBHOOK_SECRET`.

## License

MIT
