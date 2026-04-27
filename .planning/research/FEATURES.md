# Feature Landscape: Engineering License SaaS/ERP System

**Domain:** Engineering License Workflow Management (Egypt)
**Researched:** April 2026
**Mode:** Ecosystem Research

---

## Executive Summary

Engineering license SaaS/ERP systems for the Egyptian market must address two core workflows: **Device Licensing** and **Excavation Permits**, while providing financial tracking (fees, profit/margin) and client report generation. The system serves engineering office managers and employees requiring Arabic interface support.

This research identifies features across 7 categories: CRM, Workflow Management, Financial Management, Dashboard & Tracking, Client Reporting, Document Management, and Employee Management. Features are classified as **Table Stakes** (required for basic functionality), **Differentiators** (competitive advantage), or **Anti-Features** (explicitly avoid).

---

## 1. CRM (Client Management)

### Table Stakes
| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Client database | Centralize all client information | Low | Contact details, addresses, engineering discipline |
| Client contact tracking | Store multiple contacts per client | Low | Primary contact, technical contacts, decision makers |
| Client communication history | Audit trail of all interactions | Low | Emails, calls, meetings logged |
| Client search and filtering | Find clients quickly | Low | By name, company, license type |
| Client classification | Segment by type (government, private, individual) | Low | Affects workflow and pricing rules |

### Differentiators
| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Client health scoring | Identify at-risk relationships early | Medium | Combines satisfaction surveys, project metrics, payment history |
| Automated onboarding | Reduce manual setup for new clients | Medium | Welcome emails, document requests, kickoff scheduling |
| Multi-branch client management | Support holding groups with multiple entities | Medium | Consolidated view across branches |
| Client-specific pricing rules | Auto-apply discounts/rates per client | Medium | Contract-based fee schedules |

### Anti-Features
| Anti-Feature | Why Avoid | Instead |
|---------------|-----------|---------|
| Generic B2C CRM features | Not relevant for B2B engineering services | Focus on project-based client relationships |
| Social media integration | No value in this domain | Keep focus on permit/license workflows |

---

## 2. Workflow Management

### Table Stakes
| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multi-stage workflow engine | Core of the system - must handle both Device License and Excavation Permit flows | High | Visual workflow builder, conditional routing |
| Workflow templates | Pre-built templates for standard processes | Medium | Egyptian engineering workflows have specific stages |
| Task assignment | Assign work to specific employees | Low | Role-based or user-based assignment |
| Task deadlines and reminders | Prevent missed deadlines | Low | Automated notifications |
| Status tracking | Know exactly where each case stands | Low | Clear status indicators per workflow stage |
| Workflow history/audit trail | Compliance and accountability | Low | Every action timestamped and attributed |
| Document dependency management | Stages require prior documents | Medium | Chain of custody for engineering documents |
| Parallel and sequential stages | Support complex routing | Medium | Some approvals can happen concurrently |
| Deadline escalation | Auto-escalate overdue tasks | Medium | Manager notification for stale items |

### Differentiators
| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Workflow dependency modeling | Auto-calendar project timelines based on dependencies | High | Critical for excavation permits with sequential approvals |
| Auto-routing based on conditions | Route based on license type, client tier, value | Medium | Reduce manual assignment overhead |
| SLA monitoring | Track compliance with official timelines | Medium | Egyptian authorities have statutory time limits |
| Mobile workflow actions | Approve/reject from mobile | Medium | Field engineers need quick turnaround |
| AI-assisted requirement identification | Research Agent to confirm document requirements | High | Similar to PermitFlow's research capability |
| Sub-workflow templates | Reusable subprocesses (e.g., "document review cycle") | Medium | Common across different license types |

### Anti-Features
| Anti-Feature | Why Avoid | Instead |
|---------------|-----------|---------|
| Overly complex BPMN engine | Engineering offices need simplicity | Configurable but intuitive workflows |
| Code-based workflow definitions | Non-technical users must manage workflows | Visual no-code builder |

---

## 3. Financial Management

### Table Stakes
| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Fee tracking per license type | Core financial requirement | Low | Government fees vary by license category |
| Invoice generation | Bill clients for services | Low | Must support Arabic invoices |
| Payment tracking | Record what was paid, when | Low | Partial payments, installments |
| Expense logging | Track direct costs per case | Low | Government fees, third-party charges |
| Profit/margin calculation | Gross margin per workflow | Medium | Revenue - direct costs |
| Client payment reminders | Reduce AR aging | Low | Automated follow-ups |
| Multi-currency support | Handle USD/EUR transactions | Low | Egyptian engineering firms often deal in foreign currency |
| VAT/GST handling | Comply with Egyptian tax regulations | Medium | Egyptian VAT at 15% (verify current rate) |

### Differentiators
| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Time-based billing | Track hours spent per case | Medium | Engineering work is time-dependent |
| Fee schedule management | Define and update pricing tiers | Medium | By license type, client type, complexity |
| Cost code tracking | Categorize expenses by type | Medium | Required for detailed profitability analysis |
| Budget vs. actual tracking | Compare estimated to real costs | Medium | For large excavation projects |
| Cash flow forecasting | Predict incoming payments | Medium | Helps manage working capital |
| ZATCA e-invoicing integration | Egyptian electronic invoice compliance | High | Saudi ZATCA standards may apply if client operates cross-border |
| Egyptian tax form generation | Local compliance reporting | Medium | Chamber of Commerce reports, tax authority submissions |

### Anti-Features
| Anti-Feature | Why Avoid | Instead |
|---------------|-----------|---------|
| Full general ledger | Overkill for engineering office | Simple income/expense tracking with P&L |
| Fixed asset depreciation | Not relevant to license workflow business | Omit unless equipment tracking needed |

---

## 4. Dashboard & Tracking

### Table Stakes
| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Case status dashboard | Know what's pending, what's done | Low | Real-time status across all workflows |
| Deadline calendar | View upcoming deadlines | Low | Calendar integration helpful |
| Employee workload view | See who is overwhelmed/available | Low | Task assignment optimization |
| Simple KPI cards | At-a-glance metrics | Low | Cases processed, revenue, pending items |
| Filtering and drill-down | Navigate from summary to detail | Low | Portfolio → Client → Case → Documents |

### Differentiators
| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Portfolio-level overview | Manage unlimited projects across clients | Medium | Like Permitful's project dashboards |
| Real-time cost tracking | See financial position as work happens | Medium | Field-to-finance data flow |
| Client-facing dashboards | Share project status with clients | Medium | Branded, read-only access for clients |
| Predictive deadline alerts | AI warns of at-risk timelines | High | Machine learning on historical data |
| GIS/map integration | Visualize excavation permits spatially | High | Link permits to locations (as found in Cloudpermit) |
| Custom dashboard builder | Users define their own views | Medium | Drag-and-drop widgets |
| Export to Arabic reports | One-click Arabic exports | Low | Critical for Egyptian clients |

### Anti-Features
| Anti-Feature | Why Avoid | Instead |
|---------------|-----------|---------|
| Pre-configured dashboards only | Every engineering office has different needs | Allow customization |
| Generic construction KPIs | Focus on license workflows, not construction | Domain-specific metrics |

---

## 5. Client Reporting

### Table Stakes
| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Case progress report | Client-facing status summary | Low | Current stage, pending documents, expected timeline |
| Invoice history report | Financial statement for client | Low | All charges and payments |
| Document checklist | What was submitted, what's missing | Low | For client transparency |
| Arabic report output | Local language requirement | Low | Must generate Arabic PDFs |

### Differentiators
| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Automated periodic reports | Weekly/monthly summaries auto-sent | Medium | Reduce manual reporting effort |
| Branded client portal | White-label experience | Medium | Engineering firms want branded materials |
| Executive summary reports | High-level for management | Low | One-page case summaries |
| Comparative analysis | Year-over-year or client-to-client | Medium | Benchmarking capability |
| Custom report builder | Users create own report templates | High | Most flexible but complex |
| Real-time live dashboards | Shared view updates automatically | Medium | Like Permitful's public project dashboards |

### Anti-Features
| Anti-Feature | Why Avoid | Instead |
|---------------|-----------|---------|
| Static PDF-only reports | Modern clients expect live access | Offer portal + PDF export |
| Report distribution lists | Manual email sending | Automated triggers |

---

## 6. Document Management

### Table Stakes
| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Document upload and storage | Store engineering drawings, certificates | Low | Support PDF, DWG, common image formats |
| Document versioning | Track revisions | Low | Auto-version on re-upload |
| Document categorization | Organize by type (drawings, certificates, photos) | Low | Tag-based or folder-based |
| Document search | Find documents quickly | Low | By name, date, type, client |
| Access control | Restrict who can see what | Low | Role-based permissions |
| Secure document storage | Protect sensitive client data | Medium | Encryption at rest |
| Document download tracking | Audit who accessed documents | Low | Security compliance |

### Differentiators
| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Automated document validation | Check required fields, formats | High | Reduce rejection from authorities |
| OCR for Arabic documents | Extract text from scanned Arabic | High | Critical for Arabic document processing |
| E-signature integration | Sign documents electronically | Medium | Acceptable for Egyptian authorities? |
| Document expiration tracking | Alert for expiring certificates | Medium | Engineering licenses, insurance docs |
| Integration with government portals | Pull documents from official sources | High | EgyptianSingle Window system integration |
| Engineering drawing preview | View DWG files without AutoCAD | High | Web-based viewer |
| Bulk document processing | Handle large volumes | Medium | Batch upload, rename, classify |

### Anti-Features
| Anti-Feature | Why Avoid | Instead |
|---------------|-----------|---------|
| Full EDMS capabilities | Overkill for license workflows | Focused document management |
| Complex metadata schemas | Non-technical users can't manage | Simple tagging approach |

---

## 7. Employee Management

### Table Stakes
| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Employee profiles | Store contact info, role, department | Low | Engineers, admin, managers |
| Role-based access control | Define what each role can do | Low | Admin, Manager, Employee, Viewer |
| Task assignment tracking | Know who's working on what | Low | Already in workflow management |
| Time-off tracking | Vacation, sick leave | Low | Ensure coverage |
| Basic timesheets | Track billable hours | Low | For time-based billing |

### Differentiators
| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Employee utilization reports | See capacity vs. assignments | Medium | Billable vs. non-billable time |
| Skills/certification tracking | Match employees to case requirements | Medium | Engineers have different specializations |
| Performance metrics | Individual productivity tracking | Medium | Cases closed, cycle time, client ratings |
| Saudization/localization tracking | If operating in GCC markets | Medium | Track nationalization compliance |
| Hierarchical approvals | Multi-level sign-off for large deals | Medium | Department head → Director → Partner |
| Delegation rules | Auto-forward when absent | Low | Vacation coverage |

### Anti-Features
| Anti-Feature | Why Avoid | Instead |
|---------------|-----------|---------|
| Full HRIS functionality | Payroll, benefits, recruitment | Omit unless scale requires |
| Employee self-service portal | Overkill for small engineering offices | Simple admin-managed records |

---

## Feature Dependencies

```
Client Intake (CRM)
    ↓
Workflow Initiation (Workflow)
    ↓
Document Collection (Document Management)
    ↓
Document Review & Validation (Document Management + Workflow)
    ↓
Financial Processing (Financial Management)
    ↓
Approval & Issuance (Workflow)
    ↓
Reporting (Client Reporting + Dashboard)
    ↓
Archive & Compliance (Document Management)
```

### Key Dependencies
- **CRM → Workflow**: Client must exist before creating case
- **Workflow → Document Management**: Stages require specific documents
- **Document Management → Financial Management**: Document fees trigger invoicing
- **Financial Management → Client Reporting**: Invoice history feeds client reports
- **Employee Management → Workflow**: Tasks assigned to employees

---

## MVP Recommendation

### Phase 1: Core Foundation
Prioritize these features for initial release:

1. **CRM**: Client database, contact tracking, basic classification
2. **Workflow Management**: Multi-stage engine, templates for Device License + Excavation Permit, status tracking, task assignment, deadlines
3. **Financial Management**: Fee tracking, invoice generation, payment tracking, profit calculation
4. **Document Management**: Upload, versioning, categorization, search
5. **Dashboard & Tracking**: Case status dashboard, deadline calendar, basic KPIs
6. **Client Reporting**: Case progress report, invoice history, Arabic PDF export

### Phase 2: Enhanced Capabilities
Add in subsequent phases:

- Employee utilization tracking
- Time-based billing
- Client portal
- Document expiration tracking
- Custom report builder
- SLA monitoring

### Phase 3: Advanced Differentiation
For competitive advantage:

- AI-assisted requirement identification
- Predictive deadline alerts
- Government portal integration
- OCR for Arabic documents
- Workflow dependency modeling

---

## Feature Complexity Summary

| Category | Low Complexity | Medium Complexity | High Complexity |
|----------|---------------|-------------------|-----------------|
| CRM | 5 | 2 | 0 |
| Workflow Management | 3 | 4 | 3 |
| Financial Management | 4 | 4 | 1 |
| Dashboard & Tracking | 4 | 4 | 2 |
| Client Reporting | 3 | 3 | 1 |
| Document Management | 4 | 2 | 4 |
| Employee Management | 3 | 4 | 0 |

**Total**: 26 Low, 19 Medium, 11 High

---

## Sources

### Permit/License Management Systems
- PermitFlow (permitflow.com) - Construction permitting SaaS
- Cloudpermit (cloudpermit.com) - Public works permitting
- Viva Civic (vivacivic.com) - Engineering permitting
- Catalis Permitting (catalisgov.com) - Municipal permitting
- Tyler Technologies Enterprise Permitting
- Trimble Unity Permit / Cityworks
- Permitful - Project-based permit tracking
- Expiration Reminder - Permit tracking with compliance

### Construction ERP Systems
- Acumatica Construction Edition
- Procore Financial Management
- Eclipse ERP
- TimeSuite
- Premier Construction

### Professional Services CRM
- Accelo
- Scoro
- Capsule CRM
- Theo CRM
- ProFlow360 CRM

### Document Management
- Cadmatic Engineering
- Sharecat
- Proarc DMS
- Adept (Synergis)

### Middle East/Arabic ERP Localization
- OpenX ERP (openxerp.com) - Arabic-native ERP
- FALCON ERP - GCC compliance
- FlowSense ERP - Saudi localization
- Quarto ERP - ZATCA compliance
- +ERP (erppluscloud.com) - MENA region

### Egyptian Regulatory Context
- Engineers' Syndicate Law No. 66 of 1974
- Egyptian Federation for Construction and Building Contractors Law No. 104 of 1992
- Law No. 15 of 2017 (Industrial Licensing)
- Building Law No. 119 of 2008

---

**Confidence Assessment:**
- **CRM features**: MEDIUM - Based on professional services CRM patterns, Egyptian-specific nuances need validation
- **Workflow Management**: HIGH - PermitFlow and similar systems are well-documented
- **Financial Management**: MEDIUM - Construction ERP patterns apply; Egyptian VAT specifics need verification
- **Dashboard & Tracking**: MEDIUM - General patterns; domain-specific KPIs need Egyptian user validation
- **Client Reporting**: HIGH - Standard report types across systems
- **Document Management**: MEDIUM - Engineering document systems vary widely
- **Employee Management**: MEDIUM - Basic patterns well-established
