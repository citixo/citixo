import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Citixootps } from '@/lib/models'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, otp } = await request.json()
    console.log('Verify OTP API called with:', { email, otp, emailLower: email?.toLowerCase() })

    // Validate input
    if (!email || !otp) {
      console.log('Missing email or OTP')
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      )
    }


    // Find the OTP record
    const searchCriteria = {
      email: email.toLowerCase(),
      otp,
      purpose: 'signup',
      isUsed: false
    }
    console.log('Searching for OTP with criteria:', searchCriteria)

    const otpRecord = await Citixootps.findOne(searchCriteria)
    const currentTime = new Date()
    
    console.log('Found OTP record:', otpRecord ? {
      email: otpRecord.email,
      otp: otpRecord.otp,
      purpose: otpRecord.purpose,
      isUsed: otpRecord.isUsed,
      attempts: otpRecord.attempts,
      expiresAt: otpRecord.expiresAt,
      createdAt: otpRecord.createdAt,
      timeRemaining: Math.max(0, Math.floor((otpRecord.expiresAt.getTime() - currentTime.getTime()) / 1000))
    } : 'No record found')

    if (!otpRecord) {
      console.log('No OTP record found for this email and OTP combination')
      return NextResponse.json(
        { success: false, error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Check if OTP is fresh (within 1 minute) and not used
    const timeRemaining = Math.max(0, Math.floor((otpRecord.expiresAt.getTime() - currentTime.getTime()) / 1000))
    const isExpired = otpRecord.expiresAt <= currentTime
    const isUsed = otpRecord.isUsed
    const hasExceededAttempts = otpRecord.attempts >= 3
    
    console.log('OTP validation details:', {
      isUsed,
      attempts: otpRecord.attempts,
      hasExceededAttempts,
      expiresAt: otpRecord.expiresAt.toISOString(),
      currentTime: currentTime.toISOString(),
      isExpired,
      timeRemaining: `${timeRemaining} seconds`,
      isValid: !isUsed && !isExpired && !hasExceededAttempts
    })

    // Check if OTP is already used
    if (isUsed) {
      console.log('OTP has already been used')
      return NextResponse.json(
        { success: false, error: 'OTP has already been used' },
        { status: 400 }
      )
    }

    // Check if OTP has expired
    if (isExpired) {
      console.log('OTP has expired')
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Check if attempts exceeded
    if (hasExceededAttempts) {
      console.log('OTP has exceeded maximum attempts')
      return NextResponse.json(
        { success: false, error: 'OTP has exceeded maximum attempts. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    console.log('Marking OTP as used')
    await otpRecord.markAsUsed()

    console.log('OTP verification successful')
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
