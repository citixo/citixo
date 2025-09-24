import Image from "next/image"
import Link from "next/link"
import { Search, Calendar, UserCheck, CreditCard, Headphones } from "lucide-react"

export default function HowItWorksPage() {
  const steps = [
    {
      icon: Search,
      title: "Select Service",
      description: "Browse our wide range of home services and select what you need",
      details:
        "Choose from cleaning, repairs, maintenance, beauty services and more. Each service comes with detailed descriptions and transparent pricing.",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: Calendar,
      title: "Choose Time Slot",
      description: "Pick a convenient date and time that works for your schedule",
      details:
        "Select from available morning, afternoon, or evening slots. We offer flexible scheduling including weekends and holidays.",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: UserCheck,
      title: "Match with Professional",
      description: "We assign a trained and verified professional for your service",
      details:
        "All our service providers are background verified, trained, and rated by previous customers. You can view their profile and ratings.",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay securely online or choose cash on delivery",
      details:
        "Multiple payment options including UPI, cards, wallets, and cash. All transactions are secure and you get instant receipts.",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      icon: Headphones,
      title: "After-Service Support",
      description: "Rate your experience and get ongoing support",
      details:
        "Rate and review your service provider. Our customer support team is available 24/7 for any queries or issues.",
      image: "/placeholder.svg?height=300&width=400",
    },
  ]

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="section-title">How It Works</h1>
          <p className="body-text text-gray-400 max-w-3xl mx-auto">
            Getting professional home services has never been easier. Follow these simple steps to book and enjoy
            hassle-free service delivery.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12`}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#0095FF] rounded-2xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-[#0095FF]">{String(index + 1).padStart(2, "0")}</div>
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{step.title}</h2>
                  <p className="text-xl text-gray-300 mb-4">{step.description}</p>
                  <p className="text-gray-400 leading-relaxed">{step.details}</p>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1">
                <Image
                  src={step.image || "/placeholder.svg"}
                  alt={step.title}
                  width={400}
                  height={300}
                  className="w-full h-64 md:h-80 object-cover rounded-2xl"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-20 py-16 bg-[#1A2332] rounded-2xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Choose AjitMote?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We've designed our platform to make home services simple, reliable, and affordable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
            {[
              {
                title: "Verified Professionals",
                description: "All service providers undergo background verification and skill assessment",
                icon: "🛡️",
              },
              {
                title: "Transparent Pricing",
                description: "No hidden charges. See exact pricing before booking any service",
                icon: "💰",
              },
              {
                title: "Quality Guarantee",
                description: "100% satisfaction guarantee or we'll make it right at no extra cost",
                icon: "✅",
              },
              {
                title: "Flexible Scheduling",
                description: "Book services at your convenience, including weekends and holidays",
                icon: "📅",
              },
              {
                title: "Secure Payments",
                description: "Multiple secure payment options with instant receipts and refunds",
                icon: "🔒",
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock customer support for all your queries and concerns",
                icon: "🎧",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Flow Visualization */}
        <div className="mt-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Simple Booking Process</h2>
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8">
            {[
              { step: "Browse", time: "2 min" },
              { step: "Book", time: "1 min" },
              { step: "Relax", time: "Until service" },
              { step: "Enjoy", time: "Clean home!" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-20 h-20 bg-[#0095FF] rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">
                  {index + 1}
                </div>
                <h3 className="font-semibold mb-1">{item.step}</h3>
                <p className="text-gray-400 text-sm">{item.time}</p>
                {index < 3 && (
                  <div className="hidden md:block w-16 h-0.5 bg-[#0095FF] mt-4 absolute translate-x-20"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-[#0A0F1A] rounded-2xl p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust AjitMote for their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="btn-primary">
              Book Your First Service
            </Link>
            <Link href="/plans" className="btn-secondary">
              View Subscription Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
