"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Phone, MessageCircle, Mail, Clock, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from "lucide-react"

interface Question {
  id: string
  question: string
  answer: string
  tags: string[]
  viewCount: number
  helpful: number
  notHelpful: number
}

interface FaqCategory {
  category: string
  questions: Question[]
}

interface Settings {
  companyName: string
  companyEmail: string
  supportPhone: string
  companyAddress: string
  website: string
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<FaqCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
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

  // Fetch help data from API
  useEffect(() => {
    const fetchHelpData = async () => {
      try {
        setLoading(true)
        setError("")
        
        const url = new URL('/api/help', window.location.origin)
        if (selectedCategory !== "all") {
          url.searchParams.set('category', selectedCategory)
        }
        if (searchQuery.trim()) {
          url.searchParams.set('search', searchQuery.trim())
        }

        const response = await fetch(url.toString())
        const result = await response.json()

        if (result.success) {
          setFaqs(result.data)
          setCategories(['all', ...result.categories])
        } else {
          setError(result.error || "Failed to load help data")
        }
      } catch (err) {
        console.error("Error fetching help data:", err)
        setError("Failed to load help data")
      } finally {
        setLoading(false)
      }
    }

    fetchHelpData()
  }, [selectedCategory, searchQuery])

  // Handle feedback for help items
  const handleFeedback = async (helpId: string, helpful: boolean) => {
    try {
      await fetch(`/api/help/${helpId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful }),
      })
      
      // Refresh data to show updated counts
      const url = new URL('/api/help', window.location.origin)
      if (selectedCategory !== "all") {
        url.searchParams.set('category', selectedCategory)
      }
      const response = await fetch(url.toString())
      const result = await response.json()
      if (result.success) {
        setFaqs(result.data)
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
    }
  }

  const filteredFaqs = faqs.filter(category =>
    category.questions.some(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title">Help & Support</h1>
          <p className="body-text text-gray-400 max-w-3xl mx-auto">
            Find answers to common questions or get in touch with our support team for personalized assistance.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#374151] rounded-lg py-4 pl-12 pr-4 text-black placeholder-gray-400 focus:border-[#0095FF] focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-[#0095FF] text-white"
                      : "bg-[#1A2332] text-gray-300 hover:bg-[#374151]"
                  }`}
                >
                  {category === "all" ? "All Categories" : category}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-[#0095FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading help content...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No help topics found matching your search.</p>
              </div>
            ) : (
              filteredFaqs.map((category, categoryIndex) => (
                <div key={category.category} className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-[#0095FF]">
                    {category.category}
                  </h2>
                  <div className="space-y-4">
                    {category.questions.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 1000 + faqIndex
                      return (
                        <div
                          key={faq.id}
                          className="bg-white  rounded-lg border border-gray-900 overflow-hidden"
                        >
                          <button
                            onClick={() =>
                              setOpenFaq(openFaq === globalIndex ? null : globalIndex)
                            }
                            className="w-full p-6 text-left hover:bg-white  transition-colors flex items-center justify-between"
                          >
                            <span className="font-medium text-black pr-4">
                              {faq.question}
                            </span>
                            {openFaq === globalIndex ? (
                              <ChevronUp className="w-5 h-5 text-[#0095FF] flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {openFaq === globalIndex && (
                            <div className="px-6 pb-6">
                              <div className="text-gray-300 leading-relaxed mb-4">
                                {faq.answer}
                              </div>
                              
                              {/* Feedback and Stats */}
                              <div className="flex items-center justify-between pt-4 border-t border-[#374151]">
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                  <span>Views: {faq.viewCount}</span>
                                  <span>👍 {faq.helpful}</span>
                                  <span>👎 {faq.notHelpful}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-400">Was this helpful?</span>
                                  <button
                                    onClick={() => handleFeedback(faq.id, true)}
                                    className="p-1 hover:bg-[#374151] rounded transition-colors"
                                  >
                                    <ThumbsUp className="w-4 h-4 text-green-400" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(faq.id, false)}
                                    className="p-1 hover:bg-[#374151] rounded transition-colors"
                                  >
                                    <ThumbsDown className="w-4 h-4 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Support */}
            <div className="bg-white rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-bold mb-4">Contact Support</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#0095FF]" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-400">{settings?.supportPhone || '1800-123-4567'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-[#0095FF]" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-gray-400">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#0095FF]" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-400">{settings?.companyEmail || 'support@citixo.com'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-[#0095FF]" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-sm text-gray-400">Within 2 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-gray-600  rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/terms" className="block text-gray-400 hover:text-[#0095FF] transition-colors">
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="block text-gray-400 hover:text-[#0095FF] transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/refund-policy" className="block text-gray-400 hover:text-[#0095FF] transition-colors">
                  Refund Policy
                </Link>
                <Link href="/careers" className="block text-gray-400 hover:text-[#0095FF] transition-colors">
                  Careers
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Still Need Help Section */}
        <div className="mt-16 bg-white border border-gray-400 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary">Start Live Chat</button>
            <Link href={`tel:${settings?.supportPhone || '1800-123-4567'}`} className="btn-secondary">
              Call Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}