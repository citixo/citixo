"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Filter, Copy, CheckCircle, XCircle } from "lucide-react"
import { toast } from "react-toastify"

interface Coupon {
  _id: string
  code: string
  discountPercentage: number
  startDate: string
  expiryDate: string
  isActive: boolean
  usageCount: number
  usedBy: Array<{
    userId: string
    bookingId: string
    usedAt: string
  }>
  description?: string
  createdAt: string
  updatedAt: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Fetch coupons from API
  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/coupons")
      const result = await response.json()

      if (result.success) {
        setCoupons(result.data)
      } else {
        console.error("Failed to fetch coupons:", result.error)
        toast.error("Failed to fetch coupons")
      }
    } catch (error) {
      console.error("Error fetching coupons:", error)
      toast.error("Failed to fetch coupons")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === "All" || 
                         (filterStatus === "Active" && coupon.isActive) ||
                         (filterStatus === "Inactive" && !coupon.isActive) ||
                         (filterStatus === "Expired" && new Date(coupon.expiryDate) < new Date())
    return matchesSearch && matchesStatus
  })

  const handleDeleteCoupon = async (id: string) => {
    const confirmToast = toast(
      <div className="flex flex-col space-y-3">
        <div className="text-black font-medium">Delete Coupon</div>
        <div className="text-gray-900 text-sm">Are you sure you want to delete this coupon? This action cannot be undone.</div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(confirmToast)
              performDeleteCoupon(id)
            }}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(confirmToast)}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-black text-sm rounded transition-colors"
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

  const performDeleteCoupon = async (id: string) => {
    try {
      const response = await fetch(`/api/coupons?id=${id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (result.success) {
        toast.success("Coupon deleted successfully!")
        await fetchCoupons()
      } else {
        toast.error("Failed to delete coupon: " + result.error)
      }
    } catch (error) {
      console.error("Error deleting coupon:", error)
      toast.error("Failed to delete coupon")
    }
  }

  const handleToggleStatus = async (id: string) => {
    const coupon = coupons.find((c) => c._id === id)
    if (!coupon) return

    try {
      const response = await fetch("/api/coupons", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          isActive: !coupon.isActive,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Coupon status updated successfully!")
        await fetchCoupons()
      } else {
        toast.error("Failed to update coupon: " + result.error)
      }
    } catch (error) {
      console.error("Error updating coupon:", error)
      toast.error("Failed to update coupon")
    }
  }

  const handleSubmitCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const couponData = {
      code: formData.get("code") as string,
      discountPercentage: Number(formData.get("discountPercentage")),
      startDate: formData.get("startDate") as string,
      expiryDate: formData.get("expiryDate") as string,
      description: formData.get("description") as string,
    }

    try {
      const url = "/api/coupons"
      const method = editingCoupon ? "PUT" : "POST"
      const body = editingCoupon ? { id: editingCoupon._id, ...couponData } : couponData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(editingCoupon ? "Coupon updated successfully!" : "Coupon created successfully!")
        await fetchCoupons()
        setShowAddModal(false)
        setEditingCoupon(null)
      } else {
        toast.error("Failed to save coupon: " + result.error)
      }
    } catch (error) {
      console.error("Error saving coupon:", error)
      toast.error("Failed to save coupon")
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success("Coupon code copied to clipboard!")
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error("Failed to copy coupon code")
    }
  }

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.isActive) return "bg-gray-500/10 text-gray-500"
    const now = new Date()
    const start = new Date(coupon.startDate)
    const expiry = new Date(coupon.expiryDate)
    
    if (now < start) return "bg-yellow-500/10 text-yellow-500"
    if (now > expiry) return "bg-red-500/10 text-red-500"
    return "bg-green-500/10 text-green-500"
  }

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.isActive) return "Inactive"
    const now = new Date()
    const start = new Date(coupon.startDate)
    const expiry = new Date(coupon.expiryDate)
    
    if (now < start) return "Not Started"
    if (now > expiry) return "Expired"
    return "Active"
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const isNotStarted = (startDate: string) => {
    return new Date(startDate) > new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading coupons...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Coupon Codes</h1>
          <p className="text-gray-400 mt-2">Manage discount coupons ({coupons.length} total)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Coupon</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-[#2D3748]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#2D3748] rounded-lg pl-10 pr-4 py-2 text-black placeholder-gray-800 focus:outline-none focus:border-[#0095FF]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-[#2D3748] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-[#2D3748]">
              <tr>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Code</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Discount</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Start Date</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Expiry Date</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Status</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Usage</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Used By</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Description</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-[#2D3748] hover:bg-slate-100 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-black font-mono font-bold text-lg">{coupon.code}</span>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="text-gray-400 hover:text-[#0095FF] transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === coupon.code ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-[#0095FF]/10 text-[#0095FF] px-2 py-1 rounded-full text-sm font-medium">
                      {coupon.discountPercentage}% OFF
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-black">
                      {new Date(coupon.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {isNotStarted(coupon.startDate) ? "Not Started" : "Started"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-black">
                      {new Date(coupon.expiryDate).toLocaleDateString()}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {isExpired(coupon.expiryDate) ? "Expired" : "Valid"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleStatus(coupon._id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(coupon)}`}
                    >
                      {getStatusText(coupon)}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-black">
                    <div className="text-sm">
                      {coupon.usageCount} uses
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      {coupon.usedBy && coupon.usedBy.length > 0 ? (
                        <div className="space-y-1">
                          {coupon.usedBy.slice(0, 2).map((usage, index) => (
                            <div key={index} className="text-gray-600 text-xs">
                              {usage.userId} ({new Date(usage.usedAt).toLocaleDateString()})
                            </div>
                          ))}
                          {coupon.usedBy.length > 2 && (
                            <div className="text-gray-400 text-xs">
                              +{coupon.usedBy.length - 2} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not used</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-400 text-sm max-w-xs truncate">
                      {coupon.description || "No description"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingCoupon(coupon)}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                        title="Edit coupon"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete coupon"
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

      {/* Add/Edit Coupon Modal */}
      {(showAddModal || editingCoupon) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl border border-[#2D3748]">
            <h2 className="text-2xl font-bold text-black mb-6">
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h2>
            <form onSubmit={handleSubmitCoupon} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Coupon Code (6 characters)</label>
                  <input
                    type="text"
                    name="code"
                    defaultValue={editingCoupon?.code || ""}
                    required
                    pattern="[A-Z0-9]{6}"
                    maxLength={6}
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF] font-mono text-center text-lg uppercase"
                    placeholder="DAMN22"
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase()
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter exactly 6 alphanumeric characters (e.g., DAMN22)</p>
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Discount Percentage</label>
                  <input
                    type="number"
                    name="discountPercentage"
                    defaultValue={editingCoupon?.discountPercentage || ""}
                    required
                    min="1"
                    max="100"
                    step="0.01"
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    placeholder="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">1-100% (decimals allowed)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    defaultValue={editingCoupon ? new Date(editingCoupon.startDate).toISOString().slice(0, 16) : ""}
                    required
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  />
                  <p className="text-xs text-gray-500 mt-1">When the coupon becomes valid</p>
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="datetime-local"
                    name="expiryDate"
                    defaultValue={editingCoupon ? new Date(editingCoupon.expiryDate).toISOString().slice(0, 16) : ""}
                    required
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  />
                  <p className="text-xs text-gray-500 mt-1">When the coupon expires</p>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-2">Description (optional)</label>
                <textarea
                  name="description"
                  defaultValue={editingCoupon?.description || ""}
                  rows={3}
                  maxLength={500}
                  className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  placeholder="Enter coupon description..."
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingCoupon(null)
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingCoupon ? "Update Coupon" : "Add Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
