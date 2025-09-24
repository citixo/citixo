import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
export async function GET(request: NextRequest) {
  try {
    // Get cookies from the request
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get("adminuser")
    const normalCookie = cookieStore.get("normaluser")
    const userTypeCookie = cookieStore.get("userType")
    const emailCookie = cookieStore.get("email")
    const nameCookie = cookieStore.get("name")
    console.log("Auth check - Cookies:", {
      adminuser: adminCookie?.value,
      normaluser: normalCookie?.value,
      userType: userTypeCookie?.value,
      email: emailCookie?.value,
      name: nameCookie?.value
    })

    if (adminCookie?.value === "true") {
      return NextResponse.json({
        success: true,
        userType: "admin",
        isAuthenticated: true,
        message: "Admin user authenticated",
        email: emailCookie?.value,
        name: nameCookie?.value
      })
    }

    if (normalCookie?.value === "true") {
      return NextResponse.json({
        success: true,
        userType: "user",
        isAuthenticated: true,
        message: "Normal user authenticated",
        email: emailCookie?.value,
        name: nameCookie?.value
      })
    }

    return NextResponse.json({
      success: false,
      userType: null,
      isAuthenticated: false, 
      message: "No authentication found",
      email: null,
      name: null
    })

  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      email: null,
      name: null
    }, { status: 500 })
  }
}

