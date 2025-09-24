import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CitixoSettings } from '@/lib/models'

// GET - Fetch notification settings only
export async function GET() {
  try {
    await connectDB()
    const settings = await CitixoSettings.getSettings()
    
    return NextResponse.json({
      success: true,
      data: settings.notifications
    })
  } catch (error: any) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch notification settings',
      details: error.message
    }, { status: 500 })
  }
}

// PUT - Update notification settings only
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const settings = await CitixoSettings.getSettings()
    await settings.updateSection('notifications', body)
    
    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: settings.notifications
    })
  } catch (error: any) {
    console.error('Error updating notification settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update notification settings',
      details: error.message
    }, { status: 500 })
  }
}
