import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Zap,
  Sparkles,
  Home,
  X,
  ChevronUp,
} from "lucide-react";
import { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import { CitixoServices, CitixoServiceCategories } from "@/lib/models";
import HomeInteractive from "@/components/home-interactive";

interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  status: string;
  bookings: number;
  rating: number;
  image: string;
  href?: string;
  createdAt: string;
}

interface HomePageData {
  featuredServices: Service[];
  newServices: Service[];
  mostBookedServices: Service[];
  categories: any;
}

interface CategoryService {
  id: string;
  name: string;
  icon: string;
  image: string;
  href: string;
}

// Server-side data fetching
async function getHomePageData() {
  try {
    await connectDB();

    // Fetch services and categories in parallel
    const [services, categories] = await Promise.all([
      CitixoServices.find({ status: "Active" })
        .sort({ bookingCount: -1, 'rating.average': -1 })
        .limit(50),
      CitixoServiceCategories.find({ status: "Active" })
        .sort({ displayOrder: 1, createdAt: -1 })
    ]);

    // Create category map
    const categoryMap = categories.reduce((map, cat) => {
      map[cat.categoryId] = cat.name;
      return map;
    }, {} as Record<string, string>);

    // Transform services data
    const transformedServices = services.map((service: any) => ({
      id: service.serviceId,
      name: service.name,
      description: service.description,
      category: categoryMap[service.categoryId] || 'Uncategorized',
      price: service.formattedPrice,
      rating: service.rating.average,
      reviews: service.rating.count,
      bookings: service.bookingCount,
      image: service.images ? service.images.url : "/placeholder.svg?height=200&width=300",
      images: service.images || {},
      href: `/services/${service.seo?.slug || service.serviceId}`,
      status: service.status,
      features: service.features,
      includedServices: service.includedServices || [],
      createdAt: service.createdAt
    }));

          // Get unique categories
    const uniqueCategories = [
      ...new Set(transformedServices.map((service: Service) => service.category))
          ] as string[];

          // Sort services by bookings for most booked
    const mostBookedServices = [...transformedServices]
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 4);

          // Sort by creation date for new services (most recent first)
    const newServices = [...transformedServices]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 5);

          // Featured services (high rating and good bookings)
    const featuredServices = [...transformedServices]
            .filter(
              (service) => service.rating >= 4.7 && service.bookings >= 500
            )
            .slice(0, 6);

    // Marketing services (first 4 services)
    const marketingServices = transformedServices.slice(0, 4);

    return {
            featuredServices,
            newServices,
            mostBookedServices,
      marketingServices,
      categories: categories.map(cat => ({
        id: cat.categoryId,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color
      })),
      uniqueCategories
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return {
      featuredServices: [],
      newServices: [],
      mostBookedServices: [],
      marketingServices: [],
      categories: [],
      uniqueCategories: []
    };
  }
}

// Metadata for SEO
export const metadata: Metadata = {
  title: "Citixo Services - Professional Home Services | #1 Home Service Provider",
  description: "India's #1 trusted home service provider. Professional cleaning, AC service, plumbing, electrical work, painting & maintenance. Book online with verified professionals. 100% satisfaction guaranteed!",
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
  openGraph: {
    title: "Citixo Services - Professional Home Services | #1 Home Service Provider",
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
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  // Fetch data server-side
  const homeData = await getHomePageData();

  const formatReviews = (bookings: number) => {
    if (bookings >= 1000) {
      return `${(bookings / 1000).toFixed(1)}k`;
    }
    return bookings.toString();
  };

  return (
    <div className="">
      {/* Hero Section - New Design */}
      <section className="py-16  bg-white">
        <div className="container mx-auto px-4">
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Left Side - Categories */}
            <div className="w-full lg:w-[40%] border border-gray-200 rounded-2xl p-4">
              <div className="mb-8">
                <h1 className="text-4xl md:text-4xl font-black text-gray-900 mb-4">
                Citixo Services - Professional Home Services at Your Doorstep
              </h1>
                <h2 className="text-lg text-gray-600 mb-8">
                  Trusted Citixo Services for Cleaning, Repairs & Maintenance - What are you looking for?
                </h2>
              </div>

              {/* Categories Grid */}
              <HomeInteractive 
                categories={homeData.categories} 
                marketingServices={homeData.marketingServices}
              />
            </div>

            {/* Right Side - Marketing Images */}
            <div className="w-full lg:flex-1 mt-8 lg:mt-0">
              {homeData.marketingServices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No services available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Marketing Images from Services */}
                <div className="space-y-6">
                  {homeData.marketingServices[0] && (
                    <Link
                      href={
                        homeData.marketingServices[0].href ||
                        `/services/${homeData.marketingServices[0].id}`
                      }
                    >
                      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group mb-2 shadow-lg hover:shadow-2xl transition-all duration-300">
                        <Image
                          src={homeData.marketingServices[0].image || "/placeholder.jpg"}
                          alt={homeData.marketingServices[0].name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 text-white">
                          <h3 className="font-bold text-lg md:text-xl mb-2 leading-tight">
                            {homeData.marketingServices[0].name}
                          </h3>
                          <p className="text-xs md:text-sm opacity-90 font-medium">
                            {homeData.marketingServices[0].category}
                          </p>
                          <div className="mt-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-xs font-medium">
                              Professional Service
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  {homeData.marketingServices[1] && (
                    <Link
                      href={
                        homeData.marketingServices[1].href ||
                        `/services/${homeData.marketingServices[1].id}`
                      }
                    >
                      <div className="relative h-48 md:h-60 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
                        <Image
                          src={homeData.marketingServices[1].image || "/placeholder.jpg"}
                          alt={homeData.marketingServices[1].name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-opacity duration-300"></div>
                        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 text-white">
                          <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                            {homeData.marketingServices[1].name}
                          </h3>
                          <p className="text-xs opacity-90 font-medium">
                            {homeData.marketingServices[1].category}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>

                <div className="space-y-6">
                  {homeData.marketingServices[2] && (
                    <Link
                      href={
                        homeData.marketingServices[2].href ||
                        `/services/${homeData.marketingServices[2].id}`
                      }
                    >
                      <div className="relative h-48 md:h-60 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all mb-2 duration-300">
                        <Image
                          src={homeData.marketingServices[2].image || "/placeholder.jpg"}
                          alt={homeData.marketingServices[2].name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-opacity duration-300"></div>
                        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 text-white">
                          <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                            {homeData.marketingServices[2].name}
                          </h3>
                          <p className="text-xs opacity-90 font-medium">
                            {homeData.marketingServices[2].category}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {homeData.marketingServices[3] && (
                    <Link
                      href={
                        homeData.marketingServices[3].href ||
                        `/services/${homeData.marketingServices[3].id}`
                      }
                    >
                      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
                        <Image
                          src={homeData.marketingServices[3].image || "/placeholder.jpg"}
                          alt={homeData.marketingServices[3].name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 text-white">
                          <h3 className="font-bold text-lg md:text-xl mb-2 leading-tight">
                            {homeData.marketingServices[3].name}
                          </h3>
                          <p className="text-xs md:text-sm opacity-90 font-medium">
                            {homeData.marketingServices[3].category}
                          </p>
                          <div className="mt-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-xs font-medium">
                              Expert Technicians
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}

      {/* Promotional Banners */}

      {/* New and Noteworthy */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title mb-0">New and Noteworthy</h2>
            <Link
              href="/services"
              className="text-[#0095FF] hover:text-[#0080E6] font-semibold"
            >
              See all
            </Link>
          </div>

            <div className="grid grid-cols-2 md:grid-cols-3 boxshadow-md-gray-200  lg:grid-cols-5 gap-6">
              {homeData.newServices.map((service, index) => (
                <Link
                  key={service.id}
                  href={service.href || `/services/${service.id}`}
                  className="bg-white rounded-xl p-4 hover:bg-gray-100  border border-gray-200  transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                >
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.name}
                    width={200}
                    height={200}
                    className="w-full h-32 object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"
                  />
                  <h3 className="font-semibold text-sm mb-1">{service.name}</h3>
                  <p className="text-blue-500 text-sm font-semibold">
                    {service.price}
                  </p>
                </Link>
              ))}
            </div>
        </div>
      </section>

      {/* Most Booked Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title mb-0">Most Booked Services</h2>
            <Link
              href="/services"
              className="text-[#0095FF] hover:text-[#0080E6] font-semibold"
            >
              See all
            </Link>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {homeData.mostBookedServices.map((service, index) => (
                <Link
                  key={service.id}
                  href={service.href || `/services/${service.id}`}
                  className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                >
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.name}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{service.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{service.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-500 font-semibold">
                        {service.price}
                      </span>
                      <span className="text-gray-500 text-xs">
                        ({formatReviews(service.bookings)})
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        </div>
      </section>

      {/* Service Categories */}

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
         
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Trusted Professionals",
                description:
                  "All service providers are background verified and trained",
              },
              {
                icon: Clock,
                title: "On-Time Service",
                description:
                  "We guarantee punctual service delivery every time",
              },
              {
                icon: Star,
                title: "Quality Guaranteed",
                description:
                  "100% satisfaction guarantee or we'll make it right",
              },
              {
                icon: Users,
                title: "24/7 Support",
                description:
                  "Round-the-clock customer support for all your needs",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
           
            <div className="prose prose-lg max-w-none text-gray-700">
              
              
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Why Choose Citixo Services?</h3>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Professional Cleaning Services:</strong> Deep cleaning, regular housekeeping, and specialized cleaning solutions</li>
                <li><strong>AC Service & Repair:</strong> Expert AC maintenance, repair, and installation services</li>
                <li><strong>Plumbing Services:</strong> Complete plumbing solutions including repairs, installations, and maintenance</li>
                <li><strong>Electrical Work:</strong> Safe and reliable electrical repairs and installations</li>
                <li><strong>Painting Services:</strong> Interior and exterior painting with premium quality materials</li>
                <li><strong>Appliance Repair:</strong> Expert repair services for all home appliances</li>
              </ul>

              <p className="text-lg leading-relaxed mb-6">
                With thousands of satisfied customers across India, <strong>Citixo Services</strong> has established itself as the 
                most trusted name in home services. Our background-verified professionals, on-time service delivery, 
                and 24/7 customer support make us the preferred choice for all your home service needs.
              </p>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold mb-3 text-blue-900">Book Your Service Today</h4>
                <p className="text-blue-800">
                  Experience the convenience of professional home services with <strong>Citixo Services</strong>. 
                  Book online in just a few clicks and get your home serviced by verified professionals. 
                  Available 24/7 across major cities in India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to book your Citixo service?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get started with professional Citixo services today - Trusted by thousands of customers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="bg-white text-blue-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>Browse Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/plans"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-500 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>View Plans</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
