import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest } from '@/lib/frappe/adapter'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'readClients')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id } = await params
    const document = await getFrappeAdapterForRequest(request).getWorkflowDocument(id)
    const download = request.nextUrl.searchParams.get('download') === '1'
    const signedUrl = `/api/workflow-documents/${encodeURIComponent(id)}/file${download ? '?download=1' : ''}`
    return NextResponse.json({ signedUrl, document })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load workflow document'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
