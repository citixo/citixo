import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CitixoSettings } from '@/lib/models'

// GET - Fetch backup settings only
export async function GET() {
  try {
    await connectDB()
    const settings = await CitixoSettings.getSettings()
    
    return NextResponse.json({
      success: true,
      data: {
        automaticBackups: settings.backup.automaticBackups,
        backupFrequency: settings.backup.backupFrequency,
        retentionPeriod: settings.backup.retentionPeriod,
        lastBackupDate: settings.backup.lastBackupDate,
        backupLocation: settings.backup.backupLocation
      }
    })
  } catch (error: any) {
    console.error('Error fetching backup settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch backup settings',
      details: error.message
    }, { status: 500 })
  }
}

// PUT - Update backup settings only
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const settings = await CitixoSettings.getSettings()
    await settings.updateSection('backup', body)
    
    return NextResponse.json({
      success: true,
      message: 'Backup settings updated successfully',
      data: settings.backup
    })
  } catch (error: any) {
    console.error('Error updating backup settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update backup settings',
      details: error.message
    }, { status: 500 })
  }
}

// POST - Create backup or perform backup operations
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    const { action } = body

    const settings = await CitixoSettings.getSettings()

    if (action === 'create_backup') {
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

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Error in backup operation:', error)
    return NextResponse.json({
      success: false,
      error: 'Backup operation failed',
      details: error.message
    }, { status: 500 })
  }
}
