// Export all Citixo models
export { default as CitixoUsers } from './CitixoUsers'
export { default as CitixoServices } from './CitixoServices'
export { default as CitixoServiceCategories } from './CitixoServiceCategories'
export { default as CitixoBookings } from './CitixoBookings'
export { default as CitixoPlans } from './CitixoPlans'
export { default as CitixoUserPlans } from './CitixoUserPlans'
export { default as CitixoReviews } from './CitixoReviews'
export { default as CitixoPayments } from './CitixoPayments'
export { default as CitixoSettings } from './CitixoSettings'
export { default as CitixoHelp } from './CitixoHelp'
export { default as Citixootps } from './Citixootps'
export { default as CitixoCoupons } from './CitixoCoupons'

// Keep the old model for backward compatibility during migration
export { default as CitixoData } from './CitixoData'

// Database relationship types
export interface DatabaseRelationships {
  // One-to-Many
  UserToBookings: 'CitixoUsers -> CitixoBookings[]'
  ServiceToBookings: 'CitixoServices -> CitixoBookings[]'
  CategoryToServices: 'CitixoServiceCategories -> CitixoServices[]'
  UserToReviews: 'CitixoUsers -> CitixoReviews[]'
  ServiceToReviews: 'CitixoServices -> CitixoReviews[]'
  BookingToReview: 'CitixoBookings -> CitixoReviews'
  UserToPayments: 'CitixoUsers -> CitixoPayments[]'
  
  // Many-to-Many (through junction table)
  UserToPlans: 'CitixoUsers <-> CitixoPlans (via CitixoUserPlans)'
  
  // Self-referencing
  UserToProfessional: 'CitixoUsers -> CitixoUsers (professional assignment)'
}

// Collection naming convention
export const COLLECTION_NAMES = {
  USERS: 'CitixoUsers',
  SERVICES: 'CitixoServices', 
  SERVICE_CATEGORIES: 'CitixoServiceCategories',
  BOOKINGS: 'CitixoBookings',
  PLANS: 'CitixoPlans',
  USER_PLANS: 'CitixoUserPlans',
  REVIEWS: 'CitixoReviews',
  PAYMENTS: 'CitixoPayments',
  HELP: 'CitixoHelp',
  OTPS: 'Citixootps',
  COUPONS: 'CitixoCoupons',
  // Legacy
  DATA: 'CitixoData'
} as const
