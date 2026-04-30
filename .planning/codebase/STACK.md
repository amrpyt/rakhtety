# Technology Stack

**Analysis Date:** 2026-05-01

## Languages

**Primary:**
- TypeScript 6.0.3 - App Router pages, API routes, services, repositories, hooks, React components, and tests under `src/**/*.ts` and `src/**/*.tsx`.
- SQL - Supabase schema and migrations under `supabase/schema.sql` and `supabase/migrations/*.sql`.

**Secondary:**
- JavaScript - Tooling configuration in `next.config.mjs`, `eslint.config.mjs`, and `postcss.config.js`.
- HTML - Static UI reference in `rakhtety-erp-demo.html`.

## Runtime

**Environment:**
- Node.js v24.5.0 - Current local runtime reported by `node -v`.
- Next.js runtime - Server Components, Client Components, middleware, and route handlers in `src/app/**`.
- Cloudflare Workers - Production target configured by `wrangler.jsonc` with `main: ".open-next/worker.js"`.

**Package Manager:**
- pnpm 10.32.1 - Declared in `package.json` as `"packageManager": "pnpm@10.32.1"` and confirmed locally with `pnpm -v`.
- Lockfile: present at `pnpm-lock.yaml`.

## Frameworks

**Core:**
- Next.js 16.2.4 - App Router web application and API routes under `src/app/**`.
- React 19.2.5 - Interactive UI components under `src/components/**`, providers under `src/providers/**`, and hooks under `src/hooks/**`.
- Supabase JS 2.105.1 - Database, Auth, and Storage client used through `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, and `src/lib/supabase/admin.ts`.
- Supabase SSR 0.10.2 - Browser/server/middleware auth clients in `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, and `src/lib/supabase/proxy.ts`.

**Testing:**
- Vitest 4.1.5 - Unit/API tests configured by `vitest.config.ts`; tests live beside implementation files such as `src/lib/services/workflow.service.test.ts`, `src/lib/services/document.service.test.ts`, and `src/app/api/clients/route.test.ts`.

**Build/Dev:**
- TypeScript 6.0.3 - Strict type checking configured in `tsconfig.json`.
- ESLint 9.39.4 with `eslint-config-next` 16.2.4 - Linting configured in `eslint.config.mjs`.
- Tailwind CSS 3.4.13 - Utility styling configured in `tailwind.config.ts` and `postcss.config.js`.
- PostCSS 8.4.47 and Autoprefixer 10.4.20 - CSS processing configured in `postcss.config.js`.
- OpenNext Cloudflare 1.19.5 - Cloudflare build, preview, deploy, and upload pipeline in `package.json` scripts and `open-next.config.ts`.
- Wrangler 4.86.0 - Cloudflare Worker deployment and type generation configured by `wrangler.jsonc`.
- Vite 8.0.10 - Present as Vitest supporting build dependency in `package.json`.

## Key Dependencies

**Critical:**
- `next` 16.2.4 - Owns routing, rendering, middleware, and API route handlers in `src/app/**` and `src/middleware.ts`.
- `react` 19.2.5 and `react-dom` 19.2.5 - Render UI components in `src/components/**` and pages in `src/app/**`.
- `@supabase/supabase-js` 2.105.1 - Direct admin client in `src/lib/supabase/admin.ts` and typed Supabase access in app code.
- `@supabase/ssr` 0.10.2 - Cookie-aware auth clients in `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, and `src/lib/supabase/proxy.ts`.
- `zod` 4.4.1 - Runtime validation schemas in `src/lib/validation/schemas.ts` and request parsing in API routes.
- `react-hook-form` 7.74.0 and `@hookform/resolvers` 5.2.2 - Form state and Zod integration used by auth and business forms such as `src/components/auth/LoginForm.tsx` and `src/components/financial/PaymentForm.tsx`.

**Infrastructure:**
- `@opennextjs/cloudflare` 1.19.5 - Converts the Next.js app into a Cloudflare Worker using `open-next.config.ts`.
- `wrangler` 4.86.0 - Cloudflare deploy, preview, and type generation scripts in `package.json`.
- `tailwindcss` 3.4.13 - Styling utilities applied across `src/app/**` and `src/components/**`.
- `lucide-react` 1.14.0 - Icon dependency available to UI components.
- `@gsd-build/sdk` 0.1.0 - Declared in `package.json`; no direct imports detected in `src/**`.

## Configuration

**Environment:**
- Supabase URL is read from `NEXT_PUBLIC_SUPABASE_URL` in `src/config/database.config.ts`.
- Supabase browser/server public key is read from `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `src/config/database.config.ts`.
- Supabase service-role key is read from `SUPABASE_SERVICE_ROLE_KEY` in `src/config/database.config.ts`; use this only from server-side code such as `src/lib/supabase/admin.ts`.
- Auth behavior is centralized in `src/config/auth.config.ts`, including protected routes, public routes, default redirect, and role redirects.
- `.env.local` is present and must be treated as secret environment configuration. Do not read or commit its values.
- `.dev.vars` is present and must be treated as local Cloudflare/development environment configuration. Do not read or commit its values.
- `wrangler.jsonc` declares Cloudflare dashboard placeholders for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and documents `SUPABASE_SERVICE_ROLE_KEY` as a required Wrangler secret.

**Build:**
- `package.json` scripts:
  - `pnpm dev` runs `next dev`.
  - `pnpm build` runs `next build --webpack`.
  - `pnpm start` runs `next start`.
  - `pnpm lint` runs `eslint .`.
  - `pnpm test` runs `vitest run`.
  - `pnpm typecheck` runs `next typegen && tsc --noEmit`.
  - `pnpm preview` runs `opennextjs-cloudflare build && opennextjs-cloudflare preview`.
  - `pnpm deploy` runs `opennextjs-cloudflare build && opennextjs-cloudflare deploy`.
  - `pnpm upload` runs `opennextjs-cloudflare build && opennextjs-cloudflare upload`.
  - `pnpm cf-typegen` runs `wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts`.
- `tsconfig.json` enables strict TypeScript, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, and path aliases `@/*` to `src/*` and `@lib/*` to `src/lib/*`.
- `next.config.mjs` enables `reactStrictMode`.
- `eslint.config.mjs` uses Next core web vitals and TypeScript rules, with local warnings for React hook memoization/effect patterns.
- `tailwind.config.ts` scans `./src/**/*.{js,ts,jsx,tsx,mdx}`.
- `open-next.config.ts` configures Cloudflare R2 incremental cache via `r2IncrementalCache`.
- `wrangler.jsonc` configures Cloudflare Worker name `rakhtety`, compatibility date `2026-04-29`, `nodejs_compat`, assets binding, image binding, service self-reference, and R2 cache bucket.

## Platform Requirements

**Development:**
- Use pnpm 10.32.1 with Node.js compatible with Next.js 16 and TypeScript 6.
- Provide Supabase environment variables required by `src/config/database.config.ts`.
- Run local app with `pnpm dev`.
- Run checks with `pnpm lint`, `pnpm test`, and `pnpm typecheck`.
- Use `vitest.config.ts` path alias setup for tests that import from `@/*`.

**Production:**
- Deployment target is Cloudflare Workers through OpenNext and Wrangler.
- Build output is `.open-next/worker.js`, referenced by `wrangler.jsonc`.
- Cloudflare R2 bucket `rakhtety-opennext-cache` is required for Next incremental cache via binding `NEXT_INC_CACHE_R2_BUCKET`.
- Cloudflare Images binding `IMAGES` is configured in `wrangler.jsonc`.
- Supabase project must provide Postgres, Auth, and private Storage bucket `workflow-documents`.

---

*Stack analysis: 2026-05-01*
