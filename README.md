# RepairFlow Staff & Technician Portal

A Next.js (Turbopack) frontend for RepairFlow **Owner/Staff** and **Technician** roles, connecting to a live Express/MongoDB backend API with HttpOnly cookie sessions, role-based access control (RBAC), repair job intake, estimate management, and an interactive **Technician Workspace Dashboard** for active job queues.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Implemented Features & Modules](#implemented-features--modules)
  - [1. Authentication & Security (Shared Internal Portal)](#1-authentication--security-shared-internal-portal)
  - [2. Technician Workspace & Active Queue (SCRUM-41)](#2-technician-workspace--active-queue-scrum-41)
  - [3. Repair Job Intake & Registration (SCRUM-9)](#3-repair-job-intake--registration-scrum-9)
  - [4. Repair Estimates & Pricing (SCRUM-14)](#4-repair-estimates--pricing-scrum-14)
  - [5. Technician Account Management (Owner/Staff Only)](#5-technician-account-management-ownerstaff-only)
- [Route Directory](#route-directory)
- [Backend API Integration](#backend-api-integration)
- [Prerequisites & Environment Configuration](#prerequisites--environment-configuration)
- [How to Run the Application](#how-to-run-the-application)
- [Step-by-Step Testing & User Guide](#step-by-step-testing--user-guide)
- [Project Directory Structure](#project-directory-structure)

---

## Overview

RepairFlow Staff Portal is a centralized workshop management application providing:
- **For Shop Owners & Front Desk Staff**: Customer search, repair job intake, price estimates with line items, and technician provisioning.
- **For Bench Technicians**: A dedicated workstation dashboard with live queue dispatch, triage priority SLA countdowns, parts hold feeds, safety instrument logs, and full hardware/customer detail views with strict RBAC security.

---

## System Architecture

```text
[ Browser / Client ]
        │  (Runs on http://localhost:3001)
        ▼
[ Next.js Turbopack App Router ]
   ├── app/ (Routing & Layouts)
   ├── src/views/ (Page Views & Role Guards)
   ├── src/widgets/ (Component Feature Blocks)
   ├── src/shared/ (API Client, Auth Provider, Types)
   └── proxy.ts (Reverse Proxy Handler for /api/*)
        │
        │  Forwarded with credentials: include (HttpOnly JWT Cookies)
        ▼
[ Express & MongoDB Backend ]
   (Runs on http://localhost:5000/api)
   ├── /internal/auth/*  (Shared Authentication & Sessions)
   ├── /staff/*          (Owner/Staff Endpoints: Jobs, Customers, Estimates, Techs)
   └── /technician/*     (Technician Workspace: Assigned Jobs & Security RBAC)
```

---

## Implemented Features & Modules

### 1. Authentication & Security (Shared Internal Portal)
- **Unified Sign-In (`/staff/login`)**: Single entry point for both Owner/Staff and Technicians. The backend automatically resolves the user's role and verification status from the entered email address.
- **Login OTP Verification (`/staff/login/verify-otp`)**: Two-factor email OTP verification with countdown timer and resend capability.
- **Password Recovery**: Complete forgot-password flow with OTP verification, reset tokens, and new password confirmation (`/staff/forgot-password/*`).
- **Session Management**: JWT access and refresh tokens are stored exclusively in `HttpOnly` cookies. The frontend client (`src/shared/api/http.ts`) transparently refreshes expired sessions via `/api/internal/auth/refresh-token` on HTTP 401 and retries original requests without user disruption.
- **Strict Role-Based Access Control (RBAC)**: Enforced both on client routes (`InternalProtectedRoute`) and backend API middleware. Technicians cannot access technician management or staff-exclusive registration endpoints.

---

### 2. Technician Workspace & Active Queue (SCRUM-41)
When authenticated as a **Technician**, navigating to `/dashboard` renders the **Technician Workspace Dashboard**:

- **Dark-Themed Workspace Layout**:
  - Left navigation matching workshop aesthetic (`#0b1329` dark navy) with `WORK` (*Assigned Repair Jobs*, *Parts & Line Items*) and `ACCOUNT` (*My Profile*).
  - Bottom technician profile card with live green status indicator and quick sign-out.
  - Top header displaying breadcrumb navigation, live station status (`• Bench Station 02 • Active`), technician name, and power control.

- **Header & Calibration Status**:
  - Live dispatch badge (`• Live Dispatch` with pulsating blue indicator).
  - Bench station status card (`Bench Station 02 • Calibrated`, Lead Tech name, and `ESD Pass` certification).

- **Real-Time Summary Metric Cards**:
  1. **TOTAL ASSIGNED**: Total active repair jobs assigned to the bench with a blue accent line.
  2. **IN PROGRESS**: Units currently on bench undergoing repair/diagnosis with a blue accent line.
  3. **WAITING FOR PARTS**: Units held for component shipments (`1 PO in transit`) with a crimson accent line.
  4. **DIAGNOSIS PENDING**: Units queued for multimeter or board-level scanning with a dark slate accent line.

- **Interactive Toolbar**:
  - Real-time search across job references, customer names, device types, and fault descriptions.
  - Status filter dropdown (*All Active Statuses*, *Diagnosis Pending*, *In Progress*, *Waiting for Parts*, *Completed*).
  - Priority filter dropdown (*All*, *High SLA*, *Normal*, *Low*).
  - Reset filters button.
  - Queue count badge.
  - **Zero State Demo Toggle**: Instantly tests the Acceptance Criteria 4 empty state without modifying database records.
  - **Direct Access Test**: Test input to verify HTTP 403 Forbidden handling on unassigned or foreign jobs.

- **Assigned Jobs Table**:
  - **Job ID**: High-contrast blue badge (e.g. `RF-2026-002`) with triage reference number.
  - **Device & Customer**: Device-specific icon (Laptop, Smartphone, Tablet, or PC), model name, customer name, and category.
  - **Reported Fault**: Main fault description and highlighted diagnostic notes (e.g. `Digitizer replacement approved`, `Internal heatsink thermal paste degraded`).
  - **Color-Coded Status Badge**: Color-coordinated badges with status dots and subtext indicators.
  - **Priority & SLA**: High-priority countdown indicators (`! High SLA`, `Today • 03:00 PM`, `Remaining: 2h 45m`) vs normal indicators.
  - **Received & Bench Time**: Formatted timestamp with active bench elapsed timer.

- **Technical Detail View Modal & Route (AC-3)**:
  - Clicking any job row fetches `GET /api/technician/jobs/:jobIdentifier` to display complete technical specifications:
    - Device Type, Make/Model, and Serial Number (`"N/A"` if not provided).
    - Full Reported Fault technical description.
    - Received date & status history.
    - Customer Snapshot details: Full Name, Contact Number, and Email Address.

- **403 Forbidden Security Handling (AC-5)**:
  - If a technician attempts to access a job assigned to another technician or an unassigned job, the backend returns HTTP 403 (`{ message: "You do not have permission to access this job" }`).
  - The UI gracefully intercepts this error, rendering a clear **"HTTP 403 Forbidden — Access Denied"** security banner, and completely hides unauthorized hardware or customer privacy data.

- **Informative Empty State (AC-4)**:
  - If no jobs are currently assigned, displays:
    > *"No jobs currently assigned to you. When the front desk or shop owner assigns repair jobs to you, they will appear here on your active dispatch queue."*

- **Bench Auxiliary Cards**:
  - **Bench Instruments**: Hakko Soldering Station (350°C Ready), Rigol Oscilloscope (Cal. Nov 2026), and ESD Ground Strap monitor with `All Pass` badges and re-check action.
  - **Parts Request Feed**: Pending components for active jobs with job reference badges and courier ETAs.
  - **Dispatch Announcements**: High-priority triage policy and BGA rework maintenance memos with shift lead acknowledgement.

---

### 3. Repair Job Intake & Registration (SCRUM-9)
Available to **Owner/Staff** users:
- **Route**: `/repair-jobs/new`
- **Customer Lookup**: Real-time asynchronous search against verified customer accounts (`GET /api/staff/customers?query=...`).
- **Device Intake**: Capture device type, make/model, optional hardware serial number, and detailed reported fault.
- **Idempotency Protection**: Every submission generates an `Idempotency-Key` header to prevent accidental duplicate job registrations on network retry or double-clicks.

---

### 4. Repair Estimates & Pricing (SCRUM-14)
Available to **Owner/Staff** users:
- **Routes**: `/repair-jobs/estimate` and `/repair-jobs/[jobIdentifier]/estimate`
- **Job Lookup**: Retrieve estimate context by job reference or MongoDB ID.
- **Line-Item Editor**: Add and remove `PART` and `LABOUR` line items with positive whole-number quantities and unit prices in LKR.
- **Live Calculation**: Real-time line item subtotal and total cost previews with backend validation before issuing.

---

### 5. Technician Account Management (Owner/Staff Only)
Available to **Owner/Staff** users:
- **Route**: `/technicians`
- **Create Technician**: Form modal capturing full name, email, contact number, and initial password.
- **In-Modal Activation OTP**: The verification OTP sent to the technician's email is entered directly in the modal to verify the account immediately.
- **Technician List & Access Control**: View verified technicians and toggle their account active/disabled status. Disabling a technician immediately invalidates their active backend sessions.

---

## Route Directory

| Route Path | Allowed Roles | Description |
| :--- | :--- | :--- |
| `/staff/login` | Public | Shared Owner/Staff & Technician login screen |
| `/staff/login/verify-otp` | Public | 2FA Login OTP verification |
| `/staff/forgot-password` | Public | Password reset initiation |
| `/staff/forgot-password/verify-otp` | Public | Password reset OTP verification |
| `/staff/forgot-password/reset` | Public | Set new password with verified reset token |
| `/dashboard` | `owner_staff`, `technician` | Role-aware dashboard (Technician Queue or Staff Management) |
| `/technicians/jobs/[jobIdentifier]` | `technician` | Direct route for technician job details with 403 security |
| `/repair-jobs/new` | `owner_staff` | Customer lookup & repair job intake registration |
| `/repair-jobs/estimate` | `owner_staff` | Standalone estimate lookup by job reference |
| `/repair-jobs/[jobIdentifier]/estimate` | `owner_staff` | Line-item estimate editor and issuance |
| `/technicians` | `owner_staff` | Create, verify, list, and enable/disable technicians |
| `/profile` | `owner_staff`, `technician` | View user profile details and role metadata |

---

## Backend API Integration

The frontend connects to the Express backend through a Next.js reverse proxy (`proxy.ts`).

| Frontend API Path | Proxied Backend Target | Method | Description |
| :--- | :--- | :--- | :--- |
| `/api/internal/auth/login` | `/api/internal/auth/login` | POST | Authenticate credentials & initiate OTP |
| `/api/internal/auth/login/verify-otp` | `/api/internal/auth/login/verify-otp` | POST | Verify OTP & set HttpOnly cookies |
| `/api/internal/auth/refresh-token` | `/api/internal/auth/refresh-token` | POST | Refresh JWT session cookie |
| `/api/internal/auth/me` | `/api/internal/auth/me` | GET | Retrieve authenticated user profile |
| `/api/internal/auth/logout` | `/api/internal/auth/logout` | POST | Invalidate session cookies |
| `/api/technician/jobs` | `/api/technician/jobs` | GET | **SCRUM-41**: Fetch assigned jobs for technician |
| `/api/technician/jobs/:id` | `/api/technician/jobs/:id` | GET | **SCRUM-41**: Fetch job details (returns 403 if unauthorized) |
| `/api/staff/customers` | `/api/staff/customers` | GET | Customer search for intake |
| `/api/staff/jobs` | `/api/staff/jobs` | POST | Register new repair job |
| `/api/staff/jobs/:id/estimate-context` | `/api/staff/jobs/:id/estimate-context` | GET | Fetch job context for estimate |
| `/api/staff/jobs/:id/estimates` | `/api/staff/jobs/:id/estimates` | POST | Issue estimate with line items |
| `/api/staff/technicians` | `/api/staff/technicians` | GET/POST | List and create technicians |
| `/api/staff/technicians/:id/toggle-active`| `/api/staff/technicians/:id/toggle-active`| PATCH | Enable or disable technician account |

---

## Prerequisites & Environment Configuration

### Prerequisites
- **Node.js**: v20.x, v22.x, or v24.x
- **npm**: v10.x or v11.x
- **RepairFlow Express/MongoDB Backend**: Running on port `5000`

### Environment Configuration (`.env`)
Create or verify the `.env` file in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=/api
BACKEND_API_BASE_URL=http://localhost:5000/api
```

- `NEXT_PUBLIC_API_BASE_URL`: Relative `/api` prefix used by browser requests.
- `BACKEND_API_BASE_URL`: URL of the Express backend server (default: `http://localhost:5000/api`).

---

## How to Run the Application

### 1. Start the Backend Server
In the backend directory (`nibm261pgroupE_Backend`):
```bash
npm install
npm run dev
```
Ensure the backend is running and listening on `http://localhost:5000`.

### 2. Start the Frontend Portal
In this directory (`nibm261pgroupE_Admin`):
```bash
npm install
npm run dev
```

The Next.js development server will start on port `3001`:
```text
▲ Next.js 16.1.6 (Turbopack)
- Local:   http://localhost:3001
- Network: http://192.168.x.x:3001
✓ Ready
```

Open [http://localhost:3001/staff/login](http://localhost:3001/staff/login) in your browser.

---

## Step-by-Step Testing & User Guide

### Scenario A: Testing the Technician Workspace (SCRUM-41)
1. **Login as a Technician**:
   - Navigate to `http://localhost:3001/staff/login`.
   - Enter technician credentials (email + password).
   - Enter the received login OTP on `/staff/login/verify-otp`.
2. **View Assigned Jobs Queue**:
   - You are automatically redirected to `http://localhost:3001/dashboard`.
   - Notice the dark navy sidebar with **Assigned Repair Jobs**, **Parts & Line Items**, and **My Profile**.
   - Check the 4 metric cards: *Total Assigned*, *In Progress*, *Waiting for Parts*, *Diagnosis Pending*.
   - Review your assigned jobs in the table with job IDs, hardware types, reported faults, and color-coded status badges.
3. **Filter and Search Jobs**:
   - Type a model name (e.g. `Samsung` or `HP`) in the search box.
   - Filter by status dropdown (e.g. `Waiting for Parts`).
   - Click **Reset** to restore all active jobs.
4. **Open Technical Detail View (AC-3)**:
   - Click on any job row.
   - The modal drawer will load full hardware details, serial number, reported fault, received date, and customer contact details.
5. **Verify 403 Forbidden Security Handling (AC-5)**:
   - In the toolbar, click **Direct Access Test**.
   - Enter an unassigned job reference or a job ID assigned to another technician (or visit `http://localhost:3001/technicians/jobs/<other-job-id>`).
   - The UI intercepts HTTP 403 and displays the prominent **"HTTP 403 Forbidden — Access Denied"** security banner, hiding all confidential customer and device information.
6. **Verify Empty State (AC-4)**:
   - Click the **Zero State Demo** button in the toolbar.
   - The table renders the clean empty state: *"No jobs currently assigned to you. When the front desk or shop owner assigns repair jobs to you, they will appear here."*
   - Click **Exit Zero State Demo** to return to your active list.
7. **Inspect Bench Auxiliary Cards**:
   - Scroll to the bottom to view **Bench Instruments** (click *Re-check Station*), **Parts Request Feed**, and **Dispatch Announcements** (click *Acknowledge*).

---

### Scenario B: Testing Owner/Staff Management
1. **Login as Owner/Staff**:
   - Sign in with Owner/Staff credentials at `http://localhost:3001/staff/login`.
2. **Technician Provisioning (`/technicians`)**:
   - Click **Technicians** in the sidebar.
   - Click **Add technician** and fill in technician details.
   - Enter the verification OTP in the modal.
   - Use the status toggle button to enable/disable technicians.
3. **Repair Job Intake (`/repair-jobs/new`)**:
   - Search for an active customer.
   - Enter device specifications, serial number, and reported fault.
   - Submit the form to register the job with automated idempotency protection.
4. **Estimate Creation (`/repair-jobs/estimate`)**:
   - Enter the job reference to load the estimate editor.
   - Add parts and labour items with unit costs and issue the estimate.

---

## Project Directory Structure

```text
nibm261pgroupE_Admin/
├── app/                                    # Next.js App Router Pages
│   ├── dashboard/page.tsx                  # Role-aware dashboard page
│   ├── technicians/
│   │   ├── page.tsx                        # Owner/Staff technician management
│   │   └── jobs/[jobIdentifier]/page.tsx   # Direct route for technician job details
│   ├── repair-jobs/
│   │   ├── new/page.tsx                    # Repair job intake page
│   │   └── [jobIdentifier]/estimate/page.tsx # Repair estimate editor
│   ├── profile/page.tsx                    # User profile page
│   ├── staff/                              # Public authentication routes
│   │   ├── login/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── globals.css                         # Global CSS & Tailwind setup
│   └── layout.tsx                          # Root application layout
├── src/
│   ├── shared/                             # Cross-cutting utilities & API client
│   │   ├── api/
│   │   │   ├── http.ts                     # Fetch client with auto refresh & ApiError
│   │   │   ├── internalAuth.api.ts         # Authentication API calls
│   │   │   ├── technicianJobs.api.ts       # SCRUM-41 Technician jobs API calls
│   │   │   ├── repairJobs.api.ts           # SCRUM-9 Job intake API calls
│   │   │   ├── estimates.api.ts            # SCRUM-14 Estimate API calls
│   │   │   └── technicians.api.ts          # Technician provisioning API calls
│   │   ├── auth/                           # Auth context & route protection
│   │   │   ├── InternalAuthProvider.tsx    # Session provider with refresh listener
│   │   │   └── InternalProtectedRoute.tsx  # RBAC route guard component
│   │   └── types/                          # TypeScript definitions
│   │       ├── internal.ts                 # User & session types
│   │       ├── technicianJobs.ts           # SCRUM-41 DTOs & filter types
│   │       ├── repairJobs.ts               # Repair job intake types
│   │       └── estimates.ts                # Repair estimate types
│   ├── views/                              # Page-level view compositions
│   │   ├── dashboard/ui/InternalDashboardPage.tsx
│   │   ├── technicians/ui/TechnicianJobDetailPage.tsx
│   │   └── repair-jobs/ui/RegisterRepairJobPage.tsx
│   └── widgets/                            # Feature-specific UI components
│       ├── dashboard/ui/InternalDashboardShell.tsx # Dynamic role-aware sidebar/header
│       ├── technician/ui/
│       │   ├── TechnicianDashboardView.tsx # Main technician workspace queue
│       │   ├── TechnicianJobDetailModal.tsx # Full specs & 403 Forbidden interceptor
│       │   └── TechnicianBenchAuxiliaryCards.tsx # Bench instruments, parts, memos
│       ├── technicians/ui/AddTechnicianModal.tsx
│       └── repair-jobs/ui/RepairIntakeForm.tsx
├── docs/                                   # Coursework integration documentation
│   ├── SCRUM41_TECHNICIAN_DASHBOARD_FRONTEND.md
│   ├── SCRUM14_ESTIMATE_FRONTEND.md
│   ├── SCRUM9_FRONTEND_INTEGRATION.md
│   └── BACKEND_INTEGRATION.md
├── proxy.ts                                # Next.js reverse proxy for /api/*
├── package.json
└── tsconfig.json
```
