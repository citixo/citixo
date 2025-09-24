import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { CitixoUsers, CitixoBookings, CitixoServices, CitixoServiceCategories, CitixoPlans } from '@/lib/models'

// GET - Export data in various formats
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // users, bookings, services, etc.
    const format = searchParams.get('format') || 'json' // json, csv
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Export type is required'
      }, { status: 400 })
    }

    let data: any[] = []
    let filename = `citixo_${type}_${new Date().toISOString().split('T')[0]}`

    // Build date query if provided
    let dateQuery = {}
    if (startDate || endDate) {
      dateQuery = {
        createdAt: {
          ...(startDate && { $gte: new Date(startDate) }),
          ...(endDate && { $lte: new Date(endDate) })
        }
      }
    }

    switch (type) {
      case 'users':
        data = await CitixoUsers.find(dateQuery)
          .select('-password -loginHistory')
          .sort({ createdAt: -1 })
          .lean()
        break

      case 'bookings':
        data = await CitixoBookings.find(dateQuery)
          .populate('userId', 'firstName lastName email phone')
          .populate('serviceId', 'name basePrice')
          .sort({ createdAt: -1 })
          .lean()
        break

      case 'services':
        data = await CitixoServices.find(dateQuery)
          .populate('categoryId', 'name')
          .sort({ createdAt: -1 })
          .lean()
        break

      case 'categories':
        data = await CitixoServiceCategories.find(dateQuery)
          .sort({ displayOrder: 1 })
          .lean()
        break

      case 'plans':
        data = await CitixoPlans.find(dateQuery)
          .sort({ displayOrder: 1 })
          .lean()
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid export type'
        }, { status: 400 })
    }

    if (format === 'csv') {
      // Convert to CSV
      if (data.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'No data found for export'
        }, { status: 404 })
      }

      const csvData = convertToCSV(data)
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })
    } else {
      // Return JSON
      return NextResponse.json({
        success: true,
        data,
        count: data.length,
        exportInfo: {
          type,
          format,
          timestamp: new Date().toISOString(),
          dateRange: startDate || endDate ? { startDate, endDate } : null
        }
      })
    }

  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({
      success: false,
      error: 'Export failed',
      details: error.message
    }, { status: 500 })
  }
}

// Helper function to convert JSON to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  // Get all unique keys from all objects
  const allKeys = new Set<string>()
  data.forEach(item => {
    Object.keys(flattenObject(item)).forEach(key => allKeys.add(key))
  })

  const headers = Array.from(allKeys)
  const csvRows = [headers.join(',')]

  data.forEach(item => {
    const flatItem = flattenObject(item)
    const row = headers.map(header => {
      const value = flatItem[header] || ''
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csvRows.push(row.join(','))
  })

  return csvRows.join('\n')
}

// Helper function to flatten nested objects for CSV
function flattenObject(obj: any, prefix = ''): any {
  const flattened: any = {}

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key

      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, flattenObject(value, newKey))
      } else if (Array.isArray(value)) {
        flattened[newKey] = value.join('; ')
      } else {
        flattened[newKey] = value
      }
    }
  }

  return flattened
}
