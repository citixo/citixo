import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Citixootps } from '@/lib/models'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, firstName } = await request.json()

    // Validate input
    if (!email || !firstName) {
      return NextResponse.json(
        { success: false, error: 'Email and first name are required' },
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

    // Check if there's already a valid OTP for this email
    const existingOTP = await Citixootps.findOne({
      email: email.toLowerCase(),
      purpose: 'signup',
      isUsed: false,
      expiresAt: { $gt: new Date() }
    })

    console.log('Existing OTP found:', existingOTP ? {
      email: existingOTP.email,
      otp: existingOTP.otp,
      isUsed: existingOTP.isUsed,
      expiresAt: existingOTP.expiresAt,
      createdAt: existingOTP.createdAt
    } : 'No existing OTP')

    if (existingOTP) {
      // If OTP was created less than 30 seconds ago, don't send another
      const timeDiff = Date.now() - existingOTP.createdAt.getTime()
      console.log('Time difference since last OTP:', timeDiff, 'ms')
      if (timeDiff < 30000) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Please wait before requesting another OTP',
            retryAfter: Math.ceil((30000 - timeDiff) / 1000)
          },
          { status: 429 }
        )
      }
      
      // Mark existing OTP as used
      console.log('Marking existing OTP as used before creating new one')
      await existingOTP.markAsUsed()
    }

    // Generate new OTP
    const otp = Citixootps.generateOTP()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 60 * 1000) // Exactly 1 minute from now

    console.log('Creating new OTP:', {
      email: email.toLowerCase(),
      otp,
      purpose: 'signup',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      expiresInSeconds: 60
    })

    // Create new OTP record
    const otpRecord = new Citixootps({
      email: email.toLowerCase(),
      otp,
      purpose: 'signup',
      expiresAt,
      createdAt: now, // Explicit timestamp
      isUsed: false,
      attempts: 0
    })

    try {
      await otpRecord.save()
      console.log('New OTP saved successfully with ID:', otpRecord._id)
      
      // Verify the OTP was actually saved by querying it back
      const savedOTP = await Citixootps.findById(otpRecord._id)
      console.log('Verification - OTP found in database:', savedOTP ? {
        id: savedOTP._id,
        email: savedOTP.email,
        otp: savedOTP.otp,
        purpose: savedOTP.purpose,
        isUsed: savedOTP.isUsed,
        expiresAt: savedOTP.expiresAt
      } : 'NOT FOUND')
    } catch (saveError) {
      console.error('Error saving OTP:', saveError)
      return NextResponse.json(
        { success: false, error: 'Failed to save OTP to database' },
        { status: 500 }
      )
    }

    // Send OTP email
    console.log('Sending OTP email to:', email)
    const emailResult = await sendOTPEmail(email, otp, firstName)
    console.log('Email sending result:', emailResult)

    if (!emailResult.success) {
      // If email sending fails, delete the OTP record
      console.log('Email sending failed, deleting OTP record')
      await Citixootps.findByIdAndDelete(otpRecord._id)
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP email' },
        { status: 500 }
      )
    }

    // Final verification - check if OTP still exists after email is sent
    const finalOTPCheck = await Citixootps.findById(otpRecord._id)
    console.log('Final OTP check after email sent:', finalOTPCheck ? 'EXISTS' : 'DELETED')

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 60 // seconds
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
