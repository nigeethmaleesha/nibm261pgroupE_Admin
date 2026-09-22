# Backend Integration

Frontend base URL is proxied through Next.js:

```env
NEXT_PUBLIC_API_BASE_URL=/api
BACKEND_API_BASE_URL=http://localhost:5000/api
```

## Shared staff authentication

Owner/Staff and Technician use the same login screen. The user enters only email + password. The backend finds the account by email and uses the role stored on that account.

- `POST /api/internal/auth/login`
- `POST /api/internal/auth/login/verify-otp`
- `POST /api/internal/auth/login/resend-otp`
- `POST /api/internal/auth/forgot-password/initiate`
- `POST /api/internal/auth/forgot-password/resend-otp`
- `POST /api/internal/auth/forgot-password/verify-otp`
- `POST /api/internal/auth/forgot-password/change`
- `POST /api/internal/auth/refresh-token`
- `POST /api/internal/auth/logout`
- `GET /api/internal/auth/me`

The login response does not require the frontend to choose an Owner/Staff or Technician endpoint. After OTP verification, the returned `user.role` controls navigation and permissions.

## Technician management

Owner/Staff only:

- `POST /api/staff/technicians`
- `POST /api/staff/technicians/verify-otp`
- `POST /api/staff/technicians/resend-otp`
- `GET /api/staff/technicians`
- `PATCH /api/staff/technicians/:technicianId/toggle-active`

Technician account verification is completed inside the Owner/Staff Add Technician modal. There is no separate public technician-activation page in this frontend.

## Cookies

Access and refresh JWTs remain in HttpOnly cookies. The frontend does not copy JWTs into localStorage. When an authenticated request returns `401`, the API client calls `/api/internal/auth/refresh-token` once and retries the original request.
