# Requirements: رخصتي (Rakhtety) ERP

**Defined:** 2026-04-27
**Core Value:** إدارة تراخيص البناء وتصاريح الحفر للمكاتب الهندسية — القضاء على العشوائية والتخلص من Excel

## v1 Requirements

### CRM-01: Client Database

- [x] **CRM-01**: User can add new client with: name, phone, city, district, neighborhood, parcel number
- [x] **CRM-02**: User can search clients by name, phone, or parcel number
- [x] **CRM-03**: User can view client profile with all associated workflow files
- [x] **CRM-04**: System validates 5 mandatory attachments before saving new client file:
  - محضر الاستلام (receipt minutes)
  - صورة البطاقة (ID copy)
  - توكيل (power of attorney)
  - شهادة هندسية (engineering certificate)
  - كشف قياس (measurement sheet)

### WF-01: Workflow Engine

- [x] **WF-01**: System tracks Device License workflow (5 steps):
  - Step 1: بيان الصلاحية (Eligibility Statement)
  - Step 2: تقديم المجمعة العشرية للإسكان المميز (Submit Decade Collective for Distinguished Housing)
  - Step 3: تقديم الملف (File Submission)
  - Step 4: دفع إذن الرخصة وشراء عقد مخلفات (Pay License Fee & Purchase Waste Contract)
  - Step 5: استلام الرخصة (Receive License)
- [x] **WF-02**: System tracks Excavation Permit workflow (5 steps):
  - Step 1: تقديم واستلام شهادة الإشراف (Submit & Receive Supervision Certificate)
  - Step 2: تقديم واستلام التأمينات (Submit & Receive Insurance)
  - Step 3: التقديم على العداد الإنشائي (Apply for Construction Meter)
  - Step 4: تقديم ودفع واستلام تصريح الحفر (Submit, Pay & Receive Excavation Permit)
  - Step 5: تصريح التعدين — الدفع والاستلام ومتابعة معاينة الجيش (Mining Permit)
- [x] **WF-03**: System enforces workflow dependency: Excavation Permit cannot start until Device License is COMPLETED
- [x] **WF-04**: Each workflow step shows: status (pending/in_progress/completed), assigned employee, completion date
- [x] **WF-05**: Each workflow step shows financial info: government fees (رسوم) and office profit (أتعاب)

### FIN-01: Financial Tracking

- [x] **FIN-01**: Each workflow step is linked to government fees (رسوم) and office profit (أتعاب)
- [x] **FIN-02**: System calculates total cost per workflow (sum of all fees + profit)
- [x] **FIN-03**: System tracks payments received against each workflow
- [x] **FIN-04**: System calculates outstanding debt per client
- [x] **FIN-05**: Dashboard shows: total fees collected, total profit, total debt outstanding

### DOC-01: Document Management

- [x] **DOC-01**: User can upload attachments per workflow step
- [x] **DOC-02**: System stores documents with: type, upload date, uploaded by
- [x] **DOC-03**: Required documents must be uploaded before step can be marked complete
- [x] **DOC-04**: Optional documents (e.g., receipt for التعلية) can be uploaded but don't block progress

### DASH-01: Dashboard & Tracking

- [x] **DASH-01**: Dashboard shows KPIs: active files, completed this month, pending debt, bottlenecks
- [x] **DASH-02**: System identifies bottlenecks: files stuck > 7 days at same step
- [x] **DASH-03**: Bottleneck view shows: client name, stuck step, assigned employee, days stuck
- [x] **DASH-04**: Manager can see which employee is responsible for bottleneck
- [x] **DASH-05**: Manager can send alert notification to employee about bottleneck

### RPT-01: Client Reporting

- [x] **RPT-01**: System generates professional PDF report per client
- [x] **RPT-02**: Report shows completed steps with checkmark (✓)
- [x] **RPT-03**: Report shows pending steps
- [x] **RPT-04**: Report shows financial summary: total paid, outstanding debt, fees breakdown
- [x] **RPT-05**: Report is in Arabic with proper RTL formatting

### AUTH-01: Authentication & Authorization

- [x] **AUTH-01**: Users log in with email/password
- [x] **AUTH-02**: System has role-based access: Admin (مدير), Employee (موظف), Manager (مدير)
- [x] **AUTH-03**: Employees can only see assigned workflows
- [x] **AUTH-04**: Admin can see all workflows and manage employees

### EMP-01: Employee Management

- [x] **EMP-01**: Admin can add/edit/delete employee profiles
- [x] **EMP-02**: Each workflow step is assigned to a specific employee
- [x] **EMP-03**: System tracks employee workload (cases assigned, cases completed)

## v2 Requirements

### CRM

- **CRM-05**: Client classification (government, private, individual) affects pricing rules
- **CRM-06**: Client communication history (calls, meetings logged)

### Workflow

- **WF-06**: Auto-routing based on license type, client tier, value
- **WF-07**: SLA monitoring with deadline alerts
- **WF-08**: Mobile workflow actions for field engineers

### Financial

- **FIN-06**: Time-based billing (track hours per case)
- **FIN-07**: Egyptian VAT handling (15%)
- **FIN-08**: ZATCA e-invoicing integration (if cross-border)

### Documents

- **DOC-05**: OCR for Arabic document processing
- **DOC-06**: Document expiration tracking with alerts
- **DOC-07**: Integration with government portals

### Client Portal

- **RPT-06**: Client-facing portal with read-only access
- **RPT-07**: Automated periodic reports sent to client email

### Advanced

- **AI-01**: AI-assisted requirement identification
- **AI-02**: Predictive deadline alerts
- **GIS-01**: GIS/map integration for spatial visualization of permits

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full general ledger / accounting | Simple income/expense tracking sufficient for MVP |
| Payroll functionality | Not relevant to license workflow business |
| Video calls / conferencing | Not needed for permit workflows |
| Social media integration | No value in this domain |
| Full EDMS capabilities | Focused document management, not enterprise content management |
| Fixed asset depreciation tracking | Not relevant to license workflow business |
| Saudization tracking | Only if GCC expansion — not current market |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CRM-01 | Phase 1 | Complete |
| CRM-02 | Phase 1 | Complete |
| CRM-03 | Phase 1 | Complete |
| CRM-04 | Phase 1 | Complete |
| WF-01 | Phase 1 | Complete |
| WF-02 | Phase 1 | Complete |
| WF-03 | Phase 2 | Complete |
| WF-04 | Phase 1 | Complete |
| WF-05 | Phase 1 | Complete |
| FIN-01 | Phase 3 | Complete |
| FIN-02 | Phase 3 | Complete |
| FIN-03 | Phase 3 | Complete |
| FIN-04 | Phase 3 | Complete |
| FIN-05 | Phase 3 | Complete |
| DOC-01 | Phase 4 | Complete |
| DOC-02 | Phase 4 | Complete |
| DOC-03 | Phase 4 | Complete |
| DOC-04 | Phase 4 | Complete |
| DASH-01 | Phase 5 | Complete |
| DASH-02 | Phase 5 | Complete |
| DASH-03 | Phase 5 | Complete |
| DASH-04 | Phase 5 | Complete |
| DASH-05 | Phase 5 | Complete |
| RPT-01 | Phase 6 | Complete |
| RPT-02 | Phase 6 | Complete |
| RPT-03 | Phase 6 | Complete |
| RPT-04 | Phase 6 | Complete |
| RPT-05 | Phase 6 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| EMP-01 | Phase 1 | Complete |
| EMP-02 | Phase 1 | Complete |
| EMP-03 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-27*
*Last updated: 2026-05-03 after v1.0 audit closure*
