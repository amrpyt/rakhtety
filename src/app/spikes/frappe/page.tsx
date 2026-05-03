import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface FrappeStep {
  name: string
  step_order: number
  step_name_ar: string
  status: string
  assigned_to: string | null
  requires_document: number
  required_document_uploaded: number
  government_fees: number
  office_profit: number
}

interface FrappeWorkflow {
  name: string
  workflow_type: string
  status: string
  assigned_to: string | null
  steps: FrappeStep[]
}

interface FrappeWorkflowPayload {
  message?: {
    client: {
      title: string
      phone: string
      city: string
      district: string
      parcel_number: string
    }
    workflows: FrappeWorkflow[]
  }
  error?: string
}

async function getWorkflow(): Promise<FrappeWorkflowPayload> {
  const baseUrl = process.env.FRAPPE_SPIKE_LOCAL_URL || 'http://localhost:3010'
  const response = await fetch(`${baseUrl}/api/spikes/frappe/client-workflow?client=Test%20Client%20One`, {
    cache: 'no-store',
  })

  return response.json()
}

export default async function FrappeSpikePage() {
  const payload = await getWorkflow()

  if (payload.error || !payload.message) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <h1 className="text-2xl font-bold">Frappe Spike Error</h1>
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{payload.error}</p>
      </main>
    )
  }

  const { client, workflows } = payload.message

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-950" dir="rtl">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm text-slate-500">Frappe backend spike</p>
            <h1 className="text-3xl font-bold">{client.title}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {client.city} - {client.district} - قطعة {client.parcel_number}
            </p>
          </div>
          <Link className="text-sm font-medium text-blue-700" href="/dashboard">
            العودة للوحة التحكم
          </Link>
        </header>

        <section className="grid gap-4">
          {workflows.map((workflow) => (
            <article key={workflow.name} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{workflow.workflow_type}</h2>
                  <p className="text-sm text-slate-500">المسؤول: {workflow.assigned_to || 'غير محدد'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {workflow.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {workflow.steps.length === 0 ? (
                  <p className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    تم فتح هذا المسار، ولم تتم إضافة خطواته في الاختبار الصغير بعد.
                  </p>
                ) : (
                  workflow.steps.map((step) => (
                    <div
                      key={step.name}
                      className="grid gap-3 rounded border border-slate-200 p-4 md:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <p className="font-medium">
                          {step.step_order}. {step.step_name_ar}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">المسؤول: {step.assigned_to}</p>
                      </div>
                      <div className="text-sm text-slate-700">
                        <p>الحالة: {step.status}</p>
                        <p>رسوم: {step.government_fees} ج.م</p>
                        <p>أتعاب: {step.office_profit} ج.م</p>
                        <p>المستند: {step.requires_document ? (step.required_document_uploaded ? 'مرفوع' : 'مطلوب') : 'غير مطلوب'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
