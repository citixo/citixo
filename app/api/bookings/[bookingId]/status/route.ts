import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoBookings } from "@/lib/models"

// PUT - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await connectDB()

    const { bookingId } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({
        success: false,
        error: "Status is required"
      }, { status: 400 })
    }

    const validStatuses = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: "Invalid status"
      }, { status: 400 })
    }

    const booking = await CitixoBookings.findOne({ bookingId: bookingId })
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found"
      }, { status: 404 })
    }

    // Update status
    const oldStatus = booking.status
    booking.status = status

    // Add to status history
    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: 'Admin',
      notes: `Status changed from ${oldStatus} to ${status}`
    })

    // Set completion time if completed
    if (status === 'Completed' && !booking.completedAt) {
      booking.completedAt = new Date()
    }

    // Assign professional if accepted (placeholder logic)
    if (status === 'Accepted' && !booking.professionalDetails.id) {
      booking.professionalDetails = {
        id: `PROF${Date.now()}`,
        name: "John Smith",
        phone: "+91 9876543210",
        rating: 4.5,
        assignedAt: new Date()
      }
    }

    await booking.save()

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: {
        bookingId: booking.bookingId,
        status: booking.status,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update booking status" 
    }, { status: 500 })
  }
}
