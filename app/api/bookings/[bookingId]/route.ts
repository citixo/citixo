import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoBookings, CitixoUsers, CitixoServices } from "@/lib/models"

// GET - Fetch specific booking details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await connectDB()

    const { bookingId } = await params
    const booking = await CitixoBookings.findOne({ 
      bookingId: bookingId 
    })

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found"
      }, { status: 404 })
    }

    // Fetch current service data for the latest image
    const service = await CitixoServices.findOne({ 
      serviceId: booking.serviceId,
      status: 'Active'
    }).select('serviceId name images')

    // Transform data for frontend
    const bookingDetail = {
      id: booking.bookingId,
      bookingNumber: `CTX${booking.bookingId.slice(-6)}`,
      service: {
        name: booking.serviceDetails.name,
        description: booking.serviceDetails.description,
        image: service?.images ? service.images.url : "/placeholder.svg"
      },
      customer: {
        name: booking.customerDetails.name,
        email: booking.customerDetails.email,
        phone: booking.customerDetails.phone,
        address: `${booking.customerDetails.address.street}, ${booking.customerDetails.address.city}, ${booking.customerDetails.address.state} ${booking.customerDetails.address.zipCode}`
      },
      scheduledDate: booking.scheduledDate.toISOString(),
      scheduledTime: booking.scheduledTime,
      status: booking.status,
      amount: booking.finalAmount,
      quantity: booking.quantity,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      professional: booking.professionalDetails?.name ? {
        name: booking.professionalDetails.name,
        phone: booking.professionalDetails.phone,
        rating: booking.professionalDetails.rating || 4.5
      } : null,
      review: booking.reviewDetails?.rating ? {
        rating: booking.reviewDetails.rating,
        comment: booking.reviewDetails.comment,
        createdAt: booking.reviewDetails.createdAt?.toISOString() || new Date().toISOString()
      } : null
    }

    return NextResponse.json({
      success: true,
      data: bookingDetail
    })
  } catch (error) {
    console.error("Error fetching booking details:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch booking details" 
    }, { status: 500 })
  }
}

// PUT - Update booking details (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await connectDB()

    const { bookingId } = await params
    const body = await request.json()
    const { status, amount, notes, professionalId } = body

    const booking = await CitixoBookings.findOne({ bookingId: bookingId })
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found"
      }, { status: 404 })
    }

    // Update fields
    if (status) {
      booking.status = status
      
      // Add to status history
      booking.statusHistory.push({
        status,
        timestamp: new Date(),
        updatedBy: 'Admin',
        notes: `Status updated to ${status}`
      })

      // Set completion time if completed
      if (status === 'Completed' && !booking.completedAt) {
        booking.completedAt = new Date()
      }
    }

    if (amount !== undefined) {
      booking.finalAmount = amount
    }

    if (notes !== undefined) {
      booking.notes = notes
    }

    if (professionalId) {
      // Here you would fetch professional details and assign
      booking.professionalDetails = {
        id: professionalId,
        name: "Professional Name", // Fetch from professionals collection
        phone: "+91 9876543210",
        rating: 4.5
      }
    }

    await booking.save()

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      data: booking
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update booking" 
    }, { status: 500 })
  }
}
