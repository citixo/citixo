import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoBookings, CitixoUsers, CitixoServices } from "@/lib/models"
import CitixoCoupons from "@/lib/models/CitixoCoupons"

// GET - Fetch all bookings
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get user from cookies for authentication
    const cookies = request.headers.get('cookie') || ''
    const cookieObj = Object.fromEntries(
      cookies.split('; ').map(c => c.split('=')).filter(([key, value]) => key && value)
    )
    
    if (!cookieObj.normaluser && !cookieObj.adminuser) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated"
      }, { status: 401 })
    }

    const userType = cookieObj.userType
    const currentUserId = cookieObj.userId

    if (!currentUserId) {
      return NextResponse.json({
        success: false,
        error: "User session not found"
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceId = searchParams.get('serviceId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query - always filter by current user unless admin
    let query: any = {}
    
    if (userType !== 'admin') {
      // Regular users can only see their own bookings
      query.userId = currentUserId
    }
    // Admin can see all bookings (no userId filter)
    
    if (status) query.status = status
    if (serviceId) query.serviceId = serviceId
    
    if (startDate || endDate) {
      query.scheduledDate = {}
      if (startDate) query.scheduledDate.$gte = new Date(startDate)
      if (endDate) query.scheduledDate.$lte = new Date(endDate)
    }

    // Get bookings without population first (since we're using custom string IDs)
    const bookings = await CitixoBookings.find(query)
      .sort({ scheduledDate: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    // Get total count for pagination
    const totalCount = await CitixoBookings.countDocuments(query)

    // Get unique service IDs from bookings
    const serviceIds = [...new Set(bookings.map(booking => booking.serviceId))]
    
    // Fetch current service data for all services
    const services = await CitixoServices.find({ 
      serviceId: { $in: serviceIds },
      status: 'Active'
    }).select('serviceId name images')
    
    // Create a map for quick service lookup
    const serviceMap = services.reduce((map, service) => {
      map[service.serviceId] = service
      return map
    }, {} as Record<string, any>)

    // Transform data for the orders page format
    const transformedBookings = bookings.map(booking => {
      const service = serviceMap[booking.serviceId]
      
      return {
        id: booking.bookingId,
        bookingNumber: `CTX${booking.bookingId.slice(-6)}`,
        service: {
          name: booking.serviceDetails.name,
          image: service?.images ? service.images.url : "/placeholder.svg"
        },
        customer: {
          name: booking.customerDetails.name,
          email: booking.customerDetails.email,
          phone: booking.customerDetails.phone,
          address: booking.customerDetails.address.street 
            ? `${booking.customerDetails.address.street}, ${booking.customerDetails.address.city}, ${booking.customerDetails.address.state} ${booking.customerDetails.address.zipCode}` 
            : `${booking.customerDetails.address.city}, ${booking.customerDetails.address.state}`
        },
        scheduledDate: booking.scheduledDate.toISOString(),
        scheduledTime: booking.scheduledTime,
        status: booking.status,
        amount: booking.finalAmount,
        quantity: booking.quantity,
        createdAt: booking.createdAt.toISOString(),
        professional: booking.professionalDetails?.name ? {
          name: booking.professionalDetails.name
        } : undefined,
        hasReview: booking.reviewDetails?.rating ? true : false
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedBookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error: any) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bookings" }, { status: 500 })
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Get user from cookies for authentication
    const cookies = request.headers.get('cookie') || ''
    const cookieObj = Object.fromEntries(
      cookies.split('; ').map(c => c.split('=')).filter(([key, value]) => key && value)
    )
    
    if (!cookieObj.normaluser && !cookieObj.adminuser) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated"
      }, { status: 401 })
    }

    const userType = cookieObj.userType
    const currentUserId = cookieObj.userId

    if (!currentUserId) {
      return NextResponse.json({
        success: false,
        error: "User session not found"
      }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.serviceId || !body.scheduledDate || !body.scheduledTime) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: serviceId, scheduledDate, scheduledTime"
      }, { status: 400 })
    }

    // Verify service exists and get/create user
    const service = await CitixoServices.findOne({ serviceId: body.serviceId, status: 'Active' })
    
    if (!service) {
      return NextResponse.json({
        success: false,
        error: "Invalid service ID or service not available"
      }, { status: 400 })
    }

    // Get current user from database using session userId
    let user = null
    
    if (userType === 'admin' && currentUserId === 'admin') {
      // Admin users cannot create bookings for themselves
      return NextResponse.json({
        success: false,
        error: "Admin users cannot create bookings"
      }, { status: 403 })
    } else {
      // Find the authenticated user
      user = await CitixoUsers.findOne({ 
        userId: currentUserId,
        status: { $in: ["Active", "Pending"] }
      })
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: "User not found. Please log in again."
        }, { status: 404 })
      }
    }

    // Generate unique booking ID with random component to avoid collisions
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const bookingId = `BK${timestamp.slice(-5)}${random}`

    // Calculate amounts
    const quantity = body.quantity || 1
    const totalAmount = service.basePrice * quantity
    
    // Handle coupon discount if provided
    let finalAmount = totalAmount
    let discountData = {}
    
    if (body.discount && body.discount.couponCode) {
      finalAmount = body.finalAmount || totalAmount
      discountData = {
        discount: {
          amount: body.discount.amount || 0,
          type: body.discount.type || 'Percentage',
          couponCode: body.discount.couponCode,
          discountPercentage: body.discount.discountPercentage || 0
        }
      }
    }
    
    const newBooking = new CitixoBookings({
      bookingId,
      userId: currentUserId,
      serviceId: body.serviceId,
      customerDetails: {
        name: body.customerDetails?.name || user.fullName,
        phone: body.customerDetails?.phone || user.phone,
        email: body.customerDetails?.email || user.email,
        address: body.customerDetails?.address || {
          street: user.address.street,
          city: user.address.city,
          state: user.address.state,
          zipCode: user.address.zipCode
        }
      },
      serviceDetails: {
        name: service.name,
        description: service.description,
        basePrice: service.basePrice,
        categoryName: service.categoryId // Will be populated later
        // Note: No image stored here - we fetch it dynamically from service.images when displaying
      },
      scheduledDate: new Date(body.scheduledDate),
      scheduledTime: body.scheduledTime,
      quantity,
      totalAmount,
      finalAmount,
      ...discountData,
      status: 'Confirmed', // Changed to Confirmed since payment is successful
      paymentStatus: body.paymentData ? 'Paid' : 'Pending',
      notes: body.notes || '',
      specialInstructions: body.specialInstructions || '',
      // Add payment details if available
      ...(body.paymentData && {
        paymentDetails: {
          paymentId: body.paymentData.paymentId,
          orderId: body.paymentData.orderId,
          amount: body.paymentData.amount,
          currency: body.paymentData.currency,
          status: body.paymentData.status,
          method: body.paymentData.method,
          paidAt: new Date()
        }
      })
    })

    await newBooking.save()

    // Mark coupon as used if applied
    if (body.discount && body.discount.couponCode) {
      try {
        await CitixoCoupons.findOneAndUpdate(
          { code: body.discount.couponCode.toUpperCase() },
          {
            $push: {
              usedBy: {
                userId: currentUserId,
                bookingId: newBooking.bookingId,
                usedAt: new Date()
              }
            },
            $inc: { usageCount: 1 }
          }
        )
      } catch (error) {
        console.error('Error marking coupon as used:', error)
        // Don't fail the booking if coupon marking fails
      }
    }

    // Update user and service statistics
    await Promise.all([
      CitixoUsers.findOneAndUpdate(
        { userId: user.userId },
        { 
          $inc: { totalBookings: 1, totalSpent: newBooking.finalAmount },
          lastLoginAt: new Date()
        }
      ),
      CitixoServices.findOneAndUpdate(
        { serviceId: body.serviceId },
        { $inc: { bookingCount: 1 } }
      )
    ])

    // Transform response to match old format
    const responseData = {
      id: newBooking.bookingId,
      customer: {
        name: newBooking.customerDetails.name,
        phone: newBooking.customerDetails.phone,
        email: newBooking.customerDetails.email,
        address: `${newBooking.customerDetails.address.street}, ${newBooking.customerDetails.address.city}`
      },
      service: newBooking.serviceDetails.name,
      date: newBooking.scheduledDate.toISOString().split('T')[0],
      time: newBooking.scheduledTime,
      amount: newBooking.finalAmount,
      status: newBooking.status,
      professional: 'Unassigned',
      notes: newBooking.notes,
      createdAt: newBooking.createdAt.toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Booking created successfully",
    })
  } catch (error: any) {
    console.error("Error creating booking:", error)
    
    // Provide more specific error messages
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: "A booking with similar details already exists or user data conflict" 
      }, { status: 409 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to create booking" 
    }, { status: 500 })
  }
}

// PUT - Update booking
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { bookingId, ...updateData } = body

    if (!bookingId) {
      return NextResponse.json({
        success: false,
        error: "Booking ID is required"
      }, { status: 400 })
    }

    const booking = await CitixoBookings.findOne({ bookingId })
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found"
      }, { status: 404 })
    }

    // Update booking with status history
    if (updateData.status && updateData.status !== booking.status) {
      booking.statusHistory.push({
        status: updateData.status,
        timestamp: new Date(),
        updatedBy: updateData.updatedBy || 'System',
        notes: updateData.statusNotes || `Status changed to ${updateData.status}`
      })
    }

    // Update fields
    Object.assign(booking, updateData)
    
    // Set completion time if status is completed
    if (updateData.status === 'Completed' && !booking.completedAt) {
      booking.completedAt = new Date()
    }

    await booking.save()

    return NextResponse.json({
      success: true,
      data: booking,
      message: "Booking updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 })
  }
}