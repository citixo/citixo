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
  colorScheme: "light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
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
        "alternateName": ["Citixo Services", "Citixo Home Services", "Citixo Home Services"],
        "url": "https://www.citixoservices.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.citixoservices.com/images/logo.jpeg",
          "width": 200,
          "height": 200,
          "caption": "Citixo Services Logo"
        },
        "image": "https://www.citixoservices.com/images/logo.jpeg",
        "description": "India's #1 trusted home service provider. Professional cleaning, AC service, plumbing, electrical work, painting & maintenance. Book online with verified professionals. 100% satisfaction guaranteed!",
        "foundingDate": "2024",
        "foundingLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN",
            "addressLocality": "India"
          }
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+91-XXXX-XXXX-XX",
            "contactType": "customer service",
            "availableLanguage": ["English", "Hindi"],
            "areaServed": "IN",
            "hoursAvailable": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              "opens": "06:00",
              "closes": "22:00"
            }
          },
          {
            "@type": "ContactPoint",
            "telephone": "+91-XXXX-XXXX-XX",
            "contactType": "sales",
            "availableLanguage": ["English", "Hindi"],
            "areaServed": "IN"
          }
        ],
        "sameAs": [
          "https://www.facebook.com/citixoservices",
          "https://www.twitter.com/citixoservices",
          "https://www.instagram.com/citixoservices",
          "https://www.linkedin.com/company/citixoservices",
          "https://www.youtube.com/citixoservices"
        ],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressLocality": "India",
          "addressRegion": "India"
        },
        "serviceArea": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates",
            "latitude": "28.6139",
            "longitude": "77.2090"
          },
          "geoRadius": "50000"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Citixo Services Catalog",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Home Cleaning Services",
                "description": "Professional home cleaning services including deep cleaning, regular cleaning, and specialized cleaning"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "AC Service & Repair",
                "description": "Professional AC installation, repair, and maintenance services"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Plumbing Services",
                "description": "Expert plumbing services for all your home plumbing needs"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Electrical Work",
                "description": "Professional electrical services and repairs"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Painting Services",
                "description": "Interior and exterior painting services"
              }
            }
          ]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "1250",
          "bestRating": "5",
          "worstRating": "1"
        },
        "priceRange": "$$",
        "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"],
        "currenciesAccepted": "INR"
      },
      {
        "@type": "WebSite",
        "@id": "https://www.citixoservices.com/#website",
        "url": "https://www.citixoservices.com",
        "name": "Citixo Services - Professional Home Services",
        "description": "India's #1 trusted home service provider. Professional cleaning, AC service, plumbing, electrical work, painting & maintenance.",
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
        ],
        "inLanguage": "en-US",
        "copyrightYear": "2024",
        "copyrightHolder": {
          "@id": "https://www.citixoservices.com/#organization"
        }
      },
      {
        "@type": "Service",
        "@id": "https://www.citixoservices.com/#service",
        "name": "Professional Home Services",
        "description": "India's #1 trusted home service provider. Professional cleaning, AC service, plumbing, electrical work, painting & maintenance. Book online with verified professionals.",
        "provider": {
          "@id": "https://www.citixoservices.com/#organization"
        },
        "serviceType": "Home Services",
        "areaServed": {
          "@type": "Country",
          "name": "India"
        },
        "availableChannel": {
          "@type": "ServiceChannel",
          "serviceUrl": "https://www.citixoservices.com",
          "serviceSmsNumber": "+91-XXXX-XXXX-XX",
          "servicePhone": "+91-XXXX-XXXX-XX"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Citixo Services Catalog",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Home Cleaning Services",
                "description": "Professional home cleaning services"
              },
              "price": "500",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "AC Service & Repair",
                "description": "Professional AC installation, repair, and maintenance"
              },
              "price": "800",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Plumbing Services",
                "description": "Expert plumbing services"
              },
              "price": "600",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Electrical Work",
                "description": "Professional electrical services"
              },
              "price": "700",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Painting Services",
                "description": "Interior and exterior painting services"
              },
              "price": "2000",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            }
          ]
        }
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://www.citixoservices.com/#localbusiness",
        "name": "Citixo Services",
        "image": "https://www.citixoservices.com/images/logo.jpeg",
        "telephone": "+91-XXXX-XXXX-XX",
        "email": "info@citixoservices.com",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressLocality": "India"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "28.6139",
          "longitude": "77.2090"
        },
        "url": "https://www.citixoservices.com",
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "06:00",
            "closes": "22:00"
          }
        ],
        "priceRange": "$$",
        "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "UPI", "Net Banking"],
        "currenciesAccepted": "INR"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.citixoservices.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Services",
            "item": "https://www.citixoservices.com/services"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Plans",
            "item": "https://www.citixoservices.com/plans"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What services does Citixo Services provide?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Citixo Services provides professional home services including cleaning, AC service, plumbing, electrical work, painting, carpentry, and appliance repair. We are India's #1 trusted home service provider."
            }
          },
          {
            "@type": "Question",
            "name": "How do I book a service with Citixo Services?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can book our services online through our website citixoservices.com or call us at +91-XXXX-XXXX-XX. Our booking process is simple and secure."
            }
          },
          {
            "@type": "Question",
            "name": "Are Citixo Services professionals verified?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, all our service professionals are thoroughly verified, background checked, and trained to ensure the highest quality of service delivery."
            }
          }
        ]
      }
    ]
  };

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
