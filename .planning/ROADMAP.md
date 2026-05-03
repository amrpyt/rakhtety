# Roadmap: رخصتي (Rakhtety) ERP

**Created:** 2026-04-27
**Granularity:** Standard (6 phases, 3-5 plans each)
**Requirements:** 31 v1 requirements mapped

---

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|-----------------|
| 1 | Core Foundation | Supabase setup, Auth, CRM, basic Workflow UI | 16 | 4 |
| 2 | Workflow Engine | Full state machine, dependency enforcement, step completion | 7 | 4 |
| 3 | Financial Layer | Fees, payments, debt tracking, profit calculation | 5 | 4 |
| 4 | Document Management | File uploads, required document validation | 4 | 3 |
| 5 | Dashboard & Analytics | KPIs, bottleneck detection, alerts, employee tracking | 6 | 4 |
| 6 | Client Reporting & Polish | Arabic PDF reports, final polish, Cloudflare deployment | 4 | 4 |

---

## Phase 1: Core Foundation

**Goal:** Set up Supabase project, authentication, basic CRM, and workflow UI skeleton

### Requirements
- CRM-01, CRM-02, CRM-03, CRM-04
- AUTH-01, AUTH-02, AUTH-03, AUTH-04
- WF-01 (UI only), WF-04 (UI only), WF-05 (UI only)
- EMP-01, EMP-02

### Success Criteria
1. User can sign up/login with email/password
2. Admin can create employee accounts with roles (Admin, Employee, Manager)
3. User can add new client with all address fields
4. User can see workflow list with Device License and Excavation Permit tabs

### Plans
1. **Supabase Project Setup** — Create Supabase project, enable Auth, set up database
2. **Authentication System** — Email/password auth, role-based access control
3. **CRM Core** — Client database, search, profile view
4. **Employee Management** — Employee CRUD, workflow assignment

---

## Phase 2: Workflow Engine

**Goal:** Implement full workflow state machine with database-enforced transitions and dependency gates

### Requirements
- WF-01 (state machine)
- WF-02 (state machine)
- WF-03 (dependency enforcement)
- WF-04 (state tracking)
- WF-05 (financial config per step)

### Success Criteria
1. Workflow state transitions are database-enforced (no invalid transitions)
2. Excavation Permit workflow is blocked until Device License is COMPLETED
3. Each step shows status, assigned employee, completion date
4. Each step shows government fees and office profit

### Plans
1. **Database Schema for Workflows** (02-01) — State transition trigger + workflow_step_configs table
2. **State Machine Implementation** (02-02) — App-level validation + error handling + tests
3. **Workflow Dependency Gate** (02-03) — Excavation Permit blocked until Device License complete
4. **Step Completion with Financial Config** (02-04) — Mark Complete button + fees/profit display

### Status: Planning complete - 4 plans created

---

## Phase 3: Financial Layer

**Goal:** Implement financial tracking, payment recording, and debt calculation

### Requirements
- FIN-01, FIN-02, FIN-03, FIN-04, FIN-05

### Success Criteria
1. Each workflow step registers government fee and office profit
2. User can record payments against workflows
3. System calculates total cost, total paid, outstanding debt per client
4. Dashboard shows total fees collected, total profit, total debt

### Plans
1. **Financial Events Schema** — Event-sourced financial records
2. **Payment Recording** — Record payments, allocate to specific fees
3. **Debt Calculation** — Compute outstanding balance from events
4. **Financial Dashboard Widgets** — KPI cards for financial metrics

### Status: Complete - verified 2026-04-29

---

## Phase 4: Document Management

**Goal:** Implement file uploads, required document validation, and document storage

### Requirements
- DOC-01, DOC-02, DOC-03, DOC-04

### Success Criteria
1. User can upload documents per workflow step
2. Documents are stored with type, upload date, uploader
3. Step cannot be marked complete without required documents
4. Optional documents don't block progress

### Plans
1. **Supabase Storage Setup** — Bucket for documents, RLS policies
2. **File Upload UI** — Drag-and-drop upload zone per step
3. **Document Validation** — Block step completion if required docs missing
4. **Document List View** — View all uploaded documents per workflow

### Status: Complete - verified 2026-04-29

---

## Phase 5: Dashboard & Analytics

**Goal:** Implement KPI dashboard, bottleneck detection, alerts, and employee tracking

### Requirements
- DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
- EMP-03

### Success Criteria
1. Dashboard shows: active files, completed this month, pending debt, bottlenecks
2. System identifies files stuck > 7 days at same step
3. Bottleneck view shows: client, step, employee, days stuck
4. Manager can send alert to employee about bottleneck

### Plans
1. **KPI Dashboard Cards** — Active files, completion rate, debt metrics
2. **Bottleneck Detection** — Query workflows stuck > 7 days
3. **Bottleneck UI** — List view with employee assignment and alert button
4. **Alert System** — Send notification to employee (in-app notification center)

### Status: Complete - verified 2026-04-29

---

## Phase 6: Client Reporting & Polish

**Goal:** Generate professional Arabic PDF reports and deploy to Cloudflare Pages

### Requirements
- RPT-01, RPT-02, RPT-03, RPT-04, RPT-05

### Success Criteria
1. User can generate PDF report for any client
2. Report shows completed steps with checkmark
3. Report shows pending steps
4. Report shows financial summary with Arabic formatting

### Plans
1. **PDF Report Template** — jsPDF template with RTL Arabic layout
2. **Report Data Aggregation** — Collect workflow progress and financial data
3. **Arabic PDF Generation** — Generate PDF with Cairo font, proper RTL
4. **Cloudflare Pages Deployment** — Build and deploy static app

---

## Success Criteria Summary

| Phase | Criteria |
|-------|----------|
| 1 | Auth works, roles enforced, CRM functional, workflow UI skeleton |
| 2 | State machine enforced, dependencies block correctly, financials configured |
| 3 | Financial events recorded, payments tracked, debt calculated |
| 4 | Documents uploaded, required docs enforced, optional docs allowed |
| 5 | KPIs displayed, bottlenecks detected, alerts sent |
| 6 | Arabic PDF generated, app deployed to Cloudflare Pages |

---

*Roadmap created: 2026-04-27*
*Last updated: 2026-05-03 - Phase 7 and Phase 8 removed*
