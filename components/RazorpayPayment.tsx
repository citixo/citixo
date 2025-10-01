"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"

interface RazorpayPaymentProps {
  amount: number
  currency?: string
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayPayment({
  amount,
  currency = "INR",
  onSuccess,
  onError,
  disabled = false,
  className = "",
  children
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setIsScriptLoaded(true)
    script.onerror = () => {
      onError("Failed to load Razorpay script")
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [onError])

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      onError("Payment system is still loading. Please try again.")
      return
    }

    if (disabled || isLoading) return

    setIsLoading(true)

    try {
      // Create order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: `receipt_${Date.now()}`
        })
      })

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order")
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Citixo",
        description: "Service Booking Payment",
        order_id: orderData.data.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            })

            const verifyData = await verifyResponse.json()

            if (verifyData.success) {
              onSuccess(verifyData.data)
            } else {
              onError(verifyData.error || "Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            onError("Payment verification failed")
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        notes: {
          address: "Service Booking Payment"
        },
        theme: {
          color: "#0095FF"
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false)
          }
        }
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error: any) {
      console.error("Payment error:", error)
      onError(error.message || "Payment failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isLoading || !isScriptLoaded}
      className={`${className} ${(disabled || isLoading || !isScriptLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
