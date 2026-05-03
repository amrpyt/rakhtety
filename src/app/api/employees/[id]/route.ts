import { NextRequest, NextResponse } from 'next/server'
import { requirePermission } from '@/lib/auth/server-permissions'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { employeeUpdateSchema } from '@/lib/validation/schemas'
import { z } from 'zod'
import type { EmployeeWithProfile } from '@/types/database.types'

const employeeApiUpdateSchema = employeeUpdateSchema.extend({
  is_active: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

async function loadEmployee(admin = createAdminClient(), id: string): Promise<EmployeeWithProfile | null> {
  const { data, error } = await admin
    .from('employees')
    .select('*, profile:profiles(*)')
    .eq('id', id)
    .maybeSingle<EmployeeWithProfile>()

  if (error) throw error
  return data || null
}

function jsonError(error: unknown, fallback: string, status = 500) {
  const message = error instanceof Error ? error.message : fallback
  return NextResponse.json({ error: message }, { status })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'manageEmployees')
  if (permission instanceof NextResponse) return permission

  try {
    const { id } = await context.params
    const parsed = employeeApiUpdateSchema.partial().safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات الموظف غير صالحة' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const existing = await loadEmployee(admin, id)
    if (!existing) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 })
    }

    const profilePatch = {
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      role: parsed.data.role,
    }
    const hasProfilePatch = Object.values(profilePatch).some((value) => value !== undefined)

    if (hasProfilePatch) {
      const { error } = await admin
        .from('profiles')
        .update(profilePatch)
        .eq('id', existing.user_id)

      if (error) throw error
    }

    if (parsed.data.position !== undefined || parsed.data.is_active !== undefined) {
      const { error } = await admin
        .from('employees')
        .update({
          position: parsed.data.position,
          is_active: parsed.data.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) throw error
    }

    return NextResponse.json({ employee: await loadEmployee(admin, id) })
  } catch (error) {
    return jsonError(error, 'Failed to update employee')
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'manageEmployees')
  if (permission instanceof NextResponse) return permission

  try {
    const { id } = await context.params
    const admin = createAdminClient()
    const existing = await loadEmployee(admin, id)
    if (!existing) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 })
    }

    const { count, error: countError } = await admin
      .from('workflows')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', existing.user_id)
      .neq('status', 'completed')

    if (countError) throw countError

    if ((count || 0) > 0) {
      return NextResponse.json(
        { error: `لا يمكن حذف الموظف لأنه مسؤول عن ${count} مسارات عمل نشطة.` },
        { status: 400 }
      )
    }

    const { error: employeeError } = await admin.from('employees').delete().eq('id', id)
    if (employeeError) throw employeeError

    const { error: userError } = await admin.auth.admin.deleteUser(existing.user_id)
    if (userError) throw userError

    return NextResponse.json({ ok: true })
  } catch (error) {
    return jsonError(error, 'Failed to delete employee')
  }
}
