import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import CitixoData from "@/lib/models/CitixoData"

// GET - Fetch cart items (this could be user-specific in a real app)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "guest"

    await connectDB()

    // In a real app, you'd fetch user-specific cart items
    // For now, we'll return a sample response
    return NextResponse.json({
      success: true,
      data: [],
      message: "Cart fetched successfully"
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 })
  }
}

// POST - Process cart and create bookings
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { cartItems, customerInfo, orderType = "booking" } = body

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 400 })
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      return NextResponse.json({ success: false, error: "Customer information is required" }, { status: 400 })
    }

    const bookings = []
    let totalAmount = 0

    // Create bookings for each cart item
    for (const item of cartItems) {
      const bookingId = `BK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`
      
      // Extract price number from string like "Starting ₹499"
      const priceMatch = item.price.match(/₹(\d+)/)
      const itemPrice = priceMatch ? parseInt(priceMatch[1]) : 0
      const itemTotal = itemPrice * item.quantity

      const bookingData = {
        id: bookingId,
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
          address: customerInfo.address || "",
        },
        service: item.name,
        date: customerInfo.preferredDate || new Date().toISOString().split('T')[0],
        time: customerInfo.preferredTime || "10:00 AM",
        amount: itemTotal,
        quantity: item.quantity,
        status: "Pending",
        professional: "Unassigned",
        notes: customerInfo.notes || `${item.quantity}x ${item.name}`,
        createdAt: new Date().toISOString().split('T')[0],
      }

      const newBooking = new CitixoData({
        type: "booking",
        data: bookingData,
      })

      await newBooking.save()
      bookings.push(bookingData)
      totalAmount += itemTotal
    }

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        totalAmount,
        orderType,
        orderId: `ORD${Date.now()}`
      },
      message: `${bookings.length} booking(s) created successfully`
    })
  } catch (error) {
    console.error("Error processing cart:", error)
    return NextResponse.json({ success: false, error: "Failed to process cart" }, { status: 500 })
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, quantity, action } = body

    // This is a client-side operation in our current setup
    // In a real app, you'd update the cart in the database
    
    return NextResponse.json({
      success: true,
      message: "Cart updated successfully"
    })
  } catch (error) {
    console.error("Error updating cart:", error)
    return NextResponse.json({ success: false, error: "Failed to update cart" }, { status: 500 })
  }
}

// DELETE - Clear cart or remove item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const userId = searchParams.get("userId") || "guest"

    // This is a client-side operation in our current setup
    // In a real app, you'd delete items from the database cart

    return NextResponse.json({
      success: true,
      message: itemId ? "Item removed from cart" : "Cart cleared successfully"
    })
  } catch (error) {
    console.error("Error clearing cart:", error)
    return NextResponse.json({ success: false, error: "Failed to clear cart" }, { status: 500 })
  }
} 