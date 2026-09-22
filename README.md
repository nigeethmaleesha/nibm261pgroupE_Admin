# RepairFlow Staff Portal

Separate Next.js frontend for RepairFlow **Owner/Staff** and **Technician** users.

## What is implemented

- Shared Owner/Staff + Technician sign-in screen. The backend detects the account role from the submitted email.
- Login OTP verification and resend OTP for both roles.
- Forgot-password OTP, resend OTP, verification, and new-password flow for both roles.
- Technician email verification is completed inside the Owner/Staff Add Technician flow, with OTP and resend OTP.
- HttpOnly-cookie session handling with automatic access-token refresh.
- Protected dashboard routes and role-aware navigation.
- Owner/Staff technician management: create technician, list verified technicians, and enable/disable toggle.
- Owner/Staff and Technician profile pages.
- Logout for both roles.
- Technician users never see the technician-management navigation or add-technician UI.

## Route choice

The shared internal login route is:

```text
/staff/login
```

Related auth routes:

```text
/staff/login/verify-otp
/staff/forgot-password
/staff/forgot-password/verify-otp
/staff/forgot-password/reset
```

Protected routes:

```text
/dashboard
/technicians   # owner_staff only
/profile
```

## Environment

A local `.env.local` is included in the delivered ZIP for local testing:

```env
NEXT_PUBLIC_API_BASE_URL=/api
BACKEND_API_BASE_URL=http://localhost:5000/api
```

`.env.local` is ignored by Git. Commit `.env.example`, not `.env.local`.

## Run

Start the backend first on port 5000, then:

```bash
npm install
npm run dev
```

The Staff Portal runs at:

```text
http://localhost:3001
```

Open:

```text
http://localhost:3001/staff/login
```

## Owner/Staff setup

The initial `owner_staff` account is intentionally **not created from this frontend**. It remains the protected one-time Postman/system setup flow in the backend. After the account is verified, it can sign in through `/staff/login`.

## Technician creation and verification

1. Owner/Staff opens **Technicians**.
2. Click **Add technician** and enter full name, email, contact number, and initial password.
3. Backend creates a pending technician and emails the verification OTP.
4. The Owner/Staff Add Technician modal switches to OTP verification. Enter the OTP sent to the technician email.
5. After verification, the technician becomes active and can sign in from `/staff/login`.

Only verified technicians are returned by the backend technician-list endpoint, so a newly created pending technician appears in the list only after OTP verification.

## Security notes

- JWT access/refresh tokens remain in HttpOnly cookies; the frontend does not place them in localStorage.
- The frontend does not store a role hint for authentication. The authenticated user role comes from the backend profile/session response.
- Direct technician access to `/technicians` is blocked in the UI and the backend still enforces Owner/Staff-only RBAC.
- Disabling a technician invalidates their backend sessions; the next protected request returns them to login.
