"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react"
import { toast } from "react-toastify"


export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch plans from API
  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/plans")
      const result = await response.json()

      if (result.success) {
        setPlans(result.data)
      } else {
        console.error("Failed to fetch plans:", result.error)
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeletePlan = async (id: string) => {
    // Show confirmation toast
    const confirmToast = toast(
      <div className="flex flex-col space-y-3">
        <div className="text-white font-medium">Delete Plan</div>
        <div className="text-gray-300 text-sm">Are you sure you want to delete this plan? This action cannot be undone.</div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(confirmToast)
              performDeletePlan(id)
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

  const performDeletePlan = async (id: string) => {
    try {
      const response = await fetch(`/api/plans?id=${id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (result.success) {
        toast.success("Plan deleted successfully!")
        await fetchPlans() // Refresh the list
      } else {
        toast.error("Failed to delete plan: " + result.error)
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
      toast.error("Failed to delete plan")
    }
  }

  const handleToggleStatus = async (id: string) => {
    const plan = plans.find((p) => p.id === id)
    if (!plan) return

    try {
      const response = await fetch("/api/plans", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: id,
          status: plan.status === "Active" ? "Inactive" : "Active",
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchPlans() // Refresh the list
      } else {
        toast.error("Failed to update plan: " + result.error)
      }
    } catch (error) {
      console.error("Error updating plan:", error)
      toast.error("Failed to update plan")
    }
  }

  const handleTogglePopular = async (id: string) => {
    const plan = plans.find((p) => p.id === id)
    if (!plan) return

    try {
      const response = await fetch("/api/plans", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: id,
          popular: !plan.popular,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchPlans() // Refresh the list
      } else {
        toast.error("Failed to update plan: " + result.error)
      }
    } catch (error) {
      console.error("Error updating plan:", error)
      toast.error("Failed to update plan")
    }
  }

  const handleSubmitPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const featuresText = formData.get("features") as string
    const features = featuresText.split("\n").filter((f) => f.trim())

    const planData = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      period: formData.get("period") as string,
      description: formData.get("description") as string,
      features,
      status: formData.get("status") as string,
      popular: formData.get("popular") === "on",
    }

    try {
      const url = editingPlan ? "/api/plans" : "/api/plans"
      const method = editingPlan ? "PUT" : "POST"
      const body = editingPlan ? { planId: editingPlan.id, ...planData } : planData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        await fetchPlans() // Refresh the list
        setShowAddModal(false)
        setEditingPlan(null)
      } else {
        toast.error("Failed to save plan: " + result.error)
      }
    } catch (error) {
      console.error("Error saving plan:", error)
      toast.error("Failed to save plan")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black text-xl">Loading plans...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Subscription Plans</h1>
          <p className="text-gray-400 mt-2">Manage your subscription plans ({plans.length} total)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Plan</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 border border-[#2D3748]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#2D3748] rounded-lg pl-10 pr-4 py-2 text-black placeholder-gray-400 focus:outline-none focus:border-[#0095FF]"
          />
        </div>
      </div>
      
      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.planId}
            className={`bg-slate-50 rounded-xl p-6 border transition-all hover:scale-105 ${
              plan.popular ? "border-[#0095FF] ring-2 ring-[#0095FF]/20" : "border-[#2D3748]"
            }`}
          >
            {plan.popular && (
              <div className="bg-[#0095FF] text-black px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                Most Popular
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
              <p className="text-gray-700 text-sm">{plan.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-black">₹{plan.price}</span>
                <span className="text-gray-900 ml-1">/{plan.period}</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-800 text-sm">Subscribers</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-[#0095FF]" />
                  <span className="text-white font-semibold">{plan.subscribers}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-800 text-sm">Status</span>
                <button
                  onClick={() => handleToggleStatus(plan.id)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    plan.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {plan.status}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-black font-medium mb-3">Features:</h4>
              <ul className="space-y-2">
                {plan.features.slice(0, 3).map((feature: any, index: any) => (
                  <li key={index} className="text-gray-900 text-sm flex items-start">
                    <span className="text-[#0095FF] mr-2">✓</span>
                    {feature}
                  </li>
                ))}
                {plan.features.length > 3 && (
                  <li className="text-gray-400 text-sm">+{plan.features.length - 3} more features</li>
                )}
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2D3748]">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTogglePopular(plan.id)}
                  className={`text-xs px-2 py-1 rounded ${
                    plan.popular
                      ? "bg-yellow-500/10 text-yellow-500"
                      : "bg-gray-500/10 text-gray-900 hover:text-yellow-500"
                  }`}
                >
                  {plan.popular ? "Popular" : "Set Popular"}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-[#0095FF] transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Plan Modal */}
      {(showAddModal || editingPlan) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-slate-50 rounded-xl p-6 w-full max-w-2xl border border-[#2D3748] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-black mb-6">{editingPlan ? "Edit Plan" : "Add New Plan"}</h2>
            <form onSubmit={handleSubmitPlan} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Plan Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingPlan?.name || ""}
                    required
                    className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    placeholder="Enter plan name"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingPlan?.price || ""}
                    required
                    className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    placeholder="999"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Period</label>
                  <select
                    name="period"
                    defaultValue={editingPlan?.period || "month"}
                    className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  >
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Status</label>
                  <select
                    name="status"
                    defaultValue={editingPlan?.status || "Active"}
                    className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingPlan?.description || ""}
                  required
                  rows={3}
                  className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  placeholder="Enter plan description"
                />
              </div>
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-2">Features (one per line)</label>
                <textarea
                  name="features"
                  defaultValue={editingPlan?.features.join("\n") || ""}
                  required
                  rows={6}
                  className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  placeholder="2 cleaning sessions per month&#10;Basic customer support&#10;10% discount on repair services"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="popular"
                  name="popular"
                  defaultChecked={editingPlan?.popular || false}
                  className="w-4 h-4 text-[#0095FF] bg-white border-[#2D3748] rounded focus:ring-[#0095FF]"
                />
                <label htmlFor="popular" className="text-gray-900 text-sm">
                  Mark as popular plan
                </label>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingPlan(null)
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
                  {submitting ? "Saving..." : editingPlan ? "Update Plan" : "Add Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
