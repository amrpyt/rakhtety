import type {
  Client,
  ClientWithWorkflows,
  DashboardAnalyticsSummary,
  EmployeeWithProfile,
  WorkflowDocument,
  WorkflowFinancialSummary,
  WorkflowOverviewItem,
  WorkflowType,
  WorkflowWithSteps,
} from '@/types/database.types'
import type { AuthSession } from '@/types/auth.types'
import { loginToFrappe } from '@/lib/frappe-spike/client'

const SESSION_COOKIE = 'rakhtety-session'

type FrappeEnvelope<T> = { message?: T; exc?: string; exception?: string }

function getFrappeBaseUrl() {
  const baseUrl = process.env.FRAPPE_BASE_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('FRAPPE_BASE_URL is required')
  return baseUrl
}

function decodeCookieValue(value: string) {
  let decoded = value
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const next = decodeURIComponent(decoded)
    if (next === decoded) return decoded
    decoded = next
  }
  return decoded
}

export function extractFrappeSidFromSessionCookie(raw?: string | null) {
  if (!raw) return null
  try {
    const session = JSON.parse(decodeCookieValue(raw)) as AuthSession
    return session.access_token || null
  } catch {
    return null
  }
}

export function getFrappeSidFromRequest(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
  return extractFrappeSidFromSessionCookie(match?.[1])
}

async function callFrappe<T>(sid: string, method: string, params: Record<string, string> = {}) {
  const response = await fetch(`${getFrappeBaseUrl()}/api/method/${method}`, {
    method: 'POST',
    headers: {
      cookie: sid,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
    cache: 'no-store',
  })
  const payload = (await response.json().catch(() => ({}))) as FrappeEnvelope<T>

  if (!response.ok || payload.exc || payload.exception) {
    throw new Error(payload.exception || payload.exc || `Frappe request failed: ${response.status}`)
  }

  if (payload.message === undefined) {
    throw new Error('Frappe response did not include message')
  }

  return payload.message
}

export class FrappeAdapter {
  constructor(private readonly sid: string) {}

  listClients(search?: string) {
    return callFrappe<Client[]>(this.sid, 'rakhtety_frappe.api.list_clients', search ? { search } : {})
  }

  createClient(data: Record<string, unknown>) {
    return callFrappe<Client>(this.sid, 'rakhtety_frappe.api.create_client', {
      data: JSON.stringify(data),
    })
  }

  getClient(id: string) {
    return callFrappe<ClientWithWorkflows>(this.sid, 'rakhtety_frappe.api.get_client_detail', { client: id })
  }

  listClientWorkflows(clientId: string) {
    return callFrappe<{
      workflows: WorkflowWithSteps[]
      deviceLicense: WorkflowWithSteps | null
      excavationPermit: WorkflowWithSteps | null
      deviceLicenseCompleted: boolean
      excavationPermitBlocked: boolean
      excavationPermitBlockedReason?: string
    }>(this.sid, 'rakhtety_frappe.api.list_client_workflows', { client: clientId })
  }

  createWorkflow(clientId: string, type: WorkflowType) {
    return callFrappe<WorkflowWithSteps>(this.sid, 'rakhtety_frappe.api.create_workflow', { client: clientId, type })
  }

  listWorkflowOverview() {
    return callFrappe<WorkflowOverviewItem[]>(this.sid, 'rakhtety_frappe.api.list_workflow_overview')
  }

  dashboardSummary() {
    return callFrappe<DashboardAnalyticsSummary>(this.sid, 'rakhtety_frappe.api.dashboard_summary')
  }

  listEmployees() {
    return callFrappe<EmployeeWithProfile[]>(this.sid, 'rakhtety_frappe.api.list_employees')
  }

  uploadWorkflowDocument(data: Record<string, unknown>) {
    return callFrappe<WorkflowDocument>(this.sid, 'rakhtety_frappe.api.upload_workflow_document', {
      data: JSON.stringify(data),
    })
  }

  updateStepStatus(stepId: string, status: string) {
    return callFrappe<unknown>(this.sid, 'rakhtety_frappe.api.update_step_status', {
      step: stepId,
      status,
    })
  }

  workflowFinancialSummary(workflowId: string) {
    return callFrappe<WorkflowFinancialSummary>(this.sid, 'rakhtety_frappe.api.workflow_financial_summary', {
      workflow: workflowId,
    })
  }

  clientReport(clientId: string) {
    return callFrappe<unknown>(this.sid, 'rakhtety_frappe.api.client_report', { client: clientId })
  }
}

export function getFrappeAdapterForRequest(request: Request) {
  const sid = getFrappeSidFromRequest(request)
  if (!sid) throw new Error('Login is required')
  return new FrappeAdapter(sid)
}

export async function getPrivilegedFrappeAdapterForRequest(request: Request) {
  const sid = getFrappeSidFromRequest(request)
  if (!sid) throw new Error('Login is required')
  const session = await loginToFrappe()
  return new FrappeAdapter(session.cookie)
}
