"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react"
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import Brand from "@/components/Brand"

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  otp: string
}

interface ValidationErrors {
  general?: string[]
}

// Validation schemas
const signupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  otp: Yup.string()
    .length(6, 'OTP must be exactly 6 digits')
    .matches(/^\d{6}$/, 'OTP must contain only numbers')
    .required('OTP is required')
})

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [successMessage, setSuccessMessage] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [otpExpiryTime, setOtpExpiryTime] = useState<Date | null>(null)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailChecked, setEmailChecked] = useState(false)
  const [lastCheckedEmail, setLastCheckedEmail] = useState("")
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [otpValidated, setOtpValidated] = useState(false)
  const checkingEmailRef = useRef(false)
  const lastRequestTimeRef = useRef(0)
  const router = useRouter()

  // OTP Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpExpiryTime) {
      interval = setInterval(() => {
        const now = new Date()
        const remaining = Math.max(0, Math.floor((otpExpiryTime.getTime() - now.getTime()) / 1000))
        setOtpTimer(remaining)
        
        if (remaining === 0) {
          setOtpSent(false)
          setOtpExpiryTime(null)
          setOtpValidated(false)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpExpiryTime])

  // Check email uniqueness and send OTP automatically
  const checkEmailAndSendOTP = async (email: string, firstName: string) => {
    if (!email || !firstName || checkingEmailRef.current) return

    // Rate limiting: Don't make requests more than once every 5 seconds
    const now = Date.now()
    if (now - lastRequestTimeRef.current < 5000) {
      console.log('Rate limited: Too soon since last request')
      setIsRateLimited(true)
      setTimeout(() => setIsRateLimited(false), 5000 - (now - lastRequestTimeRef.current))
      return
    }

    checkingEmailRef.current = true
    lastRequestTimeRef.current = now
    setIsCheckingEmail(true)
    setLastCheckedEmail(email)
    setErrors({})

    try {
      // First check if email already exists
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const checkData = await checkResponse.json()

      if (!checkData.success) {
        setErrors({ general: [checkData.error || "Failed to check email"] })
        return
      }

      if (checkData.exists) {
        setErrors({ general: ["Email already registered. Please use a different email or try logging in."] })
        return
      }

      // Email is available, now send OTP
      setIsSendingOtp(true)
      
      const otpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          firstName: firstName
        }),
      })

      const otpData = await otpResponse.json()

      if (otpData.success) {
        setOtpSent(true)
        const expiryTime = new Date(Date.now() + 60 * 1000) // 1 minute from now
        setOtpExpiryTime(expiryTime)
        setOtpTimer(60) // 60 seconds
        setEmailChecked(true)
        setOtpValidated(false)
        setSuccessMessage("OTP sent to your email address")
      } else {
        if (otpData.retryAfter) {
          setErrors({ general: [`Please wait ${otpData.retryAfter} seconds before requesting another OTP`] })
          lastRequestTimeRef.current = Date.now() - (30000 - (otpData.retryAfter * 1000))
        } else {
          setErrors({ general: [otpData.error || "Failed to send OTP"] })
        }
      }
    } catch (error) {
      console.error('Check email and send OTP error:', error)
      setErrors({ general: ["Network error. Please try again."] })
    } finally {
      checkingEmailRef.current = false
      setIsCheckingEmail(false)
      setIsSendingOtp(false)
    }
  }

  // Send OTP function (for manual resend)
  const sendOTP = async (email: string, firstName: string) => {
    if (!email || !firstName) {
      setErrors({ general: ["Please fill in email and first name first"] })
      return
    }

    // Rate limiting: Don't make requests more than once every 5 seconds
    const now = Date.now()
    if (now - lastRequestTimeRef.current < 5000) {
      setErrors({ general: ["Please wait a moment before requesting another OTP"] })
      setIsRateLimited(true)
      setTimeout(() => setIsRateLimited(false), 5000 - (now - lastRequestTimeRef.current))
      return
    }

    lastRequestTimeRef.current = now
    setIsSendingOtp(true)
    setErrors({})

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          firstName: firstName
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOtpSent(true)
        const expiryTime = new Date(Date.now() + 60 * 1000) // 1 minute from now
        setOtpExpiryTime(expiryTime)
        setOtpTimer(60) // 60 seconds
        setOtpValidated(false)
        setSuccessMessage("OTP sent to your email address")
      } else {
        if (data.retryAfter) {
          setErrors({ general: [`Please wait ${data.retryAfter} seconds before requesting another OTP`] })
          lastRequestTimeRef.current = Date.now() - (30000 - (data.retryAfter * 1000))
        } else {
          setErrors({ general: [data.error || "Failed to send OTP"] })
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      setErrors({ general: ["Network error. Please try again."] })
    } finally {
      setIsSendingOtp(false)
    }
  }

  // Verify OTP function - called when user enters 6 digits
  const verifyOTP = async (email: string, otp: string) => {
    console.log('verifyOTP called with:', { 
      email, 
      otp, 
      length: otp?.length, 
      isNumeric: /^\d{6}$/.test(otp || ''),
      emailLower: email?.toLowerCase()
    })

    // Prevent multiple simultaneous verification attempts
    if (isLoading) {
      console.log('Already loading, skipping verification')
      return { success: false, error: 'Already processing' }
    }

    setIsLoading(true)
    setErrors({})

    try {
      console.log('Sending verification request:', {
        email: email,
        otp: otp,
        emailLower: email?.toLowerCase()
      })

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otp
        }),
      })

      console.log('Verification response status:', response.status)
      console.log('Verification response ok:', response.ok)
      
      if (!response.ok) {
        console.error('API request failed with status:', response.status)
        const errorText = await response.text()
        console.error('Error response body:', errorText)
        return { success: false, error: `API Error: ${response.status} - ${errorText}` }
      }
      
      const data = await response.json()
      console.log('Verification response data:', data)

      return data
    } catch (error) {
      console.error('Verify OTP error:', error)
      return { success: false, error: "Network error. Please try again." }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle registration after OTP verification
  const handleRegistration = async (values: FormData) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        setSuccessMessage("Account created successfully! Redirecting to login...")
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/login?message=Account created successfully. Please login.')
        }, 2000)
      } else {
        if (data.details && Array.isArray(data.details)) {
          setErrors({ general: data.details })
        } else {
          setErrors({ general: [data.error || "Registration failed"] })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ general: ["Network error. Please try again."] })
    }
  }

  // Handle form submission
  const handleSubmit = async (values: FormData, { setSubmitting, setFieldError }: any) => {
    try {
      // If OTP is not sent yet, send it
      if (!otpSent) {
        await checkEmailAndSendOTP(values.email, values.firstName)
        setSubmitting(false)
        return
      }

      // If OTP is sent but not validated, verify it first
      if (otpSent && !otpValidated && values.otp) {
        const otpResult = await verifyOTP(values.email, values.otp)
        
        if (otpResult.success) {
          setOtpValidated(true)
          setSuccessMessage("OTP verified successfully! You can now create your account.")
          setSubmitting(false)
          return
        } else {
          setFieldError('otp', otpResult.error)
          setSubmitting(false)
          return
        }
      }

      // If OTP is validated, proceed with registration
      if (otpValidated) {
        await handleRegistration(values)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ general: ["An error occurred. Please try again."] })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle email change to trigger OTP sending
  const handleEmailChange = async (email: string, firstName: string) => {
    if (email && firstName && email !== lastCheckedEmail) {
      setLastCheckedEmail(email)
      await checkEmailAndSendOTP(email, firstName)
    }
  }

  // Resend OTP
  const resendOTP = async (email: string, firstName: string) => {
    if (otpTimer > 0) return
    await sendOTP(email, firstName)
  }

  // Auto-verify OTP when 6 digits are entered
  const handleOTPChange = async (otp: string, email: string, setFieldError: any) => {
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      console.log('Auto-verifying OTP:', otp)
      const result = await verifyOTP(email, otp)
      
      if (result.success) {
        setOtpValidated(true)
        setSuccessMessage("OTP verified successfully! You can now create your account.")
      } else {
        setFieldError('otp', result.error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-gray-900 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#2D3748]">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brand showname={false} />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Create Account</h1>
            <p className="text-gray-400">Join thousands of happy customers</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Messages */}
          {errors.general && errors.general.length > 0 && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <span className="text-red-400 font-medium">Registration Failed</span>
                  <ul className="mt-1 text-sm text-red-300">
                    {errors.general.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              password: '',
              confirmPassword: '',
              otp: ''
            }}
            validationSchema={signupSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue, setFieldError }) => (
              <Form className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-gray-900 text-sm font-medium mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                      <Field
                        name="firstName"
                        type="text"
                        placeholder="John"
                        className="w-full bg-slate-50 border border-[#2D3748] rounded-lg pl-10 pr-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFieldValue('firstName', e.target.value)
                          if (values.email && e.target.value) {
                            handleEmailChange(values.email, e.target.value)
                          }
                        }}
                      />
                    </div>
                    <ErrorMessage name="firstName" component="p" className="mt-1 text-sm text-red-400" />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-gray-900 text-sm font-medium mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                      <Field
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        className="w-full bg-slate-50 border border-[#2D3748] rounded-lg pl-10 pr-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:border-[#0095FF] focus:ring-1 focus:ring-[#0095FF] transition-colors"
                      />
                    </div>
                    <ErrorMessage name="lastName" component="p" className="mt-1 text-sm text-red-400" />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-gray-900 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                    <Field
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      className={`w-full bg-slate-50 border rounded-lg pl-10 pr-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                        errors.email && touched.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#2D3748] focus:border-[#0095FF] focus:ring-[#0095FF]'
                      }`}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('email', e.target.value)
                        if (values.firstName && e.target.value) {
                          handleEmailChange(e.target.value, values.firstName)
                        }
                      }}
                    />
                    {isCheckingEmail ? (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-[#0095FF]/30 border-t-[#0095FF] rounded-full animate-spin"></div>
                      </div>
                    ) : emailChecked && !errors.email ? (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                    ) : null}
                  </div>
                  <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-400" />
                  {isCheckingEmail && (
                    <p className="mt-1 text-sm text-[#0095FF]">Checking email availability...</p>
                  )}
                  {emailChecked && !errors.email && (
                    <p className="mt-1 text-sm text-green-400">✓ Email available, OTP sent!</p>
                  )}
                </div>

                {/* OTP Field - Always visible */}
                <div>
                  <label htmlFor="otp" className="block text-gray-900 text-sm font-medium mb-2">
                    OTP Verification
                  </label>
                  <div className="relative">
                    <Field
                      name="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={`w-full bg-slate-50 border rounded-lg px-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors text-center text-xl tracking-widest ${
                        errors.otp && touched.otp ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 
                        otpValidated ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                        'border-[#2D3748] focus:border-[#0095FF] focus:ring-[#0095FF]'
                      }`}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setFieldValue('otp', value)
                        
                        // Auto-verify when 6 digits are entered
                        if (value.length === 6 && /^\d{6}$/.test(value)) {
                          handleOTPChange(value, values.email, setFieldError)
                        }
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === ' ' || (e.key.length === 1 && !/\d/.test(e.key))) {
                          e.preventDefault()
                        }
                      }}
                      onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                        e.preventDefault()
                        const pastedText = e.clipboardData.getData('text')
                        const cleanText = pastedText.replace(/\D/g, '').slice(0, 6)
                        setFieldValue('otp', cleanText)
                        
                        // Auto-verify when 6 digits are pasted
                        if (cleanText.length === 6 && /^\d{6}$/.test(cleanText)) {
                          handleOTPChange(cleanText, values.email, setFieldError)
                        }
                      }}
                    />
                    {otpValidated && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                    )}
                    {isLoading && values.otp && values.otp.length === 6 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-[#0095FF]/30 border-t-[#0095FF] rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <ErrorMessage name="otp" component="p" className="mt-1 text-sm text-red-400" />
                  
                  {/* OTP Status and Resend */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm">
                      {otpSent ? (
                        <span className="text-gray-600">
                          OTP sent to <strong>{values.email}</strong>
                        </span>
                      ) : (
                        <span className="text-gray-500">Enter email and first name to receive OTP</span>
                      )}
                    </div>
                    
                    {otpSent && (
                      <div className="flex items-center space-x-2">
                        {otpTimer > 0 ? (
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Resend in {otpTimer}s</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => resendOTP(values.email, values.firstName)}
                            disabled={isSendingOtp || isRateLimited}
                            className="flex items-center space-x-1 text-[#0095FF] hover:text-[#0080E6] transition-colors text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            <RefreshCw className={`w-4 h-4 ${isSendingOtp ? 'animate-spin' : ''}`} />
                            <span>{isSendingOtp ? 'Sending...' : 'Resend OTP'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-gray-900 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                    <Field
                      name="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      className={`w-full bg-slate-50 border rounded-lg pl-10 pr-4 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                        errors.phone && touched.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#2D3748] focus:border-[#0095FF] focus:ring-[#0095FF]'
                      }`}
                    />
                    {values.phone && /^[\+]?[1-9][\d]{0,15}$/.test(values.phone.replace(/\s/g, '')) && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                    )}
                  </div>
                  <ErrorMessage name="phone" component="p" className="mt-1 text-sm text-red-400" />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-gray-900 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className={`w-full bg-slate-50 border rounded-lg pl-10 pr-12 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                        errors.password && touched.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#2D3748] focus:border-[#0095FF] focus:ring-[#0095FF]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="mt-1 text-sm text-red-400" />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-900 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900 w-5 h-5" />
                    <Field
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={`w-full bg-slate-50 border rounded-lg pl-10 pr-12 py-3 text-black placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-[#2D3748] focus:border-[#0095FF] focus:ring-[#0095FF]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-sm text-red-400" />
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="w-4 h-4 text-[#0095FF] bg-white border-[#2D3748] rounded focus:ring-[#0095FF] focus:ring-2"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-400">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#0095FF] hover:text-[#0080E6] underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#0095FF] hover:text-[#0080E6] underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSendingOtp || isCheckingEmail || isLoading || isRateLimited || isSubmitting}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    !isSendingOtp && !isCheckingEmail && !isLoading && !isRateLimited && !isSubmitting
                      ? "bg-[#0095FF] hover:bg-[#0080E6] text-white shadow-lg hover:shadow-[#0095FF]/25"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSendingOtp || isCheckingEmail ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{isCheckingEmail ? "Checking email..." : "Sending OTP..."}</span>
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verifying OTP...</span>
                    </div>
                  ) : isRateLimited ? (
                    "Please wait..."
                  ) : otpValidated ? (
                    "Create Account"
                  ) : otpSent ? (
                    "Verify OTP First"
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#0095FF] hover:text-[#0080E6] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}