# Technology Stack

**Project:** Engineering License Management ERP (Egypt)
**Researched:** 2026-04-27
**Confidence:** MEDIUM-HIGH

> **Why MEDIUM-HIGH and not HIGH:** Some recommendations are based on recent 2026 articles that haven't been battle-tested in production for years. Firebase vs Supabase choice particularly depends on specific project constraints. Verify specific version numbers against official docs before implementation.

---

## Recommended Stack

### Backend-as-a-Service: Supabase

| Property | Value | Rationale |
|----------|-------|-----------|
| **Service** | Supabase | Open-source Firebase alternative |
| **Database** | PostgreSQL 15+ | Relational data, ACID compliance |
| **Auth** | Supabase Auth | Built-in, Row Level Security integration |
| **Storage** | Supabase Storage | File uploads with policy controls |
| **Realtime** | Supabase Realtime | Postgres changes as websocket events |
| **Edge Functions** | Deno Deploy / Supabase Edge | Serverless function execution |

**Why Supabase over Firebase:**
- **SQL over NoSQL** — License workflows have structured relational data (applications, steps, users, fees). SQL queries are more powerful for reporting and aggregations.
- **Predictable pricing** — Tier-based pricing vs Firebase's per-operation costs that compound at scale.
- **Open-source escape hatch** — Can self-host if needed; vendor lock-in risk is lower.
- **Row Level Security (RLS)** — Native PostgreSQL RLS provides tenant isolation for multi-client deployments.

**Sources:**
- [Supabase vs Firebase 2026 Comparison](https://www.digitalapplied.com/blog/supabase-vs-firebase-2026-backend-comparison-guide) (Jan 2026)
- [Supabase for B2B SaaS](https://supabase.com/solutions/b2b-saas) (Official)
- [Why Supabase for startups 2026](https://makerkit.dev/blog/tutorials/best-database-software-startups) (Jan 2026)

---

### Frontend Framework: React 19 + shadcn/ui

| Property | Value | Rationale |
|----------|-------|-----------|
| **Framework** | React 19 | Latest with concurrent features |
| **UI Library** | shadcn/ui | Copy-paste component model, Tailwind-based |
| **RTL Support** | First-class (Jan 2026) | Arabic layout automatically adapts |
| **Styling** | Tailwind CSS 4 | Utility-first, excellent RTL logical properties |
| **State** | React Query (TanStack Query) | Server state management, caching |
| **Forms** | React Hook Form + Zod | Performance + validation |

**Why this combination:**
- **shadcn/ui RTL** — As of January 2026, shadcn/ui has first-class RTL support. Components automatically adapt for Arabic without manual direction switching.
- **Tailwind logical properties** — Classes like `ms-4` (margin-inline-start) and `text-start` automatically flip for RTL, reducing CSS customization needed.
- **Copy-paste model** — No npm dependency for components; you own the code, easier to customize for Arabic typography.

**RTL Implementation:**
```html
<!-- Direction set at root -->
<html dir="rtl" lang="ar">
<!-- Components automatically adapt -->
<div class="flex items-center gap-4">
  <div class="text-end">اسم الترخيص</div>
</div>
```

**Sources:**
- [shadcn/ui RTL Support Changelog](https://ui.shadcn.com/docs/changelog/2026-01-rtl) (Jan 2026)
- [Tailwind CSS RTL Documentation](https://tailwindcss.com/docs/rtl) (Official)
- [shadcn/ui Handbook 2026](https://shadcnspace.com/blog/shadcn-ui-handbook) (Mar 2026)

---

### Static Frontend Deployment

| Option | Free Tier | Bandwidth | Best For |
|--------|-----------|-----------|----------|
| **Cloudflare Pages** | ✓ Unlimited | Unlimited | Production ERP with generous needs |
| **Vercel** | ✓ 100GB/mo | 100GB/mo | Next.js projects, preview deployments |
| **Netlify** | ✓ 100GB/mo | 100GB/mo | Simple static sites, forms/functions |

**Recommendation: Cloudflare Pages**

- **Unlimited bandwidth** on free tier — critical for ERP systems where multiple clients download reports simultaneously
- **Automatic Arabic font optimization** via Cloudflare's content delivery
- **Static export compatibility** — React/Vite projects can build to static HTML

**Sources:**
- [Cloudflare Pages vs Netlify vs Vercel 2026](https://coderfile.io/blog/vercel-vs-netlify-vs-cloudflare-2026) (Mar 2026)
- [Free Tier Comparison](https://github.com/iSoumyaDey/Awesome-Web-Hosting-2026) (Verified 2026)

---

### Report Generation

| Library | Use Case | Complexity |
|---------|----------|------------|
| **jsPDF** | Simple PDFs, quick demos | Low |
| **@react-pdf/renderer** | React components → PDF | Medium |
| **Puppeteer** | HTML templates to PDF, high fidelity | High (server-side) |

**Recommendation: jsPDF for MVP**

For a static frontend demo, jsPDF works client-side without server requirements:
- Lightweight (~200KB)
- Generates PDF from scratch or simple templates
- Works offline after initial load

**For production upgrade path:**
- Phase 1: jsPDF client-side
- Phase 2: Serverless function (Supabase Edge) using Puppeteer for complex Arabic-rendered reports with proper RTL support

**Sources:**
- [Top JavaScript PDF Libraries 2026](https://www.nutrient.io/blog/top-js-pdf-libraries/) (Feb 2026)
- [React PDF Generation 2026](https://viprasol.com/blog/react-pdf-generation/) (Dec 2025)

---

### Workflow Engine (Multi-Step Approvals)

| Approach | Complexity | Supabase Native |
|----------|------------|-----------------|
| **Database-driven state machine** | Medium | ✓ |
| **Supabase Workflows (beta)** | Low | ✓ (limited) |
| **External: DBOS** | Medium | ✓ Integration available |

**Recommendation: Database-driven state machine**

For 5-step workflows, a simple PostgreSQL table with state tracking is sufficient:

```sql
CREATE TABLE license_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('device_license', 'excavation_permit')),
  current_step INTEGER DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
  status TEXT DEFAULT 'draft',
  applicant_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE workflow_event AS ENUM (
  'submit', 'approve_step', 'reject_step', 'request_clarification', 'complete'
);
```

**Why not Supabase Workflows (beta):**
- Still maturing (announced Apr 2021, still not GA)
- DBOS integration is Python-based, adds complexity
- Simple state in Postgres is battle-tested

**Sources:**
- [Supabase Workflows Announcement](https://supabase.com/blog/supabase-workflows) (Apr 2021)
- [DBOS Durable Workflows in Postgres](https://supabase.com/blog/durable-workflows-in-postgres-dbos) (Dec 2024)

---

### File Storage

| Provider | Free Tier | File Size Limit | Notes |
|----------|-----------|-----------------|-------|
| **Supabase Storage** | 1GB | 50MB | Native auth integration |
| **Firebase Storage** | 5GB | 5TB (paid) | 1GB free, 5MB limit |

**Recommendation: Supabase Storage**

- Integrated with Supabase Auth — no separate authentication layer
- RLS policies for access control per application
- Generous for demo (1GB); professional tier at $25/mo for 100GB

**Sources:**
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage) (Official)

---

## Complete Installation

```bash
# Core dependencies
npm create vite@latest . -- --template react-ts
npm install @supabase/supabase-js @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install tailwindcss @tailwindcss/vite
npm install lucide-react clsx tailwind-merge

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card form input select table badge
npx shadcn@latest add tabs -y  # For workflow steps

# PDF generation
npm install jspdf html2canvas

# Optional: Date handling for Arabic calendars
npm install date-fns @date-io/date-fns
```

---

## Architecture Decision Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| BaaS Platform | **Supabase** | SQL + RLS + predictable pricing |
| Frontend | **React 19 + shadcn/ui** | RTL-first, component ownership |
| Styling | **Tailwind CSS 4** | Logical properties for RTL |
| Deployment | **Cloudflare Pages** | Unlimited bandwidth |
| Workflow | **Postgres state machine** | Simple, reliable, no external deps |
| Reports | **jsPDF** | Client-side, zero server |
| Storage | **Supabase Storage** | Native auth + RLS |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| BaaS | Supabase | Firebase | NoSQL less suited for relational workflows; per-operation pricing |
| UI Library | shadcn/ui | Material UI | Mui has RTL support but heavier; shadcn is lighter |
| Deployment | Cloudflare Pages | Vercel | Vercel's free tier has bandwidth cap |
| Workflow | Postgres state | Temporal/DBOS | Added complexity for 5-step flows |
| Reports | jsPDF | @react-pdf/renderer | Simpler for static demo, easier RTL handling |

---

## Sources

| Source | Confidence | Date |
|--------|------------|------|
| [Supabase vs Firebase 2026 Backend Comparison](https://www.digitalapplied.com/blog/supabase-vs-firebase-2026-backend-comparison-guide) | MEDIUM | Jan 2026 |
| [shadcn/ui RTL Support](https://ui.shadcn.com/docs/changelog/2026-01-rtl) | HIGH | Jan 2026 |
| [Tailwind CSS RTL Docs](https://tailwindcss.com/docs/rtl) | HIGH | Current |
| [MakerKit Best Database 2026](https://makerkit.dev/blog/tutorials/best-database-software-startups) | MEDIUM | Jan 2026 |
| [Top JS PDF Libraries 2026](https://www.nutrient.io/blog/top-js-pdf-libraries/) | MEDIUM | Feb 2026 |
| [Cloudflare vs Netlify vs Vercel](https://coderfile.io/blog/vercel-vs-netlify-vs-cloudflare-2026) | MEDIUM | Mar 2026 |
| [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) | HIGH | Current |
| [DBOS Workflows in Postgres](https://supabase.com/blog/durable-workflows-in-postgres-dbos) | HIGH | Dec 2024 |
