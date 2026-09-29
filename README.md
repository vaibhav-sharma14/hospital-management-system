# MediCore — Hospital Management System

A full-stack, role-based Hospital Management System built with **React (Vite)**, **Node.js/Express**, and **MongoDB**.

## ✨ Features

- JWT authentication (Register / Login / Logout) with bcrypt password hashing
- Role-based access control: `admin`, `doctor`, `receptionist`, `lab_technician`, `pharmacist`, `patient`
- Dashboard analytics (patients, doctors, revenue, appointment trends) using Recharts
- Patient management, Doctor management, Department management
- Appointment booking & scheduling
- Prescriptions with multi-line medicine entries
- Medical records with vitals tracking
- Laboratory test ordering, status tracking & results
- Pharmacy / medicine inventory with stock & dispensing
- Billing & invoicing with itemized line items, discounts, tax, payment tracking
- Staff management (receptionists, lab techs, pharmacists, nurses)
- In-app notifications
- Profile management & password change
- Search, filter, sort and pagination on every list view
- Responsive, healthcare-themed UI (Tailwind CSS)

## 🗂 Project structure

```
hospital-management-system/
├── backend/
│   ├── config/          # DB connection
│   ├── middleware/       # auth (JWT) + RBAC, error handling
│   ├── models/           # Mongoose schemas
│   ├── controllers/       # business logic per module
│   ├── routes/            # Express routers per module
│   ├── utils/             # pagination/search/filter helper
│   ├── seed/              # demo data seeder
│   └── server.js
└── frontend/
    └── src/
        ├── api/            # axios instance with auth interceptor
        ├── context/        # AuthContext (login/register/logout)
        ├── components/
        │   ├── Layout/      # Sidebar, Navbar, AppLayout, ProtectedRoute
        │   └── UI/          # DataTable, Modal, Pagination, Badge, etc.
        ├── pages/           # one page per module
        └── App.jsx          # routing + RBAC route guards
```

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod` or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Backend setup

```bash
cd backend
cp .env.example .env     # then edit MONGO_URI and JWT_SECRET
npm install
npm run seed              # creates a demo admin + doctor + sample medicines
npm run dev                # starts API on http://localhost:5000
```

Demo accounts created by the seed script:
| Role   | Email                | Password    |
|--------|-----------------------|-------------|
| Admin  | admin@hospital.com    | Admin@123   |
| Doctor | doctor@hospital.com   | Doctor@123  |

### 2. Frontend setup

```bash
cd frontend
cp .env.example .env      # defaults to http://localhost:5000/api
npm install
npm run dev                 # starts the app on http://localhost:5173
```

Open http://localhost:5173, sign in with a demo account (or register a new patient account), and explore.

## 🔐 Security practices included
- Passwords hashed with bcrypt, never returned in API responses
- JWT-based stateless auth with route-level `protect` + `authorize(...roles)` middleware
- `helmet` for HTTP headers, `express-mongo-sanitize` against NoSQL injection
- Rate limiting on `/auth/login` and `/auth/register`
- Centralized error handling with safe, environment-aware error messages
- Server-side validation on all Mongoose models (required fields, enums, formats)

## 📈 Extending this project
- Swap MongoDB for MySQL by replacing the Mongoose models with Sequelize models (the controller/route layer is database-agnostic)
- Add file uploads (lab reports, prescriptions) via `multer` + cloud storage
- Add a PDF export for invoices/prescriptions
- Add WebSocket/real-time notifications instead of polling

## 📝 License
This project is provided as a learning/starter template. Adapt and harden it (audits, pen-testing, HIPAA/GDPR review) before using it with real patient data in production.
