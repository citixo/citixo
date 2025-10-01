"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Settings, Users, Calendar, Package, Menu, X, LogOut, Home, User, FolderOpen, Tag } from "lucide-react"
import Brand from "@/components/Brand"
import { toast } from "react-toastify"

interface AdminUser {
  email: string
  name: string
  loginTime: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  const [loading, setLoading] = useState(false) 
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024 // lg breakpoint
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    // Set initial state
    checkAuth()
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


   const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (!data.email || data.userType !== 'admin') {
          toast.error("No addmin access. Please log in with an admin account.", {
            position: "top-right",
            autoClose: 5000,
          });
          router.push("/");
          return;
        }

        

      } catch (error) {
        console.error("Error checking auth:", error);
        toast.error("Something went wrong. Please try again.");
      }
    };
 

  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side httpOnly cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Show success toast
        toast.success("Successfully logged out!", {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Emit custom event to notify header component
        window.dispatchEvent(new Event('authChanged'))
        
        // Redirect to login page
        router.push("/login")
      } else {
        console.error('Logout failed');
        // Show error toast
        toast.error("Logout failed. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
        
        // Fallback: try to clear cookies manually and redirect
        document.cookie = "adminuser=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "userType=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "name=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        document.cookie = "userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        
        window.dispatchEvent(new Event('authChanged'))
        router.push("/login")
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Show error toast
      toast.error("Logout error. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
      
      // Fallback: try to clear cookies manually and redirect
      document.cookie = "adminuser=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      document.cookie = "userType=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      document.cookie = "email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      document.cookie = "name=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      document.cookie = "userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
      
      window.dispatchEvent(new Event('authChanged'))
      router.push("/login")
    }
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: FolderOpen },
    { name: "Services", href: "/admin/services", icon: Settings },
    { name: "Plans", href: "/admin/plans", icon: Package },
    { name: "Coupons", href: "/admin/coupons", icon: Tag },
    { name: "Bookings", href: "/admin/bookings", icon: Calendar },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    )
  }

 

  return (
    <div className="min-h-screen bg-white ">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white  transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-white ">
          <Brand />
          
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-full transition-all duration-200"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-700 hover:text-white"
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info and logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center mb-4">
           
          </div>
          <div className="space-y-2">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm text-gray-900  hover:text-black rounded-lg transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Website
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-900 hover:text-black rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}`}>
        {/* Top bar */}
        <div className="bg-white border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="flex items-center space-x-2 text-gray-400 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200"
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <Menu className={`w-5 h-5 transform transition-transform duration-200 ${sidebarOpen ? 'rotate-90' : 'rotate-0'}`} />
                <span className="text-sm font-medium hidden sm:block">
                  {sidebarOpen ? "Hide Menu" : "Show Menu"}
                </span>
              </button>
              <div className="h-6 w-px bg-gray-600 hidden sm:block"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <h2 className="text-lg font-semibold text-black capitalize">
                  {pathname === '/admin' ? 'Dashboard' : pathname.split('/').pop()?.replace('-', ' ')}
                </h2>
                <span className="text-gray-400 text-sm">Welcome back, {user?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
