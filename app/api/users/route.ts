import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoUsers } from "@/lib/models"
import bcrypt from 'bcryptjs'

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status') || 'Active'
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search')

    // Build query
    let query: any = { status }
    
    if (role) query.role = role
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    // Get users (exclude password and sensitive data)
    const users = await CitixoUsers.find(query)
      .select('-password -loginHistory')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    // Get total count for pagination
    const totalCount = await CitixoUsers.countDocuments(query)

    // Transform data for backward compatibility
    const transformedUsers = users.map(user => ({
      id: user.userId,
      name: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: `${user.address.street}, ${user.address.city}, ${user.address.state}`.replace(/^, |, $/g, ''),
      city: user.address.city,
      state: user.address.state,
      zipCode: user.address.zipCode,
      country: user.address.country,
      joinDate: user.createdAt.toISOString().split('T')[0],
      totalBookings: user.totalBookings,
      totalSpent: user.totalSpent,
      status: user.status,
      role: user.role,
      lastLogin: user.lastLoginAt?.toISOString().split('T')[0] || null,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      avatar: user.profileImage || "/placeholder.svg?height=40&width=40",
      preferences: user.preferences
    }))

    return NextResponse.json({
      success: true,
      data: transformedUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.email || !body.phone || !body.password) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: firstName, lastName, email, phone, password"
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await CitixoUsers.findOne({
      $or: [
        { email: body.email.toLowerCase() },
        { phone: body.phone }
      ]
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "User with this email or phone already exists"
      }, { status: 400 })
    }

    // Generate unique user ID
    const userId = `USR${Date.now().toString().slice(-6)}`

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12)

    const newUser = new CitixoUsers({
      userId,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone.trim(),
      password: hashedPassword,
      role: body.role || 'User',
      status: body.status || 'Active',
      emailVerified: body.emailVerified || false,
      phoneVerified: body.phoneVerified || false,
      profileImage: body.profileImage || null,
      address: {
        street: body.address?.street || '',
        city: body.address?.city || '',
        state: body.address?.state || '',
        zipCode: body.address?.zipCode || '',
        country: body.address?.country || 'India'
      },
      preferences: {
        notifications: body.preferences?.notifications ?? true,
        emailNotifications: body.preferences?.emailNotifications ?? true,
        smsNotifications: body.preferences?.smsNotifications ?? false,
        language: body.preferences?.language || 'en',
        currency: body.preferences?.currency || 'INR'
      }
    })

    await newUser.save()

    // Transform response to match old format (exclude sensitive data)
    const responseData = {
      id: newUser.userId,
      name: newUser.fullName,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      address: `${newUser.address.street}, ${newUser.address.city}`.replace(/^, |, $/g, ''),
      joinDate: newUser.createdAt.toISOString().split('T')[0],
      totalBookings: newUser.totalBookings,
      totalSpent: newUser.totalSpent,
      status: newUser.status,
      role: newUser.role,
      emailVerified: newUser.emailVerified,
      phoneVerified: newUser.phoneVerified,
      avatar: newUser.profileImage || "/placeholder.svg?height=40&width=40"
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "User created successfully",
    })
  } catch (error) {
    console.error("Error creating user:", error)
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: "User with this email or phone already exists"
      }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { userId, password, ...updateData } = body

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User ID is required"
      }, { status: 400 })
    }

    const user = await CitixoUsers.findOne({ userId })
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    // Handle password update separately
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update user fields
    Object.assign(user, updateData)
    await user.save()

    // Return updated user (exclude sensitive data)
    const responseData = {
      id: user.userId,
      name: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: `${user.address.street}, ${user.address.city}`.replace(/^, |, $/g, ''),
      status: user.status,
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      totalBookings: user.totalBookings,
      totalSpent: user.totalSpent
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE - Delete user (soft delete by changing status)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User ID is required"
      }, { status: 400 })
    }

    const result = await CitixoUsers.findOneAndUpdate(
      { userId },
      { status: 'Inactive' },
      { new: true }
    )

    if (!result) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 })
  }
}