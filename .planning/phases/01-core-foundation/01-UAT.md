---
status: completed
phase: 01-core-foundation
source: P-01-SUMMARY.md, P-02-SUMMARY.md, P-03-SUMMARY.md, P-04-SUMMARY.md
started: 2026-04-28T00:00:00Z
updated: 2026-04-28T15:58:00Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  Kill any running server. Clear any caches or lock files. Start the Next.js app with `npm run dev`. Server boots without errors and the login page loads in the browser.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: |
  Kill any running server. Clear any caches or lock files. Start the Next.js app with `npm run dev`. Server boots without errors and the login page loads in the browser.
result: PASSED

### 2. Login Page Renders
expected: |
  Visit /login — you should see a dark blurred background with Arabic branding "رخصتي" (Licenses System), an email field, password field, and a "دخول" (Login) button.
result: PASSED

### 3. Login Form Validation
expected: |
  Submit the login form with empty fields — Arabic validation errors should appear: "البريد الإلكتروني مطلوب" and "كلمة المرور مطلوبة".
result: PASSED (after noValidate fix applied)

### 4. Login with Credentials
expected: |
  Enter valid Supabase credentials and click login — you should be redirected to /dashboard.
result: BLOCKED - Supabase credentials not available

### 6. Sidebar Navigation
expected: |
  After logging in, the sidebar shows Arabic labels: "لوحة التحكم" (Dashboard), "ملفات العملاء" (Clients), "مسارات العمل" (Workflows), "الموظفون" (Employees). All labels are in Arabic.
result: BLOCKED - requires Supabase auth

### 7. Dashboard KPI Cards
expected: |
  On /dashboard, you see 4 KPI cards with icons: إجمالي العملاء (Total Clients), مسارات العمل النشطة (Active Workflows), تم الإنجاز (Completed), في الانتظار (Pending).
result: BLOCKED - requires Supabase auth

### 8. Clients List Card View
expected: |
  Visit /clients — you see a grid of client cards showing name, phone, city. Toggle to card view shows cards with Badge showing the parcel number.
result: BLOCKED - requires Supabase auth

### 9. Clients Search
expected: |
  In the search bar on /clients, type a client name — results filter in real-time after 300ms debounce.
result: BLOCKED - requires Supabase auth

### 10. Client Detail Workflow Tabs
expected: |
  Click a client to visit /clients/[id] — you see two tabs: "🏗️ مسار رخصة الجهاز" (Device License) and "⛏️ مسار تصريح الحفر" (Excavation Permit). Device License tab shows 5 steps.
result: BLOCKED - requires Supabase auth

### 11. Excavation Permit Locked
expected: |
  On the client detail page, the Excavation Permit tab is disabled and shows a lock icon with message "لا يمكن بدء مسار تصريح الحفر قبل اكتمال رخصة الجهاز بالكامل" (Cannot start excavation permit before device license is complete).
result: BLOCKED - requires Supabase auth

### 12. Employees Page
expected: |
  Visit /employees — you see employee cards in a grid with avatar, name, position, role badge (e.g., "مدير النظام" for admin), and status badge ("نشط" for active).
result: BLOCKED - requires Supabase auth

### 13. Add Employee Dialog
expected: |
  Click "إضافة موظف" (Add Employee) — a dialog opens with fields: full name, email, phone, position, role. Submit with valid data creates a new employee card.
result: BLOCKED - requires Supabase auth

### 14. Edit Employee Dialog
expected: |
  Click "تعديل" (Edit) on an employee card — a dialog opens pre-filled with the employee's data. Saving changes updates the card.
result: BLOCKED - requires Supabase auth

### 15. Delete Employee Confirmation
expected: |
  Click "حذف" (Delete) on an employee card — a confirmation dialog asks "هل أنت متأكد..." with Cancel and Delete buttons.
result: BLOCKED - requires Supabase auth

### 5. Unauthenticated Redirect
expected: |
  Try to visit /dashboard without logging in — you should be redirected to /login.
result: PASSED (verified via curl: /dashboard → 307 → /login?redirect=%2Fdashboard)

### 6. Sidebar Navigation
expected: |
  After logging in, the sidebar shows Arabic labels: "لوحة التحكم" (Dashboard), "ملفات العملاء" (Clients), "مسارات العمل" (Workflows), "الموظفون" (Employees). All labels are in Arabic.
result: pending

### 7. Dashboard KPI Cards
expected: |
  On /dashboard, you see 4 KPI cards with icons: إجمالي العملاء (Total Clients), مسارات العمل النشطة (Active Workflows), تم الإنجاز (Completed), في الانتظار (Pending).
result: pending

### 8. Clients List Card View
expected: |
  Visit /clients — you see a grid of client cards showing name, phone, city. Toggle to card view shows cards with Badge showing the parcel number.
result: pending

### 9. Clients Search
expected: |
  In the search bar on /clients, type a client name — results filter in real-time after 300ms debounce.
result: pending

### 10. Client Detail Workflow Tabs
expected: |
  Click a client to visit /clients/[id] — you see two tabs: "🏗️ مسار رخصة الجهاز" (Device License) and "⛏️ مسار تصريح الحفر" (Excavation Permit). Device License tab shows 5 steps.
result: pending

### 11. Excavation Permit Locked
expected: |
  On the client detail page, the Excavation Permit tab is disabled and shows a lock icon with message "لا يمكن بدء مسار تصريح الحفر قبل اكتمال رخصة الجهاز بالكامل" (Cannot start excavation permit before device license is complete).
result: pending

### 12. Employees Page
expected: |
  Visit /employees — you see employee cards in a grid with avatar, name, position, role badge (e.g., "مدير النظام" for admin), and status badge ("نشط" for active).
result: pending

### 13. Add Employee Dialog
expected: |
  Click "إضافة موظف" (Add Employee) — a dialog opens with fields: full name, email, phone, position, role. Submit with valid data creates a new employee card.
result: pending

### 14. Edit Employee Dialog
expected: |
  Click "تعديل" (Edit) on an employee card — a dialog opens pre-filled with the employee's data. Saving changes updates the card.
result: pending

### 15. Delete Employee Confirmation
expected: |
  Click "حذف" (Delete) on an employee card — a confirmation dialog asks "هل أنت متأكد..." with Cancel and Delete buttons.
result: pending

## Summary

total: 15
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 11

## Gaps

| # | Gap | Severity | Fix Applied |
|---|-----|----------|-------------|
| 1 | LoginForm had browser native validation overriding Arabic React validation | High | Added `noValidate` to form element — browser was blocking submission before React validation ran |
## 2026-04-28 Browser Auth Check

Tested with browser-use against the live app after wiring Supabase SSR cookies and fixing the signup API.

- `POST /api/auth/signup` with a fresh test user passed and created the `profiles` row.
- `/dashboard` stayed on the protected route after injecting a valid Supabase session cookie.
- The dashboard shell loaded, but the browser-use session did not show the client-side user name, so that part is still not fully proven in this tool.
