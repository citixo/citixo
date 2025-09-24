"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Edit, Trash2, Eye, Mail, Phone, MapPin } from "lucide-react"
import { toast } from "react-toastify"

interface User {
  id: string
  name: string
  email: string
  phone: string
  address: string
  joinDate: string
  totalBookings: number
  totalSpent: number
  status: "Active" | "Inactive" | "Blocked"
  lastLogin: string
  avatar: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const statuses = ["All", "Active", "Inactive", "Blocked"]

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      const result = await response.json()

      if (result.success) {
        setUsers(result.data)
      } else {
        console.error("Failed to fetch users:", result.error)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
    const matchesStatus = filterStatus === "All" || user.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/10 text-green-500"
      case "Inactive":
        return "bg-yellow-500/10 text-yellow-500"
      case "Blocked":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const handleDeleteUser = async (id: string) => {
    // Show confirmation toast
    const confirmToast = toast(
      <div className="flex flex-col space-y-3">
        <div className="text-black font-medium">Delete User</div>
        <div className="text-gray-900 text-sm">Are you sure you want to delete this user? This action cannot be undone.</div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(confirmToast)
              performDeleteUser(id)
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(confirmToast)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
          >
            Cancel
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

  const performDeleteUser = async (id: string) => {
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (result.success) {
        toast.success("User deleted successfully!")
        await fetchUsers() // Refresh the list
      } else {
        toast.error("Failed to delete user: " + result.error)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: userId,
          status: newStatus,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("User status updated successfully!")
        await fetchUsers() // Refresh the list
      } else {
        toast.error("Failed to update user: " + result.error)
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error("Failed to update user")
    }
  }

  const handleSubmitUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      status: formData.get("status") as string,
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (result.success) {
        await fetchUsers() // Refresh the list
        setShowAddModal(false)
      } else {
        toast.error("Failed to create user: " + result.error)
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Failed to create user")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black text-xl">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Users</h1>
          <p className="text-gray-900 mt-2">Manage customer accounts and information ({users.length} total)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#0095FF] hover:bg-[#0080E6] text-black px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
          <div className="text-2xl font-bold text-black">{users.length}</div>
          <div className="text-gray-900 text-sm">Total Users</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
          <div className="text-2xl font-bold text-green-500">{users.filter((u) => u.status === "Active").length}</div>
          <div className="text-gray-900 text-sm">Active Users</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
          <div className="text-2xl font-bold text-yellow-500">
            {users.filter((u) => u.status === "Inactive").length}
          </div>
          <div className="text-gray-900 text-sm">Inactive Users</div>
        </div>
        <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
          <div className="text-2xl font-bold text-red-500">{users.filter((u) => u.status === "Blocked").length}</div>
          <div className="text-gray-900 text-sm">Blocked Users</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-50 rounded-xl p-6 border border-[#2D3748]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-[#2D3748] rounded-lg pl-10 pr-4 py-2 text-black placeholder-gray-900 focus:outline-none focus:border-[#0095FF]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-900" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
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

      {/* Users Table */}
      <div className="bg-slate-50 rounded-xl border border-[#2D3748] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-[#2D3748]">
              <tr>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">User</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Contact</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Join Date</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Bookings</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Total Spent</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Status</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Last Login</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#2D3748] hover:bg-white transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-black font-medium">{user.name}</p>
                        <p className="text-gray-900 text-sm">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-black text-sm">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-900" />
                        <span className="text-gray-900 text-sm">{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-black">{user.joinDate}</td>
                  <td className="py-4 px-6 text-black font-semibold">{user.totalBookings}</td>
                  <td className="py-4 px-6 text-[#0095FF] font-semibold">₹{ user.totalSpent ? user.totalSpent?.toLocaleString() : 0}</td>
                  <td className="py-4 px-6">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(user.status)}`}
                    >
                      {statuses.slice(1).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-6 text-gray-900 text-sm">{user.lastLogin}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-gray-900 hover:text-[#0095FF] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-900 hover:text-yellow-500 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-50 rounded-xl p-6 w-full max-w-2xl border border-[#2D3748] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* User Profile */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.avatar || "/placeholder.svg"}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-2xl font-bold text-black">{selectedUser.name}</h3>
                  <p className="text-gray-900">{selectedUser.id}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-black font-semibold mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-900" />
                    <span className="text-black">{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-900" />
                    <span className="text-black">{selectedUser.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-900" />
                    <span className="text-black">{selectedUser.address}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-[#0095FF]">{selectedUser.totalBookings}</div>
                  <div className="text-gray-900 text-sm">Total Bookings</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">₹{selectedUser.totalSpent?.toLocaleString()}</div>
                  <div className="text-gray-900 text-sm">Total Spent</div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-black font-semibold mb-3">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Join Date</label>
                    <p className="text-black">{selectedUser.joinDate}</p>
                  </div>
                  <div>
                    <label className="block text-gray-900 text-sm mb-1">Last Login</label>
                    <p className="text-black">{selectedUser.lastLogin}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-[#2D3748]">
                <button className="px-4 py-2 text-gray-400 hover:text-black transition-colors">Send Email</button>
                <button className="px-4 py-2 text-gray-400 hover:text-black transition-colors">View Bookings</button>
                <button className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-50 rounded-xl p-6 w-full max-w-2xl border border-[#2D3748]">
            <h2 className="text-2xl font-bold text-black mb-6">Add New User</h2>
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Status</label>
                  <select
                    name="status"
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-2">Address</label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  placeholder="Enter address"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-900 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0095FF] hover:bg-[#0080E6] text-black px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
