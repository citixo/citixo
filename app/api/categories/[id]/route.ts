import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoServiceCategories } from "@/lib/models"

// GET - Fetch single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const category = await CitixoServiceCategories.findById(params.id)

    if (!category) {
      return NextResponse.json({
        success: false,
        error: "Category not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: category
    })

  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const category = await CitixoServiceCategories.findById(params.id)

    if (!category) {
      return NextResponse.json({
        success: false,
        error: "Category not found"
      }, { status: 404 })
    }

    // Update category
    category.name = name
    category.description = description
    category.icon = icon
    category.color = color || category.color
    category.displayOrder = displayOrder || category.displayOrder
    category.status = status || category.status

    await category.save()

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category updated successfully"
    })

  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const category = await CitixoServiceCategories.findById(params.id)

    if (!category) {
      return NextResponse.json({
        success: false,
        error: "Category not found"
      }, { status: 404 })
    }

    await CitixoServiceCategories.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}
