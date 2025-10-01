import { NextRequest, NextResponse } from "next/server"
// import connectToDatabase from "@/lib/mongodb"
import CitixoCoupons from "@/lib/models/CitixoCoupons"
import connectDB from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (code) {
      // Get specific coupon by code
      const coupon = await CitixoCoupons.findOne({ code: code.toUpperCase() })
      
      if (!coupon) {
        return NextResponse.json({ 
          success: false, 
          error: "Coupon not found" 
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: true, 
        data: coupon 
      })
    }
    
    // Get all coupons
    const coupons = await CitixoCoupons.find({})
      .sort({ createdAt: -1 })
    
    return NextResponse.json({ 
      success: true, 
      data: coupons 
    })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch coupons" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { code, discountPercentage, startDate, expiryDate, description } = body
    
    // Validate required fields
    if (!code || !discountPercentage || !startDate || !expiryDate) {
      return NextResponse.json({ 
        success: false, 
        error: "Code, discount percentage, start date, and expiry date are required" 
      }, { status: 400 })
    }
    
    // Validate code format (6 alphanumeric characters)
    const upperCode = code.toUpperCase()
    if (!/^[A-Z0-9]{6}$/.test(upperCode)) {
      return NextResponse.json({ 
        success: false, 
        error: "Code must be exactly 6 alphanumeric characters (e.g., DAMN22)" 
      }, { status: 400 })
    }
    
    // Validate discount percentage
    if (isNaN(discountPercentage) || discountPercentage < 1 || discountPercentage > 100) {
      return NextResponse.json({ 
        success: false, 
        error: "Discount percentage must be a number between 1 and 100" 
      }, { status: 400 })
    }
    
    // Validate start date - handle datetime-local format properly
    let start: Date
    if (startDate.includes('T') && !startDate.includes('Z')) {
      // datetime-local format, treat as local time
      start = new Date(startDate + ':00') // Add seconds if missing
    } else {
      start = new Date(startDate)
    }
    if (isNaN(start.getTime())) {
      return NextResponse.json({ 
        success: false, 
        error: "Start date must be a valid date" 
      }, { status: 400 })
    }
    
    // Validate expiry date - handle datetime-local format properly
    let expiry: Date
    if (expiryDate.includes('T') && !expiryDate.includes('Z')) {
      // datetime-local format, treat as local time
      expiry = new Date(expiryDate + ':00') // Add seconds if missing
    } else {
      expiry = new Date(expiryDate)
    }
    if (isNaN(expiry.getTime())) {
      return NextResponse.json({ 
        success: false, 
        error: "Expiry date must be a valid date" 
      }, { status: 400 })
    }
    
    // Validate date range
    if (start >= expiry) {
      return NextResponse.json({ 
        success: false, 
        error: "Start date must be before expiry date" 
      }, { status: 400 })
    }
    
    // Validate start date is not too far in the past (more than 1 year ago)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    if (start < oneYearAgo) {
      return NextResponse.json({ 
        success: false, 
        error: "Start date cannot be more than 1 year in the past" 
      }, { status: 400 })
    }
    
    // Validate expiry date is not too far in the future (more than 5 years)
    const fiveYearsFromNow = new Date()
    fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5)
    if (expiry > fiveYearsFromNow) {
      return NextResponse.json({ 
        success: false, 
        error: "Expiry date cannot be more than 5 years in the future" 
      }, { status: 400 })
    }
    
    // Check if coupon code already exists
    const existingCoupon = await CitixoCoupons.findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon code already exists" 
      }, { status: 400 })
    }
    
    // Create new coupon
    const couponData = {
      code: upperCode,
      discountPercentage,
      startDate: start,
      expiryDate: expiry,
      description
    }
    
    const coupon = new CitixoCoupons(couponData)
    
    await coupon.save()
    
    return NextResponse.json({ 
      success: true, 
      data: coupon,
      message: "Coupon created successfully" 
    })
  } catch (error: any) {
    console.error("Error creating coupon:", error)
    
    // If it's a MongoDB validation error, return more specific details
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message).join(', ')
      return NextResponse.json({ 
        success: false, 
        error: "Validation failed",
        details: validationErrors
      }, { status: 400 })
    }
    
    // If it's a duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon code already exists" 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create coupon",
      details: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { id, code, discountPercentage, startDate, expiryDate, description, isActive } = body
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon ID is required" 
      }, { status: 400 })
    }
    
    // Validate code format if provided
    if (code && !/^[A-Z0-9]{6}$/.test(code.toUpperCase())) {
      return NextResponse.json({ 
        success: false, 
        error: "Code must be exactly 6 alphanumeric characters (e.g., DAMN22)" 
      }, { status: 400 })
    }
    
    // Validate discount percentage if provided
    if (discountPercentage !== undefined) {
      if (isNaN(discountPercentage) || discountPercentage < 1 || discountPercentage > 100) {
        return NextResponse.json({ 
          success: false, 
          error: "Discount percentage must be a number between 1 and 100" 
        }, { status: 400 })
      }
    }
    
    // Validate start date if provided
    let start: Date | null = null
    if (startDate) {
      start = new Date(startDate)
      if (isNaN(start.getTime())) {
        return NextResponse.json({ 
          success: false, 
          error: "Start date must be a valid date" 
        }, { status: 400 })
      }
      
      // Validate start date is not too far in the past
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      if (start < oneYearAgo) {
        return NextResponse.json({ 
          success: false, 
          error: "Start date cannot be more than 1 year in the past" 
        }, { status: 400 })
      }
    }
    
    // Validate expiry date if provided
    let expiry: Date | null = null
    if (expiryDate) {
      expiry = new Date(expiryDate)
      if (isNaN(expiry.getTime())) {
        return NextResponse.json({ 
          success: false, 
          error: "Expiry date must be a valid date" 
        }, { status: 400 })
      }
      
      // Validate expiry date is not too far in the future
      const fiveYearsFromNow = new Date()
      fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5)
      if (expiry > fiveYearsFromNow) {
        return NextResponse.json({ 
          success: false, 
          error: "Expiry date cannot be more than 5 years in the future" 
        }, { status: 400 })
      }
    }
    
    // Validate date range if both dates are provided
    if (start && expiry && start >= expiry) {
      return NextResponse.json({ 
        success: false, 
        error: "Start date must be before expiry date" 
      }, { status: 400 })
    }
    
    // Check if coupon code already exists (excluding current coupon)
    if (code) {
      const existingCoupon = await CitixoCoupons.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: id }
      })
      if (existingCoupon) {
        return NextResponse.json({ 
          success: false, 
          error: "Coupon code already exists" 
        }, { status: 400 })
      }
    }
    
    // Update coupon
    const updateData: any = {}
    if (code) updateData.code = code.toUpperCase()
    if (discountPercentage !== undefined) updateData.discountPercentage = discountPercentage
    if (startDate) updateData.startDate = start
    if (expiryDate) updateData.expiryDate = expiry
    if (description !== undefined) updateData.description = description
    if (isActive !== undefined) updateData.isActive = isActive
    
    const coupon = await CitixoCoupons.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    
    if (!coupon) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon not found" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: coupon,
      message: "Coupon updated successfully" 
    })
  } catch (error) {
    console.error("Error updating coupon:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update coupon" 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon ID is required" 
      }, { status: 400 })
    }
    
    const coupon = await CitixoCoupons.findByIdAndDelete(id)
    
    if (!coupon) {
      return NextResponse.json({ 
        success: false, 
        error: "Coupon not found" 
      }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Coupon deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting coupon:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete coupon" 
    }, { status: 500 })
  }
}
