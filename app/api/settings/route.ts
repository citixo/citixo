import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CitixoSettings } from '@/lib/models'
import bcrypt from 'bcryptjs'

// GET - Fetch all settings or specific section
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section')

    const settings = await CitixoSettings.getSettings()

    if (section) {
      // Return specific section
      if (settings[section]) {
        return NextResponse.json({
          success: true,
          data: settings[section],
          section
        })
      } else {
        return NextResponse.json({
          success: false,
          error: `Section '${section}' not found`
        }, { status: 404 })
      }
    }

    // Return all settings (excluding sensitive data)
    const publicSettings = {
      general: settings.general,
      notifications: {
        ...settings.notifications,
        emailSettings: undefined // Hide email credentials
      },
      security: {
        passwordMinLength: settings.security.passwordMinLength,
        requireSpecialChars: settings.security.requireSpecialChars,
        sessionTimeout: settings.security.sessionTimeout,
        maxLoginAttempts: settings.security.maxLoginAttempts,
        lockoutDuration: settings.security.lockoutDuration,
        twoFactorEnabled: settings.security.twoFactorEnabled
        // Hide sensitive security settings
      },
      appearance: settings.appearance,
      backup: {
        automaticBackups: settings.backup.automaticBackups,
        backupFrequency: settings.backup.backupFrequency,
        retentionPeriod: settings.backup.retentionPeriod,
        lastBackupDate: settings.backup.lastBackupDate,
        backupLocation: settings.backup.backupLocation
      },
      business: settings.business,
      version: settings.version,
      lastUpdated: settings.lastUpdated
    }

    return NextResponse.json({
      success: true,
      data: publicSettings
    })

  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings',
      details: error.message
    }, { status: 500 })
  }
}

// PUT - Update settings (specific section or full settings)
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { section, data, adminPassword } = body

    // Verify admin authentication for sensitive changes
    if (section === 'security' || section === 'integrations') {
      if (!adminPassword) {
        return NextResponse.json({
          success: false,
          error: 'Admin password required for security changes'
        }, { status: 401 })
      }

      // For demo purposes, we'll use a simple check
      // In production, verify against actual admin password
      if (adminPassword !== 'Password@123') {
        return NextResponse.json({
          success: false,
          error: 'Invalid admin password'
        }, { status: 401 })
      }
    }

    const settings = await CitixoSettings.getSettings()

    if (section) {
      // Update specific section
      if (!settings[section]) {
        return NextResponse.json({
          success: false,
          error: `Section '${section}' not found`
        }, { status: 404 })
      }

      // Special handling for password changes
      if (section === 'security' && data.newPassword) {
        if (!data.currentPassword) {
          return NextResponse.json({
            success: false,
            error: 'Current password is required'
          }, { status: 400 })
        }

        // In production, verify current password against admin user
        // For demo, skip current password verification
        
        if (data.newPassword !== data.confirmPassword) {
          return NextResponse.json({
            success: false,
            error: 'New passwords do not match'
          }, { status: 400 })
        }

        // Hash new password (in production, update admin user password)
        const hashedPassword = await bcrypt.hash(data.newPassword, 12)
        console.log('New password hash:', hashedPassword) // For demo only

        // Remove password fields from data before saving to settings
        const { currentPassword, newPassword, confirmPassword, ...otherData } = data
        await settings.updateSection(section, otherData)
      } else {
        await settings.updateSection(section, data)
      }

      return NextResponse.json({
        success: true,
        message: `${section} settings updated successfully`,
        data: settings[section]
      })
    } else {
      // Update multiple sections
      Object.keys(data).forEach(key => {
        if (settings[key]) {
          settings[key] = { ...settings[key], ...data[key] }
        }
      })

      await settings.save()

      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      })
    }

  } catch (error: any) {
    console.error('Error updating settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update settings',
      details: error.message
    }, { status: 500 })
  }
}

// POST - Initialize default settings or backup
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { action } = body

    if (action === 'backup') {
      const settings = await CitixoSettings.getSettings()
      
      // Create backup (in production, save to cloud storage)
      const backupData = {
        timestamp: new Date().toISOString(),
        settings: settings.toObject(),
        version: settings.version
      }

      // Update last backup date
      settings.backup.lastBackupDate = new Date()
      await settings.save()

      return NextResponse.json({
        success: true,
        message: 'Backup created successfully',
        data: {
          timestamp: backupData.timestamp,
          size: JSON.stringify(backupData).length + ' bytes'
        }
      })
    }

    if (action === 'restore') {
      const { backupData } = body
      if (!backupData) {
        return NextResponse.json({
          success: false,
          error: 'Backup data is required'
        }, { status: 400 })
      }

      // Restore from backup (in production, validate backup integrity)
      const settings = await CitixoSettings.getSettings()
      Object.assign(settings, backupData.settings)
      await settings.save()

      return NextResponse.json({
        success: true,
        message: 'Settings restored from backup successfully'
      })
    }

    if (action === 'reset') {
      // Reset to default settings
      await CitixoSettings.deleteMany({})
      const newSettings = await CitixoSettings.getSettings()

      return NextResponse.json({
        success: true,
        message: 'Settings reset to defaults successfully',
        data: newSettings
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Error in settings operation:', error)
    return NextResponse.json({
      success: false,
      error: 'Settings operation failed',
      details: error.message
    }, { status: 500 })
  }
}
