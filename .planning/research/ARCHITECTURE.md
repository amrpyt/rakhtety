# Architecture Patterns: Serverless SaaS ERP for Engineering License Management

**Domain:** Engineering license workflow management (Egypt)
**Researched:** 2026-04-27
**Confidence:** MEDIUM-HIGH (combines established patterns with project-specific constraints)

---

## Architecture Overview

This system tracks engineering license applications through multi-step government workflows, manages financial tracking (fees + profit margins), monitors employee performance bottlenecks, and generates client-facing reports.

### Key Characteristics

| Characteristic | Implication |
|----------------|------------|
| Long-running workflows (weeks/months) | Must persist state; human approval gates |
| Two parallel workflows with dependencies | License → Excavation permit dependency |
| Financial tracking per step | Each step has fees (government) + profit (office) |
| Arabic RTL interface | UI layer concern; data layer is language-agnostic |
| Multi-tenant SaaS (future) | Database isolation required |
| Serverless stack (Firebase/Supabase) | Stateless functions; external state store |

### Recommended Component Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Admin Panel │  │ Employee UI │  │ Client Portal│             │
│  │   (Web)     │  │   (Web)     │  │   (Web)      │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼───────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Firebase Auth / Supabase Auth (JWT validation)             │ │
│  │  - Tenant resolution from token claims                      │ │
│  │  - Role-based access (admin, employee, client)              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Workflow   │  │   Financial  │  │   Reporting  │           │
│  │   Engine     │  │   Service    │  │   Service    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Document   │  │   Employee  │  │   Analytics  │           │
│  │   Service    │  │   Tracking   │  │   Service    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  [Cloud Functions / Edge Functions]                              │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Firestore (NoSQL) or Supabase (PostgreSQL)                │  │
│  │  - Tenant-scoped collections/tables                         │  │
│  │  - Row-level security / RLS                                  │  │
│  │  - Real-time subscriptions for live updates                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  File Storage (Firebase Storage / Supabase Storage)         │  │
│  │  - Tenant-prefixed buckets                                  │  │
│  │  - Required attachments per workflow step                    │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### 1. Workflow Engine

**Responsibility:** Manages license permit state, step sequencing, dependencies, and transitions.

| Boundary | Contains |
|----------|----------|
| **Owns** | Workflow definitions, step states, transition rules, current step tracking |
| **Knows About** | Employee assignments, document requirements per step |
| **Does Not Know** | Financial calculations (delegates to Financial Service) |

**State Machine Design:**

```
Workflow Instance State:
├── status: DRAFT | ACTIVE | PAUSED | COMPLETED | CANCELLED
├── currentStep: StepDefinition
├── completedSteps: StepInstance[]
├── pendingSteps: StepInstance[]
├── blockedBy: Dependency[] (e.g., "excavation permit blocked until device license complete")
└── metadata: { createdAt, updatedAt, assignedTo, clientId }
```

**Step Definition Schema:**
```typescript
interface StepDefinition {
  id: string;
  workflowType: 'DEVICE_LICENSE' | 'EXCAVATION_PERMIT';
  order: number;
  nameAr: string;           // Arabic name
  nameEn: string;          // English name
  requiredDocuments: string[];
  estimatedDays: number;    // SLA tracking
  financialConfig: {
    governmentFee: number;  // Fixed fee amount
    officeProfit: number;  // Office service charge
  };
  transitionRules: {
    allowedFrom: string[];  // Which steps can transition here
    allowedTo: string[];    // Which steps can be next
    requiresApproval: boolean;
    approverRole: 'EMPLOYEE' | 'MANAGER' | 'CLIENT';
  };
}
```

**Build Order Implication:** Workflow Engine is the foundational component. All other services (Financial, Reporting, Analytics) reference workflow state.

---

### 2. Financial Service

**Responsibility:** Tracks fees, payments, outstanding balances, and profit calculations per workflow step.

| Boundary | Contains |
|----------|----------|
| **Owns** | Invoice records, payment records, fee configurations, balance calculations |
| **Knows About** | Workflow step completion (triggers invoice creation) |
| **Does Not Know** | Who is assigned to the step (employee tracking) |

**Financial Schema (Event-Sourced for Audit):**

```typescript
interface FinancialEvent {
  id: string;
  tenantId: string;
  workflowId: string;
  stepId: string;
  eventType:
    | 'FEE_REGISTERED'      // Government fee added to step
    | 'PROFIT_REGISTERED'   // Office profit added to step
    | 'PAYMENT_RECEIVED'    // Payment against fee/profit
    | 'PAYMENT_ALLOCATED'   // Payment assigned to specific invoice
    | 'REFUND_ISSUED'       // Refund processed
    | 'BALANCE_ADJUSTED';   // Manual adjustment
  amount: number;           // In piasters (smallest Egyptian pound unit)
  currency: 'EGP';
  metadata: {
    paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CARD';
    referenceNumber?: string;
    recordedBy: string;
    recordedAt: Date;
  };
}

// Current state derived from events:
// - Total Cost = SUM(FEE_REGISTERED + PROFIT_REGISTERED)
// - Total Paid = SUM(PAYMENT_RECEIVED)
// - Outstanding = Total Cost - Total Paid
```

**Build Order Implication:** Financial Service depends on Workflow Engine. Financial events are created when workflow steps complete.

---

### 3. Employee & Bottleneck Tracking Service

**Responsibility:** Monitors employee workload, tracks task aging, identifies bottlenecks.

| Boundary | Contains |
|----------|----------|
| **Owns** | Employee workload metrics, task aging, bottleneck alerts |
| **Knows About** | Workflow step assignments and durations |
| **Does Not Know** | Financial details (fees paid/not paid) |

**Bottleneck Detection Schema:**

```typescript
interface TaskMetrics {
  taskId: string;
  assigneeId: string;
  workflowId: string;
  stepId: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  slaDeadline: Date;         // calculated from estimatedDays
  isOverdue: boolean;        // computed: completedAt > slaDeadline
  agingBucket:               // for dashboard grouping
    | 'ON_TRACK'            // < 50% of SLA time used
    | 'AT_RISK'             // 50-80% of SLA time used
    | 'BEHIND'              // 80-100% of SLA time used
    | 'OVERDUE';            // past SLA deadline
}

// Bottleneck detection query pattern:
// Find steps where agingBucket = 'OVERDUE' GROUP BY assigneeId
// Alert manager when count > threshold
```

**Build Order Implication:** This service is independent but benefits from Workflow Engine existing first (to get assignment data).

---

### 4. Reporting Service

**Responsibility:** Generates client-facing reports, admin dashboards.

| Boundary | Contains |
|----------|----------|
| **Owns** | Report templates, generated reports, export formats |
| **Knows About** | Workflow state, financial totals, client info |
| **Does Not Know** | How bottleneck detection works internally |

**Client Report Schema:**

```typescript
interface ClientReport {
  clientId: string;
  workflowId: string;
  generatedAt: Date;
  reportType: 'STATUS_UPDATE' | 'COMPLETION_SUMMARY' | 'FINANCIAL_SUMMARY';
  content: {
    // Workflow progress
    completedSteps: Array<{
      name: string;
      completedAt: Date;
      completedBy: string;
    }>;
    pendingSteps: Array<{
      name: string;
      estimatedCompletion: Date;
    }>;

    // Financial summary
    totalCost: number;
    totalPaid: number;
    outstandingBalance: number;
    feeBreakdown: Array<{
      stepName: string;
      governmentFee: number;
      officeProfit: number;
      paid: number;
    }>;

    // Timeline
    startDate: Date;
    projectedCompletion: Date;
    actualCompletion?: Date;
  };
}
```

---

## Data Flow Patterns

### 1. Workflow State Transitions

```
┌──────────────────────────────────────────────────────────────────┐
│                     WORKFLOW STATE FLOW                          │
└──────────────────────────────────────────────────────────────────┘

  CLIENT CREATES
       │
       ▼
  ┌─────────┐    Step Complete    ┌─────────────┐
  │  DRAFT  │ ─────────────────► │   ACTIVE    │
  └─────────┘    Triggered        └─────────────┘
                                       │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
            ┌───────────┐       ┌───────────┐       ┌───────────┐
            │  STEP_1   │──────►│  STEP_2   │──────►│  STEP_N   │
            │ COMPLETED │       │  ACTIVE   │       │           │
            └───────────┘       └───────────┘       └───────────┘
                    │                   │                   │
                    │                   │                   │
                    └───────────────────┴───────────────────┘
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │  COMPLETED    │
                                    └───────────────┘

  DEPENDENCY GATE:
  Excavation Permit Step 1 can only start when
  Device License Step 5 (final) is COMPLETED
```

### 2. Event-Driven Financial Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                   FINANCIAL EVENT FLOW                           │
└──────────────────────────────────────────────────────────────────┘

  Workflow Engine                          Financial Service
        │                                        │
        │  Step completed event                  │
        │  { stepId, workflowId, completedAt }    │
        │ ─────────────────────────────────────► │
        │                                        │
        │                                        │ Create FEE_REGISTERED event
        │                                        │ Create PROFIT_REGISTERED event
        │                                        │
        │  Payment received event                │
        │  { amount, paymentMethod, ... }        │
        │ ─────────────────────────────────────► │
        │                                        │
        │                                        │ Create PAYMENT_RECEIVED event
        │                                        │ Allocate to outstanding fees
        │                                        │ Calculate new balance
        │                                        │
        │  Query: getBalance(workflowId)         │
        │ ◄───────────────────────────────────── │
        │  Response: { total, paid, outstanding }│
```

### 3. Real-Time Update Flow (Firestore)

```
┌──────────────────────────────────────────────────────────────────┐
│                 FIRESTORE REAL-TIME FLOW                         │
└──────────────────────────────────────────────────────────────────┘

  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
  │   Client    │         │  Firestore   │         │   Cloud     │
  │   Web App   │         │   Database   │         │  Functions  │
  └──────┬──────┘         └──────┬──────┘         └──────┬──────┘
         │                        │                        │
         │  Subscribe to         │                        │
         │  /workflows/{id}      │                        │
         │ ───────────────────► │                        │
         │                        │                        │
         │                        │  Change detected       │
         │                        │  on document          │
         │                        │ ─────────────────────►│
         │                        │                        │
         │                        │                        │ Process step
         │                        │                        │ completion
         │                        │                        │
         │  Real-time update      │  Write new state       │
         │  ◄─────────────────────│ ──────────────────────│
         │                        │                        │
         │  UI re-renders        │                        │
         │  with new data        │                        │
```

---

## Database Schema Design

### Multi-Tenancy Pattern

For this SaaS ERP, use **Shared Database with tenant_id column** (Pool Model):

```sql
-- All tenant-scoped tables include tenant_id

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  plan_type TEXT DEFAULT 'trial',  -- trial, smb, enterprise
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL,  -- admin, employee, client
  display_name_ar TEXT,
  display_name_en TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

-- Critical: Every query must filter by tenant_id
-- Use indexes with tenant_id as leading column
CREATE INDEX idx_workflows_tenant ON workflows(tenant_id, status);
CREATE INDEX idx_steps_tenant_workflow ON workflow_steps(tenant_id, workflow_id);
CREATE INDEX idx_financial_tenant ON financial_events(tenant_id, workflow_id);
```

### Workflow Tables (Firestore Collections)

If using Firestore:

```
/tenants/{tenantId}
  - name, plan, settings

/tenants/{tenantId}/workflows/{workflowId}
  - clientInfo: { name, phone, address }
  - type: 'DEVICE_LICENSE' | 'EXCAVATION_PERMIT'
  - status: 'draft' | 'active' | 'completed' | 'cancelled'
  - currentStepId: string
  - createdAt, updatedAt

/tenants/{tenantId}/workflows/{workflowId}/steps/{stepId}
  - stepDefinitionId: string
  - status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  - assignedTo: userId
  - startedAt, completedAt
  - documents: { documentType: { uploadedAt, storageUrl } }

/tenants/{tenantId}/workflows/{workflowId}/financialEvents/{eventId}
  - eventType, amount, currency
  - stepId, recordedBy, recordedAt

/tenants/{tenantId}/analytics/taskMetrics
  - taskId, assigneeId, workflowId, stepId
  - status, queuedAt, slaDeadline, agingBucket
```

---

## State Management Patterns

### 1. Workflow State Machine (Database-Enforced)

```sql
-- Valid transitions table (whitelist approach)
CREATE TABLE workflow_step_transitions (
  id SERIAL PRIMARY KEY,
  from_status VARCHAR(50) NOT NULL,
  to_status VARCHAR(50) NOT NULL,
  step_definition_id VARCHAR(50) NOT NULL,
  UNIQUE(from_status, to_status, step_definition_id)
);

-- Example valid transitions for a step:
-- ('pending', 'in_progress')
-- ('in_progress', 'completed')
-- ('in_progress', 'blocked')
-- ('blocked', 'in_progress')  -- unblock

-- Enforce with trigger
CREATE OR REPLACE FUNCTION validate_step_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM workflow_step_transitions
    WHERE from_status = OLD.status
    AND to_status = NEW.status
    AND step_definition_id = NEW.step_definition_id
  ) THEN
    RAISE EXCEPTION 'Invalid transition from % to % for step %',
      OLD.status, NEW.status, NEW.step_definition_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_step_transition
BEFORE UPDATE ON workflow_steps
FOR EACH ROW
EXECUTE FUNCTION validate_step_transition();
```

### 2. Idempotent Cloud Functions (Firestore)

```typescript
// Cloud Function pattern for handling workflow transitions
export const processStepCompletion = onDocumentWritten(
  '/tenants/{tenantId}/workflows/{workflowId}/steps/{stepId}',
  async (event) => {
    const { tenantId, workflowId, stepId } = event.params;
    const before = event.data.before?.data();
    const after = event.data.after?.data();

    // Idempotency: only process if status actually changed to 'completed'
    if (after?.status !== 'completed' || before?.status === 'completed') {
      return;
    }

    // Use transaction for consistency
    await runTransaction(db, async (transaction) => {
      // 1. Create financial events for the completed step
      const stepDef = await getStepDefinition(after.stepDefinitionId);
      transaction.create(
        doc(collection(db, `tenants/${tenantId}/workflows/${workflowId}/financialEvents`)),
        {
          eventType: 'FEE_REGISTERED',
          amount: stepDef.financialConfig.governmentFee * 100, // piasters
          currency: 'EGP',
          stepId,
          recordedAt: Date.now(),
        }
      );

      // 2. Update workflow to next step
      const nextStep = await getNextStep(workflowId, stepDef.order);
      if (nextStep) {
        transaction.update(
          doc(db, `tenants/${tenantId}/workflows/${workflowId}`),
          { currentStepId: nextStep.id }
        );
      } else {
        // Final step - mark workflow complete
        transaction.update(
          doc(db, `tenants/${tenantId}/workflows/${workflowId}`),
          { status: 'completed', completedAt: Date.now() }
        );
      }
    });
  }
);
```

---

## Scalability Considerations

### At 10 Users (Current/MVP)

| Concern | Approach |
|---------|----------|
| Database | Single Firestore database / Supabase project |
| Functions | Cloud Functions (scales to zero) |
| Storage | Single storage bucket with tenant prefixes |
| Monitoring | Firebase console / Supabase dashboard |

### At 100 Users

| Concern | Approach |
|---------|----------|
| Database | Add composite indexes for common queries |
| Functions | Review cold start latency; consider provisioned concurrency |
| Storage | Tenant-scoped storage rules enforced |
| Monitoring | Add custom dashboards for bottleneck metrics |

### At 1000+ Users (SaaS Scale)

| Concern | Approach |
|---------|----------|
| Database | Consider schema-per-tenant (Bridge Model) for better isolation |
| Multi-tenancy | Add tenant_id to all queries; audit for data leaks |
| Functions | Consider Warm Pool for latency-sensitive operations |
| Storage | Separate buckets per tenant for compliance |
| Cost | Monitor read/write costs; add caching layer |

---

## Anti-Patterns to Avoid

### 1. Don't Store Workflow State in Client Memory

**Bad:** Client tracks current step, decides when to advance
**Good:** All state in Firestore/Postgres; Cloud Functions enforce transitions

### 2. Don't Skip Audit Trail for Financial Data

**Bad:** Update balance field in place
**Good:** Append-only financial_events collection/table; derive balance from events

### 3. Don't Mix Tenant Data Without tenant_id Filter

**Bad:** Query all workflows, filter in client
**Good:** Always scope queries by tenant_id at database level

### 4. Don't Build Monolithic Workflow Logic

**Bad:** One Cloud Function handles all workflow logic
**Good:** Separate functions for: step_completion, document_upload, payment_received, notification

### 5. Don't Use One Big Document for All Workflow Data

**Bad:** Single document with steps array, financial data, client info
**Good:** Separate collections with references; denormalize for read performance

---

## Sources

- AWS Step Functions Saga Pattern: https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/implement-the-serverless-saga-pattern-by-using-aws-step-functions.html
- Multi-Tenant Database Schema Patterns: https://erflow.io/en/blog/designing-multi-tenant-database-schema
- Firestore SaaS Architecture: https://dev.to/frihet/react-firebase-architecture-decisions-for-a-production-erp-2lg4
- pgflow Workflow Engine (Supabase): https://pgflow.dev/
- Event Sourcing for Financial Data: https://www.appmaster.io/blog/billing-ledger-schema-reconciliation
- Workflow Database Design: https://exceptionnotfound.net/designing-a-workflow-engine-database-part-4-states-and-transitions/
- DDD in ERP Architecture: https://medium.com/@warlenmarcio/arquitetura-de-erps-saas-como-estabelecer-limites-contextuais-que-resistem-ao-tempo-51e90efbc4d9
