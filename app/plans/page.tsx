"use client"

import Link from "next/link"
import { Check, Star } from "lucide-react"
import { useState, useEffect } from "react"

interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  status: string
  subscribers: number
  popular: boolean
  color?: string
  textColor?: string
  createdAt: string
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans')
        const data = await response.json()
        
        if (data.success) {
          // Filter only active plans and sort by price
          const activePlans = data.data
            .filter((plan: Plan) => plan.status === "Active")
            .sort((a: Plan, b: Plan) => a.price - b.price)
          
          setPlans(activePlans)
        } else {
          setError("Failed to fetch plans")
        }
      } catch (err) {
        setError("Error loading plans")
        console.error("Error fetching plans:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const subscribeToPlan = (plan: Plan) => {
    // Add plan to cart or redirect to subscription flow
    const subscriptionData = {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      period: plan.period,
      description: plan.description,
      features: plan.features,
      type: 'subscription'
    }
    
    // Store subscription choice in localStorage
    localStorage.setItem('selectedPlan', JSON.stringify(subscriptionData))
    
    // Show success message or redirect to payment
    alert(`You've selected the ${plan.name} plan! Redirecting to subscription setup...`)
    
    // You can redirect to a subscription setup page here
    // window.location.href = '/subscribe'
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0095FF] mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading subscription plans...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title">Subscription Plans</h1>
          <p className="body-text text-gray-400 max-w-3xl mx-auto">
            Save more with our subscription plans. Get priority booking, exclusive discounts, and peace of mind with
            regular home maintenance.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div key={index} className={`plan-card relative ${plan.popular ? "border-[#0095FF] scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#0095FF] text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className={`w-20 h-20 ${plan.color || 'bg-gradient-to-br from-blue-100 to-blue-200'} rounded-2xl mb-6 flex items-center justify-center`}>
                <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center`}>
                  <div className={`w-6 h-6 ${plan.color || 'bg-gradient-to-br from-blue-100 to-blue-200'} rounded-lg`}></div>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6">{plan.description}</p>

              <div className="mb-8">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-gray-400 ml-1">/{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.subscribers} subscribers</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => subscribeToPlan(plan)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "bg-[#0095FF] hover:bg-[#0085E6] text-white"
                    : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-white border border-gray-400 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Subscription?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0095FF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-[#0095FF]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Priority Booking</h3>
              <p className="text-gray-400">
                Get priority slots and faster service booking with guaranteed availability.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Exclusive Discounts</h3>
              <p className="text-gray-400">
                Save up to 20% on all services and get free quarterly maintenance checks.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
              <p className="text-gray-400">
                Round-the-clock customer support with dedicated account management.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white border border-gray-400 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-400">
                Yes, you can cancel your subscription at any time. Your current plan will remain active until the end of the billing cycle.
              </p>
            </div>
            <div className="bg-white border border-gray-400 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">What happens if I don't use all my monthly services?</h3>
              <p className="text-gray-400">
                Unused services from your monthly allocation can be carried forward to the next month (up to 2 months).
              </p>
            </div>
            <div className="bg-white border border-gray-400 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-400">
                Yes, you can change your plan at any time. Changes will take effect from your next billing cycle.
              </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  )
}
