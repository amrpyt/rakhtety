import { NextRequest, NextResponse } from 'next/server'
import { callFrappeMethod } from '@/lib/frappe-spike/client'

interface AssignedWorkPayload {
  message?: Array<{
    name: string
    workflow: string
    status: string
    assigned_to: string
  }>
  exc?: string
  exception?: string
}

export async function GET(request: NextRequest) {
  try {
    const employee = request.nextUrl.searchParams.get('employee')

    if (!employee) {
      return NextResponse.json({ error: 'employee is required' }, { status: 400 })
    }

    const { response, payload } = await callFrappeMethod<AssignedWorkPayload>('rakhtety_frappe.api.assigned_work', {
      employee,
    })

    if (!response.ok || payload.exc || payload.exception) {
      return NextResponse.json({ error: payload.exception || payload.exc || 'Frappe assigned work failed' }, { status: 502 })
    }

    return NextResponse.json({ message: payload.message || [] })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown Frappe assigned work error' }, { status: 500 })
  }
}
