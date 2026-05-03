import { NextResponse } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { can, type PermissionAction } from '@/lib/auth/permissions'
import type { Profile } from '@/types/database.types'

export interface PermissionContext {
  user: User
  profile: Pick<Profile, 'id' | 'role' | 'full_name' | 'email'>
}

export async function getPermissionContext(supabase: SupabaseClient): Promise<PermissionContext | NextResponse> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const metadata = user.user_metadata as { full_name?: string } | undefined
  const role = profile?.role

  if (!role) {
    return NextResponse.json({ error: 'ملف المستخدم غير موجود' }, { status: 403 })
  }

  return {
    user,
    profile: {
      id: profile?.id || user.id,
      role,
      full_name: profile?.full_name || metadata?.full_name || '',
      email: profile?.email || user.email || null,
    },
  }
}

export async function requirePermission(
  supabase: SupabaseClient,
  action: PermissionAction
): Promise<PermissionContext | NextResponse> {
  const context = await getPermissionContext(supabase)
  if (context instanceof NextResponse) return context

  if (!can(context.profile.role, action)) {
    return NextResponse.json({ error: 'ليس لديك صلاحية لتنفيذ هذا الإجراء' }, { status: 403 })
  }

  return context
}
