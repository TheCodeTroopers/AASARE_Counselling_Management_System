# AASARE Counselling Cell Management Portal

A production-quality Next.js 15 counsellor frontend for the AASARE Counselling Cell Management Portal.

## Scope

This project implements only the Counsellor Panel frontend. It does not include the User Panel or Admin Panel.

## Tech Stack

- React 19
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Lucide React
- Framer Motion
- TanStack Table
- React Query
- Recharts

## Included Modules

The application includes the following counsellor-facing pages:

1. Dashboard
2. Appointments
3. Availability
4. Daily Slots
5. Case Management
6. New Case Wizard
7. Draft Cases
8. Google Drive UI
9. Notifications
10. Profile
11. Settings

## Design Direction

The interface is styled as a modern medical dashboard with:

- Primary color: `#2563EB`
- Secondary color: `#14B8A6`
- Background: `#F8FAFC`
- Success: `#22C55E`
- Warning: `#F59E0B`
- Danger: `#EF4444`

It uses soft shadows, rounded cards, glass-style surfaces, and smooth motion patterns.

## Architecture Highlights

- App Router structure under `app/(counsellor)`
- Reusable components under `components/`
- API integration points under `services/`
- Mock JSON-style responses to support frontend development before backend integration
- React Query hooks for loading, error, and suspense-friendly UI patterns
- Type-safe interfaces under `types/`

## Mock API Layer

The service layer includes mock responses for:

- `getDashboard()`
- `getAppointments()`
- `acceptAppointment(id)`
- `rejectAppointment(id)`
- `updateAvailability()`
- `updateSlots()`
- `createCase()`
- `updateCase()`
- `saveDraft()`
- `getCase()`
- `getAllCases()`
- `getDrafts()`
- `connectGoogleDrive()`
- `disconnectGoogleDrive()`
- `getDriveFiles()`
- `getProfile()`
- `updateProfile()`
- `getNotifications()`
- `getSettings()`
- `updateSettings()`

## Run the Project

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Notes

- The appointment module and case management module are visually and logically separated.
  
- Confidential case data is kept isolated from appointment data.
- Every page contains integration-ready service touchpoints for future backend wiring.
