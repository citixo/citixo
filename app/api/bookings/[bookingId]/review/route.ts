import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoBookings, CitixoReviews } from "@/lib/models"

// POST - Submit review for completed booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await connectDB()

    const { bookingId } = await params
    const body = await request.json()
    const { rating, comment } = body

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: "Valid rating (1-5) is required"
      }, { status: 400 })
    }

    if (!comment || comment.trim().length < 5) {
      return NextResponse.json({
        success: false,
        error: "Comment must be at least 5 characters long"
      }, { status: 400 })
    }

    const booking = await CitixoBookings.findOne({ bookingId: bookingId })
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found"
      }, { status: 404 })
    }

    if (booking.status !== 'Completed') {
      return NextResponse.json({
        success: false,
        error: "Reviews can only be submitted for completed bookings"
      }, { status: 400 })
    }

    if (booking.reviewDetails.rating) {
      return NextResponse.json({
        success: false,
        error: "Review already submitted for this booking"
      }, { status: 400 })
    }

    // Create review record
    const reviewId = `REV${Date.now()}`
    const newReview = new CitixoReviews({
      reviewId,
      userId: booking.userId,
      serviceId: booking.serviceId,
      bookingId: booking.bookingId,
      rating,
      comment: comment.trim(),
      reviewType: 'Service',
      isVerified: true, // Since it's from a completed booking
      helpful: 0,
      notHelpful: 0,
      status: 'Active'
    })

    await newReview.save()

    // Update booking with review details
    booking.reviewDetails = {
      reviewId,
      rating,
      comment: comment.trim(),
      createdAt: new Date()
    }

    await booking.save()

    // Update service average rating (you might want to implement this)
    // await updateServiceAverageRating(booking.serviceId)

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      data: {
        reviewId,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to submit review" 
    }, { status: 500 })
  }
}

// GET - Get review for booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await connectDB()

    const { bookingId } = await params
    const review = await CitixoReviews.findOne({ 
      bookingId: bookingId,
      status: 'Active'
    })

    if (!review) {
      return NextResponse.json({
        success: false,
        error: "Review not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        reviewId: review.reviewId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        helpful: review.helpful,
        notHelpful: review.notHelpful
      }
    })
  } catch (error) {
    console.error("Error fetching review:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch review" 
    }, { status: 500 })
  }
}
