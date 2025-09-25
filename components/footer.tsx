"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Download } from "lucide-react"
import Brand from "./Brand"
import { useState, useEffect } from "react"

interface Settings {
  companyName: string
  companyEmail: string
  supportPhone: string
  companyAddress: string
  website: string
}

export default function Footer() {
  const [settings, setSettings] = useState<Settings | null>(null)

  // Fetch settings data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/general')
        const result = await response.json()
        
        if (result.success) {
          setSettings(result.data)
        }
      } catch (err) {
        console.error("Error fetching settings:", err)
      }
    }

    fetchSettings()
  }, [])
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              
             <Brand />
            </div>
            <p className="text-gray-900 mb-4">
              {settings?.companyAddress || 'Your trusted partner for professional home services. Quality guaranteed.'}
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-900 hover:text-[#0095FF] cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-900 hover:text-[#0095FF] cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-900 hover:text-[#0095FF] cursor-pointer" />
              <Linkedin className="w-5 h-5 text-gray-900 hover:text-[#0095FF] cursor-pointer" />
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/cleaning" className="text-gray-900 hover:text-gray-600">
                  Cleaning & Pest Control
                </Link>
              </li>
              <li>
                <Link href="/services/repairs" className="text-gray-900 hover:text-gray-600">
                  AC & Appliance Repair
                </Link>
              </li>
              <li>
                <Link href="/services/wellness" className="text-gray-900 hover:text-gray-600">
                  Salon & Wellness
                </Link>
              </li>
              <li>
                <Link href="/services/maintenance" className="text-gray-900 hover:text-gray-600">
                  Maintenance
                </Link>
              </li>
              <li>
                <Link href="/services/painting" className="text-gray-900 hover:text-gray-600">
                  Painting & Waterproofing
                </Link>
              </li>
            </ul>
          </div>

    
          {/* Download App */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Download App</h3>
            <p className="text-gray-900 mb-4">
              Install our app for faster booking and better experience
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // This will be handled by the PWA install button
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready.then(() => {
                      // Trigger install prompt if available
                      window.dispatchEvent(new Event('beforeinstallprompt'))
                    })
                  }
                }}
                className="w-full bg-[#0095FF] hover:bg-[#0080E6] text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Install App</span>
              </button>
              <p className="text-xs text-gray-600 text-center">
                Available on all devices
              </p>
            </div>
          </div>
        
        </div>

              <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-900">
          <p>&copy; {new Date().getFullYear()} {settings?.companyName || 'Citixo'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
