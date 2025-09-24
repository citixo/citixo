import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CitixoSettings } from '@/lib/models'

// GET - Fetch appearance settings only
export async function GET() {
  try {
    await connectDB()
    const settings = await CitixoSettings.getSettings()
    
    return NextResponse.json({
      success: true,
      data: settings.appearance
    })
  } catch (error: any) {
    console.error('Error fetching appearance settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch appearance settings',
      details: error.message
    }, { status: 500 })
  }
}

// PUT - Update appearance settings only
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const settings = await CitixoSettings.getSettings()
    await settings.updateSection('appearance', body)
    
    return NextResponse.json({
      success: true,
      message: 'Appearance settings updated successfully',
      data: settings.appearance
    })
  } catch (error: any) {
    console.error('Error updating appearance settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update appearance settings',
      details: error.message
    }, { status: 500 })
  }
}
