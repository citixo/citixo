"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Star, Shield, Clock, CheckCircle, Users, ArrowLeft, ArrowRight, MessageSquare } from "lucide-react"
import Cookies from "js-cookie";
import { toast } from "react-toastify";

interface Service {
  id: string
  name: string
  description: string
  category: string
  price: string
  rating: number
  reviews?: number
  image: string
  status: string
  bookings: number
  createdAt: string
  features?: string[]
  includedServices?: string[]
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  customerName: string
  customerInitials: string
  createdAt: string
  isVerified: boolean
  helpfulVotes: {
    up: number
    down: number
  }
}

interface ReviewsData {
  reviews: Review[]
  ratingSummary: {
    totalReviews: number
    averageRating: number
    distribution: { [key: number]: number }
  } | null
}

interface ReviewForm {
  rating: number
  title: string
  comment: string
}

interface Settings {
  companyName: string
  companyEmail: string
  supportPhone: string
  companyAddress: string
  website: string
}

export default function DynamicServicePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string[]
  
  
  const [service, setService] = useState<Service | null>(null)
  const [reviewsData, setReviewsData] = useState<ReviewsData>({ reviews: [], ratingSummary: null })
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 5,
    title: "",
    comment: ""
  })
  const [settings, setSettings] = useState<Settings | null>(null)



   const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (!data.email) {
          toast.error("Please login to book a service");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        toast.error("Something went wrong. Please try again.");
      }
    };

  // Fetch service details based on slug
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        setError("")
        
        // Convert slug array to service identifier
        const serviceSlug = slug.join('/')
        
        // Fetch all services and find the matching one
        const response = await fetch('/api/services')
        const data = await response.json()
        
        if (data.success && data.data) {
          // Find service by matching slug, ID, or name
          const foundService = data.data.find((s: Service) => {
            const serviceHref = s.id
            const slugPath = serviceSlug
            const serviceName = s.name
            
            return (
              s.id === serviceSlug ||
              serviceHref === slugPath ||
              serviceName === slugPath ||
              slugPath.includes(s.id?.toLowerCase() || '') ||
              slugPath.includes(serviceHref || '') ||
              slugPath.includes(serviceName)
            )
          })
          
          if (foundService && foundService.status === 'Active') {
            setService(foundService)
          } else {
            setError("Service not found or is not available")
          }
        } else {
          setError("Failed to load service details")
        }
      } catch (error) {
        console.error('Error fetching service:', error)
        setError("Network error. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (slug && slug.length > 0) {
      fetchService()
    } else {
      setError("Invalid service URL")
      setLoading(false)
    }
  }, [slug])

  // Fetch reviews for the service
  useEffect(() => {
    const fetchReviews = async () => {
      if (!service?.id) return

      try {
        setReviewsLoading(true)
        const response = await fetch(`/api/reviews?serviceId=${service.id}&limit=6`)
        const result = await response.json()

        if (result.success) {
          setReviewsData(result.data)
        } else {
          console.error("Failed to load reviews:", result.error)
        }
      } catch (err) {
        console.error("Error fetching reviews:", err)
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [service?.id])

  // Fetch settings data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/general')
        const result = await response.json()
        
        if (result.success) {
          setSettings(result.data)
        }
      } catch (err) {
        console.error("Error fetching settings:", err)
      }
    }

    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0095FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900">Loading service details...</p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 text-red-400 mx-auto mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-black mb-2">Service Not Found</h1>
          <p className="text-gray-900 mb-6">{error || "The requested service could not be found."}</p>
          <Link
            href="/services"
            className="inline-flex items-center space-x-2 bg-[#0095FF] hover:bg-[#0080E6] text-white px-6 py-3 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Services</span>
          </Link>
        </div>
      </div>
    )
  }

  const defaultFeatures = [
    "Professional and trained staff",
    "All tools and equipment provided",
    "Quality guarantee",
    "Insured service",
    "On-time arrival",
    "Clean-up after service"
  ]

  // Submit review function
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service || !Cookies.get("userType") ) {
      toast.error("Please log in to submit a review")
      return
    }

    if (reviewForm.comment.trim().length < 10) {
      toast.error("Please write at least 10 characters for your review")
      return
    }

    setIsSubmittingReview(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          rating: reviewForm.rating,
          title: reviewForm.title.trim() || undefined,
          comment: reviewForm.comment.trim()
        }),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        // Reset form and hide it
        setReviewForm({ rating: 5, title: "", comment: "" })
        setShowReviewForm(false)
        
        // Refresh reviews
        const reviewsResponse = await fetch(`/api/reviews?serviceId=${service.id}&limit=6`)
        const reviewsResult = await reviewsResponse.json()
        if (reviewsResult.success) {
          setReviewsData(reviewsResult.data)
        }
        
        toast.success("Thank you for your review! It will be visible after approval.")
      } else {
        toast.error(result.error || "Failed to submit review")
      }
    } catch (err) {
      console.error("Error submitting review:", err)
      toast.error("Failed to submit review")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return "1 week ago"
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-slate-100 shadow-lg shadow-white py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-900">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-black">
              Services
            </Link>
            <span>/</span>
            <span className="text-black">{service.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div className="mb-8">
              <Image
                src={service.image || "/placeholder.svg?height=400&width=600"}
                alt={service.name}
                width={600}
                height={400}
                className="w-full h-64 md:h-80 object-cover rounded-xl mb-6"
              />

              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-black">{service.name}</h1>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-black">{service.rating}</span>
                  </div>
                  <span className="text-gray-900">•</span>
                  <span className="text-gray-900">{service.reviews || service.bookings}+ reviews</span>
                </div>
              </div>

              <p className="text-gray-900 text-lg leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Key Benefits */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-6">Why Choose Our Service?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Shield,
                    title: "100% Safe & Insured",
                    description: "All our professionals are background verified and insured",
                  },
                  {
                    icon: Clock,
                    title: "On-Time Guarantee", 
                    description: "We guarantee to arrive on time or we'll compensate you",
                  },
                  {
                    icon: CheckCircle,
                    title: "Quality Assured",
                    description: "30-day service guarantee - we'll re-service if you're not satisfied",
                  },
                  {
                    icon: Users,
                    title: "Trained Professionals",
                    description: "Our team undergoes rigorous training and regular skill updates",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#0095FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-[#0095FF]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-black">{benefit.title}</h3>
                      <p className="text-gray-900 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(service?.includedServices || []).map((item:string, index:number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Customer Reviews</h2>
                {reviewsData.ratingSummary && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-black font-semibold">
                        {reviewsData.ratingSummary.averageRating}
                      </span>
                    </div>
                    <span className="text-gray-900">
                      ({reviewsData.ratingSummary.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-50 rounded-lg p-6 animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviewsData.reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviewsData.reviews.map((review) => (
                    <div key={review.id} className="bg-slate-100 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-[#0095FF] rounded-full flex items-center justify-center text-black font-semibold text-sm">
                            {review.customerInitials}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-black">{review.customerName}</h4>
                              {review.isVerified && (
                                <Shield className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                            <div className="flex items-center space-x-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-900 text-sm">{formatDate(review.createdAt)}</span>
                          {review.helpfulVotes.up > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {review.helpfulVotes.up} found helpful
                            </div>
                          )}
                        </div>
                      </div>
                      {review.title && (
                        <h5 className="font-medium text-black mb-2">{review.title}</h5>
                      )}
                      <p className="text-gray-900">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-100 rounded-lg p-8 text-center">
                  <Star className="w-12 h-12 text-gray-900 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-black mb-2">No Reviews Yet</h3>
                  <p className="text-gray-900 mb-4">Be the first to share your experience with this service!</p>
                  <Link
                    href={`/book/${service.id}`}
                    className="inline-flex items-center space-x-2 bg-[#0095FF] hover:bg-[#0080E6] text-black px-4 py-2 rounded-lg transition-colors"
                  >
                    <span>Book & Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Write Review Section */}
              <div className="mt-8 bg-slate-100 rounded-lg p-6 border border-[#2D3748]">
                <h3 className="text-xl font-bold text-black mb-4">Share Your Experience</h3>
                
                {!showReviewForm ? (
                  <div className="text-center">
                    <p className="text-gray-900 mb-4">
                      Have you used this service? Share your experience to help others make informed decisions.
                    </p>
                    {Cookies.get("userType") ? (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span>Write a Review</span>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-gray-400">Please log in to write a review</p>
                        <Link
                          href="/login"
                          className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center space-x-2"
                        >
                          <span>Login to Review</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    {/* Rating Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Rating *
                      </label>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                            className="focus:outline-none transition-colors"
                          >
                            <Star
                              className={`w-8 h-8 ${
                                star <= reviewForm.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-600 hover:text-gray-400"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-3 text-black font-medium">
                          {reviewForm.rating} / 5
                        </span>
                      </div>
                    </div>

                    {/* Title (Optional) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Review Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Brief summary of your experience"
                        maxLength={100}
                        className="w-full bg-slate-50 border border-[#4A5568] rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:border-[#0095FF] focus:outline-none"
                      />
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Your Review *
                      </label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                        placeholder="Share your experience with this service..."
                        maxLength={1000}
                        className="w-full bg-slate-50 border border-[#4A5568] rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:border-[#0095FF] focus:outline-none resize-none"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {reviewForm.comment.length}/1000 characters (minimum 10)
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={isSubmittingReview || reviewForm.comment.trim().length < 10}
                        className="bg-[#0095FF] hover:bg-[#0080E6] disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        {isSubmittingReview ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4" />
                            <span>Submit Review</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-black px-6 py-3 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 rounded-xl p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold text-[#0095FF] mb-2">{service.price}</div>
                <div className="text-gray-900">Starting price</div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-900">Service Category</label>
                  <div className="w-full bg-slate-100 border border-[#2D3748] rounded-lg px-3 py-2 text-gray-900">
                    {service.category}
                  </div>
                </div>

              

                
              </div>

              <Link
                href={`/book/${service.id}`}
                className="w-full bg-[#0095FF] hover:bg-[#0080E6] text-black py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="text-center text-sm text-gray-900 mt-4">
                <p>Free cancellation up to 2 hours before service</p>
              </div>

              <div className="mt-6 pt-6 border-t border-[#2D3748]">
                <h3 className="font-semibold mb-3 text-black">Need Help?</h3>
                <div className="space-y-2 text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>📞</span>
                    <span>Call: {settings?.supportPhone || '1800-123-4567'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>💬</span>
                    <a
                  href={`https://wa.me/${settings?.supportPhone}?text=${encodeURIComponent(
                    "Hi CITIXO, I want to book a service"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live Chat Support
                </a>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
