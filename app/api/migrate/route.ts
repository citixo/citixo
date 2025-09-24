import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CitixoData from '@/lib/models/CitixoData'
import { 
  CitixoUsers, 
  CitixoServices, 
  CitixoServiceCategories, 
  CitixoBookings, 
  CitixoPlans, 
  CitixoReviews 
} from '@/lib/models'

interface MigrationResult {
  success: boolean
  message: string
  stats: {
    users: number
    services: number
    categories: number
    bookings: number
    plans: number
  }
  errors: string[]
}

export async function POST(request: NextRequest): Promise<NextResponse<MigrationResult>> {
  try {
    await connectDB()
    
    const errors: string[] = []
    const stats = {
      users: 0,
      services: 0,
      categories: 0,
      bookings: 0,
      plans: 0
    }

    // Get all data from the old collection
    const allData = await CitixoData.find({})
    
    console.log(`Starting migration of ${allData.length} records...`)

    // Create service categories first (needed for services)
    const categoryMap = new Map<string, string>()
    const existingCategories = new Set(['Cleaning & Pest Control', 'AC & Appliance Repair', 'Electronics Repair', 'Home Maintenance'])
    
    for (const categoryName of existingCategories) {
      try {
        const categoryId = `CAT${Date.now()}${Math.random().toString(36).substr(2, 4)}`
        
        const category = new CitixoServiceCategories({
          categoryId,
          name: categoryName,
          description: `Professional ${categoryName.toLowerCase()} services`,
          status: 'Active',
          displayOrder: Array.from(existingCategories).indexOf(categoryName) + 1,
          color: getColorForCategory(categoryName)
        })
        
        await category.save()
        categoryMap.set(categoryName, categoryId)
        stats.categories++
      } catch (error) {
        errors.push(`Category migration error for ${categoryName}: ${error}`)
      }
    }

    // Migrate each record based on type
    for (const record of allData) {
      try {
        switch (record.type) {
          case 'user':
            await migrateUser(record.data)
            stats.users++
            break
            
          case 'service':
            await migrateService(record.data, categoryMap)
            stats.services++
            break
            
          case 'booking':
            await migrateBooking(record.data)
            stats.bookings++
            break
            
          case 'plan':
            await migratePlan(record.data)
            stats.plans++
            break
            
          default:
            console.log(`Unknown record type: ${record.type}`)
        }
      } catch (error) {
        errors.push(`Migration error for ${record.type} ${record.data?.id}: ${error}`)
      }
    }

    const result: MigrationResult = {
      success: errors.length === 0,
      message: errors.length === 0 
        ? 'Migration completed successfully!' 
        : `Migration completed with ${errors.length} errors`,
      stats,
      errors
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      stats: { users: 0, services: 0, categories: 0, bookings: 0, plans: 0 },
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 })
  }
}

// Helper functions for migration
async function migrateUser(userData: any) {
  const user = new CitixoUsers({
    userId: userData.id || `USR${Date.now()}`,
    firstName: userData.firstName || userData.name?.split(' ')[0] || 'User',
    lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
    email: userData.email,
    phone: userData.phone || '',
    password: userData.password || 'defaultPassword123',
    role: userData.role || 'User',
    status: userData.status || 'Active',
    emailVerified: userData.emailVerified || false,
    phoneVerified: userData.phoneVerified || false,
    address: {
      street: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      zipCode: userData.zipCode || '',
      country: 'India'
    },
    totalBookings: userData.totalBookings || 0,
    totalSpent: userData.totalSpent || 0,
    lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : null
  })
  
  await user.save()
}

async function migrateService(serviceData: any, categoryMap: Map<string, string>) {
  const categoryId = categoryMap.get(serviceData.category) || 'CAT001'
  
  const service = new CitixoServices({
    serviceId: serviceData.id || `SRV${Date.now()}`,
    name: serviceData.name,
    description: serviceData.description,
    categoryId,
    basePrice: extractPriceFromString(serviceData.price),
    priceType: 'Starting',
    features: serviceData.features || [],
    images: serviceData.image ? [serviceData.image] : [],
    status: serviceData.status || 'Active',
    rating: {
      average: serviceData.rating || 0,
      count: serviceData.reviews || 0
    },
    bookingCount: serviceData.bookings || 0,
    seo: {
      slug: serviceData.href?.replace('/services/', '') || serviceData.name.toLowerCase().replace(/\s+/g, '-')
    }
  })
  
  await service.save()
}

async function migrateBooking(bookingData: any) {
  const booking = new CitixoBookings({
    bookingId: bookingData.id || `BK${Date.now()}`,
    userId: `USR${Date.now()}`, // This would need to be mapped properly
    serviceId: `SRV${Date.now()}`, // This would need to be mapped properly
    customerDetails: {
      name: bookingData.customer?.name || '',
      phone: bookingData.customer?.phone || '',
      email: bookingData.customer?.email || '',
      address: {
        street: bookingData.customer?.address || '',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411001'
      }
    },
    serviceDetails: {
      name: bookingData.service || '',
      basePrice: bookingData.amount || 0
    },
    scheduledDate: new Date(bookingData.date),
    scheduledTime: bookingData.time || '10:00 AM',
    quantity: bookingData.quantity || 1,
    totalAmount: bookingData.amount || 0,
    finalAmount: bookingData.amount || 0,
    status: bookingData.status || 'Pending',
    notes: bookingData.notes || '',
    professionalDetails: {
      name: bookingData.professional || 'Unassigned'
    }
  })
  
  await booking.save()
}

async function migratePlan(planData: any) {
  const plan = new CitixoPlans({
    planId: planData.id || `PLN${Date.now()}`,
    name: planData.name,
    description: planData.description,
    price: planData.price,
    billingPeriod: planData.period === 'month' ? 'Monthly' : 'Monthly',
    features: planData.features || [],
    status: planData.status || 'Active',
    isPopular: planData.popular || false,
    displayOrder: planData.subscribers || 0,
    colors: {
      background: planData.color || '#f3f4f6',
      text: planData.textColor || '#1f2937',
      accent: '#0095FF'
    },
    subscriberCount: planData.subscribers || 0,
    benefits: {
      serviceDiscount: planData.name === 'Standard' ? 15 : planData.name === 'Premium' ? 20 : 10,
      prioritySupport: planData.name !== 'Basic',
      emergencySupport: planData.name === 'Premium'
    }
  })
  
  await plan.save()
}

// Helper function to extract price from string like "Starting ₹499"
function extractPriceFromString(priceString: string): number {
  if (!priceString) return 0
  const match = priceString.match(/₹?(\d+)/)
  return match ? parseInt(match[1]) : 0
}

// Helper function to get color for category
function getColorForCategory(categoryName: string): string {
  const colors = {
    'Cleaning & Pest Control': '#10B981',
    'AC & Appliance Repair': '#3B82F6', 
    'Electronics Repair': '#8B5CF6',
    'Home Maintenance': '#F59E0B'
  }
  return colors[categoryName as keyof typeof colors] || '#0095FF'
}

// GET endpoint to check migration status
export async function GET() {
  try {
    await connectDB()
    
    const oldCount = await CitixoData.countDocuments()
    const newCounts = {
      users: await CitixoUsers.countDocuments(),
      services: await CitixoServices.countDocuments(),
      categories: await CitixoServiceCategories.countDocuments(),
      bookings: await CitixoBookings.countDocuments(),
      plans: await CitixoPlans.countDocuments()
    }
    
    return NextResponse.json({
      oldCollectionCount: oldCount,
      newCollectionCounts: newCounts,
      migrationNeeded: oldCount > 0 && Object.values(newCounts).every(count => count === 0)
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check migration status' }, { status: 500 })
  }
}
