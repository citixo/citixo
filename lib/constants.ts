export const APP_CONFIG = {
  name: "Citixo",
  description: "Professional Home Services",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supportPhone: "1800-123-4567",
  supportEmail: "support@citixo.com",
} as const

export const ROUTES = {
  HOME: "/",
  SERVICES: "/services",
  PLANS: "/plans",
  HELP: "/help",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin",
    SERVICES: "/admin/services",
    PLANS: "/admin/plans",
    BOOKINGS: "/admin/bookings",
    USERS: "/admin/users",
    SETTINGS: "/admin/settings",
  },
} as const

export const SERVICE_CATEGORIES = ["Cleaning", "Appliance Repair", "Maintenance", "Beauty", "Painting"] as const

export const USER_STATUSES = ["Active", "Inactive", "Blocked"] as const
export const BOOKING_STATUSES = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"] as const
export const SERVICE_STATUSES = ["Active", "Inactive"] as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

export const AUTH_CONFIG = {
  STORAGE_KEY: "adminAuth",
  USER_STORAGE_KEY: "adminUser",
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
} as const
