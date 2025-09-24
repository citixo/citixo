"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Search, Filter, MoreVertical, Eye, EyeOff } from "lucide-react"
import { toast } from "react-toastify"

interface Category {
  _id: string
  categoryId: string
  name: string
  description: string
  icon: string
  image: string | null
  status: "Active" | "Inactive"
  displayOrder: number
  color: string
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All")
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#0095FF",
    displayOrder: 1,
    status: "Active" as "Active" | "Inactive"
  })

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      } else {
        toast.error("Failed to fetch categories")
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error("Error fetching categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Filter categories based on search and status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.categoryId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || category.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingCategory ? "Category updated successfully!" : "Category created successfully!")
        setShowModal(false)
        setEditingCategory(null)
        setFormData({
          name: "",
          description: "",
          icon: "",
          color: "#0095FF",
          displayOrder: 1,
          status: "Active"
        })
        fetchCategories()
      } else {
        toast.error(data.error || "Failed to save category")
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error("Error saving category")
    }
  }

  // Handle edit
  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      displayOrder: category.displayOrder,
      status: category.status
    })
    setShowModal(true)
  }

  // Handle delete
  const handleDelete = async (categoryId: string) => {
    // Show confirmation toast
    const confirmToast = toast(
      <div className="flex flex-col space-y-3">
        <div className="text-white font-medium">Delete Category</div>
        <div className="text-gray-300 text-sm">Are you sure you want to delete this category? This action cannot be undone.</div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(confirmToast)
              performDelete(categoryId)
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

  const performDelete = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Category deleted successfully!")
        fetchCategories()
      } else {
        toast.error(data.error || "Failed to delete category")
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error("Error deleting category")
    }
  }

  // Toggle status
  const toggleStatus = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          status: category.status === "Active" ? "Inactive" : "Active"
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Category ${category.status === "Active" ? "deactivated" : "activated"} successfully!`)
        fetchCategories()
      } else {
        toast.error(data.error || "Failed to update category status")
      }
    } catch (error) {
      console.error('Error updating category status:', error)
      toast.error("Error updating category status")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-black text-xl">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Categories Management</h1>
            <p className="text-gray-400">Manage service categories and their properties</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-600 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "Inactive")}
                className="bg-white border border-gray-600 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category._id} className="bg-white border border-gray-600 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{category.name}</h3>
                    <p className="text-gray-400 text-sm">ID: {category.categoryId}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.status === "Active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {category.status}
                  </span>
                  <div className="relative group">
                    <button className="p-1 hover:bg-white border border-gray-600 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-700" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-600 shadow-lg py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(category)}
                        className="w-full text-left px-4 py-2 text-gray-900 hover:bg-white  flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => toggleStatus(category)}
                        className="w-full text-left px-4 py-2 text-gray-900 hover:bg-white flex items-center space-x-2"
                      >
                        {category.status === "Active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{category.status === "Active" ? "Deactivate" : "Activate"}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="w-full text-left px-4 py-2 text-red-400 hover:bg-white  flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{category.description}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Order: {category.displayOrder}</span>
                <span>{new Date(category.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No categories found</div>
            <p className="text-gray-500 mt-2">
              {searchTerm || statusFilter !== "All" 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by creating your first category"
              }
            </p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-black mb-4">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-gray-600 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white border border-gray-600 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Icon</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      placeholder="🏠"
                      className="w-full bg-white  border border-gray-600 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="w-full h-10 bg-white  border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value)})}
                      className="w-full bg-white border border-gray-600 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as "Active" | "Inactive"})}
                      className="w-full bg-white border border-gray-600 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingCategory(null)
                      setFormData({
                        name: "",
                        description: "",
                        icon: "",
                        color: "#0095FF",
                        displayOrder: 1,
                        status: "Active"
                      })
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingCategory ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
