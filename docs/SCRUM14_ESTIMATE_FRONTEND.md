# SCRUM-14 Admin Frontend Integration

Only the Owner/Staff frontend is changed. The customer frontend remains untouched because customer current-estimate viewing is SCRUM-15.

## Routes

- `/repair-jobs/estimate` — standalone job lookup by reference or MongoDB ID. This keeps SCRUM-14 usable before the SCRUM-10 job-search screen is merged.
- `/repair-jobs/[jobIdentifier]/estimate` — estimate context + line-item editor.

## API

- `GET /api/staff/jobs/:jobIdentifier/estimate-context`
- `POST /api/staff/jobs/:jobIdentifier/estimates`

The existing HttpOnly Owner/Staff session and automatic refresh handling are reused. No new token storage was added.

## UI validation

The editor supports PART/LABOUR rows, add/remove line controls, positive whole-number quantity, non-negative unit price with at most two decimals, per-line LKR preview, total preview, and issue confirmation. The server response is authoritative for money values.

If SCRUM-13 has not been merged, the editor shows the backend prerequisite message instead of allowing issue. Use the backend development script documented in `docs/SCRUM14_REPAIR_ESTIMATE.md` only when you need isolated test data.
