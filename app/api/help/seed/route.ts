import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoHelp } from "@/lib/models"

const helpData = [
  // Booking & Scheduling
  {
    category: "Booking & Scheduling",
    question: "How do I book a service?",
    answer: "You can book a service by browsing our services page, selecting the service you need, choosing your preferred date and time, and completing the payment. You'll receive a confirmation with all the details.",
    tags: ["booking", "schedule", "service", "payment"],
    priority: 10
  },
  {
    category: "Booking & Scheduling",
    question: "Can I reschedule my booking?",
    answer: "Yes, you can reschedule your booking up to 2 hours before the scheduled time without any charges. You can do this through our app, website, or by calling our support team.",
    tags: ["reschedule", "booking", "cancel", "support"],
    priority: 9
  },
  {
    category: "Booking & Scheduling",
    question: "What if I need to cancel my booking?",
    answer: "You can cancel your booking up to 2 hours before the scheduled time for a full refund. Cancellations made within 2 hours may incur a small cancellation fee.",
    tags: ["cancel", "refund", "booking", "fee"],
    priority: 8
  },
  {
    category: "Booking & Scheduling",
    question: "How far in advance can I book a service?",
    answer: "You can book services up to 30 days in advance. For urgent requirements, we also offer same-day booking based on availability.",
    tags: ["advance", "booking", "same-day", "availability"],
    priority: 7
  },

  // Payments & Pricing
  {
    category: "Payments & Pricing",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets. Payment is processed securely through our encrypted payment gateway.",
    tags: ["payment", "credit card", "UPI", "digital wallet"],
    priority: 10
  },
  {
    category: "Payments & Pricing",
    question: "Are there any hidden charges?",
    answer: "No, we believe in transparent pricing. All charges including service fees, taxes, and any additional costs are clearly mentioned before you make the payment.",
    tags: ["pricing", "transparent", "hidden charges", "fees"],
    priority: 9
  },
  {
    category: "Payments & Pricing",
    question: "Do you offer discounts for regular customers?",
    answer: "Yes! We have subscription plans and loyalty programs that offer significant discounts for regular customers. Check our Plans section for more details.",
    tags: ["discount", "loyalty", "subscription", "regular customers"],
    priority: 8
  },
  {
    category: "Payments & Pricing",
    question: "Can I get a refund if I'm not satisfied?",
    answer: "We offer a satisfaction guarantee. If you're not happy with our service, contact us within 24 hours and we'll work to resolve the issue or provide a refund.",
    tags: ["refund", "satisfaction", "guarantee", "support"],
    priority: 7
  },

  // Service Quality & Professionals
  {
    category: "Service Quality & Professionals",
    question: "Are your professionals verified?",
    answer: "Yes, all our professionals undergo thorough background verification, skill assessment, and training before joining our platform. We ensure they meet our quality standards.",
    tags: ["verification", "background check", "quality", "professionals"],
    priority: 10
  },
  {
    category: "Service Quality & Professionals",
    question: "What if I'm not satisfied with the service quality?",
    answer: "We strive for excellence in every service. If you're not satisfied, please contact us immediately. We'll either send someone to fix the issue or provide a refund.",
    tags: ["quality", "satisfaction", "complaint", "resolution"],
    priority: 9
  },
  {
    category: "Service Quality & Professionals",
    question: "Can I request a specific professional?",
    answer: "While we can't guarantee specific professionals due to availability, you can mention preferences in the booking notes. We'll try our best to accommodate your request.",
    tags: ["specific professional", "request", "preferences", "booking"],
    priority: 6
  },
  {
    category: "Service Quality & Professionals",
    question: "Do you provide a warranty on services?",
    answer: "Yes, we provide a warranty on most of our services. The warranty period varies by service type and is mentioned in the service details. Contact us if you face any issues during the warranty period.",
    tags: ["warranty", "guarantee", "service protection", "support"],
    priority: 8
  },

  // Account & Profile
  {
    category: "Account & Profile",
    question: "How do I create an account?",
    answer: "You can create an account by clicking the 'Sign Up' button and providing your basic details like name, email, and phone number. You can also sign up using Google or Facebook.",
    tags: ["account", "signup", "registration", "social login"],
    priority: 8
  },
  {
    category: "Account & Profile",
    question: "I forgot my password. How do I reset it?",
    answer: "Click on 'Forgot Password' on the login page and enter your email address. We'll send you a password reset link to your registered email address.",
    tags: ["password", "reset", "forgot", "email"],
    priority: 7
  },
  {
    category: "Account & Profile",
    question: "How do I update my profile information?",
    answer: "Go to your Profile section after logging in. You can update your personal information, address, and preferences from there.",
    tags: ["profile", "update", "information", "settings"],
    priority: 6
  },
  {
    category: "Account & Profile",
    question: "Can I delete my account?",
    answer: "Yes, you can delete your account by going to Settings > Account > Delete Account. Please note that this action is irreversible and all your data will be permanently removed.",
    tags: ["delete account", "permanent", "data removal", "settings"],
    priority: 5
  },

  // General Support
  {
    category: "General Support",
    question: "How can I contact customer support?",
    answer: "You can reach our customer support through live chat, email at support@citixo.com, or call us at 1800-123-4567. We're available 24/7 to assist you.",
    tags: ["support", "contact", "live chat", "email", "phone"],
    priority: 10
  },
  {
    category: "General Support",
    question: "What are your service hours?",
    answer: "Our services are available from 6:00 AM to 10:00 PM, seven days a week. Emergency services are available 24/7 for urgent requirements.",
    tags: ["service hours", "availability", "emergency", "24/7"],
    priority: 8
  },
  {
    category: "General Support",
    question: "Do you serve my area?",
    answer: "We currently serve major cities and their surrounding areas. Enter your pincode on our website to check if we provide services in your location.",
    tags: ["service area", "location", "pincode", "coverage"],
    priority: 7
  },
  {
    category: "General Support",
    question: "How do I track my service request?",
    answer: "You can track your service request by logging into your account and going to 'My Bookings'. You'll see real-time updates about your service status and professional assignment.",
    tags: ["track", "service request", "booking status", "updates"],
    priority: 9
  }
]

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Clear existing help data
    await CitixoHelp.deleteMany({})

    // Insert new help data
    const helpItems = helpData.map((item, index) => ({
      helpId: `HELP${(Date.now() + index).toString()}`,
      category: item.category,
      title: item.question,
      question: item.question,
      answer: item.answer,
      tags: item.tags,
      priority: item.priority,
      isActive: true,
      viewCount: Math.floor(Math.random() * 100), // Random view count for demo
      helpful: Math.floor(Math.random() * 50),
      notHelpful: Math.floor(Math.random() * 10)
    }))

    await CitixoHelp.insertMany(helpItems)

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${helpItems.length} help items`,
      data: {
        totalItems: helpItems.length,
        categories: [...new Set(helpData.map(item => item.category))]
      }
    })
  } catch (error) {
    console.error("Error seeding help data:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to seed help data" 
    }, { status: 500 })
  }
}
