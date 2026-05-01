import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Account creation is admin-only. Please ask an admin to create the employee account.' },
    { status: 403 }
  )
}
