import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoReviews, CitixoUsers } from "@/lib/models"

// GET - Fetch reviews (optionally filtered by serviceId)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status') || 'Approved' // Only show approved reviews by default

    // Build query
    const query: any = { status }
    if (serviceId) {
      query.serviceId = serviceId
    }

    // Fetch reviews with pagination
    const reviews = await CitixoReviews.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    // Get total count for pagination
    const total = await CitixoReviews.countDocuments(query)

    // Fetch user details for non-anonymous reviews
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        let customerName = 'Anonymous User'
        let customerInitials = 'AU'

        if (!review.isAnonymous) {
          // Use stored customer info if available, otherwise fetch from user
          if (review.customerName && review.customerInitials) {
            customerName = review.customerName
            customerInitials = review.customerInitials
          } else {
            try {
              const user = await CitixoUsers.findOne({ userId: review.userId })
              if (user) {
                customerName = `${user.firstName} ${user.lastName}`
                customerInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
              }
            } catch (error) {
              console.error('Error fetching user for review:', error)
            }
          }
        }

        return {
          id: review.reviewId,
          rating: review.rating,
          title: review.title || '',
          comment: review.comment,
          customerName,
          customerInitials,
          createdAt: review.createdAt.toISOString(),
          isVerified: review.isVerified,
          helpfulVotes: review.helpfulVotes || { up: 0, down: 0 },
          detailedRatings: review.ratings || {},
          adminResponse: review.adminResponse || null
        }
      })
    )

    // Calculate rating summary if serviceId provided
    let ratingSummary = null
    if (serviceId) {
      const ratingStats = await CitixoReviews.aggregate([
        { $match: { serviceId, status: 'Approved' } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ])

      if (ratingStats.length > 0) {
        const stats = ratingStats[0]
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        
        stats.ratingDistribution.forEach((rating: number) => {
          distribution[rating as keyof typeof distribution]++
        })

        ratingSummary = {
          totalReviews: stats.totalReviews,
          averageRating: Number(stats.averageRating.toFixed(1)),
          distribution
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reviews: enrichedReviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasMore: (page * limit) < total
        },
        ratingSummary
      }
    })

  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch reviews" 
    }, { status: 500 })
  }
}

// POST - Submit a new review
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { serviceId, rating, title, comment } = body

    // Validate required fields
    if (!serviceId || !rating || !comment) {
      return NextResponse.json({
        success: false,
        error: "Service ID, rating, and comment are required"
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: "Rating must be between 1 and 5"
      }, { status: 400 })
    }

    if (comment.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: "Comment must be at least 10 characters long"
      }, { status: 400 })
    }

    // Get user from cookies
    const cookies = request.headers.get('cookie') || ''
    const cookieObj = Object.fromEntries(
      cookies.split('; ').map(c => c.split('=')).filter(([key, value]) => key && value)
    )
    
    if (!cookieObj.normaluser && !cookieObj.adminuser) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 })
    }

    const userType = cookieObj.userType
    const userId = cookieObj.userId

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User session not found"
      }, { status: 401 })
    }

    // Get user details from database
    let user = null
    if (userType === 'admin' && userId === 'admin') {
      user = {
        userId: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@citixo.com'
      }
    } else {
      user = await CitixoUsers.findOne({ userId: userId })
      if (!user) {
        return NextResponse.json({
          success: false,
          error: "User not found"
        }, { status: 404 })
      }
    }
    
    // Generate review ID
    const reviewId = `REV${Date.now()}`

    // Create review
    const newReview = new CitixoReviews({
      reviewId,
      userId,
      serviceId,
      bookingId: `DIRECT${Date.now()}`, // Direct review not from booking
      rating,
      title: title || '',
      comment: comment.trim(),
      status: 'Approved', // Auto-approve for demo, normally would be 'Pending'
      isVerified: false, // Since it's not from a completed booking
      isAnonymous: false,
      customerName: `${user.firstName} ${user.lastName}`,
      customerInitials: `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`,
      helpfulVotes: {
        up: 0,
        down: 0,
        votedBy: []
      }
    })

    await newReview.save()

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      data: {
        reviewId: newReview.reviewId,
        status: newReview.status
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
