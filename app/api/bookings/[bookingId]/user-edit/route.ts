import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoBookings } from "@/lib/models"

// PUT - Update booking details (user edit)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await connectDB()

    const { bookingId } = await params
    const body = await request.json()
    const { 
      scheduledDate, 
      scheduledTime, 
      customerDetails, 
      specialInstructions, 
      notes 
    } = body

    // Validate required fields
    if (!scheduledDate || !scheduledTime || !customerDetails) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields"
      }, { status: 400 })
    }

    // Validate customer details
    const { name, phone, email, address } = customerDetails
    if (!name || !phone || !email || !address) {
      return NextResponse.json({
        success: false,
        error: "Missing required customer details"
      }, { status: 400 })
    }

    // Validate address
    const { street, city, state, zipCode } = address
    if (!street || !city || !state || !zipCode) {
      return NextResponse.json({
        success: false,
        error: "Missing required address fields"
      }, { status: 400 })
    }

    // Find the booking
    const booking = await CitixoBookings.findOne({ bookingId: bookingId })
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found"
      }, { status: 404 })
    }

    // Check if user can edit this booking
    // Only allow editing if status is Pending or Accepted
    if (!['Pending', 'Accepted'].includes(booking.status)) {
      return NextResponse.json({
        success: false,
        error: "Booking cannot be edited in current status"
      }, { status: 400 })
    }

    // Validate date is not in the past
    const selectedDate = new Date(scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      return NextResponse.json({
        success: false,
        error: "Cannot schedule booking for past dates"
      }, { status: 400 })
    }

    // Check if booking is too close to scheduled time (less than 2 hours)
    const now = new Date()
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const timeDiff = scheduledDateTime.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    
    if (hoursDiff < 2) {
      return NextResponse.json({
        success: false,
        error: "Cannot edit booking less than 2 hours before scheduled time"
      }, { status: 400 })
    }

    // Update booking fields
    booking.scheduledDate = selectedDate
    booking.scheduledTime = scheduledTime
    
    // Update customer details
    booking.customerDetails = {
      name,
      phone,
      email,
      address: {
        street,
        city,
        state,
        zipCode,
        coordinates: booking.customerDetails.address.coordinates // Keep existing coordinates
      }
    }

    // Update special instructions and notes
    if (specialInstructions !== undefined) {
      booking.specialInstructions = specialInstructions
    }
    if (notes !== undefined) {
      booking.notes = notes
    }

    // Add to status history
    booking.statusHistory.push({
      status: booking.status,
      timestamp: new Date(),
      updatedBy: 'User',
      notes: 'Booking details updated by user'
    })

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
