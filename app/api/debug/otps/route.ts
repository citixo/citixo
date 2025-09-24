import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Citixootps } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get all OTPs (for debugging)
    const allOTPs = await Citixootps.find({}).sort({ createdAt: -1 }).limit(10)
    
    console.log('All OTPs in database:', allOTPs.length)
    
    return NextResponse.json({
      success: true,
      count: allOTPs.length,
      otps: allOTPs.map(otp => ({
        id: otp._id,
        email: otp.email,
        otp: otp.otp,
        purpose: otp.purpose,
        isUsed: otp.isUsed,
        attempts: otp.attempts,
        expiresAt: otp.expiresAt,
        createdAt: otp.createdAt
      }))
    })

  } catch (error) {
    console.error('Debug OTPs error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch OTPs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get OTPs for specific email
    const emailOTPs = await Citixootps.find({ 
      email: email.toLowerCase() 
    }).sort({ createdAt: -1 })
    
    console.log(`OTPs for ${email}:`, emailOTPs.length)
    
    return NextResponse.json({
      success: true,
      email: email.toLowerCase(),
      count: emailOTPs.length,
      otps: emailOTPs.map(otp => ({
        id: otp._id,
        email: otp.email,
        otp: otp.otp,
        purpose: otp.purpose,
        isUsed: otp.isUsed,
        attempts: otp.attempts,
        expiresAt: otp.expiresAt,
        createdAt: otp.createdAt,
        isValid: otp.isValid()
      }))
    })

  } catch (error) {
    console.error('Debug OTPs by email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch OTPs by email' },
      { status: 500 }
    )
  }
}
