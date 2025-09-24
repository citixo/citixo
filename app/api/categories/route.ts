import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoServiceCategories } from "@/lib/models"

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query: any = {}
    
    if (status && status !== 'All') {
      query.status = status
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { categoryId: { $regex: search, $options: 'i' } }
      ]
    }

    const categories = await CitixoServiceCategories.find(query).sort({ displayOrder: 1, createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    })

  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { name, description, icon, color, displayOrder, status } = body

    // Validation
    if (!name || !description || !icon) {
      return NextResponse.json({
        success: false,
        error: "Name, description, and icon are required"
      }, { status: 400 })
    }

    // Generate category ID
    const lastCategory = await CitixoServiceCategories.findOne().sort({ categoryId: -1 })
    const lastId = lastCategory?.categoryId ? parseInt(lastCategory.categoryId.replace('CAT', '')) : 0
    const categoryId = `CAT${String(lastId + 1).padStart(3, '0')}`

    const category = new CitixoServiceCategories({
      categoryId,
      name,
      description,
      icon,
      color: color || "#0095FF",
      displayOrder: displayOrder || 1,
      status: status || "Active"
    })

    await category.save()

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category created successfully"
    })

  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}