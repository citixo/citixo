"use client"



import { useState, useEffect } from "react"

import Link from "next/link"

import { useRouter } from "next/navigation"

import { ArrowLeft, User, Mail, Calendar, Edit, Shield, Phone, MapPin, Crown, Settings, Eye, Camera, Bell, Lock, Activity } from "lucide-react"





interface UserData {

  id: string

  email: string

  name: string

  firstName: string

  lastName: string

  loginTime: string

  isAdmin?: boolean

  phone?: string

  address?: string

  city?: string

  state?: string

  zipCode?: string

  country?: string

  joinDate?: string

  totalBookings?: number

  totalSpent?: number

  emailVerified?: boolean

  phoneVerified?: boolean

  avatar?: string

  preferences?: {

    notifications: boolean

    emailNotifications: boolean

    smsNotifications: boolean

    language: string

    currency: string

  }

}



export default function ProfilePage() {

  const router = useRouter()

 

  const [user, setUser] = useState<UserData | null>(null)

  const [isEditing, setIsEditing] = useState(false)

  const [editForm, setEditForm] = useState({

    firstName: "",

    lastName: "",

    phone: "",

    address: {

      street: "",

      city: "",

      state: "",

      zipCode: "",

      country: "India"

    }

  })

  const [loading, setLoading] = useState(true)

  const [updateLoading, setUpdateLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)



  // Fetch user profile data

  useEffect(() => {

    const fetchUserProfile = async () => {

     



      try {

        setLoading(true)

        const response = await fetch('/api/user/me', {

          credentials: 'include'

        })



        const result = await response.json()



        if (result.success) {

          setUser(result.data)

          setEditForm({

            firstName: result.data.firstName || "",

            lastName: result.data.lastName || "",

            phone: result.data.phone || "",

            address: {

              street: result.data.address?.split(',')[0]?.trim() || "",

              city: result.data.city || "",

              state: result.data.state || "",

              zipCode: result.data.zipCode || "",

              country: result.data.country || "India"

            }

          })

        } else {

          console.error("Failed to fetch profile:", result.error)

        }

      } catch (error) {

        console.error('Error loading profile:', error)

      } finally {

        setLoading(false)

      }

    }



    fetchUserProfile()

  }, [])



  const handleSaveProfile = async () => {

    if (!user) return



    setUpdateLoading(true)

    try {

      const response = await fetch('/api/user/me', {

        method: 'PUT',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify(editForm),

        credentials: 'include'

      })



      const result = await response.json()



      if (result.success) {

        setUser(result.data)

        setIsEditing(false)

        

        // Notify header to update

        window.dispatchEvent(new Event('authChanged'))

        

        // Show success feedback

        console.log("Profile updated successfully")

      } else {

        console.error("Failed to update profile:", result.error)

        alert("Failed to update profile: " + result.error)

      }

    } catch (error) {

      console.error('Error updating profile:', error)

      alert("Failed to update profile")

    } finally {

      setUpdateLoading(false)

    }

  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setImageUploading(true)

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setUser(prev => prev ? { ...prev, avatar: result.data.avatar } : null)
        // Notify header to update
        window.dispatchEvent(new Event('authChanged'))
        console.log("Profile image updated successfully")
      } else {
        console.error("Failed to update profile image:", result.error)
        alert("Failed to update profile image: " + result.error)
      }
    } catch (error) {
      console.error('Error updating profile image:', error)
      alert("Failed to update profile image")
    } finally {
      setImageUploading(false)
    }
  }



  const getInitials = (name: string) => {

    return name

      .split(' ')

      .map(n => n[0])

      .join('')

      .toUpperCase()

      .slice(0, 2)

  }



  // Loading state

  if (loading) {

    return (

      <div className="min-h-screen bg-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-16 h-16 border-4 border-[#0095FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

          <p className="text-gray-600">Loading your profile...</p>

        </div>

      </div>

    )

  }



  // Not authenticated state

  if (!user) {

    return (

      <div className="min-h-screen bg-white text-black flex items-center justify-center">

        <div className="text-center max-w-md mx-auto p-8">

          <div className="w-20 h-20 bg-gradient-to-r from-[#0095FF] to-[#00D4FF] rounded-full flex items-center justify-center mx-auto mb-6">

            <Lock className="w-10 h-10 text-white" />

          </div>

          <h2 className="text-2xl font-bold mb-4 text-black">Access Restricted</h2>

          <p className="text-gray-600 mb-6">Please log in to view your profile and manage your account settings.</p>

          <Link href="/login" className="bg-gradient-to-r from-[#0095FF] to-[#00D4FF] hover:from-[#0080E6] hover:to-[#00B8E6] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">

            Login to Continue

          </Link>

        </div>

      </div>

    )

  }



  return (

    <div className="min-h-screen bg-white text-black">

      {/* Header with Gradient Background */}

      <div className="relative overflow-hidden">

        <div className="absolute inset-0"></div>

        <div className="relative container mx-auto px-4 py-12">

          <div className="flex items-center space-x-4 mb-6">

            <Link href="/" className="text-gray-600 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100">

              <ArrowLeft className="w-6 h-6" />

            </Link>

            <div>

              <h1 className="text-4xl font-bold text-black">

                Profile Dashboard

              </h1>

              <p className="text-gray-600 mt-1">Manage your account and preferences</p>

            </div>

          </div>

        </div>

      </div>



      <div className="container mx-auto px-4 pb-12 -mt-6">

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Enhanced Profile Card */}

          <div className="lg:col-span-1">

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl">

              <div className="text-center">

                {/* Profile Avatar with Admin Crown */}

                <div className="relative mb-6">

                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto shadow-lg overflow-hidden ${

                    user.isAdmin 

                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 

                      : 'bg-gradient-to-r from-[#0095FF] to-[#00D4FF]'

                  }`}>

                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      getInitials(user.name)
                    )}

                  </div>

                  

                  {user.isAdmin && (

                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">

                      <Crown className="w-5 h-5 text-white" />

                    </div>

                  )}

                  

                  {/* Edit Avatar Button */}

                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#0095FF] hover:bg-[#0080E6] rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer">

                    <Camera className="w-5 h-5 text-white" />

                    <input

                      type="file"

                      accept="image/*"

                      onChange={handleImageUpload}

                      disabled={imageUploading}

                      className="hidden"

                    />

                  </label>

                  {imageUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                </div>

                

                {isEditing ? (

                  <div className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <input

                        type="text"

                        value={editForm.firstName}

                        onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}

                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/50 transition-all"

                        placeholder="First Name"

                      />

                      <input

                        type="text"

                        value={editForm.lastName}

                        onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}

                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/50 transition-all"

                        placeholder="Last Name"

                      />

                    </div>

                    <input

                      type="tel"

                      value={editForm.phone}

                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}

                      className="w-full bg-slate-50 backdrop-blur-sm border border-[#374151] rounded-xl px-4 py-3 text-black focus:outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/50 transition-all"

                      placeholder="Phone Number"

                    />

                    <input

                      type="text"

                      value={editForm.address.street}

                      onChange={(e) => setEditForm(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}

                      className="w-full bg-slate-50  backdrop-blur-sm border border-[#374151] rounded-xl px-4 py-3 text-black focus:outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/50 transition-all"

                      placeholder="Street Address"

                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      <input

                        type="text"

                        value={editForm.address.city}

                        onChange={(e) => setEditForm(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}

                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/50 transition-all"

                        placeholder="City"

                      />

                      <input

                        type="text"

                        value={editForm.address.state}

                        onChange={(e) => setEditForm(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}

                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/50 transition-all"

                        placeholder="State"

                      />

                      <input

                        type="text"

                        value={editForm.address.zipCode}

                        onChange={(e) => setEditForm(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))}

                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-[#0095FF] focus:ring-2 focus:ring-[#0095FF]/50 transition-all"

                        placeholder="ZIP Code"

                      />

                    </div>

                    <div className="flex space-x-3">

                      <button

                        onClick={handleSaveProfile}

                        disabled={updateLoading}

                        className="flex-1 bg-gradient-to-r from-[#0095FF] to-[#00D4FF] hover:from-[#0080E6] hover:to-[#00B8E6] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"

                      >

                        {updateLoading ? "Saving..." : "Save"}

                      </button>

                      <button

                        onClick={() => {

                          setIsEditing(false)

                          setEditForm({

                            firstName: user.firstName || "",

                            lastName: user.lastName || "",

                            phone: user.phone || "",

                            address: {

                              street: user.address?.split(',')[0]?.trim() || "",

                              city: user.city || "",

                              state: user.state || "",

                              zipCode: user.zipCode || "",

                              country: user.country || "India"

                            }

                          })

                        }}

                        className="flex-1 bg-gray-600/80 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm"

                      >

                        Cancel

                      </button>

                    </div>

                  </div>

                ) : (

                  <div>

                    <div className="flex items-center justify-center space-x-2 mb-3">

                      <h2 className="text-2xl font-bold text-black">{user.name}</h2>

                      {user.isAdmin && (

                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg">

                          ADMIN

                        </span>

                      )}

                    </div>

                    <p className="text-gray-600 mb-2">{user.email}</p>

                    <div className="flex items-center justify-center space-x-1 text-green-400 text-sm mb-6">

                      <Activity className="w-4 h-4" />

                      <span>Online</span>

                    </div>

                    <button

                      onClick={() => {

                        setIsEditing(true)

                        setEditForm({

                          firstName: user.firstName || "",

                          lastName: user.lastName || "",

                          phone: user.phone || "",

                          address: {

                            street: user.address?.split(',')[0]?.trim() || "",

                            city: user.city || "",

                            state: user.state || "",

                            zipCode: user.zipCode || "",

                            country: user.country || "India"

                          }

                        })

                      }}

                      className="bg-gray-200 hover:bg-gray-300 text-black px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 mx-auto hover:scale-105 shadow-lg"

                    >

                      <Edit className="w-4 h-4" />

                      <span>Edit Profile</span>

                    </button>

                  </div>

                )}

              </div>

            </div>



            {/* Quick Stats Card */}

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xl mt-6">

              <h3 className="text-lg font-bold mb-4 text-center text-black">Quick Stats</h3>

              <div className="space-y-3">

                <div className="flex justify-between items-center">

                  <span className="text-gray-600 text-sm">Account Type</span>

                  <span className={`font-medium ${user.isAdmin ? 'text-purple-400' : 'text-blue-400'}`}>

                    {user.isAdmin ? 'Administrator' : 'User'}

                  </span>

                </div>

                <div className="flex justify-between items-center">

                  <span className="text-gray-600 text-sm">Status</span>

                  <span className="text-green-400 font-medium">Active</span>

                </div>

                <div className="flex justify-between items-center">

                  <span className="text-gray-600 text-sm">Member Since</span>

                  <span className="text-black font-medium">Jan 2024</span>

                </div>

              </div>

            </div>

          </div>



          {/* Enhanced Profile Details */}

          <div className="lg:col-span-3 space-y-6">

            {/* Personal Information Card */}

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-2xl">

              <div className="flex items-center space-x-3 mb-8">

                <div className="w-10 h-10 bg-gradient-to-r from-[#0095FF] to-[#00D4FF] rounded-xl flex items-center justify-center">

                  <User className="w-5 h-5 text-white" />

                </div>

                <h3 className="text-2xl font-bold text-black">Personal Information</h3>

              </div>

              

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="group">

                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#0095FF]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">

                    <div className="w-12 h-12 bg-gradient-to-r from-[#0095FF] to-[#00D4FF] rounded-xl flex items-center justify-center shadow-lg">

                      <User className="w-6 h-6 text-white" />

                    </div>

                    <div className="flex-1">

                      <p className="text-sm text-gray-600 font-medium">Full Name</p>

                      <p className="text-black font-bold text-lg">{user.name}</p>

                    </div>

                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-[#0095FF] transition-colors" />

                  </div>

                </div>



                <div className="group">

                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#0095FF]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">

                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">

                      <Mail className="w-6 h-6 text-white" />

                    </div>

                    <div className="flex-1">

                      <p className="text-sm text-gray-600 font-medium">Email Address</p>

                      <p className="text-black font-bold text-lg">{user.email}</p>

                    </div>

                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />

                  </div>

                </div>



                <div className="group">

                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#0095FF]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">

                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">

                      <Phone className="w-6 h-6 text-white" />

                    </div>

                    <div className="flex-1">

                      <p className="text-sm text-gray-600 font-medium">Phone Number</p>

                      <p className="text-black font-bold text-lg">{user.phone}</p>

                    </div>

                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />

                  </div>

                </div>



                <div className="group">

                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#0095FF]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">

                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">

                      <MapPin className="w-6 h-6 text-white" />

                    </div>

                    <div className="flex-1">

                      <p className="text-sm text-gray-600 font-medium">Location</p>

                      <p className="text-black font-bold text-lg">{user.city}</p>

                      <p className="text-gray-600 text-sm">{user.address}</p>

                    </div>

                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" />

                  </div>

                </div>



                <div className="group">

                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#0095FF]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">

                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">

                      <Calendar className="w-6 h-6 text-white" />

                    </div>

                    <div className="flex-1">

                      <p className="text-sm text-gray-600 font-medium">Member Since</p>

                      <p className="text-black font-bold text-lg">

                        {user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', {

                          year: 'numeric',

                          month: 'long',

                          day: 'numeric'

                        }) : 'January 15, 2024'}

                      </p>

                    </div>

                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />

                  </div>

                </div>



                <div className="group">

                    <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#0095FF]/50 transition-all duration-300 hover:scale-105 hover:shadow-lg">

                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${

                      user.isAdmin 

                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 

                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'

                    }`}>

                      {user.isAdmin ? <Crown className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}

                    </div>

                    <div className="flex-1">

                      <p className="text-sm text-gray-600 font-medium">Account Type</p>

                      <div className="flex items-center space-x-2">

                        <p className={`font-bold text-lg ${user.isAdmin ? 'text-purple-400' : 'text-blue-400'}`}>

                          {user.isAdmin ? 'Administrator' : 'Standard User'}

                        </p>

                        <span className="text-green-400 font-medium text-sm bg-green-400/20 px-2 py-1 rounded-full">

                          Active

                        </span>

                      </div>

                    </div>

                    <Eye className={`w-5 h-5 text-gray-400 group-hover:${user.isAdmin ? 'text-purple-400' : 'text-blue-400'} transition-colors`} />

                  </div>

                </div>

              </div>

            </div>



            {/* Enhanced Quick Actions */}

            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-2xl">

              <div className="flex items-center space-x-3 mb-8">

                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">

                  <Activity className="w-5 h-5 text-white" />

                </div>

                <h3 className="text-2xl font-bold text-black">Quick Actions</h3>

              </div>

              

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {!user.isAdmin && (

                  <Link

                    href="/orders"

                    className="group relative overflow-hidden bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-[#0095FF]/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"

                  >

                    <div className="absolute inset-0 bg-gradient-to-r from-[#0095FF]/10 to-[#00D4FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative">

                      <div className="w-14 h-14 bg-gradient-to-r from-[#0095FF] to-[#00D4FF] rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">

                        <User className="w-7 h-7 text-white" />

                      </div>

                      <h4 className="text-black font-bold text-lg mb-2">My Orders</h4>

                      <p className="text-gray-600 text-sm">View your booking history and track services</p>

                    </div>

                  </Link>

                )}



                <Link

                  href="/settings"

                  className="group relative overflow-hidden bg-gradient-to-br bg-gray-50  rounded-2xl p-6 border border-[#374151] hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"

                >

                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative">

                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">

                      <Settings className="w-7 h-7 text-white" />

                    </div>

                    <h4 className="text-black font-bold text-lg mb-2">Settings</h4>

                    <p className="text-gray-600 text-sm">Manage your account preferences and privacy</p>

                  </div>

                </Link>



                <Link

                  href="/notifications"

                  className="group relative overflow-hidden bg-gradient-to-br bg-gray-50  rounded-2xl p-6 border border-[#374151] hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"

                >

                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative">

                    <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">

                      <Bell className="w-7 h-7 text-white" />

                    </div>

                    <h4 className="text-black font-bold text-lg mb-2">Notifications</h4>

                    <p className="text-gray-600 text-sm">Manage your notification preferences</p>

                  </div>

                </Link>



                {user.isAdmin && (

                  <Link

                    href="/admin"

                    className="group relative overflow-hidden bg-gradient-to-br bg-gray-50  rounded-2xl p-6 border border-[#374151] hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"

                  >

                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative">

                      <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">

                        <Crown className="w-7 h-7 text-white" />

                      </div>

                      <h4 className="text-black font-bold text-lg mb-2">Admin Panel</h4>

                      <p className="text-gray-600 text-sm">Access administrative controls and dashboard</p>

                    </div>

                  </Link>

                )}



                <Link

                  href="/help"

                  className="group relative overflow-hidden bg-gradient-to-br bg-gray-50  rounded-2xl p-6 border border-[#374151] hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"

                >

                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative">

                    <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">

                      <Shield className="w-7 h-7 text-white" />

                    </div>

                    <h4 className="text-black font-bold text-lg mb-2">Support</h4>

                    <p className="text-gray-600 text-sm">Get help and contact customer support</p>

                  </div>

                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  )

}