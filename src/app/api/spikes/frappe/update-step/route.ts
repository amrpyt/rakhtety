import { NextResponse } from 'next/server'
import { callFrappeMethod } from '@/lib/frappe-spike/client'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { step?: string; status?: string }

    if (!body.step || !body.status) {
      return NextResponse.json({ error: 'step and status are required' }, { status: 400 })
    }

    const { response, payload } = await callFrappeMethod('rakhtety_frappe.api.update_step_status', {
      step: body.step,
      status: body.status,
    })

    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown Frappe update error' },
      { status: 500 }
    )
  }
}
