import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CitixoSettings } from '@/lib/models'
import bcrypt from 'bcryptjs'

// GET - Fetch security settings only
export async function GET() {
  try {
    await connectDB()
    const settings = await CitixoSettings.getSettings()
    
    // Return only non-sensitive security settings
    const publicSecuritySettings = {
      passwordMinLength: settings.security.passwordMinLength,
      requireSpecialChars: settings.security.requireSpecialChars,
      sessionTimeout: settings.security.sessionTimeout,
      maxLoginAttempts: settings.security.maxLoginAttempts,
      lockoutDuration: settings.security.lockoutDuration,
      twoFactorEnabled: settings.security.twoFactorEnabled
    }
    
    return NextResponse.json({
      success: true,
      data: publicSecuritySettings
    })
  } catch (error: any) {
    console.error('Error fetching security settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch security settings',
      details: error.message
    }, { status: 500 })
  }
}

// PUT - Update security settings only
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { adminPassword, currentPassword, newPassword, confirmPassword, ...otherData } = body
    
    // Verify admin authentication for security changes
    if (!adminPassword) {
      return NextResponse.json({
        success: false,
        error: 'Admin password required for security changes'
      }, { status: 401 })
    }

    // For demo purposes, we'll use a simple check
    if (adminPassword !== 'Password@123') {
      return NextResponse.json({
        success: false,
        error: 'Invalid admin password'
      }, { status: 401 })
    }

    const settings = await CitixoSettings.getSettings()
    
    // Handle password change if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({
          success: false,
          error: 'Current password is required'
        }, { status: 400 })
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json({
          success: false,
          error: 'New passwords do not match'
        }, { status: 400 })
      }

      // Hash new password (in production, update admin user password)
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      console.log('New password hash:', hashedPassword) // For demo only
    }
    
    await settings.updateSection('security', otherData)
    
    return NextResponse.json({
      success: true,
      message: 'Security settings updated successfully',
      data: settings.security
    })
  } catch (error: any) {
    console.error('Error updating security settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update security settings',
      details: error.message
    }, { status: 500 })
  }
}
