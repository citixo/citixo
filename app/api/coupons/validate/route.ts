import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import CitixoCoupons from "@/lib/models/CitixoCoupons"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { code, amount } = body
    
    if (!code) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon code is required" 
      }, { status: 400 })
    }

    // Get user from cookies for authentication
    const cookies = request.headers.get('cookie') || ''
    const cookieObj = Object.fromEntries(
      cookies.split('; ').map(c => c.split('=')).filter(([key, value]) => key && value)
    )
    
    const currentUserId = cookieObj.userId || cookieObj.email
    
    if (!currentUserId) {
      return NextResponse.json({ 
        success: false, 
        error: "User not authenticated" 
      }, { status: 401 })
    }
    
    // Find the coupon
    const coupon = await CitixoCoupons.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    })
    
    if (!coupon) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid coupon code" 
      }, { status: 404 })
    }
    
    // Check if coupon is expired
    const now = new Date()
    const startDate = new Date(coupon.startDate)
    const expiryDate = new Date(coupon.expiryDate)
    
    if (now < startDate) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon is not yet active" 
      }, { status: 400 })
    }
    
    if (now > expiryDate) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon has expired" 
      }, { status: 400 })
    }
    
    // Check if coupon has already been used by this user
    const alreadyUsed = coupon.usedBy.some(usage => usage.userId === currentUserId)
    if (alreadyUsed) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon already used by you" 
      }, { status: 400 })
    }
    
    // Calculate discount amount
    const discountAmount = (amount * coupon.discountPercentage) / 100
    const finalAmount = amount - discountAmount
    
    return NextResponse.json({ 
      success: true, 
      data: {
        couponCode: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount: Math.round(discountAmount),
        originalAmount: amount,
        finalAmount: Math.round(finalAmount),
        description: coupon.description
      }
    })
  } catch (error: any) {
    console.error("Error validating coupon:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to validate coupon" 
    }, { status: 500 })
  }
}
