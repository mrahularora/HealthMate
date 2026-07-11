# HealthMate

HealthMate is a MERN healthcare appointment platform for patients, doctors, and admins. Patients can discover doctors, request appointments, view appointment history, and manage their profile. Doctors can create availability, review appointment requests, manage accepted appointments, update visit details, and generate reports. Admins can monitor users, appointments, and contact submissions.

## Tech Stack

- Frontend: React 18, React Router, React Bootstrap, Axios, PayPal React SDK
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, cookie-based auth
- Reports: PDFKit
- Testing: React Testing Library and Jest

## Project Structure

```text
HealthMate/
  client/                  React frontend
    public/assets/         Images and icons
    src/components/        Shared, user, doctor, and admin UI
    src/pages/             Route-level pages
    src/services/          Axios API wrappers
    src/context/           Auth and route protection
    src/css/               App styles
  server/                  Express backend
    config/                MongoDB connection
    controllers/           Route handlers
    data/                  Seed scripts
    middlewares/           Auth middleware
    models/                Mongoose schemas
    routes/                API routes
    reports/               Generated PDF reports
```

## Main Features

- Role-based dashboards for User, Doctor, and Admin accounts
- Patient dashboard with appointment stats, next appointment, quick actions, and featured doctors
- Doctor discovery from the homepage and patient portal
- Guided appointment booking with doctor details, date/slot selection, patient details, and payment support
- Appointment request workflow: Requested, Confirmed, InProgress, Completed, Cancelled
- Doctor availability creation and slot management
- Patient appointment history and cancellation
- Admin user management, appointment overview, and contact message review
- Profile viewing and updates
- Chatbot widget for common navigation help
- PDF report generation for appointment details

## Prerequisites

Install these before running the project:

- Node.js 18 or newer
- npm
- MongoDB Atlas connection string or a local MongoDB instance

## Environment Setup

Create `server/.env` using `server/.env.example` as the template:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/healthmate
JWT_SECRET=replace-with-a-long-random-secret
BASE_URL=http://localhost:5000
```

Optional frontend environment variable:

```env
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
```

If `REACT_APP_PAYPAL_CLIENT_ID` is not configured, the booking page sends the appointment request directly instead of showing PayPal checkout.

## Installation

Install backend dependencies:

```bash
cd server
npm install
```

Install frontend dependencies:

```bash
cd ../client
npm install
```

## Seed Doctor Data

The app needs doctor users, doctor profile cards, and appointment slots to make booking useful. Run the seed script from the `server` folder:

```bash
cd server
npm run seed:doctors
```

This script:

- Creates starter doctor users
- Creates or repairs homepage doctor cards
- Links each doctor card to a real bookable doctor user
- Adds starter weekday appointment slots

Seeded doctor accounts use this default password:

```text
Doctor@123
```

## Running Locally

Start the backend:

```bash
cd server
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

Start the frontend in another terminal:

```bash
cd client
npm start
```

The React app runs on:

```text
http://localhost:3000
```

## Useful Scripts

Backend scripts:

```bash
npm run dev            # Start Express with nodemon
npm start              # Start Express with node
npm run build          # Syntax-check server.js
npm run seed:doctors   # Seed and repair doctor data
```

Frontend scripts:

```bash
npm start              # Start React dev server
npm run build          # Build production frontend
npm test               # Run React tests
```

Focused appointment test:

```bash
cd client
npm test -- --watchAll=false --runInBand UserAppointments.test.jsx
```

## Important Routes

Frontend routes:

- `/` - Homepage with doctor cards
- `/login` - Login
- `/signup` - Signup
- `/UserPage` - Patient dashboard
- `/doctorslist` - Patient doctor list
- `/book-appointment/:doctorId` - Appointment booking
- `/UserAppointments` - Patient appointments
- `/DoctorPage` - Doctor dashboard
- `/CreateAppointment` - Doctor availability creation
- `/RequestedAppointments` - Doctor appointment requests
- `/AcceptedAppointments` - Doctor accepted appointments
- `/Patients` - Doctor patient list
- `/AdminPage` - Admin dashboard
- `/admin/ManageUsers` - Admin user management
- `/admin/appointments` - Admin appointment overview
- `/admin/Contact` - Admin contact messages

API routes:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `GET /api/doctors`
- `GET /api/doctors/list`
- `GET /api/doctors/search?query=...`
- `POST /api/appointments/create`
- `POST /api/appointments/available`
- `POST /api/appointments/book-request`
- `GET /api/appointments`
- `PATCH /api/appointments/cancel`
- `GET /api/appointments/requests?doctorId=...`
- `PATCH /api/appointments/status`
- `GET /api/appointments/accepted?doctorId=...`
- `GET /api/appointments/details?appointmentId=...&slotId=...`
- `PATCH /api/appointments/details`

## User Roles

`User`

- View patient dashboard
- Browse doctors
- Request appointments
- View and cancel appointments
- Manage profile

`Doctor`

- View doctor dashboard
- Create appointment slots
- Review appointment requests
- Manage accepted appointments
- View patient records
- Update appointment details and prescriptions

`Admin`

- View system dashboard
- Manage users
- Review appointments
- Review contact messages

## Development Notes

- The backend requires `MONGO_URI` and `JWT_SECRET`; it exits early if either is missing.
- Auth uses JWT cookies and the shared Axios client in `client/src/services/api.js`.
- Appointment ownership is enforced on protected patient appointment routes.
- Doctor profile cards are stored separately from doctor user accounts, so `npm run seed:doctors` keeps those records linked.
- Generated PDF reports are written under `server/reports/`.
- If backend model/controller changes are made while the server is already running, restart the backend.

## Verification

Recommended checks before committing:

```bash
cd server
npm run build

cd ../client
npm run build
npm test -- --watchAll=false --runInBand UserAppointments.test.jsx
```
