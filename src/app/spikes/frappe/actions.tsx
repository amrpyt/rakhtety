'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface FrappeSpikeActionsProps {
  client: string
  firstRequiredStep?: string
  firstPendingStep?: string
}

async function postJson(path: string, body: Record<string, string>) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = (await response.json()) as { message?: unknown; error?: string; exception?: string }

  if (!response.ok || payload.error || payload.exception) {
    throw new Error(payload.error || payload.exception || 'Frappe action failed')
  }

  return payload
}

export function FrappeSpikeActions({ client, firstRequiredStep, firstPendingStep }: FrappeSpikeActionsProps) {
  const router = useRouter()
  const [message, setMessage] = useState('Ready')
  const [isWorking, setIsWorking] = useState(false)

  async function run(label: string, action: () => Promise<unknown>) {
    setIsWorking(true)
    setMessage(`${label}...`)
    try {
      await action()
      setMessage(`${label} done`)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${label} failed`)
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-slate-800">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded bg-blue-700 px-4 py-2 font-medium text-white disabled:opacity-50"
          disabled={isWorking || !firstRequiredStep}
          type="button"
          onClick={() =>
            firstRequiredStep &&
            run('Upload required document', () =>
              postJson('/api/spikes/frappe/upload-document', { step: firstRequiredStep })
            )
          }
        >
          Upload required document
        </button>
        <button
          className="rounded bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-50"
          disabled={isWorking || !firstPendingStep}
          type="button"
          onClick={() =>
            firstPendingStep &&
            run('Complete next step', () =>
              postJson('/api/spikes/frappe/update-step', { step: firstPendingStep, status: 'completed' })
            )
          }
        >
          Complete next step
        </button>
        <button
          className="rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50"
          disabled={isWorking}
          type="button"
          onClick={() => run('Start excavation', () => postJson('/api/spikes/frappe/start-excavation', { client }))}
        >
          Start excavation
        </button>
      </div>
      <p className="mt-3 text-slate-700">{message}</p>
    </section>
  )
}
