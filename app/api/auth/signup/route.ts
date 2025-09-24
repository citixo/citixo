import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoUsers } from "@/lib/models"
import bcrypt from 'bcryptjs'

interface SignupRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()
    const { firstName, lastName, email, phone, password, confirmPassword, address } = body

    // Validation
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({
        success: false,
        error: "All fields are required: firstName, lastName, email, phone, password"
      }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: "Passwords do not match"
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: "Password must be at least 6 characters long"
      }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: "Invalid email format"
      }, { status: 400 })
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await CitixoUsers.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: phone }
      ]
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "User with this email or phone already exists"
      }, { status: 400 })
    }

    // Generate unique user ID
    const userId = `USR${Date.now()}`

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user using CitixoUsers model
    const newUser = new CitixoUsers({
      userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password: hashedPassword,
      role: 'User',
      status: 'Active',
      emailVerified: false,
      phoneVerified: false,
      address: {
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        country: address?.country || 'India'
      },
      preferences: {
        notifications: true,
        emailNotifications: true,
        smsNotifications: false,
        language: 'en',
        currency: 'INR'
      }
    })

    await newUser.save()

    // Create response (exclude sensitive data)
    const responseData = {
      id: newUser.userId,
      name: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "User registered successfully. You can now log in.",
    }, { status: 201 })

  } catch (error: any) {
    console.error("Registration error:", error)
    
    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        error: "User with this email or phone already exists"
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      error: "Registration failed. Please try again."
    }, { status: 500 })
  }
} 