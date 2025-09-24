import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Clear all authentication cookies by setting them to expire immediately
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 0, // Expire immediately
      path: "/"
    }

    // Clear all possible authentication cookies
    cookieStore.set("adminuser", "", cookieOptions)
    cookieStore.set("normaluser", "", cookieOptions)
    cookieStore.set("userType", "", cookieOptions)
    cookieStore.set("email", "", cookieOptions)
    cookieStore.set("name", "", cookieOptions)
    cookieStore.set("userId", "", cookieOptions)

    return NextResponse.json({
      success: true,
      message: "Logout successful"
    })

  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 })
  }
}
