import type React from "react"
// Core Types
export interface User {
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
  avatar?: string
}

export interface Service {
  id: string
  name: string
  category: string
  price: string
  description: string
  status: "Active" | "Inactive"
  bookings: number
  rating: number
  image?: string
  createdAt: string
}

export interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string[]
  status: "Active" | "Inactive"
  subscribers: number
  popular: boolean
  createdAt: string
}

export interface Booking {
  id: string
  customer: {
    name: string
    phone: string
    email: string
    address: string
  }
  service: string
  date: string
  time: string
  amount: number
  status: "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled"
  professional: string
  notes: string
  createdAt: string
}

export interface AdminUser {
  email: string
  name: string
  loginTime: string
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
  remember?: boolean
}

export interface UserFormData {
  name: string
  email: string
  phone: string
  address: string
  status: "Active" | "Inactive" | "Blocked"
}

export interface ServiceFormData {
  name: string
  category: string
  price: string
  description: string
  status: "Active" | "Inactive"
  image?: File
}

export interface PlanFormData {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  status: "Active" | "Inactive"
  popular: boolean
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Component Props Types
export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  render?: (value: any, item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  onSort?: (key: string, direction: "asc" | "desc") => void
  className?: string
}
