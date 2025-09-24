import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoHelp } from "@/lib/models"

// GET - Fetch help data/FAQs
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')

    // Build query
    let query: any = { isActive: true }
    
    if (category && category !== 'all') {
      query.category = category
    }

    // Get help items
    let helpQuery = CitixoHelp.find(query)

    // Add text search if provided
    if (search && search.trim()) {
      helpQuery = CitixoHelp.find({
        ...query,
        $text: { $search: search.trim() }
      }).sort({ score: { $meta: 'textScore' } })
    } else {
      helpQuery = helpQuery.sort({ priority: -1, category: 1, createdAt: -1 })
    }

    const helpItems = await helpQuery
      .limit(limit)
      .skip((page - 1) * limit)
      .lean()

    // Get unique categories for filter
    const categories = await CitixoHelp.distinct('category', { isActive: true })

    // Group help items by category
    const groupedHelp = helpItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push({
        id: item.helpId,
        question: item.question,
        answer: item.answer,
        tags: item.tags,
        viewCount: item.viewCount,
        helpful: item.helpful,
        notHelpful: item.notHelpful
      })
      return acc
    }, {} as Record<string, any[]>)

    // Format response to match the existing structure
    const formattedResponse = Object.keys(groupedHelp).map(category => ({
      category,
      questions: groupedHelp[category]
    }))

    // Get total count for pagination
    const totalCount = await CitixoHelp.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: formattedResponse,
      categories,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching help data:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch help data" 
    }, { status: 500 })
  }
}

// POST - Create new help item (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Basic validation
    if (!body.category || !body.question || !body.answer) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: category, question, answer"
      }, { status: 400 })
    }

    // Generate unique help ID
    const helpId = `HELP${Date.now()}`

    const newHelpItem = new CitixoHelp({
      helpId,
      category: body.category,
      title: body.title || body.question,
      question: body.question,
      answer: body.answer,
      tags: body.tags || [],
      priority: body.priority || 0,
      isActive: body.isActive !== undefined ? body.isActive : true
    })

    await newHelpItem.save()

    return NextResponse.json({
      success: true,
      data: {
        id: newHelpItem.helpId,
        category: newHelpItem.category,
        question: newHelpItem.question,
        answer: newHelpItem.answer,
        tags: newHelpItem.tags
      },
      message: "Help item created successfully"
    })
  } catch (error) {
    console.error("Error creating help item:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create help item" 
    }, { status: 500 })
  }
}

// PUT - Update help item (admin only)
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { helpId, ...updateData } = body

    if (!helpId) {
      return NextResponse.json({
        success: false,
        error: "Help ID is required"
      }, { status: 400 })
    }

    const helpItem = await CitixoHelp.findOne({ helpId })
    if (!helpItem) {
      return NextResponse.json({
        success: false,
        error: "Help item not found"
      }, { status: 404 })
    }

    // Update fields
    Object.assign(helpItem, updateData)
    helpItem.metadata.lastUpdated = new Date()
    helpItem.metadata.updatedBy = updateData.updatedBy || 'Admin'

    await helpItem.save()

    return NextResponse.json({
      success: true,
      data: helpItem,
      message: "Help item updated successfully"
    })
  } catch (error) {
    console.error("Error updating help item:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update help item" 
    }, { status: 500 })
  }
}
