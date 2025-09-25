import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Citixo Services - Professional Home Services | Citox Services",
    template: "%s | Citixo Services"
  },
  description: "Citixo Services - Your trusted partner for professional home cleaning, repairs, maintenance, and all home services. Book online with verified professionals. #1 Citox Services provider.",
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
    "appliance repair"
  ],
  authors: [{ name: "Citixo Services" }],
  creator: "Citixo Services",
  publisher: "Citixo Services",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.citixoservices.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Citixo Services - Professional Home Services | Citox Services",
    description: "Citixo Services - Your trusted partner for professional home cleaning, repairs, maintenance, and all home services. Book online with verified professionals.",
    url: 'https://www.citixoservices.com',
    siteName: 'Citixo Services',
    images: [
      {
        url: '/images/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Citixo Services - Professional Home Services',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Citixo Services - Professional Home Services",
    description: "Your trusted partner for professional home cleaning, repairs, and maintenance services. Book online with verified professionals.",
    images: ['/images/logo.jpeg'],
    creator: '@citixoservices',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual Google Search Console verification code
  },
  category: 'home services',
  classification: 'Business',
  generator: 'Next.js',
  icons: {
    icon: [
      { url: "/images/logo.jpeg", sizes: "32x32", type: "image/jpeg" },
      { url: "/images/logo.jpeg", sizes: "16x16", type: "image/jpeg" },
    ],
    apple: [
      { url: "/images/logo.jpeg", sizes: "180x180", type: "image/jpeg" },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.citixoservices.com/#organization",
        "name": "Citixo Services",
        "alternateName": "Citox Services",
        "url": "https://www.citixoservices.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.citixoservices.com/images/logo.jpeg",
          "width": 200,
          "height": 200
        },
        "description": "Professional home services including cleaning, repairs, maintenance, and all domestic services. Trusted by thousands of customers.",
        "foundingDate": "2024",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-XXXX-XXXX-XX",
          "contactType": "customer service",
          "availableLanguage": "English"
        },
        "sameAs": [
          "https://www.facebook.com/citixoservices",
          "https://www.twitter.com/citixoservices",
          "https://www.instagram.com/citixoservices"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressLocality": "India"
        },
        "serviceArea": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates",
            "latitude": "28.6139",
            "longitude": "77.2090"
          },
          "geoRadius": "50000"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://www.citixoservices.com/#website",
        "url": "https://www.citixoservices.com",
        "name": "Citixo Services",
        "description": "Professional home services at your doorstep",
        "publisher": {
          "@id": "https://www.citixoservices.com/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.citixoservices.com/services?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "Service",
        "@id": "https://www.citixoservices.com/#service",
        "name": "Home Services",
        "description": "Professional home cleaning, repairs, maintenance, and all domestic services",
        "provider": {
          "@id": "https://www.citixoservices.com/#organization"
        },
        "serviceType": "Home Services",
        "areaServed": "India",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Citixo Services Catalog",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Home Cleaning Services"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "AC Service & Repair"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Plumbing Services"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Electrical Work"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Painting Services"
              }
            }
          ]
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
     <body suppressHydrationWarning className="min-h-screen bg-white md:px-[7rem] lg:px-[7rem] text-gray-900">

        <Header />
        <main>{children}</main>
        <Footer />
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
