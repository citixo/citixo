import Link from "next/link"
import Image from "next/image"
import { Phone, MessageCircle } from "lucide-react"

export default function ServicesShowcase() {
  const services = [
    {
      name: "Home cleaning",
      icon: "🏠",
      description: "Professional deep cleaning for your entire home",
      href: "/services/home-cleaning",
    },
    {
      name: "Bathroom cleaning",
      icon: "🛁",
      description: "Specialized bathroom deep cleaning and sanitization",
      href: "/services/bathroom-cleaning",
    },
    {
      name: "Electrician",
      icon: "⚡",
      description: "All electrical repairs and installations",
      href: "/services/electrician",
    },
    {
      name: "Painting",
      icon: "🎨",
      description: "Interior and exterior painting services",
      href: "/services/painting",
    },
    {
      name: "Plumber",
      icon: "🔧",
      description: "Complete plumbing solutions and repairs",
      href: "/services/plumber",
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-[#f5f5f0] to-[#e8e8e0] text-[#1e3a8a]">
      <div className="container mx-auto px-4">
        {/* Header Banner */}
        <div className="bg-[#1e3a8a] rounded-2xl p-6 mb-12 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-[#f5f5f0] rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-[#1e3a8a] rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">🏠</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">CITIXO</h1>
          </div>
          <p className="text-[#f5f5f0] text-lg font-medium">your home service partner</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Services List */}
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 text-[#1e3a8a]">
              OUR
              <br />
              SERVICES
            </h2>

            <div className="space-y-6">
              {services.map((service, index) => (
                <Link
                  key={index}
                  href={service.href}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/50 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-[#1e3a8a] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl text-white">{service.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#1e3a8a] capitalize mb-1">{service.name}</h3>
                    <p className="text-[#1e3a8a]/70 text-sm">{service.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Professional Image */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] rounded-2xl p-8 text-center">
              <Image
                src="/placeholder.svg?height=400&width=300&text=Professional+Worker"
                alt="CITIXO Professional Worker"
                width={300}
                height={400}
                className="mx-auto rounded-xl"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full p-2">
                <div className="w-8 h-8 bg-[#1e3a8a] rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🏠</span>
                </div>
              </div>
              <div className="mt-4 text-white font-bold text-lg">CITIXO</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 bg-[#1e3a8a] rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
            {/* Call Now */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">CALL NOW</h3>
              <Link
                href="tel:123-456-7890"
                className="inline-flex items-center space-x-3 bg-white text-[#1e3a8a] px-8 py-4 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors duration-300"
              >
                <Phone className="w-6 h-6" />
                <span>123-456-7890</span>
              </Link>
            </div>

            {/* Book on WhatsApp */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                BOOK ON
                <br />
                WHATSAPP
              </h3>
              <Link
                href="https://wa.me/1234567890"
                className="inline-flex items-center space-x-3 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-[#20b858] transition-colors duration-300"
              >
                <MessageCircle className="w-6 h-6" />
                <span>WhatsApp</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
