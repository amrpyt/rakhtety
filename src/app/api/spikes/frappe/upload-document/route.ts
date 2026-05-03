import { NextResponse } from 'next/server'
import { callFrappeMethod } from '@/lib/frappe-spike/client'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { step?: string }

    if (!body.step) {
      return NextResponse.json({ error: 'step is required' }, { status: 400 })
    }

    const { response, payload } = await callFrappeMethod('frappe.rakhtety_spike.upload_required_document', {
      step: body.step,
      file_url: '/private/files/nextjs-spike-upload.pdf',
    })

    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown Frappe upload error' },
      { status: 500 }
    )
  }
}
