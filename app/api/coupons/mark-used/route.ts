import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import CitixoCoupons from "@/lib/models/CitixoCoupons"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { code, userId, bookingId } = body
    
    if (!code || !userId || !bookingId) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon code, user ID, and booking ID are required" 
      }, { status: 400 })
    }
    
    // Find the coupon
    const coupon = await CitixoCoupons.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    })
    
    if (!coupon) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon not found" 
      }, { status: 404 })
    }
    
    // Check if coupon has already been used by this user
    const alreadyUsed = coupon.usedBy.some(usage => usage.userId === userId)
    if (alreadyUsed) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon already used by this user" 
      }, { status: 400 })
    }
    
    // Mark coupon as used
    await CitixoCoupons.findOneAndUpdate(
      { code: code.toUpperCase() },
      {
        $push: {
          usedBy: {
            userId: userId,
            bookingId: bookingId,
            usedAt: new Date()
          }
        },
        $inc: { usageCount: 1 }
      }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: "Coupon marked as used successfully" 
    })
  } catch (error: any) {
    console.error("Error marking coupon as used:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to mark coupon as used" 
    }, { status: 500 })
  }
}
