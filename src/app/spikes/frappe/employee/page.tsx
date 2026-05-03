export const dynamic = 'force-dynamic'

interface AssignedWorkItem {
  name: string
  workflow: string
  status: string
  assigned_to: string
}

interface AssignedWorkResponse {
  message?: AssignedWorkItem[]
  error?: string
}

async function getAssignedWork(employee: string): Promise<AssignedWorkResponse> {
  const baseUrl = process.env.FRAPPE_SPIKE_LOCAL_URL || 'http://localhost:3010'
  const response = await fetch(`${baseUrl}/api/spikes/frappe/assigned-work?employee=${encodeURIComponent(employee)}`, {
    cache: 'no-store',
  })

  return response.json()
}

export default async function FrappeEmployeeSpikePage({
  searchParams,
}: {
  searchParams?: Promise<{ employee?: string }>
}) {
  const params = await searchParams
  const employee = params?.employee || 'Ahmed Employee'
  const payload = await getAssignedWork(employee)

  if (payload.error) {
    return (
      <main className="min-h-screen bg-slate-50 p-8 text-slate-950">
        <h1 className="text-2xl font-bold">Frappe employee spike error</h1>
        <p className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{payload.error}</p>
      </main>
    )
  }

  const work = payload.message || []

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-950" dir="rtl">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="border-b border-slate-200 pb-4">
          <p className="text-sm text-slate-500">Frappe employee access spike</p>
          <h1 className="text-3xl font-bold">{employee}</h1>
          <p className="mt-2 text-sm text-slate-600">Assigned work only</p>
        </header>

        <section className="grid gap-3">
          {work.length === 0 ? (
            <p className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No assigned work found.</p>
          ) : (
            work.map((item) => (
              <article key={item.name} className="rounded border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.workflow}</p>
                <p className="mt-1 text-sm text-slate-600">Status: {item.status}</p>
                <p className="mt-1 text-sm text-slate-600">Assigned to: {item.assigned_to}</p>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  )
}
