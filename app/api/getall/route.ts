import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { 
  CitixoUsers, 
  CitixoServices, 
  CitixoServiceCategories, 
  CitixoBookings, 
  CitixoPlans, 
  CitixoUserPlans,
  CitixoReviews,
  CitixoPayments
} from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    switch (type) {
      case 'users':
        const users = await CitixoUsers.find({ status: 'Active' })
          .select('-password -loginHistory')
          .sort({ createdAt: -1 })
        return NextResponse.json({
          success: true,
          data: users,
          count: users.length
        })

      case 'services':
        const services = await CitixoServices.find({ status: 'Active' })
          .sort({ bookingCount: -1 })
        return NextResponse.json({
          success: true,
          data: services,
          count: services.length
        })

      case 'categories':
        const categories = await CitixoServiceCategories.find({ status: 'Active' })
          .sort({ displayOrder: 1 })
        return NextResponse.json({
          success: true,
          data: categories,
          count: categories.length
        })

      case 'bookings':
        const bookings = await CitixoBookings.find()
          .populate('userId', 'firstName lastName email phone')
          .populate('serviceId', 'name basePrice categoryId')
          .sort({ scheduledDate: -1 })
        return NextResponse.json({
          success: true,
          data: bookings,
          count: bookings.length
        })

      case 'plans':
        const plans = await CitixoPlans.find({ status: 'Active' })
          .sort({ displayOrder: 1 })
        return NextResponse.json({
          success: true,
          data: plans,
          count: plans.length
        })

      case 'reviews':
        const reviews = await CitixoReviews.find({ status: 'Approved' })
          .populate('userId', 'firstName lastName')
          .populate('serviceId', 'name')
          .sort({ createdAt: -1 })
        return NextResponse.json({
          success: true,
          data: reviews,
          count: reviews.length
        })

      case 'payments':
        const payments = await CitixoPayments.find()
          .populate('userId', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .limit(100) // Limit for performance
        return NextResponse.json({
          success: true,
          data: payments,
          count: payments.length
        })

      case 'subscriptions':
        const subscriptions = await CitixoUserPlans.find({ status: 'Active' })
          .populate('userId', 'firstName lastName email')
          .populate('planId', 'name price billingPeriod')
          .sort({ endDate: 1 })
        return NextResponse.json({
          success: true,
          data: subscriptions,
          count: subscriptions.length
        })

      case 'all':
        // Get counts from all collections
        const [
          usersCount,
          servicesCount,
          categoriesCount,
          bookingsCount,
          plansCount,
          reviewsCount,
          paymentsCount,
          subscriptionsCount
        ] = await Promise.all([
          CitixoUsers.countDocuments({ status: 'Active' }),
          CitixoServices.countDocuments({ status: 'Active' }),
          CitixoServiceCategories.countDocuments({ status: 'Active' }),
          CitixoBookings.countDocuments(),
          CitixoPlans.countDocuments({ status: 'Active' }),
          CitixoReviews.countDocuments({ status: 'Approved' }),
          CitixoPayments.countDocuments(),
          CitixoUserPlans.countDocuments({ status: 'Active' })
        ])

        return NextResponse.json({
          success: true,
          data: {
            users: usersCount,
            services: servicesCount,
            categories: categoriesCount,
            bookings: bookingsCount,
            plans: plansCount,
            reviews: reviewsCount,
            payments: paymentsCount,
            subscriptions: subscriptionsCount
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: "Invalid type parameter. Use: users, services, categories, bookings, plans, reviews, payments, subscriptions, or all"
        }, { status: 400 })
    }

  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch data" 
    }, { status: 500 })
  }
}