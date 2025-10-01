import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PWAInstallButton from "@/components/PWAInstallButton"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Citixo Services - Professional Home Services | Citixo Services | #1 Home Service Provider",
    template: "%s | Citixo Services - Professional Home Services"
  },
  description: "Citixo Services - India's #1 trusted home service provider. Professional cleaning, AC service, plumbing, electrical work, painting & maintenance. Book online with verified professionals. 100% satisfaction guaranteed!",
  keywords: [
    "citixo services",
    "citox services", 
    "home services",
    "cleaning services",
    "home repairs",
    "maintenance services",
    "professional cleaners",
    "home improvement",
    "domestic services",
    "house cleaning",
    "AC service",
    "plumbing",
    "electrical work",
    "painting services",
    "carpentry",
    "appliance repair",
    "deep cleaning",
    "regular cleaning",
    "office cleaning",
    "carpet cleaning",
    "window cleaning",
    "kitchen cleaning",
    "bathroom cleaning",
    "home maintenance",
    "citixo services near me",
    "citox services booking",
    "professional home services",
    "trusted home service provider",
    "verified professionals",
    "home service booking",
    "domestic help",
    "house maintenance",
    "home renovation",
    "interior cleaning",
    "exterior cleaning",
    "move in cleaning",
    "move out cleaning",
    "post construction cleaning",
    "commercial cleaning",
    "residential cleaning"
  ],
  authors: [{ name: "Citixo Services", url: "https://www.citixoservices.com" }],
  creator: "Citixo Services",
  publisher: "Citixo Services",
  applicationName: "Citixo Services",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.citixoservices.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/en-US',
      'hi-IN': '/hi-IN',
    },
  },
  openGraph: {
    title: "Citixo Services - Professional Home Services | Citixo Services | #1 Home Service Provider",
    description: "India's #1 trusted home service provider. Professional cleaning, AC service, plumbing, electrical work, painting & maintenance. Book online with verified professionals. 100% satisfaction guaranteed!",
    url: 'https://www.citixoservices.com',
    siteName: 'Citixo Services',
    images: [
      {
        url: 'https://www.citixoservices.com/images/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Citixo Services - Professional Home Services Logo',
        type: 'image/jpeg',
      },
      {
        url: 'https://www.citixoservices.com/images/hero-background.png',
        width: 1920,
        height: 1080,
        alt: 'Citixo Services - Professional Home Services Hero Image',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
    countryName: 'India',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Citixo Services - Professional Home Services | #1 Home Service Provider",
    description: "India's #1 trusted home service provider. Professional cleaning, AC service, plumbing, electrical work, painting & maintenance. Book online with verified professionals.",
    images: ['https://www.citixoservices.com/images/logo.jpeg'],
    creator: '@citixoservices',
    site: '@citixoservices',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual Google Search Console verification code
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
    other: {
      'msvalidate.01': 'your-bing-verification-code',
    },
  },
  category: 'home services',
  classification: 'Business',
  generator: 'Next.js',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Citixo Services',
    'msapplication-TileColor': '#ffffff',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#ffffff',
    'msapplication-navbutton-color': '#ffffff',
    'format-detection': 'telephone=no',
    'HandheldFriendly': 'True',
    'MobileOptimized': '320',
   
   
    'application-name': 'Citixo Services',
    'msapplication-tooltip': 'Citixo Services - Professional Home Services',
    'msapplication-starturl': '/',
    'msapplication-tap-highlight': 'no',
    'msapplication-TileImage': '/images/logo.jpeg',
    'msapplication-window': 'width=1024;height=768',
    'msapplication-task': 'name=Home;action-uri=/;icon-uri=/images/logo.jpeg',
   
  },
  icons: {
    icon: [
      { url: "/images/logo.jpeg", sizes: "32x32", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "16x16", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "48x48", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "64x64", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "96x96", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "128x128", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "256x256", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [
      { url: "/images/logo.jpeg", sizes: "180x180", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "152x152", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "120x120", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "76x76", type: "image/jpeg" },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/images/logo.jpeg',
        color: '#ffffff',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Citixo Services',
    statusBarStyle: 'default',
    capable: true,
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en">
      
     <body suppressHydrationWarning className="min-h-screen bg-white md:px-[7rem] lg:px-[7rem] text-gray-900">

        <Header />
        <main>{children}</main>
        <Footer />
        <PWAInstallButton />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  )
}
