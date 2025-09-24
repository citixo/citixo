"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

import Cookies from "js-cookie";
import Link from "next/link"
import { toast } from "react-toastify"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  CheckCircle,
  Star,
  Edit3,
  MessageSquare,
  Package,
  Truck,
  Award,
  AlertCircle,
  DollarSign,
  XCircle
} from "lucide-react"

interface BookingDetail {
  id: string
  bookingNumber: string
  service: {
    name: string
    description: string
    image: string
  }
  customer: {
    name: string
    email: string
    phone: string
    address: string
  }
  scheduledDate: string
  scheduledTime: string
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled'
  amount: number
  quantity: number
  notes: string
  createdAt: string
  professional?: {
    name: string
    phone: string
    rating: number
  }
  review?: {
    rating: number
    comment: string
    createdAt: string
  }
}

interface ReviewForm {
  rating: number
  comment: string
}

interface Settings {
  companyName: string
  companyEmail: string
  supportPhone: string
  companyAddress: string
  website: string
}

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()

  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 5,
    comment: ""
  })

  const [editForm, setEditForm] = useState({
    status: '',
    amount: 0,
    notes: ''
  })

  // User edit form state
  const [showUserEditForm, setShowUserEditForm] = useState(false)
  const [isUpdatingUserBooking, setIsUpdatingUserBooking] = useState(false)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [userEditForm, setUserEditForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    customerDetails: {
      name: '',
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    specialInstructions: '',
    notes: ''
  })

 
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

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return

      try {
        setLoading(true)
        setError("")

        const response = await fetch(`/api/bookings/${bookingId}`, {
          credentials: 'include'
        })

        const result = await response.json()

        if (result.success) {
          setBooking(result.data)
          setEditForm({
            status: result.data.status,
            amount: result.data.amount,
            notes: result.data.notes
          })
          
          // Populate user edit form
          setUserEditForm({
            scheduledDate: new Date(result.data.scheduledDate).toISOString().split('T')[0],
            scheduledTime: result.data.scheduledTime,
            customerDetails: {
              name: result.data.customer.name,
              phone: result.data.customer.phone,
              email: result.data.customer.email,
              address: {
                street: result.data.customer.address.street || '',
                city: result.data.customer.address.city || '',
                state: result.data.customer.address.state || '',
                zipCode: result.data.customer.address.zipCode || ''
              }
            },
            specialInstructions: result.data.specialInstructions || '',
            notes: result.data.notes || ''
          })
        } else {
          setError(result.error || "Booking not found")
        }
      } catch (err) {
        console.error("Error fetching booking:", err)
        setError("Failed to load booking details")
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId])

  // Submit review
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return

    setIsSubmittingReview(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setBooking((prev:any) => prev ? {
          ...prev,
          review: {
            rating: reviewForm.rating,
            comment: reviewForm.comment,
            createdAt: new Date().toISOString()
          }
        } : null)
        setShowReviewForm(false)
        setReviewForm({ rating: 5, comment: "" })
      } else {
        setError(result.error || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      setError("Failed to submit review")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Update booking status (admin only)
  const handleStatusUpdate = async (newStatus: string) => {
    if (!booking || Cookies.get("userType") !== 'admin') return

    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setBooking((prev:any) => prev ? { ...prev, status: newStatus as any } : null)
      } else {
        setError(result.error || "Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      setError("Failed to update status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // Cancel booking function (for users)
  const handleCancelBooking = async () => {
    if (!booking || booking.status === 'Cancelled') return
    
    if (!window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      return
    }

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Cancelled' }),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setBooking((prev:any) => prev ? { ...prev, status: 'Cancelled' as any } : null)
      } else {
        setError(result.error || "Failed to cancel booking")
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      setError("Failed to cancel booking")
    } finally {
      setIsCancelling(false)
    }
  }

  // Update booking details (admin only)
  const handleBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking || Cookies.get("userType") !== 'admin') return

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setBooking((prev:any) => prev ? {
          ...prev,
          status: editForm.status as any,
          amount: editForm.amount,
          notes: editForm.notes
        } : null)
        setShowEditForm(false)
      } else {
        setError(result.error || "Failed to update booking")
      }
    } catch (error) {
      console.error("Error updating booking:", error)
      setError("Failed to update booking")
    }
  }

  // Update booking details (user edit)
  const handleUserBookingEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking || Cookies.get("userType") === 'admin') return

    setIsUpdatingUserBooking(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/user-edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userEditForm),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setBooking((prev:any) => prev ? {
          ...prev,
          scheduledDate: new Date(userEditForm.scheduledDate),
          scheduledTime: userEditForm.scheduledTime,
          customer: {
            ...prev.customer,
            name: userEditForm.customerDetails.name,
            phone: userEditForm.customerDetails.phone,
            email: userEditForm.customerDetails.email,
            address: {
              ...prev.customer.address,
              street: userEditForm.customerDetails.address.street,
              city: userEditForm.customerDetails.address.city,
              state: userEditForm.customerDetails.address.state,
              zipCode: userEditForm.customerDetails.address.zipCode
            }
          },
          specialInstructions: userEditForm.specialInstructions,
          notes: userEditForm.notes
        } : null)
        setShowUserEditForm(false)
        toast.success("Booking updated successfully!")
      } else {
        setError(result.error || "Failed to update booking")
      }
    } catch (error) {
      console.error("Error updating booking:", error)
      setError("Failed to update booking")
    } finally {
      setIsUpdatingUserBooking(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Accepted":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "In Progress":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "Completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "Cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4" />
      case "Accepted":
        return <CheckCircle className="w-4 h-4" />
      case "In Progress":
        return <Truck className="w-4 h-4" />
      case "Completed":
        return <Award className="w-4 h-4" />
      case "Cancelled":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

   if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0095FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900">Loading orders details...</p>
        </div>
      </div>
    )
  }


  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black mb-2">Booking Not Found</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/orders" className="btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-900 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-black">Booking Details</h1>
            <p className="text-gray-900">Booking #{booking.bookingNumber}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Details */}
            <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
              <h2 className="text-xl font-bold text-black mb-4">Service Information</h2>
              <div className="flex items-start space-x-4">
                <img
                  src={booking.service.image || "/placeholder.svg"}
                  alt={booking.service.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black">{booking.service.name}</h3>
                  <p className="text-gray-900 text-sm">{booking.service.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-900">Quantity: {booking.quantity}</span>
                    <span className="text-sm text-gray-900">Amount: ₹{booking.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule & Contact */}
            <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-black">Schedule & Contact</h2>
                {Cookies.get("userType") !== 'admin' && (booking.status === 'Pending' || booking.status === 'Accepted') && (
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const now = new Date()
                      const scheduledDateTime = new Date(`${new Date(booking.scheduledDate).toISOString().split('T')[0]}T${booking.scheduledTime}`)
                      const timeDiff = scheduledDateTime.getTime() - now.getTime()
                      const hoursDiff = timeDiff / (1000 * 60 * 60)
                      const canEdit = hoursDiff >= 2
                      
                      return canEdit ? (
                        <button
                          onClick={() => setShowUserEditForm(!showUserEditForm)}
                          className="flex items-center space-x-2 text-[#0095FF] hover:text-[#0080E6] transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>{showUserEditForm ? 'Cancel Edit' : 'Edit Details'}</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-900">
                          <Edit3 className="w-4 h-4" />
                          <span className="text-sm">Edit not available (less than 2 hours before service)</span>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
              
              {!showUserEditForm ? (
                <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-[#0095FF]" />
                    <div>
                      <p className="text-sm text-gray-400">Date</p>
                      <p className="text-black">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-[#0095FF]" />
                    <div>
                      <p className="text-sm text-gray-400">Time</p>
                      <p className="text-black">{booking.scheduledTime}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-[#0095FF]" />
                    <div>
                      <p className="text-sm text-gray-400">Customer</p>
                      <p className="text-black">{booking.customer.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-[#0095FF]" />
                    <div>
                      <p className="text-sm text-gray-900">Phone</p>
                      <p className="text-black">{booking.customer.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#0095FF] mt-1" />
                <div>
                  <p className="text-sm text-gray-900">Address</p>
                      <p className="text-black">
                        {booking.customer.address.street ? 
                          `${booking.customer.address.street}, ${booking.customer.address.city}, ${booking.customer.address.state} ${booking.customer.address.zipCode}` :
                          booking.customer.address
                        }
                      </p>
                </div>
              </div>
              {booking.notes && (
                <div className="mt-4 flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-[#0095FF] mt-1" />
                  <div>
                    <p className="text-sm text-gray-900">Notes</p>
                    <p className="text-black">{booking.notes}</p>
                  </div>
                </div>
                  )}
                  {booking.specialInstructions && (
                    <div className="mt-4 flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 text-[#0095FF] mt-1" />
                      <div>
                        <p className="text-sm text-gray-900">Special Instructions</p>
                        <p className="text-black">{booking.specialInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleUserBookingEdit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Date</label>
                      <input
                        type="date"
                        value={userEditForm.scheduledDate}
                        onChange={(e) => setUserEditForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Time</label>
                      <select
                        value={userEditForm.scheduledTime}
                        onChange={(e) => setUserEditForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                        required
                      >
                        <option value="">Select time</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={userEditForm.customerDetails.name}
                        onChange={(e) => setUserEditForm(prev => ({ 
                          ...prev, 
                          customerDetails: { ...prev.customerDetails, name: e.target.value }
                        }))}
                        className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={userEditForm.customerDetails.phone}
                        onChange={(e) => setUserEditForm(prev => ({ 
                          ...prev, 
                          customerDetails: { ...prev.customerDetails, phone: e.target.value }
                        }))}
                        className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={userEditForm.customerDetails.email}
                      onChange={(e) => setUserEditForm(prev => ({ 
                        ...prev, 
                        customerDetails: { ...prev.customerDetails, email: e.target.value }
                      }))}
                      className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={userEditForm.customerDetails.address.street}
                      onChange={(e) => setUserEditForm(prev => ({ 
                        ...prev, 
                        customerDetails: { 
                          ...prev.customerDetails, 
                          address: { ...prev.customerDetails.address, street: e.target.value }
                        }
                      }))}
                      className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">City</label>
                      <input
                        type="text"
                        value={userEditForm.customerDetails.address.city}
                        onChange={(e) => setUserEditForm(prev => ({ 
                          ...prev, 
                          customerDetails: { 
                            ...prev.customerDetails, 
                            address: { ...prev.customerDetails.address, city: e.target.value }
                          }
                        }))}
                        className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">State</label>
                      <input
                        type="text"
                        value={userEditForm.customerDetails.address.state}
                        onChange={(e) => setUserEditForm(prev => ({ 
                          ...prev, 
                          customerDetails: { 
                            ...prev.customerDetails, 
                            address: { ...prev.customerDetails.address, state: e.target.value }
                          }
                        }))}
                        className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={userEditForm.customerDetails.address.zipCode}
                        onChange={(e) => setUserEditForm(prev => ({ 
                          ...prev, 
                          customerDetails: { 
                            ...prev.customerDetails, 
                            address: { ...prev.customerDetails.address, zipCode: e.target.value }
                          }
                        }))}
                        className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Special Instructions</label>
                    <textarea
                      value={userEditForm.specialInstructions}
                      onChange={(e) => setUserEditForm(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      rows={3}
                      className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                      placeholder="Any special instructions for the service..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Additional Notes</label>
                    <textarea
                      value={userEditForm.notes}
                      onChange={(e) => setUserEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full bg-white border border-[#4A5568] rounded-lg px-3 py-2 text-black focus:border-[#0095FF] focus:outline-none"
                      placeholder="Any additional notes..."
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={isUpdatingUserBooking}
                      className="bg-[#0095FF] hover:bg-[#0080E6] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>{isUpdatingUserBooking ? 'Updating...' : 'Update Booking'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserEditForm(false)}
                      className="bg-white hover:bg-gray-700 text-black px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Professional Details */}
            {booking.professional && (
              <div className="bg-[#1A2332] rounded-xl p-6 border border-[#2D3748]">
                <h2 className="text-xl font-bold text-white mb-4">Assigned Professional</h2>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#0095FF] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{booking.professional.name}</p>
                    <p className="text-gray-400">{booking.professional.phone}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-400">{booking.professional.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Section */}
            {booking.status === 'Completed' && (
              <div className="bg-[#1A2332] rounded-xl p-6 border border-[#2D3748]">
                <h2 className="text-xl font-bold text-white mb-4">Service Review</h2>
                
                {booking.review ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= booking.review!.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                      <span className="text-white ml-2">{booking.review.rating}/5</span>
                    </div>
                    <p className="text-gray-300">{booking.review.comment}</p>
                    <p className="text-sm text-gray-500">
                      Reviewed on {new Date(booking.review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-400">Share your experience with this service</p>
                    {!showReviewForm ? (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Write Review
                      </button>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Rating
                          </label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    star <= reviewForm.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-600"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Comment
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            rows={4}
                            className="w-full bg-[#2D3748] border border-[#4A5568] rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-[#0095FF] focus:outline-none"
                            placeholder="Share your experience..."
                            required
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
              <h3 className="text-lg font-bold text-black mb-4">Booking Status</h3>
              <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <span className="font-medium">{booking.status}</span>
              </div>

              {/* User Cancel Button */}
              {Cookies.get("userType") !== 'admin' && (booking.status === 'Pending' || booking.status === 'Accepted') && (
                <div className="mt-4">
                  <button
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{isCancelling ? 'Cancelling...' : 'Cancel Booking'}</span>
                  </button>
                </div>
              )}

              {/* Admin Status Controls */}
              {Cookies.get("userType") === 'admin' && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-400">Update Status:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Pending', 'Accepted', 'In Progress', 'Completed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        disabled={isUpdatingStatus || booking.status === status}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          booking.status === status
                            ? 'bg-[#0095FF] text-white'
                            : 'bg-[#2D3748] text-gray-300 hover:bg-[#4A5568]'
                        } disabled:opacity-50`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Info */}
            <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
              <h3 className="text-lg font-bold text-black mb-4">Booking Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-900">Booking ID</span>
                  <span className="text-black">{booking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900">Created</span>
                  <span className="text-black">{new Date(booking.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-black font-semibold">₹{booking.amount}</span>
                </div>
              </div>

              {/* Admin Edit Controls */}
              {Cookies.get("userType") === 'admin' && (
                <div className="mt-4 pt-4 border-t border-[#2D3748]">
                  {!showEditForm ? (
                    <button
                      onClick={() => setShowEditForm(true)}
                      className="flex items-center space-x-2 text-[#0095FF] hover:text-[#0080E6] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Booking</span>
                    </button>
                  ) : (
                    <form onSubmit={handleBookingEdit} className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Amount</label>
                        <input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          className="w-full bg-[#2D3748] border border-[#4A5568] rounded px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Notes</label>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                          rows={2}
                          className="w-full bg-[#2D3748] border border-[#4A5568] rounded px-3 py-2 text-white"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEditForm(false)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
              <h3 className="text-lg font-bold text-black mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/services"
                  className="block w-full bg-white hover:bg-[#4A5568] text-black px-4 py-2 rounded-lg transition-colors text-center"
                >
                  Book Another Service
                </Link>
                <Link
                  href="/orders"
                  className="block w-full bg-white hover:bg-[#4A5568] text-black px-4 py-2 rounded-lg transition-colors text-center"
                >
                  View All Bookings
                </Link>
                <Link
                  href="/help"
                  className="block w-full bg-white hover:bg-[#4A5568] text-black px-4 py-2 rounded-lg transition-colors text-center"
                >
                  Get Help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
