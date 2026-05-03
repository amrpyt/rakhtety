## Static Operational Data Audit

### Fixed now

- `src/components/workflow/WorkflowTabs.tsx`
  - Placeholder workflow steps were showing template `fees` and `profit`.
  - Action: removed placeholder accounting values from both device-license and excavation-permit fallback steps.

### Needs product decision

- `src/lib/domain/workflow-templates.ts`
  - Frontend workflow templates still contain static `fees` and `profit` values.
  - Current impact: after this change they are no longer shown for placeholders, but the values remain in code and can be reused accidentally.
  - Recommendation: remove accounting fields from frontend templates or load step configuration from the backend only.

- `frappe_apps/rakhtety_frappe/rakhtety_frappe/services.py` (`DEVICE_LICENSE_STEPS`)
  - Device License step names, document requirement flags, government fees, and office profit are hardcoded when real Frappe steps are created.
  - Current impact: those values become real per-client rows, but the source is still code, not an admin-managed price/config table.
  - Recommendation: acceptable short-term as a default price list; move to a configurable Frappe DocType before production finance depends on it.

- `frappe_apps/rakhtety_frappe/rakhtety_frappe/services.py` (`start_excavation`)
  - Excavation Permit workflow creation creates the workflow document but no backend step rows.
  - Current impact: UI falls back to frontend placeholder step names.
  - Recommendation: create real excavation step rows in Frappe, or show a clear "steps not created yet" state.

- `frappe_apps/rakhtety_frappe/rakhtety_frappe/services.py` (`list_workflow_overview`)
  - `days_stuck` is always `0` and `is_stuck` is always `False`.
  - Current impact: `/workflows` stuck filters and timing labels are not truly live.
  - Recommendation: calculate from step modified dates/status thresholds or hide stuck UI until supported.

- `frappe_apps/rakhtety_frappe/rakhtety_frappe/services.py` (`dashboard_summary`)
  - `bottleneck_count`, `bottlenecks`, and `employee_workloads` are static zero/empty values.
  - Current impact: dashboard workload and bottleneck widgets can look valid while showing no real data.
  - Recommendation: either wire them to Frappe queries or label/remove those widgets until data is implemented.

- `src/lib/services/financial.service.ts` and Frappe `workflow_financial_summary`
  - Recording payments throws a migration-step error, while Frappe summaries return `total_paid: 0` and `realized_profit: 0`.
  - Current impact: payment form is visible, but payment recording/paid totals are not live.
  - Recommendation: hide payment entry until Frappe payment persistence exists, or implement a real payment DocType flow.

### Looks acceptable

- `src/lib/domain/workflow-templates.ts` (`CLIENT_INTAKE_DOCUMENTS`)
  - Static intake document requirements are product configuration, not live accounting data.
  - Recommendation: keep for now unless admins need to change document requirements without deploys.

- UI labels, filters, empty states, and explanatory cards.
  - Static text is guidance/copy, not operational data.
  - Recommendation: no immediate action.
