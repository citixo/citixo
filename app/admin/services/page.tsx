"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react"
import ImageUpload from "@/components/ImageUpload"
import { toast } from "react-toastify"



export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serviceImages, setServiceImages] = useState<any>()  
  const [includedServices, setIncludedServices] = useState<string[]>([])

  const [categories, setCategories] = useState<string[]>(["All"])

  // Fetch services and categories from API
  const fetchServices = async () => {
    try {
      setLoading(true)
      const [servicesResponse, categoriesResponse] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/categories")
      ])
      
      const [servicesResult, categoriesResult] = await Promise.all([
        servicesResponse.json(),
        categoriesResponse.json()
      ])

      if (servicesResult.success) {
        setServices(servicesResult.data)
      } else {
        console.error("Failed to fetch services:", servicesResult.error)
      }

      if (categoriesResult.success) {
        const categoryNames = categoriesResult.data.map((cat: any) => cat.name)
        setCategories(["All", ...categoryNames])
      } else {
        console.error("Failed to fetch categories:", categoriesResult.error)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Reset or populate images and included services when editing state changes
  useEffect(() => {
    if (editingService && editingService.images) {
      setServiceImages(editingService.images)
    } else {
      setServiceImages(null)
    }
    
    if (editingService && editingService.includedServices) {
      setIncludedServices(editingService.includedServices)
    } else {
      setIncludedServices([])
    }
  }, [editingService])

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "All" || service.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleDeleteService = async (id: string) => {
    // Show confirmation toast
    const confirmToast = toast(
      <div className="flex flex-col space-y-3">
        <div className="text-black font-medium">Delete Service</div>
        <div className="text-gray-900 text-sm">Are you sure you want to delete this service? This action cannot be undone.</div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(confirmToast)
              performDeleteService(id)
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

  const performDeleteService = async (id: string) => {
    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: "DELETE",
      })
      const result = await response.json()

      if (result.success) {
        toast.success("Service deleted successfully!")
        await fetchServices() // Refresh the list
      } else {
        toast.error("Failed to delete service: " + result.error)
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Failed to delete service")
    }
  }

  const handleToggleStatus = async (id: string) => {
    const service = services.find((s) => s.id === id)
    if (!service) return

    try {
      const response = await fetch("/api/services", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status: service.status === "Active" ? "Inactive" : "Active",
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Service status updated successfully!")
        await fetchServices() // Refresh the list
      } else {
        toast.error("Failed to update service: " + result.error)
      }
    } catch (error) {
      console.error("Error updating service:", error)
      toast.error("Failed to update service")
    }
  }

  console.log("serviceImages", serviceImages);
  
  const handleSubmitService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const serviceData = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      price: formData.get("price") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as string,
      href: formData.get("href") as string,
      images: serviceImages, // Convert to URL array for backward compatibility
      imageData: serviceImages, // Store full image data
      includedServices: includedServices
    }

    try {
      const url = editingService ? "/api/services" : "/api/services"
      const method = editingService ? "PUT" : "POST"
      const body = editingService ? { id: editingService.id, ...serviceData } : serviceData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        await fetchServices() // Refresh the list
        setShowAddModal(false)
        setEditingService(null)
        setServiceImages(null) // Reset images
        setIncludedServices([]) // Reset included services
      } else {
        toast.error("Failed to save service: " + result.error)
      }
    } catch (error) {
      console.error("Error saving service:", error)
      toast.error("Failed to save service")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading services...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Services</h1>
          <p className="text-gray-400 mt-2">Manage your home services ({services.length} total)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-[#2D3748]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#2D3748] rounded-lg pl-10 pr-4 py-2 text-black placeholder-gray-800 focus:outline-none focus:border-[#0095FF]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white  rounded-xl border border-[#2D3748] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white border-b border-[#2D3748]">
              <tr>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Service</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Category</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Price</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Status</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Bookings</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Rating</th>
                <th className="text-left py-4 px-6 text-gray-900 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id} className="border-b border-[#2D3748] hover:bg-slate-100 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={service?.image || "/placeholder.svg"}
                        alt={service.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-black font-medium">{service.name}</p>
                        <p className="text-gray-400 text-sm">{service.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-[#0095FF]/10 text-[#0095FF] px-2 py-1 rounded-full text-sm">
                      {service.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-black font-semibold">{service.price}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleToggleStatus(service.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        service.status === "Active" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {service.status}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-black">{service.bookings}</td>
                  <td className="py-4 px-6 text-black">⭐ {service.rating}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-[#0095FF] transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          console.log("service", service);
                          
                          setEditingService(service)}}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
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

      {/* Add/Edit Service Modal */}
      {(showAddModal || editingService) && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center  justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl  h-[80%] overflow-y-scroll border border-[#2D3748]">
            <h2 className="text-2xl font-bold text-black mb-6">
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>
            <form onSubmit={handleSubmitService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Service Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingService?.name || ""}
                    required
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    placeholder="Enter service name"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    defaultValue={editingService?.category || ""}
                    required
                    className="w-full bg-slate-50 border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  >
                    <option value="">Select category</option>
                    {categories.slice(1).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Price</label>
                  <input
                    type="text"
                    name="price"
                    defaultValue={editingService?.price || ""}
                    required
                    className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                    placeholder="₹299"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">Status</label>
                  <select
                    name="status"
                    defaultValue={editingService?.status || "Active"}
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
                  defaultValue={editingService?.description || ""}
                  required
                  rows={3}
                  className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  placeholder="Enter service description"
                />
              </div>
              
              {/* Included Services Section */}
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-2">Included Services</label>
                <div className="space-y-3">
                  {includedServices.map((service, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={service}
                        onChange={(e) => {
                          const newServices = [...includedServices]
                          newServices[index] = e.target.value
                          setIncludedServices(newServices)
                        }}
                        className="flex-1 bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                        placeholder="Enter included service"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newServices = includedServices.filter((_, i) => i !== index)
                          setIncludedServices(newServices)
                        }}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIncludedServices([...includedServices, ""])}
                    className="flex items-center space-x-2 text-[#0095FF] hover:text-[#0080E6] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Included Service</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-2">Service URL</label>
                <input
                  type="text"
                  name="href"
                  defaultValue={editingService?.href || ""}
                  className="w-full bg-white border border-[#2D3748] rounded-lg px-3 py-2 text-black focus:outline-none focus:border-[#0095FF]"
                  placeholder="/services/service-name (optional)"
                />
              </div>
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-2">Service Images</label>
                <div className="bg-white border border-[#2D3748] rounded-lg p-4">
                  <ImageUpload
                    onImagesChange={setServiceImages}
                    existingImages={editingService ? editingService.images :null}
                    maxImages={5}
                    folder="services"
                    transformations={{
                      quality: 'auto'
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingService(null)
                    setServiceImages([])
                    setIncludedServices([])
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
                  {submitting ? "Saving..." : editingService ? "Update Service" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
