---
phase: 1
plan: P-01
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/schema.sql
  - src/lib/supabase/client.ts
  - src/lib/supabase/server.ts
  - src/middleware.ts
autonomous: false
requirements:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04
---

<objective>
Set up Supabase project with authentication and database schema foundation. Create the core database tables, enable email/password auth, configure Row-Level Security policies, and establish the Supabase client utilities for both client-side and server-side usage.
</objective>

<read_first>
- rakhtety-erp-demo.html (CSS tokens: lines 15-87, auth section: ~1400)
- .planning/phases/01-core-foundation/01-CONTEXT.md (D-01 through D-10)
- .planning/phases/01-core-foundation/01-RESEARCH.md (Database Schema Approach section)
- .planning/phases/01-core-foundation/01-UI-SPEC.md (Design System section)
</read_first>

<tasks>

<task>
<type>execute</type>
<files>
  - supabase/schema.sql
</files>
<action>
Create Supabase schema with the following tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'manager')) DEFAULT 'employee',
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table (CRM)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  district TEXT,
  neighborhood TEXT,
  parcel_number TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflows table
CREATE TYPE workflow_type AS ENUM ('DEVICE_LICENSE', 'EXCAVATION_PERMIT');
CREATE TYPE workflow_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');

CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type workflow_type NOT NULL,
  status workflow_status DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow steps table
CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');

CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  status step_status DEFAULT 'pending',
  assigned_to UUID REFERENCES profiles(id),
  completed_at TIMESTAMPTZ,
  fees NUMERIC(10,2) DEFAULT 0,
  profit NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert profiles" ON profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for clients
CREATE POLICY "Authenticated users can view clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert clients" ON clients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- RLS Policies for workflows
CREATE POLICY "Employees see assigned workflows" ON workflows FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    OR assigned_to = auth.uid()
  );
CREATE POLICY "Admins can manage workflows" ON workflows FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- RLS Policies for workflow_steps
CREATE POLICY "Users can view steps for accessible workflows" ON workflow_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      WHERE w.id = workflow_id AND (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
        OR w.assigned_to = auth.uid()
      )
    )
  );

-- RLS Policies for employees
CREATE POLICY "Authenticated users can view employees" ON employees FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage employees" ON employees FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_steps;
```
</action>
<verify>
```bash
# Verify schema file exists
test -f supabase/schema.sql

# Verify tables are defined
grep -q "CREATE TABLE profiles" supabase/schema.sql
grep -q "CREATE TABLE clients" supabase/schema.sql
grep -q "CREATE TABLE workflows" supabase/schema.sql
grep -q "CREATE TABLE workflow_steps" supabase/schema.sql
grep -q "CREATE TABLE employees" supabase/schema.sql

# Verify RLS is enabled
grep -q "ALTER TABLE.*ENABLE ROW LEVEL SECURITY" supabase/schema.sql

# Verify role enum values
grep -q "'admin', 'employee', 'manager'" supabase/schema.sql
```
</verify>
<acceptance_criteria>
- schema.sql contains all 5 tables (profiles, clients, workflows, workflow_steps, employees)
- RLS is enabled on all tables
- Role enum includes admin, employee, manager
- Workflow type enum includes DEVICE_LICENSE, EXCAVATION_PERMIT
- Step status enum includes pending, in_progress, completed, blocked
- FK constraints properly reference parent tables
- Index exists on workflow_steps(workflow_id)
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/supabase/client.ts
</files>
<action>
Create the Supabase client utility for client-side usage:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
```
</action>
<verify>
```bash
test -f src/lib/supabase/client.ts
grep -q "createClient" src/lib/supabase/client.ts
grep -q "persistSession: true" src/lib/supabase/client.ts
```
</verify>
<acceptance_criteria>
- File exports `supabase` client
- Uses `@supabase/supabase-js` import
- Session persistence enabled (persistSession: true)
- Uses NEXT_PUBLIC_ environment variables
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/lib/supabase/server.ts
</files>
<action>
Create server-side Supabase client for middleware and API routes:

```typescript
import { createClient } from '@supabase/supabase-js'

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}
```
</action>
<verify>
```bash
test -f src/lib/supabase/server.ts
grep -q "createServerClient" src/lib/supabase/server.ts
grep -q "SUPABASE_SERVICE_ROLE_KEY" src/lib/supabase/server.ts
```
</verify>
<acceptance_criteria>
- Exports createServerClient function
- Uses SUPABASE_SERVICE_ROLE_KEY (not anon key)
- Session persistence disabled for server-side usage
</acceptance_criteria>
</task>

<task>
<type>execute</type>
<files>
  - src/middleware.ts
</files>
<action>
Create Next.js middleware for auth session validation:

```typescript
import { createServerClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient()

  const {
    data: { session }
  } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from login
  if (request.nextUrl.pathname.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login']
}
```
</action>
<verify>
```bash
test -f src/middleware.ts
grep -q "getSession" src/middleware.ts
grep -q "matcher" src/middleware.ts
```
</verify>
<acceptance_criteria>
- middleware.ts exports middleware function
- Protects /dashboard routes requiring authentication
- Redirects unauthenticated users to /login
- Redirects authenticated users away from /login to /dashboard
- Matcher covers dashboard and login routes
</acceptance_criteria>
</task>

</tasks>

<verification>
1. All Supabase tables created with proper relationships
2. RLS policies enforce role-based access
3. Client-side supabase client has session persistence
4. Server-side client uses service role key
5. Middleware protects dashboard routes
</verification>

<success_criteria>
- supabase/schema.sql exists with all tables
- src/lib/supabase/client.ts exports persistent supabase client
- src/lib/supabase/server.ts exports server client
- src/middleware.ts protects authenticated routes
- Environment variables documented (.env.example contains SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
</success_criteria>

<threat_model>
- **Data Exposure:** RLS policies must prevent employees from seeing unassigned workflows
- **Auth Bypass:** Middleware must properly validate JWT on every protected route
- **Role Escalation:** Only admins can manage employees and see all data
- **Mitigation:** Test RLS policies with different role users before production
</threat_model>

---

*P-01: Supabase Project Setup*
