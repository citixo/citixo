import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"
import crypto from "crypto"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({
        success: false,
        error: "Missing payment verification data"
      }, { status: 400 })
    }

    // Create signature
    const body_signature = razorpay_order_id + "|" + razorpay_payment_id
    const expected_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body_signature.toString())
      .digest("hex")

    const is_authentic = expected_signature === razorpay_signature

    if (!is_authentic) {
      return NextResponse.json({
        success: false,
        error: "Payment verification failed"
      }, { status: 400 })
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id)

    return NextResponse.json({
      success: true,
      data: {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at
      }
    })
  } catch (error: any) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to verify payment"
    }, { status: 500 })
  }
}
