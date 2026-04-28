import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/database.types'

type SignupBody = {
  email?: string
  password?: string
  full_name?: string
  phone?: string
  role?: UserRole
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SignupBody

    if (!body.email || !body.password || !body.full_name) {
      return NextResponse.json(
        { error: 'Missing required signup fields' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()
    const role: UserRole = 'employee'

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.full_name,
        phone: body.phone || '',
        role,
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    const { error: profileError } = await adminClient.from('profiles').upsert({
      id: authData.user.id,
      email: body.email,
      full_name: body.full_name,
      phone: body.phone || null,
      role,
    }, {
      onConflict: 'id',
    })

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email || body.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create user'

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
