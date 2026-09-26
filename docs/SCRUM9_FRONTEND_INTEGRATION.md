# SCRUM-9 Frontend Integration

## Scope
This addition implements only the Owner/Staff Repair Job Registration frontend and keeps the existing authentication, technician management, profile and dashboard behavior intact.

## Route
- `GET /repair-jobs/new` - protected UI route, Owner/Staff only.

## Backend APIs used
- `GET /api/staff/customers?query=<text>&limit=10`
  - searches active, email-verified Customer accounts.
- `POST /api/staff/jobs`
  - sends `customerId`, `deviceType`, `makeModel`, optional `serialNumber`, `reportedFault`.
  - sends an `Idempotency-Key` request header.

## Duplicate protection
The form keeps the same generated idempotency key when the exact same payload is retried. If the payload changes, the UI generates a new key. This prevents accidental double-click/network retry duplicates while avoiding an invalid same-key/different-body request.

## Files added
- `app/repair-jobs/new/page.tsx`
- `src/shared/api/repairJobs.api.ts`
- `src/shared/types/repairJobs.ts`
- `src/views/repair-jobs/ui/RegisterRepairJobPage.tsx`
- `src/widgets/repair-jobs/ui/CustomerLookup.tsx`
- `src/widgets/repair-jobs/ui/RepairIntakeForm.tsx`
- `docs/SCRUM9_FRONTEND_INTEGRATION.md`

## Existing file updated
- `src/widgets/dashboard/ui/InternalDashboardShell.tsx`
  - adds one Owner/Staff-only sidebar entry for `Register Repair Job`.
  - no existing route or authentication behavior was removed.

## Run
1. Backend: `npm run dev` on port 5000.
2. Admin frontend: `npm run dev` on port 3001.
3. Login as Owner/Staff.
4. Open `http://localhost:3001/repair-jobs/new`.
