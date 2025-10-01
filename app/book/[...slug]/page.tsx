"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Cookies from "js-cookie";
import Link from "next/link"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  Shield,
  CheckCircle,
  Star,
  Minus,
  Plus,
  AlertCircle,
  ArrowRight,
  Tag,
  X
} from "lucide-react"
import { cookies } from "next/headers";
import { toast } from "react-toastify";
import RazorpayPayment from "@/components/RazorpayPayment";
import confetti from "canvas-confetti";

interface Service {
  id: string
  name: string
  description: string
  category: string
  price: any
  duration: string
  rating: number
  reviews: number
  image: string
  features: string[]
  status: string
  bookings: number
  createdAt: string
}

interface BookingForm {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  pincode: string
  date: string
  time: string
  quantity: number
  notes: string
}

interface CouponData {
  couponCode: string
  discountPercentage: number
  discountAmount: number
  originalAmount: number
  finalAmount: number
  description: string
}

export default function DynamicBookingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string[]
  
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  
  const [formData, setFormData] = useState<BookingForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    date: "",
    time: "",
    quantity: 1,
    notes: ""
  })

  
   useEffect(() => {
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

    checkAuth();
  }, [router]);

  // Fetch service details based on slug
  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        setError("")
        
        // Convert slug array to service identifier
        const serviceSlug = slug.join('/')
        
        // First try to find by slug/href
        let response = await fetch(`/api/services`)
        const data = await response.json()
        
        if (data.success && data.data) {
          // Find service by matching slug or ID
          const foundService = data.data.find((s: Service) => {
            const serviceHref = s.id?.toLowerCase().replace(/\s+/g, '-')
            const slugPath = serviceSlug.toLowerCase()
            return (
              s.id === serviceSlug ||
              serviceHref === slugPath ||
              s.name.toLowerCase().replace(/\s+/g, '-') === slugPath ||
              slugPath.includes(s.id?.toLowerCase() || '') ||
              slugPath.includes(serviceHref || '')
            )
          })
          
          if (foundService && foundService.status === 'Active') {
            setService(foundService)
          } else {
            setError("Service not found or is not available for booking")
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
      setError("Invalid booking URL")
      setLoading(false)
    }
  }, [slug])

  // Fetch and auto-fill user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/me', {
          credentials: 'include'
        })
        const result = await response.json()
        
        if (result.success && result.data) {
          const user = result.data
          setFormData(prev => ({
            ...prev,
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            pincode: user.zipCode || ''
          }))
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        // Fallback to localStorage if API fails
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setFormData(prev => ({
          ...prev,
          fullName: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        }))
          } catch (parseError) {
            console.error('Error parsing user data:', parseError)
          }
        }
      }
    }

    fetchUserData()
  }, [])



  // Validation functions
  const validatePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '')
    return digitsOnly.length <= 10
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    return emailRegex.test(email)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Phone number validation - prevent more than 10 digits
    if (name === 'phone') {
      if (!validatePhone(value)) {
        return // Don't update if more than 10 digits
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear location error when user starts typing
    if (locationError && (name === 'address' || name === 'city' || name === 'pincode')) {
      setLocationError("")
    }
  }

  const handleQuantityChange = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta)
    }))
  }

  function getCombinedNumber(str:any) {
    const digits = str.replace(/\D/g, "");
    return digits ? Number(digits) : null;
  }
  
  const calculateTotal = () => {
    if (!service) return 0
    const price = service.price.replace("Starting ","");
    const combinedNumber:any = getCombinedNumber(price);
    return combinedNumber * formData.quantity
  }

  const calculateFinalAmount = () => {
    const total = calculateTotal()
    if (appliedCoupon) {
      return appliedCoupon.finalAmount
    }
    return total
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code")
      return
    }

    // Prevent duplicate validation
    if (isValidatingCoupon) return

    setIsValidatingCoupon(true)
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          amount: calculateTotal()
        })
      })

      const result = await response.json()

      if (result.success) {
        // Smooth state update without reload
        setAppliedCoupon(result.data)
        setCouponCode("")
        
        // Trigger confetti celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        
        toast.success(`🎉 Coupon applied! You saved ₹${result.data.discountAmount}`)
      } else {
        toast.error(result.error || "Invalid coupon code")
        // Clear the input on error for better UX
        setCouponCode("")
      }
    } catch (error) {
      console.error("Error validating coupon:", error)
      toast.error("Failed to validate coupon code")
      setCouponCode("")
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const removeCoupon = () => {
    // Smooth state update without reload
    setAppliedCoupon(null)
    toast.info("Coupon removed")
  }

  // Handle Enter key press for coupon input
  const handleCouponKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidatingCoupon) {
      e.preventDefault()
      e.stopPropagation()
      validateCoupon()
    }
  }

  // Prevent form submission when pressing Enter in coupon input
  const handleCouponInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Get current location and reverse geocode
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return
    }

    setIsGettingLocation(true)
    setLocationError("")

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      
      // Reverse geocoding using a free service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      )
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }

      const data = await response.json()
      
      if (data.city && data.postcode) {
        setFormData(prev => ({
          ...prev,
          city: data.city || prev.city,
          pincode: data.postcode || prev.pincode,
          address: data.localityInfo?.administrative?.[0]?.name ? 
            `${data.localityInfo.administrative[0].name}, ${data.city}` : 
            prev.address
        }))
      } else {
        setLocationError("Could not determine city and pincode from location")
      }
    } catch (error: any) {
      console.error('Location error:', error)
      if (error.code === 1) {
        setLocationError("Location access denied. Please enable location permissions.")
      } else if (error.code === 2) {
        setLocationError("Location unavailable. Please try again.")
      } else if (error.code === 3) {
        setLocationError("Location request timed out. Please try again.")
      } else {
        setLocationError("Failed to get location. Please try again.")
      }
    } finally {
      setIsGettingLocation(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
     
    if (!service) return
    
    // Validate form data
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || 
        !formData.city || !formData.pincode || !formData.date || !formData.time) {
      setError("Please fill in all required fields")
      return
    }

    // Validate phone number (exactly 10 digits)
    const phoneDigits = formData.phone.replace(/\D/g, '')
    if (phoneDigits.length !== 10) {
      setError("Phone number must be exactly 10 digits")
      return
    }

    // Validate email (must be gmail.com)
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid Gmail address (e.g., yourname@gmail.com)")
      return
    }

    setError("")
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (paymentData: any) => {
    setIsSubmitting(true)
    setError("")

    try {
      // Create booking object with payment data
      const bookingData = {
        userId: Cookies.get("email"), // Use user email as temporary userId
        serviceId: service?.id,
        scheduledDate: formData.date,
        scheduledTime: formData.time,
        quantity: formData.quantity,
        notes: formData.notes,
        customerDetails: {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: {
            street: formData.address,
            city: formData.city,
            state: 'Maharashtra', // Default state, can be made dynamic
            zipCode: formData.pincode
          }
        },
        specialInstructions: formData.notes,
        // Add coupon information if applied
        ...(appliedCoupon && {
          discount: {
            amount: appliedCoupon.discountAmount,
            type: 'Percentage',
            couponCode: appliedCoupon.couponCode,
            discountPercentage: appliedCoupon.discountPercentage
          },
          totalAmount: calculateTotal(),
          finalAmount: appliedCoupon.finalAmount
        }),
        paymentData: {
          paymentId: paymentData.payment_id,
          orderId: paymentData.order_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          method: paymentData.method
        }
      }

      // Call booking API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setShowPaymentModal(false)
        setShowSuccessModal(true)
        
        // Clear form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          pincode: "",
          date: "",
          time: "",
          quantity: 1,
          notes: ""
        })
      } else {
        setError(result.error || "Failed to create booking. Please try again.")
      }
      
    } catch (error) {
      console.error('Booking error:', error)
      setError("Failed to create booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentError = (error: string) => {
    setError(error)
    setShowPaymentModal(false)
  }

  const formatPrice = (price: any) => {
    return price
  }

   if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0095FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Service Not Found</h1>
          <p className="text-gray-400 mb-6">{error || "The requested service could not be found."}</p>
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



  // Authentication check is handled by useEffect hook above

  return (
    <>
      <div className="min-h-screen bg-slate-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/services"
              className="inline-flex items-center space-x-2 text-gray-900 hover:text-black mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Services</span>
            </Link>
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-[#2D3748]">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full lg:w-32 h-48 lg:h-32 object-cover rounded-lg mb-4 lg:mb-0"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-[#0095FF]/20 text-[#0095FF] px-3 py-1 rounded-full text-sm font-medium">
                      {service.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-black font-medium">{service.rating}</span>
                      <span className="text-gray-400">({service.reviews} reviews)</span>
                    </div>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-black mb-2">{service.name}</h1>
                  <p className="text-gray-400 mb-4">{service.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{service.bookings} bookings</span>
                    </div>
                    <div className="text-2xl font-bold text-[#0095FF]">
                      {formatPrice(service.price)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-2xl p-6 border border-[#2D3748]">
                <h2 className="text-xl font-bold text-black mb-6">Book This Service</h2>
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400">{error}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Personal Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-900 text-sm font-medium mb-2">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                            className="w-full bg-white border border-[#2D3748] rounded-lg pl-10 pr-4 py-3 text-black placeholder-gray-900 focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-900 text-sm font-medium mb-2">
                          Phone Number * (10 digits only)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="9876543210"
                            maxLength={10}
                            className={`w-full bg-white border rounded-lg pl-10 pr-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                              formData.phone && formData.phone.replace(/\D/g, '').length !== 10
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-[#2D3748] focus:border-[#0095FF] focus:ring-[#0095FF]'
                            }`}
                            required
                          />
                        </div>
                        {formData.phone && formData.phone.replace(/\D/g, '').length !== 10 && (
                          <p className="text-red-500 text-xs mt-1">Phone number must be exactly 10 digits</p>
                        )}
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-gray-900 text-sm font-medium mb-2">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="yourname@gmail.com"
                            className={`w-full bg-white border rounded-lg pl-10 pr-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                              formData.email && !validateEmail(formData.email)
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-[#2D3748] focus:border-[#0095FF] focus:ring-[#0095FF]'
                            }`}
                            required
                          />
                        </div>
                        {formData.email && !validateEmail(formData.email) && (
                          <p className="text-red-500 text-xs mt-1">Please enter a valid Gmail address (e.g., yourname@gmail.com)</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-black">Service Address</h3>
                      
                    </div>
                    
                    {locationError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">{locationError}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-gray-900 text-sm font-medium mb-2">
                          Full Address *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 text-gray-900 w-5 h-5" />
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter your complete address"
                            rows={3}
                            className="w-full bg-white border border-[#2D3748] rounded-lg pl-10 pr-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors resize-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-900 text-sm font-medium mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter your city"
                          className="w-full bg-white border border-[#2D3748] rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-900 text-sm font-medium mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          placeholder="Enter pincode"
                          className="w-full bg-white border border-[#2D3748] rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schedule Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Schedule Service</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-900 text-sm font-medium mb-2">
                          Preferred Date *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-white border border-[#2D3748] rounded-lg pl-10 pr-4 py-3 text-black focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-800 text-sm font-medium mb-2">
                          Preferred Time *
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5" />
                          <select
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-[#2D3748] rounded-lg pl-10 pr-4 py-3 text-black focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors"
                            required
                          >
                            <option value="">Select time</option>
                            <option value="09:00">09:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="13:00">01:00 PM</option>
                            <option value="14:00">02:00 PM</option>
                            <option value="15:00">03:00 PM</option>
                            <option value="16:00">04:00 PM</option>
                            <option value="17:00">05:00 PM</option>
                            <option value="18:00">06:00 PM</option>
                          </select>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-gray-900 text-sm font-medium mb-2">
                          Quantity
                        </label>
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(-1)}
                            className="w-10 h-10 border border-gray-600 text-black rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-black font-medium text-lg min-w-[2rem] text-center">
                            {formData.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(1)}
                            className="w-10 h-10 border border-gray-600 text-black rounded-lg flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <span className="text-gray-400 text-sm">× {formatPrice(service.price)} each</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions or requirements..."
                      rows={3}
                      className="w-full bg-white border border-[#2D3748] rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors resize-none"
                    />
                  </div>

                  {/* Coupon Code Section */}
                  <div>
                    <label className="block text-gray-900 text-sm font-medium mb-2">
                      Coupon Code (Optional)
                    </label>
                    {!appliedCoupon ? (
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            onKeyPress={handleCouponKeyPress}
                            onKeyDown={handleCouponInputKeyDown}
                            placeholder="Enter coupon code (e.g., DAMN22)"
                            className="w-full bg-white border border-[#2D3748] rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                            maxLength={6}
                            disabled={isValidatingCoupon}
                          />
                          {isValidatingCoupon && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0095FF] border-t-transparent"></div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={validateCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim()}
                          className="bg-[#0095FF] hover:bg-[#0080E6] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Tag className="w-4 h-4" />
                          <span>{isValidatingCoupon ? "Validating..." : "Apply"}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-slide-up">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="text-green-800 font-medium">
                                Coupon Applied: {appliedCoupon.couponCode}
                              </p>
                              <p className="text-green-600 text-sm">
                                {appliedCoupon.discountPercentage}% off - You saved ₹{appliedCoupon.discountAmount}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-100"
                            title="Remove coupon"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 transition-all duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{calculateTotal()}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-green-600 animate-fade-in">
                        <span>Discount ({appliedCoupon.couponCode})</span>
                        <span>-₹{appliedCoupon.discountAmount}</span>
                      </div>
                    )}
                    <hr className="border-gray-200" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#0095FF] transition-colors duration-300">
                        ₹{calculateFinalAmount()}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0095FF] hover:bg-[#0080E6] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Proceed to Payment - {formatPrice(calculateFinalAmount())}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 rounded-2xl p-6 border border-[#2D3748] sticky top-8">
                <h3 className="text-lg font-semibold text-black mb-4">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-800">
                    <span>Service</span>
                    <span className="text-black font-medium">{service.name}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-800">
                    <span>Price per unit</span>
                    <span className="text-black font-medium">{formatPrice(service.price)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-800">
                    <span>Quantity</span>
                    <span className="text-black font-medium">{formData.quantity}</span>
                  </div>
                  
                  <hr className="border-[#2D3748]" />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-black">Total</span>
                    <span className="text-[#0095FF]">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <div className="flex items-center space-x-2 text-green-400 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Secure Booking</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Your booking is protected by our secure payment system and satisfaction guarantee.
                  </p>
                </div>

                {/* Service Features */}
                {service.features && service.features.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-black font-medium mb-3">What's Included</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 rounded-2xl p-8 border border-[#2D3748] max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#0095FF]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-[#0095FF]" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Complete Payment</h3>
            <p className="text-gray-800 mb-6">
              Pay ₹{calculateFinalAmount()} to confirm your booking for {service?.name}
            </p>
            
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-[#2D3748]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium">{service?.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-medium">{formData.quantity}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium">{formData.date} at {formData.time}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center mb-2 text-green-600">
                    <span>Discount ({appliedCoupon.couponCode})</span>
                    <span>-₹{appliedCoupon.discountAmount}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-[#0095FF]">₹{calculateFinalAmount()}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <RazorpayPayment
                  amount={calculateFinalAmount()}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#0095FF] hover:bg-[#0080E6] text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Now</span>
                  </div>
                </RazorpayPayment>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-100 rounded-2xl p-8 border border-[#2D3748] max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">Payment Successful!</h3>
            <p className="text-gray-800 mb-6">
              Your booking for {service?.name} has been confirmed and payment received. You'll receive a confirmation email shortly.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/orders')}
                className="w-full bg-[#0095FF] hover:bg-[#0080E6] text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push('/services')}
                className="w-full bg-[#2D3748] hover:bg-[#374151] text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Book Another Service
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 