import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoBookings, CitixoReviews, CitixoUsers, CitixoServices, CitixoServiceCategories, CitixoHelp } from "@/lib/models"

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type') || 'all'

    let deletedData = {
      bookings: 0,
      reviews: 0,
      users: 0,
      services: 0,
      categories: 0,
      help: 0
    }

    if (dataType === 'all' || dataType === 'bookings') {
      const bookingsResult = await CitixoBookings.deleteMany({})
      deletedData.bookings = bookingsResult.deletedCount
      console.log(`Deleted ${deletedData.bookings} bookings`)
    }

    if (dataType === 'all' || dataType === 'reviews') {
      const reviewsResult = await CitixoReviews.deleteMany({})
      deletedData.reviews = reviewsResult.deletedCount
      console.log(`Deleted ${deletedData.reviews} reviews`)
    }

    if (dataType === 'all' || dataType === 'users') {
      const usersResult = await CitixoUsers.deleteMany({})
      deletedData.users = usersResult.deletedCount
      console.log(`Deleted ${deletedData.users} users`)
    }

    if (dataType === 'all' || dataType === 'services') {
      const servicesResult = await CitixoServices.deleteMany({})
      deletedData.services = servicesResult.deletedCount
      console.log(`Deleted ${deletedData.services} services`)
    }

    if (dataType === 'all' || dataType === 'categories') {
      const categoriesResult = await CitixoServiceCategories.deleteMany({})
      deletedData.categories = categoriesResult.deletedCount
      console.log(`Deleted ${deletedData.categories} categories`)
    }

    if (dataType === 'all' || dataType === 'help') {
      const helpResult = await CitixoHelp.deleteMany({})
      deletedData.help = helpResult.deletedCount
      console.log(`Deleted ${deletedData.help} help items`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${dataType} data`,
      deleted: deletedData
    })

  } catch (error) {
    console.error("Error clearing data:", error)
    return NextResponse.json({
      success: false,
      error: `Failed to clear data: ${error.message}`
    }, { status: 500 })
  }
}
