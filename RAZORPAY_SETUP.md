# Razorpay Payment Integration Setup

## Overview
This project now includes Razorpay payment integration for service bookings. Users must complete payment before their booking is confirmed.

## Setup Instructions

### 1. Environment Variables
Add the following to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

### 2. Get Razorpay Credentials
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings > API Keys
3. Generate API Keys
4. Copy the Key ID and Key Secret
5. Replace the placeholder values in `.env.local`

### 3. Features Implemented

#### Payment Flow
1. User fills booking form
2. Clicks "Proceed to Payment" button
3. Payment modal opens with order summary
4. Razorpay checkout opens
5. User completes payment
6. Payment is verified on server
7. Booking is created with payment status "Paid"
8. Success confirmation shown

#### API Endpoints
- `POST /api/payments/create-order` - Creates Razorpay order
- `POST /api/payments/verify-payment` - Verifies payment signature

#### Components
- `RazorpayPayment` - Reusable payment component
- Payment modal in booking page
- Updated success modal with payment confirmation

#### Database Changes
- Added `paymentDetails` field to `CitixoBookings` model
- Payment status tracking
- Booking status set to "Confirmed" after successful payment

### 4. Testing
1. Use Razorpay test mode for development
2. Test with Razorpay test cards
3. Verify payment flow end-to-end
4. Check booking creation with payment data

### 5. Production Deployment
1. Switch to live Razorpay keys
2. Update webhook URLs if needed
3. Test with real payment methods
4. Monitor payment success rates

## Security Notes
- Never expose Razorpay Key Secret on frontend
- Always verify payment signatures on server
- Use HTTPS in production
- Validate payment amounts on server

## Support
For Razorpay integration issues, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payment-gateway/web-integration/standard/)
