import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoUsers } from "@/lib/models"

// GET - Get current user profile
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get user from cookies (this should be improved with proper session management)
    const cookies = request.headers.get('cookie') || ''
    const cookieObj = Object.fromEntries(
      cookies.split('; ').map(c => c.split('=')).filter(([key, value]) => key && value)
    )
    
    if (!cookieObj.normaluser && !cookieObj.adminuser) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated"
      }, { status: 401 })
    }

    const userType = cookieObj.userType
    const userId = cookieObj.userId

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User session not found"
      }, { status: 401 })
    }

    let user = null

    if (userType === 'admin' && userId === 'admin') {
      // Static admin user
      const userData = {
        userId: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@citixo.com',
        phone: '+91 9876543210',
        role: 'Admin',
        status: 'Active',
        address: {
          street: 'Admin Office',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        createdAt: new Date(),
        lastLoginAt: new Date(),
        totalBookings: 0,
        totalSpent: 0,
        emailVerified: true,
        phoneVerified: true,
        profileImage: null,
        preferences: {
          notifications: true,
          emailNotifications: true,
          smsNotifications: false,
          language: 'en',
          currency: 'INR'
        },
        get fullName() { return `${this.firstName} ${this.lastName}` }
      }
      user = userData
    } else {
      // Find regular user by userId
      user = await CitixoUsers.findOne({ 
        userId: userId,
        status: { $in: ["Active", "Pending"] }
      }).select('-password -loginHistory')
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    // Transform user data for profile page
    const userData = {
      id: user.userId,
      email: user.email,
      name: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address.street ? 
        `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zipCode}` :
        `${user.address.city}, ${user.address.state}`,
      city: user.address.city,
      state: user.address.state,
      zipCode: user.address.zipCode,
      country: user.address.country,
      joinDate: user.createdAt.toISOString().split('T')[0],
      loginTime: user.lastLoginAt?.toISOString() || user.createdAt.toISOString(),
      isAdmin: user.role === 'Admin',
      role: user.role,
      status: user.status,
      totalBookings: user.totalBookings || 0,
      totalSpent: user.totalSpent || 0,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      avatar: user.profileImage || "/placeholder.svg?height=100&width=100",
      preferences: user.preferences || {
        notifications: true,
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        currency: 'INR'
      }
    }

    return NextResponse.json({
      success: true,
      data: userData
    })

  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch user profile" 
    }, { status: 500 })
  }
}

// PUT - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Get user from cookies
    const cookies = request.headers.get('cookie') || ''
    const cookieObj = Object.fromEntries(
      cookies.split('; ').map(c => c.split('=')).filter(([key, value]) => key && value)
    )
    
    if (!cookieObj.normaluser && !cookieObj.adminuser) {
      return NextResponse.json({
        success: false,
        error: "Not authenticated"
      }, { status: 401 })
    }

    const userType = cookieObj.userType
    const userId = cookieObj.userId

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User session not found"
      }, { status: 401 })
    }

    if (userType === 'admin' && userId === 'admin') {
      return NextResponse.json({
        success: false,
        error: "Admin profile cannot be updated"
      }, { status: 403 })
    }

    // Find regular user by userId
    const user = await CitixoUsers.findOne({ 
      userId: userId,
      status: { $in: ["Active", "Pending"] }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'phone', 'preferences', 'profileImage']
    const updateData: any = {}

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Handle address update separately to avoid conflicts
    if (body.address && typeof body.address === 'object') {
      updateData.address = {
        street: body.address.street || '',
        city: body.address.city || '',
        state: body.address.state || '',
        zipCode: body.address.zipCode || '',
        country: body.address.country || 'India'
      }
    }

    await CitixoUsers.updateOne({ userId: user.userId }, { $set: updateData })

    // Fetch updated user
    const updatedUser = await CitixoUsers.findOne({ userId: user.userId }).select('-password -loginHistory')

    const userData = {
      id: updatedUser.userId,
      email: updatedUser.email,
      name: updatedUser.fullName,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      address: updatedUser.address.street ? 
        `${updatedUser.address.street}, ${updatedUser.address.city}, ${updatedUser.address.state} ${updatedUser.address.zipCode}` :
        `${updatedUser.address.city}, ${updatedUser.address.state}`,
      city: updatedUser.address.city,
      state: updatedUser.address.state,
      zipCode: updatedUser.address.zipCode,
      country: updatedUser.address.country,
      joinDate: updatedUser.createdAt.toISOString().split('T')[0],
      loginTime: updatedUser.lastLoginAt?.toISOString() || updatedUser.createdAt.toISOString(),
      isAdmin: updatedUser.role === 'Admin',
      role: updatedUser.role,
      status: updatedUser.status,
      totalBookings: updatedUser.totalBookings || 0,
      totalSpent: updatedUser.totalSpent || 0,
      emailVerified: updatedUser.emailVerified,
      phoneVerified: updatedUser.phoneVerified,
      avatar: updatedUser.profileImage || "/placeholder.svg?height=100&width=100",
      preferences: updatedUser.preferences || {
        notifications: true,
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        currency: 'INR'
      }
    }

    return NextResponse.json({
      success: true,
      data: userData,
      message: "Profile updated successfully"
    })

  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update profile" 
    }, { status: 500 })
  }
}
