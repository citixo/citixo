import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CitixoUsers } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await CitixoUsers.findOne({
      email: email.toLowerCase()
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        exists: true,
        error: 'Email already registered'
      })
    }

    return NextResponse.json({
      success: true,
      exists: false,
      message: 'Email is available'
    })

  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
