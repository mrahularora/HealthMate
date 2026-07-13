# HealthMate v1.0.0

Release date: 2026-07-13

## Highlights

- Patient, doctor, and admin role-based dashboards
- Doctor discovery, appointment booking, appointment history, and profile management
- Doctor slot creation, request review, patient records, prescriptions, and PDF report generation
- Admin user management, appointment review, and contact message inbox
- HealthMate-themed UI across dashboards, appointment pages, chatbot, and generated reports

## Before Release

```bash
cd server
npm run build

cd ../client
npm run build
npm test -- --watchAll=false --runInBand UserAppointments.test.jsx
```

## Tag

```bash
git tag v1.0.0
```
