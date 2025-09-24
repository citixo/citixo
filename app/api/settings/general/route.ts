import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CitixoSettings } from '@/lib/models'

// GET - Fetch general settings only
export async function GET() {
  try {
    await connectDB()
    const settings = await CitixoSettings.find({})
    
    return NextResponse.json({
      success: true,
      data: settings[0]?.general
    })
  } catch (error: any) {
    console.error('Error fetching general settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch general settings',
      details: error.message
    }, { status: 500 })
  }
}

// PUT - Update general settings only
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const settings = await CitixoSettings.find({})
    await settings[0].updateOne({general:body})
    
    return NextResponse.json({
      success: true,
      message: 'General settings updated successfully',
      data: settings[0].general
    })
  } catch (error: any) {
    console.error('Error updating general settings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update general settings',
      details: error.message
    }, { status: 500 })
  }
}
