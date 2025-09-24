import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoUsers } from "@/lib/models"
import bcrypt from 'bcryptjs'
import { cookies } from "next/headers";
interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body: LoginRequest = await request.json()
    const { email, password, remember } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Email and password are required"
      }, { status: 400 })
    }

    await connectDB()

    // Check for admin credentials first (static admin)
    if (email === "admin@citixo.com" && password === "Password@123") {
      const response = NextResponse.json({
        success: true,
        message: "Admin login successful",
        redirectTo: "/admin",
        userType: "admin",
        user: {
          id: "admin",
          email: "admin@citixo.com",
          name: "Admin User",
          role: "Admin"
        }
      })

      cookieStore.set("email", "admin@citixo.com", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
        path: "/"
      })

      cookieStore.set("name", "Admin User", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
        path: "/"
      })

      // Set admin cookies
      cookieStore.set("adminuser", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
        path: "/"
      })

      cookieStore.set("userType", "admin", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
        path: "/"
      })

      cookieStore.set("userId", "admin", {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
        path: "/"
      })

      return response
    }

    // Check for regular user in database
    const user = await CitixoUsers.findOne({ 
      email: email.toLowerCase(),
      status: { $in: ["Active", "Pending"] }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Invalid email or password"
      }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: "Invalid email or password"
      }, { status: 401 })
    }

    // Update last login
    user.lastLoginAt = new Date()
    await user.save()

    // Create response for regular user
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      redirectTo: "/",
      userType: "user",
      user: {
        id: user.userId,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    })
    cookieStore.set("name", user.fullName, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: "/"
    })

    cookieStore.set("email", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: "/"
    })
    // Set user cookies
    cookieStore.set("normaluser", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: "/"
    })

    cookieStore.set("userType", "user", {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: "/"
    })

    cookieStore.set("userId", user.userId, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60,
      path: "/"
    })

    return response

  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
} 