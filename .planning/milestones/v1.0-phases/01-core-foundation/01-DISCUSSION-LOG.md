# Phase 1: Core Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 01-Core Foundation
**Areas discussed:** Auth Flow Details, Database Schema Approach, CRM Search Implementation, Frontend Stack — SPA vs Framework

---

## Auth Flow Details

| Option | Description | Selected |
|--------|-------------|----------|
| 24 hours | Secure, daily login. Best for shared workstations | |
| 7 days (Recommended) | Balance — employee laptops with reasonable security | |
| 30 days | Convenient but less audit-ready | |
| Until he logs out | Persistent session | ✓ |

**User's choice:** Until he logs out (persistent session)
**Notes:** Session persists until user explicitly logs out

---

| Option | Description | Selected |
|--------|-------------|----------|
| Simple link via Supabase | Self-service, no extra services needed | |
| Email + phone OTP | Extra security like banking | |
| No verification | No verification flow yet | ✓ |

**User's choice:** No verification

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dark full-page (Recommended) | Modern dark theme with blur backdrop, matches demo aesthetic | |
| Light minimal | Clean white page, focused, simple | |
| Extract from demo.html | Match demo HTML exactly | ✓ |

**User's choice:** Extract from demo.html

---

| Option | Description | Selected |
|--------|-------------|----------|
| email + password (Recommended) | Better DX, real-time ready | ✓ |
| Magic link | Extra login step but not needed | |
| Password only | Add Google later if needed | |

**User's choice:** email + password

---

## Database Schema Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Single table with type | All workflows in one table, phase distinction via type column | ✓ |
| Separate tables | Separate tables, cleaner queries but more complex joins | |

**User's choice:** Single table with type column
**Notes:** Best practice approach

---

| Option | Description | Selected |
|--------|-------------|----------|
| JSONB array (Recommended) | Steps in JSONB array. Simpler for MVP, step ordering in code | |
| Separate table (Recommended) | Separate 'workflow_steps' table, full CRUD, better for complex scenarios | ✓ |

**User's choice:** Separate table
**Notes:** Enterprise best practice level

---

| Option | Description | Selected |
|--------|-------------|----------|
| Role-based (Recommended) | Admins see all. Employees see assigned only. Simpler, matches AUTH-03 | ✓ |
| Custom RLS policies | Complex but flexible — row-level filtering on any column | |

**User's choice:** Role-based

---

## CRM Search Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase full-text (Recommended) | Simple, Supabase built-in, fast enough for MVP. Good for name, phone, parcel | ✓ |
| External search service | Better for large datasets, but adds complexity | |
| Simple LIKE queries | Basic ILIKE queries | |

**User's choice:** Supabase full-text

---

## Frontend Stack — SPA vs Framework

| Option | Description | Selected |
|--------|-------------|----------|
| Next.js + React (Recommended) | Full power, server-side rendering, API routes, better for ERP. Recommended for complexity | ✓ |
| Vanilla JS SPA | Single HTML file, simplest path, faster initial build | |

**User's choice:** Next.js + React

---

| Option | Description | Selected |
|--------|-------------|----------|
| Extract from demo (Recommended) | Extract components from demo.html. Start with the demo then enhance | ✓ |
| New components from scratch | Build clean components using demo as style reference | |

**User's choice:** Extract from demo

---

## Agent's Discretion

- Exact component extraction strategy from demo.html
- CSS variable mapping from demo to Next.js/React format
- Login page form validation details

## Deferred Ideas

None — discussion stayed within Phase 1 scope.