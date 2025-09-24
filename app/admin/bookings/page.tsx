"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Eye, Edit, Calendar, Clock, Phone } from "lucide-react"
import { toast } from "react-toastify"



export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  const statuses = ["All", "Pending", "Confirmed", "In Progress", "Completed", "Cancelled"]

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/bookings")
      const result = await response.json()

      if (result.success) {
        setBookings(result.data)
      } else {
        console.error("Failed to fetch bookings:", result.error)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "All" || booking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/10 text-yellow-500"
      case "Confirmed":
        return "bg-blue-500/10 text-blue-500"
      case "In Progress":
        return "bg-purple-500/10 text-purple-500"
      case "Completed":
        return "bg-green-500/10 text-green-500"
      case "Cancelled":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: bookingId,
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchBookings() // Refresh the list
      } else {
        toast.error("Failed to update booking: " + result.error)
      }
    } catch (error) {
      console.error("Error updating booking:", error)
      toast.error("Failed to update booking")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black text-xl">Loading bookings...</div>
      </div>
    )
  }

  console.log("selected",selectedBooking);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Bookings</h1>
          <p className="text-gray-900 mt-2">Manage customer bookings and appointments ({bookings.length} total)</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0095FF]">{bookings.length}</div>
            <div className="text-gray-900 text-sm">Total Bookings</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              // onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#2D3748] rounded-lg pl-10 pr-4 py-2 text-black placeholder-gray-400 focus:outline-none focus:border-[#0095FF]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-900" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-50 rounded-xl border border-[#2D3748] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-[#2D3748]">
              <tr>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Booking ID</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Customer</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Service</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Date & Time</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Amount</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Status</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Professional</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-[#2D3748] hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-[#0095FF] font-semibold">{booking.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-black font-medium">{booking.customer.name}</p>
                      <p className="text-gray-900 text-sm">{booking.customer.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-black">{booking.service?.name || booking.service}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-900" />
                      <span className="text-black">{booking.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-900" />
                      <span className="text-gray-900 text-sm">{booking.time}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-black font-semibold">₹{booking.amount}</td>
                  <td className="py-4 px-6">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(booking.status)}`}
                    >
                      {statuses.slice(1).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-sm ${booking.professional === "Unassigned" ? "text-gray-400" : "text-black"}`}
                    >
                      {booking.professional}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-gray-900 hover:text-[#0095FF] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-900 hover:text-yellow-500 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-900 hover:text-green-500 transition-colors">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-50 rounded-xl p-6 w-full max-w-2xl border border-[#2D3748] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-900 hover:text-black">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Booking ID</label>
                  <p className="text-[#0095FF] font-semibold">{selectedBooking.id}</p>
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Status</label>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-black font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Name</label>
                    <p className="text-black">{selectedBooking.customer.name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Phone</label>
                    <p className="text-black">{selectedBooking.customer.phone}</p>
                  </div>
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Email</label>
                    <p className="text-black">{selectedBooking.customer.email}</p>
                  </div>
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Address</label>
                    <p className="text-black">{selectedBooking.customer.address}</p>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-black font-semibold mb-3">Service Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Service</label>
                    <p className="text-black">{selectedBooking?.service?.name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Amount</label>
                    <p className="text-[#0095FF] font-semibold">₹{selectedBooking.amount}</p>
                  </div>
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Date</label>
                    <p className="text-black">{selectedBooking.date}</p>
                  </div>
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Time</label>
                    <p className="text-black">{selectedBooking.time}</p>
                  </div>
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Professional</label>
                    <p className="text-black">{selectedBooking.professional}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-2">Notes</label>
                <p className="text-gray-900 bg-white rounded-lg p-3">{selectedBooking.notes}</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-[#2D3748]">
                <button className="px-4 py-2 text-gray-400 hover:text-black transition-colors">Call Customer</button>
                <button className="px-4 py-2 text-gray-400 hover:text-black transition-colors">
                  Assign Professional
                </button>
                <button className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
