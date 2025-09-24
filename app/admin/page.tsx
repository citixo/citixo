"use client"

import { useState, useEffect } from "react"
import { Users, Calendar, DollarSign, Settings, TrendingUp, TrendingDown, Eye, Phone } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  totalServices: number
  userGrowth: number
  bookingGrowth: number
  revenueGrowth: number
  serviceGrowth: number
}



interface TopService {
  name: string
  bookings: number
  revenue: number
  growth: number
  price: string
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalServices: 0,
    userGrowth: 0,
    bookingGrowth: 0,
    revenueGrowth: 0,
    serviceGrowth: 0,
  })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [topServices, setTopServices] = useState<TopService[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch all data from APIs
        const [usersRes, bookingsRes, servicesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/bookings"),
          fetch("/api/services"),
        ])

        const [usersData, bookingsData, servicesData] = await Promise.all([
          usersRes.json(),
          bookingsRes.json(),
          servicesRes.json(),
        ])

        // Calculate stats
        const totalUsers = usersData.success ? usersData.data.length : 0
        const totalBookings = bookingsData.success ? bookingsData.data.length : 0
        const totalServices = servicesData.success ? servicesData.data.length : 0

        // Calculate total revenue from bookings
        const totalRevenue = bookingsData.success
          ? bookingsData.data.reduce((sum: number, booking: any) => sum + booking.amount, 0)
          : 0

        // Set stats with mock growth data
        setStats({
          totalUsers,
          totalBookings,
          totalRevenue,
          totalServices,
          userGrowth: 12.5,
          bookingGrowth: 8.3,
          revenueGrowth: 15.7,
          serviceGrowth: 5.2,
        })

        // Set recent bookings (last 5)
        if (bookingsData.success) {
          const recent = bookingsData.data.slice(0, 5).map((booking: any) => ({
            id: booking.id,
            customer: booking.customer.name,
            service: booking.service?.name || booking.service,
            date: booking.date,
            amount: booking.amount,
            status: booking.status,
          }))
          setRecentBookings(recent)
        }

        // Calculate top services
        if (servicesData.success) {
          const topServicesData = servicesData.data
            .sort((a: any, b: any) => b.bookings - a.bookings)
            .slice(0, 5)
            .map((service: any) => ({
              name: service.name,
              bookings: service.bookings,
              revenue: service.bookings * Number.parseInt(service.price?.replace("Starting ₹", "") || "0"),
              growth: Math.random() * 20 - 5, // Mock growth data
            }))
          setTopServices(topServicesData)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    // Simulate loading delay
    setTimeout(fetchDashboardData, 1000)
  }, [])

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Dashboard</h1>
            <p className="text-gray-900 mt-2">Loading your admin overview...</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-500 rounded-xl p-6 border border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-400 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-400 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-400 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          <p className="text-gray-400 mt-2">Welcome to your admin overview</p>
        </div>
       
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-black">{stats.totalUsers}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{stats.userGrowth}%</span>
              </div>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white  rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold text-black">{stats.totalBookings}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{stats.bookingGrowth}%</span>
              </div>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white  rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-black">₹{stats.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{stats.revenueGrowth}%</span>
              </div>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900 text-sm">Active Services</p>
              <p className="text-3xl font-bold text-black">{stats.totalServices}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm">+{stats.serviceGrowth}%</span>
              </div>
            </div>
            <div className="bg-orange-500/10 p-3 rounded-lg">
              <Settings className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings and Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white  rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Recent Bookings</h2>
            <span className="text-gray-900 text-sm">{recentBookings.length} bookings</span>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking:any) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-white border border-gray-500 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-black font-medium">{booking.customer}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-gray-900 text-sm">{booking.service?.name || booking.service}</p>
                  <p className="text-gray-900 text-xs">{booking.date}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-black font-semibold">₹{booking.amount}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <button className="text-gray-900 hover:text-blue-500 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-900 hover:text-green-500 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white  rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Top Services</h2>
            <span className="text-gray-900 text-sm">By bookings</span>
          </div>
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div key={service.name} className="flex items-center justify-between p-4 bg-white border border-gray-500 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-400 font-semibold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-black font-medium">{service.name}</p>
                    <p className="text-gray-900 text-sm">{service.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-black font-semibold">₹{service?.revenue?.toLocaleString() || 0}</p>
                  <div className="flex items-center justify-end mt-1">
                    {service.growth > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                    )}
                    <span className={`text-xs ${service.growth > 0 ? "text-green-500" : "text-red-500"}`}>
                      {service.growth > 0 ? "+" : ""}
                      {service.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-black mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => (window.location.href = "/api/seed")}
            className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg p-4 text-left transition-colors"
          >
            <div className="text-blue-400 font-medium mb-2">Seed Database</div>
            <div className="text-gray-900 text-sm">Initialize with sample data</div>
          </button>
          <button className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg p-4 text-left transition-colors">
            <div className="text-green-400 font-medium mb-2">Export Data</div>
            <div className="text-gray-900 text-sm">Download all records</div>
          </button>
          <button className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg p-4 text-left transition-colors">
            <div className="text-purple-400 font-medium mb-2">Generate Report</div>
            <div className="text-gray-900 text-sm">Monthly analytics report</div>
          </button>
        </div>
      </div>
    </div>
  )
}
