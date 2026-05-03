import { NextRequest, NextResponse } from 'next/server'
import { can } from '@/lib/auth/permissions'
import { readServerSession } from '@/lib/auth/server-session'
import { getFrappeAdapterForRequest, getFrappeSidFromRequest } from '@/lib/frappe/adapter'

type Params = { params: Promise<{ id: string; documentId: string }> }

function frappeFileUrl(path: string) {
  const baseUrl = process.env.FRAPPE_BASE_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new Error('FRAPPE_BASE_URL is required')
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export async function GET(request: NextRequest, { params }: Params) {
  const session = readServerSession(request)
  if (!session?.user) return NextResponse.json({ error: 'Login is required' }, { status: 401 })
  if (!can(session.user.role, 'readClients')) return NextResponse.json({ error: 'Missing permission' }, { status: 403 })

  try {
    const { id, documentId } = await params
    const document = await getFrappeAdapterForRequest(request).getClientIntakeDocument(id, documentId)
    const sid = getFrappeSidFromRequest(request)
    if (!sid) return NextResponse.json({ error: 'Login is required' }, { status: 401 })

    const fileResponse = await fetch(frappeFileUrl(document.storage_path), {
      headers: { cookie: sid },
      cache: 'no-store',
    })
    if (!fileResponse.ok || !fileResponse.body) {
      return NextResponse.json({ error: 'Failed to load file' }, { status: fileResponse.status || 502 })
    }

    const headers = new Headers(fileResponse.headers)
    if (request.nextUrl.searchParams.get('download') === '1') {
      headers.set('content-disposition', `attachment; filename="${document.file_name}"`)
    }
    return new NextResponse(fileResponse.body, { status: 200, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load file'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
