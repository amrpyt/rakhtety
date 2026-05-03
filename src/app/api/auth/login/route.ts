import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { AuthUser } from '@/types/auth.types'
import { toAuthUser } from '@/lib/auth/auth-user'
import { loginSchema } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const parsed = loginSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'بيانات الدخول غير صالحة' }, { status: 400 })
    }

    const body = parsed.data
    const supabase = await createServerClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (error || !data.user || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'Login failed' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    const authUser: AuthUser = toAuthUser(data.user, profile)

    return NextResponse.json(
      {
        user: authUser,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
