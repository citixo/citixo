"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("AuthGuard - isLoading:", isLoading, "isAuthenticated:", isAuthenticated) // Debug log

    if (!isLoading && !isAuthenticated) {
      console.log("Redirecting to login") // Debug log
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111B22] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0095FF]/30 border-t-[#0095FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111B22] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#0095FF]/30 border-t-[#0095FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Show admin content if authenticated
  return <>{children}</>
}
