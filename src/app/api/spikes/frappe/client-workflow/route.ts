import { NextResponse } from 'next/server'
import { callFrappeMethod, DEFAULT_FRAPPE_CLIENT } from '@/lib/frappe-spike/client'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const client = url.searchParams.get('client') || DEFAULT_FRAPPE_CLIENT
    const { response, payload } = await callFrappeMethod('rakhtety_frappe.api.get_client_workflow', { client })

    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown Frappe spike error' },
      { status: 500 }
    )
  }
}
