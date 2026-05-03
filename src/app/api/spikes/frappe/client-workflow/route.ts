import { NextResponse } from 'next/server'
import { DEFAULT_FRAPPE_CLIENT, loginToFrappe } from '@/lib/frappe-spike/client'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const client = url.searchParams.get('client') || DEFAULT_FRAPPE_CLIENT
    const { baseUrl, cookie } = await loginToFrappe()
    const workflowResponse = await fetch(
      `${baseUrl}/api/method/rakhtety_frappe.api.get_client_workflow?client=${encodeURIComponent(client)}`,
      {
        headers: { cookie },
        cache: 'no-store',
      }
    )

    const payload = await workflowResponse.json()
    return NextResponse.json(payload, { status: workflowResponse.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown Frappe spike error' },
      { status: 500 }
    )
  }
}
