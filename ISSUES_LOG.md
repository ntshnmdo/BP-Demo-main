# Battery Passport — Issues Log

A running record of every bug encountered and how it was resolved.

---

## Issue #1 — Delete Button Not Visible (Bottom Row Clipping)
**Date:** 2026-07-06
**Symptom:** Delete button was missing on the bottom battery in the View Batteries table.
**Root Cause:** Table container had `overflow-hidden` CSS, clipping downward-opening dropdowns.
**Fix:** Added dynamic `bottom-full` vs `top-full` positioning based on row index.
**File:** `apps/frontend/src/app/(dashboard)/passports/page.tsx`

---

## Issue #2 — Delete Button Not Responding to Click
**Date:** 2026-07-07
**Symptom:** Clicking Delete in the dropdown did nothing — no dialog appeared.
**Root Cause:** `window.confirm()` is blocked by Chrome's sandbox when behind proxy tunnels (Pinggy, localtunnel). It returned `false` silently.
**Fix:** Replaced with a custom inline two-click confirmation (first click: shows red "Confirm Delete?", second click: executes delete). No browser popup dependency.
**File:** `apps/frontend/src/app/(dashboard)/passports/page.tsx`

---

## Issue #3 — Table Showing Mock Data / Delete Using Wrong IDs
**Date:** 2026-07-08
**Symptom:** After fixing the button, Confirm Delete still did nothing. Table showed mock passports with fake IDs (1, 2, etc.).
**Root Cause (Critical):** `getPassports()` had a silent `try/catch` that swallowed ALL API errors and returned hardcoded mock data. Delete was calling `DELETE /api/passports/1` (mock ID) which does not exist in the database.
**Fix:** Removed mock fallback from `getPassports()`. Errors now propagate properly. Table shows real database records with real IDs.
**File:** `apps/frontend/src/lib/api/passports.ts`

---

## Issue #4 — Create Passport Form Submission Failing Silently
**Date:** 2026-07-08
**Symptom:** Clicking "Create Passport" at the end of the multi-step form did nothing.
**Root Cause (Two-part):**
1. Field name mismatch: frontend used `capacityKwh`, backend expected `capacity` etc.
2. Date format mismatch: form produced `7/8/2026` but backend requires ISO 8601 (`2026-07-08T00:00:00.000Z`).
**Fix:** Added a payload mapper in `createPassport()` that translates all field names and converts dates to `.toISOString()`.
**File:** `apps/frontend/src/lib/api/passports.ts`

---

## Issue #5 — Calendar and Help Buttons Have No Functionality
**Date:** 2026-07-08
**Symptom:** Calendar icon and Help/? icon did nothing when clicked.
**Root Cause:** Buttons had no onClick handlers — purely decorative.
**Fix:** Calendar navigates to /tasks; Help opens a modal with keyboard shortcuts and docs.
**File:** `apps/frontend/src/components/layout/Topbar.tsx`

---

## Issue #6 — Localtunnel "Tunnel is Busy"
**Date:** 2026-07-08
**Symptom:** Pages were extremely slow or returned "Tunnel is busy" when sharing via localtunnel.
**Root Cause:** Localtunnel's free shared servers are rate-limited.
**Fix:** Switched to Pinggy over port 443: `ssh -p 443 -R 80:localhost:3000 a.pinggy.io`

---

## Issue #7 — db:migrate Not Recognized in PowerShell
**Date:** 2026-07-08
**Symptom:** Running `db:migrate` throws "not recognized as a cmdlet".
**Root Cause:** npm scripts require the `npm run` prefix. Turborepo also makes Prisma non-interactive.
**Fix:** Run directly: `npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma`

---
