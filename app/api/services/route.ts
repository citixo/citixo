import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoServices, CitixoServiceCategories } from "@/lib/models"

// GET - Fetch all services
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status') || 'Active'
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search')

    // Build query
    let query: any = { status }
    
    if (category) {
      // Find category by name or ID
      const categoryDoc = await CitixoServiceCategories.findOne({
        $or: [
          { categoryId: category },
          { name: { $regex: category, $options: 'i' } }
        ]
      })
      if (categoryDoc) {
        query.categoryId = categoryDoc.categoryId
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    // Get services with category information
    const services = await CitixoServices.find(query)
      .sort({ bookingCount: -1, 'rating.average': -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    // Get total count for pagination
    const totalCount = await CitixoServices.countDocuments(query)

    // Get category information for transformation
    const categoryIds = [...new Set(services.map(service => service.categoryId))]
    const categories = await CitixoServiceCategories.find({ 
      categoryId: { $in: categoryIds } 
    }).select('categoryId name')
    
    const categoryMap = categories.reduce((map, cat) => {
      map[cat.categoryId] = cat.name
      return map
    }, {} as Record<string, string>)

    // Transform data to match old format for backward compatibility
    const transformedServices = services.map((service:any) => ({
      id: service.serviceId,
      name: service.name,
      description: service.description,
      category: categoryMap[service.categoryId] || 'Uncategorized',
      price: service.formattedPrice,
      rating: service.rating.average,
      reviews: service.rating.count,
      bookings: service.bookingCount,
      image: service.images ? service.images.url : "/placeholder.svg?height=200&width=300",
      images: service.images || {}, // Include full images array
      href: `/services/${service.seo?.slug || service.serviceId}`,
      status: service.status,
      features: service.features,
      createdAt: service.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedServices,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch services" }, { status: 500 })
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Support both new schema and old admin interface
    const isNewSchema = body.categoryId && body.basePrice !== undefined
    const isOldSchema = body.category && body.price !== undefined

    if (!body.name || !body.description) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: name, description"
      }, { status: 400 })
    }

    // Handle category lookup for old schema
    let categoryId = body.categoryId
    if (isOldSchema && body.category) {
      const category = await CitixoServiceCategories.findOne({
        name: { $regex: new RegExp(`^${body.category}$`, 'i') }
      })
      if (category) {
        categoryId = category.categoryId
      } else {
        return NextResponse.json({
          success: false,
          error: `Category "${body.category}" not found`
        }, { status: 400 })
      }
    }

    if (!categoryId) {
      return NextResponse.json({
        success: false,
        error: "Category is required"
      }, { status: 400 })
    }

    // Handle price - extract numeric value from old format
    let basePrice = body.basePrice
    if (isOldSchema && body.price) {
      // Extract numeric value from formats like "₹299", "Starting ₹2500"
      const priceMatch = body.price.match(/[\d,]+/)
      if (priceMatch) {
        basePrice = parseInt(priceMatch[0].replace(/,/g, ''))
      }
    }

    if (!basePrice || basePrice <= 0) {
      return NextResponse.json({
        success: false,
        error: "Valid price is required"
      }, { status: 400 })
    }

    // Handle images - support both old (images array) and new (imageData array) formats
    let serviceImages =  {} // default to empty array
    if (body.imageData && body.imageData) {
      // Keep full image objects with all properties
      serviceImages = {
        publicId: body.imageData.publicId,
        url: body.imageData.url,
        fileName: body.imageData.fileName,
        width: body.imageData.width,
        height: body.imageData.height,
        size: body.imageData.size
      }
    } else if (body.images && body.images) {
      // Handle old format - could be URLs or objects
      serviceImages = 
          {
            publicId: `legacy_${Date.now()}`,
            url: body.images,
            fileName: body.images.split('/').pop() || 'image',
            width: 800,
            height: 600,
            size: 0
          }
        
       
      }
    
    // Verify category exists
    const category = await CitixoServiceCategories.findOne({ 
      categoryId: categoryId,
      status: 'Active'
    })
    if (!category) {
      return NextResponse.json({
        success: false,
        error: "Invalid category"
      }, { status: 400 })
    }

    // Generate unique ID and slug
    const serviceId = `SRV${Date.now().toString().slice(-6)}`
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const newService = new CitixoServices({
      serviceId,
      name: body.name,
      description: body.description,
      categoryId: categoryId,
      basePrice: basePrice,
      currency: body.currency || 'INR',
      priceType: body.priceType || 'Starting',
      duration: {
        estimated: body.duration || 60,
        unit: 'minutes'
      },
      features: body.features || [],
      images: serviceImages,
      status: body.status || "Active",
      availability: body.availability || "Available",
      tags: body.tags || [],
      seo: {
        slug: `${slug}-${serviceId.toLowerCase()}`,
        metaTitle: body.metaTitle || body.name,
        metaDescription: body.metaDescription || body.description.substring(0, 160)
      }
    })

    await newService.save()

    // Transform response to match old format
    const responseData = {
      id: newService.serviceId,
      name: newService.name,
      description: newService.description,
      category: category.name,
      price: newService.formattedPrice,
      rating: newService.rating.average,
      reviews: newService.rating.count,
      bookings: newService.bookingCount,
      image: newService?.images ? newService?.images.url : "/placeholder.svg?height=200&width=300",
      images: newService.images || {},
      href: `/services/${newService.seo.slug}`,
      status: newService.status,
      features: newService.features,
      createdAt: newService.createdAt
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Service created successfully",
    })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ success: false, error: "Failed to create service" }, { status: 500 })
  }
}

// PUT - Update service
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { id, ...updateData } = body

    const service = await CitixoServices.findOne({ serviceId: id })

    if (!service) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 })
    }

    // Handle images if provided
    if (updateData.imageData && updateData.imageData) {
      // Keep full image objects with all properties
      updateData.images = {
        publicId: updateData.imageData.publicId,
        url: updateData.imageData.url,
        fileName: updateData.imageData.fileName,
        width: updateData.imageData.width,
        height: updateData.imageData.height,
        size: updateData.imageData.size
      }
      delete updateData.imageData 
    }

    // Handle category lookup if updating category name (old format)
    if (updateData.category && !updateData.categoryId) {
      const category = await CitixoServiceCategories.findOne({
        name: { $regex: new RegExp(`^${updateData.category}$`, 'i') }
      })
      if (category) {
        updateData.categoryId = category.categoryId
        delete updateData.category // Remove the old field
      }
    }

    // Handle price if updating in old format
    if (updateData.price && !updateData.basePrice) {
      const priceMatch = updateData.price.match(/[\d,]+/)
      if (priceMatch) {
        updateData.basePrice = parseInt(priceMatch[0].replace(/,/g, ''))
        delete updateData.price // Remove the old field
      }
    }

    // Update only the fields that are provided
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        service[key] = updateData[key]
      }
    })

    await service.save()

    // Get category for response
    const category = await CitixoServiceCategories.findOne({ 
      categoryId: service.categoryId 
    })

    // Transform response to match frontend expectations
    const responseData = {
      id: service.serviceId,
      name: service.name,
      description: service.description,
      category: category?.name || 'Uncategorized',
      price: service.formattedPrice,
      rating: service.rating.average,
      reviews: service.rating.count,
      bookings: service.bookingCount,
      image: service.images ? service?.images?.url : "/placeholder.svg?height=200&width=300",
      images: service.images || {},
      href: `/services/${service.seo?.slug || service.serviceId}`,
      status: service.status,
      features: service.features,
      createdAt: service.createdAt
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Service updated successfully",
    })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ success: false, error: "Failed to update service" }, { status: 500 })
  }
}

// DELETE - Delete service
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Service ID is required" }, { status: 400 })
    }

    const result = await CitixoServices.deleteOne({ serviceId: id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ success: false, error: "Failed to delete service" }, { status: 500 })
  }
}
