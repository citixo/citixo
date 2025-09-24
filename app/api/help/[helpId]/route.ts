import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoHelp } from "@/lib/models"

// GET - Get specific help item and increment view count
export async function GET(
  request: NextRequest,
  { params }: { params: { helpId: string } }
) {
  try {
    await connectDB()

    const helpItem = await CitixoHelp.findOne({ 
      helpId: params.helpId, 
      isActive: true 
    })

    if (!helpItem) {
      return NextResponse.json({
        success: false,
        error: "Help item not found"
      }, { status: 404 })
    }

    // Increment view count
    await CitixoHelp.updateOne(
      { helpId: params.helpId },
      { $inc: { viewCount: 1 } }
    )

    return NextResponse.json({
      success: true,
      data: {
        id: helpItem.helpId,
        category: helpItem.category,
        question: helpItem.question,
        answer: helpItem.answer,
        tags: helpItem.tags,
        viewCount: helpItem.viewCount + 1,
        helpful: helpItem.helpful,
        notHelpful: helpItem.notHelpful
      }
    })
  } catch (error) {
    console.error("Error fetching help item:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch help item" 
    }, { status: 500 })
  }
}

// POST - Mark help item as helpful or not helpful
export async function POST(
  request: NextRequest,
  { params }: { params: { helpId: string } }
) {
  try {
    await connectDB()

    const body = await request.json()
    const { helpful } = body // true for helpful, false for not helpful

    if (typeof helpful !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: "helpful field must be boolean"
      }, { status: 400 })
    }

    const updateField = helpful ? { helpful: 1 } : { notHelpful: 1 }
    
    const result = await CitixoHelp.updateOne(
      { helpId: params.helpId, isActive: true },
      { $inc: updateField }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: "Help item not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Feedback recorded successfully"
    })
  } catch (error) {
    console.error("Error recording feedback:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to record feedback" 
    }, { status: 500 })
  }
}
