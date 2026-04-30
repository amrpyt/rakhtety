import { NextRequest, NextResponse } from 'next/server'
import { listEmployees } from '@/lib/server-data/directory-query'
import { requirePermission } from '@/lib/auth/server-permissions'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import type { EmployeeWithProfile } from '@/types/database.types'

export async function GET() {
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'manageEmployees')
  if (permission instanceof NextResponse) return permission

  try {
    return NextResponse.json({ employees: await listEmployees(supabase) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch employees'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'manageEmployees')
  if (permission instanceof NextResponse) return permission

  try {
    const body = await request.json()
    const admin = createAdminClient()

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name,
        role: body.role,
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create auth user' }, { status: 400 })
    }

    const { error: profileError } = await admin
      .from('profiles')
      .upsert(
        {
          id: authData.user.id,
          full_name: body.full_name,
          email: body.email,
          phone: body.phone || null,
          role: body.role || 'employee',
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    const { data: employee, error: employeeError } = await admin
      .from('employees')
      .insert({
        user_id: authData.user.id,
        position: body.position || null,
        is_active: true,
      })
      .select('*, profile:profiles(*)')
      .single<EmployeeWithProfile>()

    if (employeeError) {
      await admin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: employeeError.message }, { status: 400 })
    }

    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create employee'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
