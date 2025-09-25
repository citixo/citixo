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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Additional SEO Meta Tags */}
        <meta name="google-site-verification" content="your-google-verification-code" />
        <meta name="msvalidate.01" content="your-bing-verification-code" />
        <meta name="yandex-verification" content="your-yandex-verification-code" />
        <meta name="p:domain_verify" content="your-pinterest-verification-code" />
        
        {/* Additional Open Graph Tags */}
        <meta property="og:image:secure_url" content="https://www.citixoservices.com/images/logo.jpeg" />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Citixo Services - Professional Home Services Logo" />
        <meta property="og:updated_time" content={new Date().toISOString()} />
        <meta property="og:see_also" content="https://www.citixoservices.com/services" />
        <meta property="og:see_also" content="https://www.citixoservices.com/plans" />
        <meta property="og:see_also" content="https://www.citixoservices.com/help" />
        
        {/* Additional Twitter Card Tags */}
        <meta name="twitter:image:alt" content="Citixo Services - Professional Home Services" />
        <meta name="twitter:domain" content="citixoservices.com" />
        <meta name="twitter:url" content="https://www.citixoservices.com" />
        
        {/* Mobile and App Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Citixo Services" />
        <meta name="application-name" content="Citixo Services" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/images/logo.jpeg" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Performance and Security Meta Tags */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Cache Control */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
        <meta httpEquiv="Expires" content="31536000" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="revisit-after" content="1 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="language" content="English" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <meta name="geo.placename" content="India" />
        <meta name="ICBM" content="28.6139, 77.2090" />
        <meta name="DC.title" content="Citixo Services - Professional Home Services" />
        <meta name="DC.creator" content="Citixo Services" />
        <meta name="DC.subject" content="Home Services, Cleaning, AC Service, Plumbing, Electrical Work" />
        <meta name="DC.description" content="India's #1 trusted home service provider. Professional cleaning, AC service, plumbing, electrical work, painting & maintenance." />
        <meta name="DC.publisher" content="Citixo Services" />
        <meta name="DC.contributor" content="Citixo Services" />
        <meta name="DC.date" content="2024" />
        <meta name="DC.type" content="Service" />
        <meta name="DC.format" content="text/html" />
        <meta name="DC.identifier" content="https://www.citixoservices.com" />
        <meta name="DC.source" content="https://www.citixoservices.com" />
        <meta name="DC.language" content="en" />
        <meta name="DC.relation" content="https://www.citixoservices.com" />
        <meta name="DC.coverage" content="India" />
        <meta name="DC.rights" content="Copyright 2024 Citixo Services" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch for better performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Additional Link Tags */}
        <link rel="alternate" type="application/rss+xml" title="Citixo Services RSS Feed" href="/rss.xml" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <link rel="search" type="application/opensearchdescription+xml" title="Citixo Services" href="/opensearch.xml" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="57x57" href="/images/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="60x60" href="/images/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="72x72" href="/images/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="76x76" href="/images/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="114x114" href="/images/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="120x120" href="/images/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="144x144" href="/images/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/images/logo.jpeg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo.jpeg" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/images/logo.jpeg" />
        <meta name="msapplication-square70x70logo" content="/images/logo.jpeg" />
        <meta name="msapplication-square150x150logo" content="/images/logo.jpeg" />
        <meta name="msapplication-wide310x150logo" content="/images/logo.jpeg" />
        <meta name="msapplication-square310x310logo" content="/images/logo.jpeg" />
        
        {/* Additional Favicons */}
        <link rel="icon" type="image/jpeg" sizes="16x16" href="/images/logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="32x32" href="/images/logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="48x48" href="/images/logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="64x64" href="/images/logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="96x96" href="/images/logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="128x128" href="/images/logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="256x256" href="/images/logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="512x512" href="/images/logo.jpeg" />
        
        {/* Shortcut Icons */}
        <link rel="shortcut icon" href="/images/logo.jpeg" />
        <link rel="bookmark" href="/images/logo.jpeg" />
        
        {/* Additional Meta Tags for Better SEO */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Citixo Services" />
        <meta name="application-name" content="Citixo Services" />
        <meta name="msapplication-tooltip" content="Citixo Services - Professional Home Services" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="msapplication-window" content="width=1024;height=768" />
        
        {/* Additional Social Media Meta Tags */}
        <meta property="article:author" content="Citixo Services" />
        <meta property="article:publisher" content="https://www.facebook.com/citixoservices" />
        <meta property="article:section" content="Home Services" />
        <meta property="article:tag" content="citixo services" />
        <meta property="article:tag" content="citox services" />
        <meta property="article:tag" content="home services" />
        <meta property="article:tag" content="cleaning services" />
        <meta property="article:tag" content="AC service" />
        <meta property="article:tag" content="plumbing" />
        <meta property="article:tag" content="electrical work" />
        <meta property="article:tag" content="painting services" />
        
        {/* Business Hours */}
        <meta property="business:contact_data:street_address" content="India" />
        <meta property="business:contact_data:locality" content="India" />
        <meta property="business:contact_data:region" content="India" />
        <meta property="business:contact_data:postal_code" content="110001" />
        <meta property="business:contact_data:country_name" content="India" />
        <meta property="business:contact_data:email" content="info@citixoservices.com" />
        <meta property="business:contact_data:phone_number" content="+91-XXXX-XXXX-XX" />
        <meta property="business:contact_data:website" content="https://www.citixoservices.com" />
        <meta property="business:hours:day" content="monday" />
        <meta property="business:hours:start" content="06:00" />
        <meta property="business:hours:end" content="22:00" />
        <meta property="business:hours:day" content="tuesday" />
        <meta property="business:hours:start" content="06:00" />
        <meta property="business:hours:end" content="22:00" />
        <meta property="business:hours:day" content="wednesday" />
        <meta property="business:hours:start" content="06:00" />
        <meta property="business:hours:end" content="22:00" />
        <meta property="business:hours:day" content="thursday" />
        <meta property="business:hours:start" content="06:00" />
        <meta property="business:hours:end" content="22:00" />
        <meta property="business:hours:day" content="friday" />
        <meta property="business:hours:start" content="06:00" />
        <meta property="business:hours:end" content="22:00" />
        <meta property="business:hours:day" content="saturday" />
        <meta property="business:hours:start" content="06:00" />
        <meta property="business:hours:end" content="22:00" />
        <meta property="business:hours:day" content="sunday" />
        <meta property="business:hours:start" content="06:00" />
        <meta property="business:hours:end" content="22:00" />
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
