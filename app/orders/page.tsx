"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package, Calendar, User, Phone, MapPin, Clock, CheckCircle, AlertCircle, XCircle, Eye, Star, X } from "lucide-react"
import { toast } from "react-toastify"
// import LoadingSpinner from "@/components/ui/LoadingSpinner"

interface Booking {
  id: string
  bookingNumber: string
  service: {
    name: string
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
  createdAt: string
  professional?: {
    name: string
  }
  hasReview?: boolean
}

export default function OrdersPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("All")
  const [cancellingId, setCancellingId] = useState<string | null>(null)


  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
     

      try {
        setLoading(true)
        setError("")

        const response = await fetch('/api/bookings', {
          credentials: 'include'
        })

        const result = await response.json()

        if (result.success) {
          setBookings(result.data)
        } else {
          setError(result.error || "Failed to load bookings")
        }
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError("Failed to load bookings")
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // Cancel order function
  const handleCancelOrder = async (bookingId: string) => {
    // Show confirmation toast
    const confirmToast = toast(
      <div className="flex flex-col space-y-3">
        <div className="text-white font-medium">Cancel Booking</div>
        <div className="text-gray-300 text-sm">Are you sure you want to cancel this booking? This action cannot be undone.</div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(confirmToast)
              performCancelOrder(bookingId)
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Cancel Booking
          </button>
          <button
            onClick={() => toast.dismiss(confirmToast)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
          >
            Keep Booking
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        className: "bg-gray-800 border border-gray-600"
      }
    )
  }

  const performCancelOrder = async (bookingId: string) => {
    setCancellingId(bookingId)
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
        toast.success("Booking cancelled successfully!")
        // Update the booking status in local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'Cancelled' as const }
            : booking
        ))
      } else {
        toast.error(result.error || "Failed to cancel booking")
      }
    } catch (err) {
      console.error("Error cancelling booking:", err)
      toast.error("Failed to cancel booking")
    } finally {
      setCancellingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'Accepted':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'In Progress':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      case 'Pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'Cancelled':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />
      case 'Accepted':
        return <CheckCircle className="w-4 h-4" />
      case 'In Progress':
        return <Clock className="w-4 h-4" />
      case 'Pending':
        return <AlertCircle className="w-4 h-4" />
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const filteredBookings = bookings.filter(booking => 
    filter === "All" || booking.status === filter
  )

  const statuses = ["All", "Pending", "Accepted", "In Progress", "Completed", "Cancelled"]

  if ( loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* <LoadingSpinner size="lg" text={authLoading ? "Checking authentication..." : "Loading your bookings..."} className="py-12" /> */}
          <div className="w-12 h-12 border-4 border-[#0095FF]/30 border-t-[#0095FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 flex items-center justify-center">Loading...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-slate-100 text-black py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold">My Bookings</h1>
              <p className="text-gray-900">Track your service bookings and orders</p>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? "bg-[#0095FF] text-white"
                    : "bg-[#1A2332] text-gray-300 hover:bg-[#374151]"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {filter === "All" ? "No bookings found" : `No ${filter.toLowerCase()} bookings`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === "All" 
                ? "You haven't made any bookings yet. Start by exploring our services." 
                : `You don't have any ${filter.toLowerCase()} bookings at the moment.`
              }
            </p>
            <Link href="/services" className="btn-primary">
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-slate-50rounded-xl border border-[#2D3748] overflow-hidden hover:border-[#0095FF]/50 transition-colors">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={booking.service.image || "/placeholder.svg"}
                        alt={booking.service.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black mb-1">{booking.service.name}</h3>
                        <p className="text-gray-900 text-sm mb-2">Booking #{booking.bookingNumber}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{booking.scheduledTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{booking.professional?.name || "To be assigned"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span>{booking.status}</span>
                      </div>
                      <p className="text-lg font-semibold text-black mt-2">₹{booking.amount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#2D3748]">
                    <div className="flex items-center space-x-4 text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{booking.customer.address}</span>
                      </div>
                      <span>•</span>
                      <span>Qty: {booking.quantity}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {booking.status === 'Completed' && booking.hasReview && (
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">Reviewed</span>
                        </div>
                      )}
                      
                      {/* Cancel button - only show for Pending and Confirmed bookings */}
                      {(booking.status === 'Pending' || booking.status === 'Accepted') && (
                        <button
                          onClick={() => handleCancelOrder(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-black px-4 py-2 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>{cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => router.push(`/orders/${booking.id}`)}
                        className="flex items-center space-x-2 bg-[#0095FF] hover:bg-[#0080E6] text-black px-4 py-2 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/services"
              className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg hover:bg-[#2D3748] transition-colors"
            >
              <div className="w-10 h-10 bg-[#0095FF]/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-[#0095FF]" />
              </div>
              <div>
                <p className="text-black font-medium">Book New Service</p>
                <p className="text-gray-900 text-sm">Browse all services</p>
              </div>
            </Link>

            <Link
              href="/plans"
              className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg hover:bg-[#2D3748] transition-colors"
            >
              <div className="w-10 h-10 bg-[#0095FF]/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#0095FF]" />
              </div>
              <div>
                <p className="text-black font-medium">View Plans</p>
                <p className="text-gray-900 text-sm">Subscription options</p>
              </div>
            </Link>

            <Link
              href="/help"
              className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg hover:bg-[#2D3748] transition-colors"
            >
              <div className="w-10 h-10 bg-[#0095FF]/20 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#0095FF]" />
              </div>
              <div>
                <p className="text-black font-medium">Get Help</p>
                <p className="text-gray-900 text-sm">Support & FAQs</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}