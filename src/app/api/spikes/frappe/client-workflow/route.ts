import { NextResponse } from 'next/server'

const DEFAULT_CLIENT = 'Test Client One'

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required for the Frappe spike route`)
  }
  return value
}

function extractSessionCookie(setCookie: string | null): string {
  const sid = setCookie?.match(/sid=([^;]+)/)?.[1]
  if (!sid) {
    throw new Error('Frappe login did not return a session cookie')
  }
  return `sid=${sid}`
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const client = url.searchParams.get('client') || DEFAULT_CLIENT
    const baseUrl = requiredEnv('FRAPPE_BASE_URL').replace(/\/$/, '')
    const username = requiredEnv('FRAPPE_USERNAME')
    const password = requiredEnv('FRAPPE_PASSWORD')

    const loginResponse = await fetch(`${baseUrl}/api/method/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ usr: username, pwd: password }),
      cache: 'no-store',
    })

    if (!loginResponse.ok) {
      return NextResponse.json({ error: 'Frappe login failed' }, { status: loginResponse.status })
    }

    const cookie = extractSessionCookie(loginResponse.headers.get('set-cookie'))
    const workflowResponse = await fetch(
      `${baseUrl}/api/method/frappe.rakhtety_spike.get_client_workflow?client=${encodeURIComponent(client)}`,
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
