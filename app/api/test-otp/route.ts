import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'OTP test endpoint is working',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'OTP test POST endpoint is working',
      received: { email, otp },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid JSON',
      timestamp: new Date().toISOString()
    })
  }
}
