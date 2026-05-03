import { NextResponse } from 'next/server'
import { callFrappeMethod } from '@/lib/frappe-spike/client'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { client?: string }

    if (!body.client) {
      return NextResponse.json({ error: 'client is required' }, { status: 400 })
    }

    const { response, payload } = await callFrappeMethod('rakhtety_frappe.api.start_excavation', {
      client: body.client,
    })

    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown Frappe excavation error' },
      { status: 500 }
    )
  }
}
