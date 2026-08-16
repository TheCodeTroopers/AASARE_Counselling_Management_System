# AASARE Counselling Management System – Implementation Roadmap

## Overview

This document summarizes the remaining work required to align the
current implementation with the original Software Requirement
Specification (SRS).

## Current Progress

| Module                   | Status          |
| ------------------------ | --------------- |
| Authentication           | Partial         |
| Student Panel            | Mostly Complete |
| Appointment Booking      | Mostly Complete |
| Counsellor Directory     | Mostly Complete |
| Counsellor Panel         | Not Started     |
| Availability Management  | Not Started     |
| Case Study Management    | Not Started     |
| Google Drive Integration | Not Started     |
| Administrator Panel      | Not Started     |

## Phase 1 – Authentication & Role Management

- Add Student, Counsellor and Administrator roles
- Extend profiles table with role
- Protect routes based on roles
- Add role-aware navigation

## Phase 2 – Counsellor Management

Database: - counsellors - availability - daily_slots

Features: - Counsellor profile - Department & designation - Availability
toggle - Two slots per day

## Phase 3 – Counsellor Dashboard

- Today’s appointments
- Upcoming appointments
- Pending requests
- Approved appointments
- Rejected appointments
- Availability status
- Accept / Reject requests
- Rejection reason

## Phase 4 – Availability & Slot Management

- Available / Unavailable toggle
- Daily slot editor
- Two-slot-per-day system
- Slot states: Available, Pending, Booked

Recommended table:

    daily_slots
    id
    counsellor_id
    date
    slot_time
    status

## Phase 5 – Private Case Study Module

Database: - case_studies - case_followups - case_documents

Case Sheet Sections: 1. General Information 2. Reason for Visit 3.
Background 4. First Aid Response 5. Observations 6. Follow-up 7. Consent
& Confidentiality

Features: - Draft support - Edit own case studies - View own case
studies only - Follow-up management - Attach documents

## Phase 6 – Google Drive Integration

- OAuth connection
- Secure token storage
- Upload documents
- Link documents to case studies
- One Drive per counsellor

## Phase 7 – Administrator Panel

- Add counsellors
- Remove/deactivate counsellors
- View all counsellors
- View schedules
- View assigned students

Administrator must NOT access: - Case studies - Notes - Documents -
Observations - Google Drive

## Phase 8 – Notifications

- In-app notifications
- Email notifications
- Realtime appointment updates

## Phase 9 – Security

RLS: - Appointments - Case Studies - Documents - Follow-ups

Audit log table:

    audit_logs
    user_id
    action
    timestamp
    ip_address

## Phase 10 – UI Improvements

Student: - Better appointment cards - Timeline - Status indicators

Counsellor: - Dashboard - Calendar - Availability toggle

Admin: - Dashboard - Schedule viewer - Counsellor management

## Recommended Final Database

    profiles
    roles
    counsellors
    availability
    daily_slots
    appointments
    case_studies
    case_followups
    case_documents
    drive_connections
    notifications
    audit_logs

## Suggested Development Order

1.  Role Management
2.  Counsellor Dashboard
3.  Availability Management
4.  Daily Slot System
5.  Case Study Module
6.  Google Drive Integration
7.  Admin Dashboard
8.  Notifications
9.  Security Hardening
10. UI Polish
