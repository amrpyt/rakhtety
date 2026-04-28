# Phase 1: Core Foundation - Pattern Map

**Phase:** 01 - Core Foundation
**Generated:** 2026-04-28

---

## File List from Context & Research

| File | Role | Data Flow | Analog in Codebase | Status |
|------|------|-----------|-------------------|--------|
| `supabase/schema.sql` | Database schema | Schema definition | None (new) | New |
| `src/lib/supabase/client.ts` | Supabase client | Client-side DB access | None (new) | New |
| `src/lib/supabase/server.ts` | Server Supabase client | Server-side DB access | None (new) | New |
| `src/middleware.ts` | Auth middleware | JWT validation | None (new) | New |
| `src/app/(auth)/login/page.tsx` | Login page | User auth entry | `rakhtety-erp-demo.html` lines 1400+ | Extracted |
| `src/app/(dashboard)/layout.tsx` | Dashboard shell | App layout | `rakhtety-erp-demo.html` `.app-shell` | Extracted |
| `src/app/(dashboard)/page.tsx` | Dashboard home | KPIs display | `rakhtety-erp-demo.html` KPI cards | Extracted |
| `src/app/(dashboard)/clients/page.tsx` | Client list | CRM read | `rakhtety-erp-demo.html` clients table | Extracted |
| `src/app/(dashboard)/clients/[id]/page.tsx` | Client profile | CRM detail | `rakhtety-erp-demo.html` workflow view | Extracted |
| `src/app/(dashboard)/employees/page.tsx` | Employee list | Employee management | `rakhtety-erp-demo.html` employees section | Extracted |
| `src/components/ui/Button.tsx` | Button component | Reusable | `rakhtety-erp-demo.html` `.btn` | Extracted |
| `src/components/ui/Card.tsx` | Card component | Reusable | `rakhtety-erp-demo.html` `.card` | Extracted |
| `src/components/ui/Badge.tsx` | Badge component | Status display | `rakhtety-erp-demo.html` `.badge` | Extracted |
| `src/components/ui/KpiCard.tsx` | KPI card | Metrics display | `rakhtety-erp-demo.html` `.kpi-card` | Extracted |
| `src/components/ui/Table.tsx` | Table wrapper | Data display | `rakhtety-erp-demo.html` `.table-wrap` | Extracted |
| `src/components/ui/Form.tsx` | Form primitives | Input handling | `rakhtety-erp-demo.html` `.form-*` | Extracted |
| `src/components/ui/Tabs.tsx` | Tab component | Workflow switching | `rakhtety-erp-demo.html` `.tabs` | Extracted |
| `src/components/ui/Alert.tsx` | Alert component | Notifications | `rakhtety-erp-demo.html` `.alert` | Extracted |
| `src/components/ui/ProgressBar.tsx` | Progress indicator | Step progress | `rakhtety-erp-demo.html` `.progress-*` | Extracted |
| `src/components/layout/Sidebar.tsx` | Navigation rail | App navigation | `rakhtety-erp-demo.html` `.sidebar` | Extracted |
| `src/components/layout/TopBar.tsx` | Page header | Header with actions | `rakhtety-erp-demo.html` `.top-bar` | Extracted |
| `src/components/workflow/WorkflowStep.tsx` | Step display | Workflow visualization | `rakhtety-erp-demo.html` `.workflow-step` | Extracted |
| `src/styles/globals.css` | Global styles | CSS custom properties | `rakhtety-erp-demo.html` `:root` tokens | Extracted |

---

## Code Excerpts from Demo

### CSS Design Tokens (lines 15-60)
```css
:root {
  --color-primary: #01696f;
  --color-primary-hover: #0c4e54;
  --color-primary-light: #e8f4f4;
  --color-success: #437a22;
  --color-warning: #964219;
  --color-error: #b91c1c;
  --sidebar-w: 260px;
  --font-body: 'Cairo', 'Segoe UI', sans-serif;
}
```

### Login Form Structure (lines ~1400)
```html
<form class="login-form" onsubmit="handleLogin(event)">
  <input type="email" name="email" placeholder="البريد الإلكتروني">
  <input type="password" name="password" placeholder="كلمة المرور">
  <button type="submit" class="btn btn-primary btn-full">دخول</button>
</form>
```

### Sidebar Navigation (lines ~509-546)
```html
<aside class="sidebar">
  <div class="sidebar-logo">...</div>
  <nav class="sidebar-nav">
    <div class="nav-section-label">الرئيسية</div>
    <div class="nav-item" onclick="showPage('dashboard',this)">
      <i data-lucide="layout-dashboard"></i> لوحة التحكم
    </div>
    ...
  </nav>
  <div class="sidebar-footer">...</div>
</aside>
```

### Workflow Step Structure (lines ~931-987)
```html
<div class="workflow-step done">
  <div class="step-circle"><i data-lucide="check"></i></div>
  <div class="step-body">
    <div class="step-title">بيان الصلاحية</div>
    <div class="step-meta">اكتمل في 12 يناير 2025 · سارة</div>
    <div class="step-financials">
      <div class="step-fin-item">
        <div class="step-fin-label">رسوم</div>
        <div class="step-fin-value" style="color:var(--color-warning)">500 ج.م</div>
      </div>
    </div>
  </div>
</div>
```

---

## Pattern Classification

### Authentication Patterns
- Session persistence via Supabase Auth
- JWT middleware validation
- Role-based access (admin, employee, manager)

### CRM Patterns
- Client CRUD with full address fields
- Full-text search (name, phone, parcel)
- Client → Workflow → Steps hierarchy

### Workflow UI Patterns
- Two-tab interface (Device License / Excavation Permit)
- Linear step progression with status badges
- Financial info per step (fees + profit)
- Dependency lock visualization (gray overlay + lock icon)

### Component Patterns
- CSS custom properties for theming
- BEM-like class naming in demo
- Cairo font for Arabic text
- RTL direction throughout
- Lucide icons (loaded via CDN in demo)

---

*Pattern mapping complete*
