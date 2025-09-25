"use client";

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
import { useState, useEffect } from "react";
import ServicesShowcase from "@/components/services-showcase";

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

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [homeData, setHomeData] = useState<HomePageData>({
    featuredServices: [],
    newServices: [],
    mostBookedServices: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryServices, setCategoryServices] = useState<CategoryService[]>(
    []
  );
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [marketingServices, setMarketingServices] = useState<Service[]>([]);

  const banners = [
    {
      title: "Deep Clean Special",
      subtitle: "Professional home cleaning",
      discount: "30% OFF",
      color: "from-blue-600 to-blue-800",
      icon: Sparkles,
    },
    {
      title: "AC Service Season",
      subtitle: "Beat the heat with expert care",
      discount: "25% OFF",
      color: "from-green-600 to-green-800",
      icon: Zap,
    },
    {
      title: "Home Painting",
      subtitle: "Transform your space",
      discount: "₹12/sq ft",
      color: "from-orange-600 to-orange-800",
      icon: Home,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/services");
        const data = await response.json();

        if (data.success && data.data) {
          const activeServices = data.data.filter(
            (service: Service) => service.status === "Active"
          );

          // Get unique categories
          const categories = [
            ...new Set(
              activeServices.map((service: Service) => service.category)
            ),
          ] as string[];

          // Sort services by bookings for most booked
          const mostBookedServices = [...activeServices]
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 4);

          // Sort by creation date for new services (most recent first)
          const newServices = [...activeServices]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 5);

          // Featured services (high rating and good bookings)
          const featuredServices = [...activeServices]
            .filter(
              (service) => service.rating >= 4.7 && service.bookings >= 500
            )
            .slice(0, 6);

          setHomeData({
            featuredServices,
            newServices,
            mostBookedServices,
            categories,
          });
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const CurrentIcon = banners[currentBanner].icon;

  const formatReviews = (bookings: number) => {
    if (bookings >= 1000) {
      return `${(bookings / 1000).toFixed(1)}k`;
    }
    return bookings.toString();
  };

  const [categarories, setCategarories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategarories = async () => {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategarories(data.data);
    };
    fetchCategarories();
  }, []);

  // Fetch first 4 services for marketing images
  useEffect(() => {
    const fetchMarketingServices = async () => {
      try {
        const response = await fetch("/api/services?limit=4");
        const data = await response.json();
        console.log("Marketing services data:", data); // Debug log
        if (data.success && data.data) {
          setMarketingServices(data.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching marketing services:", error);
      }
    };
    fetchMarketingServices();
  }, []);

  // Handle category click to show services popup
  const handleCategoryClick = async (category: any) => {
    setSelectedCategory(category);
    setLoadingServices(true);
    setShowCategoryPopup(true);

    try {
      const response = await fetch(
        `/api/services?category=${encodeURIComponent(category.name)}&limit=8`
      );
      const data = await response.json();

      if (data.success && data.data) {
        const services = data.data.map((service: Service) => ({
          id: service.id,
          name: service.name,
          icon: category.icon,
          image: service.image,
          href: service.href || `/services/${service.id}`,
        }));
        setCategoryServices(services);
      }
    } catch (error) {
      console.error("Error fetching category services:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Close category popup
  const closeCategoryPopup = () => {
    setShowCategoryPopup(false);
    setSelectedCategory(null);
    setCategoryServices([]);
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
                  Trusted Citox Services for Cleaning, Repairs & Maintenance - What are you looking for?
                </h2>
              </div>

              {/* Categories Grid */}
              <div className="flex gap-4">
                {categarories.map((category: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category)}
                    className="group relative flex flex-col items-center justify-center rounded-2xl p-2
                               shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2
                               bg-white border border-gray-200 hover:border-gray-300"
                  >
                    {/* Icon Circle */}
                    <div
                      className="relative h-10 flex items-center justify-center rounded-full 
                                 bg-gray-50 group-hover:bg-gray-100 transition-colors duration-300 mb-4"
                    >
                      <span
                        className="text-xl transition-all duration-300"
                        style={{ color: category.color || "#0095FF" }}
                      >
                        {category.icon}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-900 text-center group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side - Marketing Images */}
            <div className="w-full lg:flex-1 mt-8 lg:mt-0">
              {marketingServices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading services...</p>
                  <p className="text-xs text-gray-400 mt-2">Count: {marketingServices.length}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Marketing Images from Services */}
                <div className="space-y-6">
                  {marketingServices[0] && (
                    <Link
                      href={
                        marketingServices[0].href ||
                        `/services/${marketingServices[0].id}`
                      }
                    >
                      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group mb-2 shadow-lg hover:shadow-2xl transition-all duration-300">
                        <Image
                          src={marketingServices[0].image || "/placeholder.jpg"}
                          alt={marketingServices[0].name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            console.error("Image load error:", e);
                            e.currentTarget.src = "/placeholder.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 text-white">
                          <h3 className="font-bold text-lg md:text-xl mb-2 leading-tight">
                            {marketingServices[0].name}
                          </h3>
                          <p className="text-xs md:text-sm opacity-90 font-medium">
                            {marketingServices[0].category}
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

                  {marketingServices[1] && (
                    <Link
                      href={
                        marketingServices[1].href ||
                        `/services/${marketingServices[1].id}`
                      }
                    >
                      <div className="relative h-48 md:h-60 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
                        <Image
                          src={marketingServices[1].image || "/placeholder.jpg"}
                          alt={marketingServices[1].name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            console.error("Image load error:", e);
                            e.currentTarget.src = "/placeholder.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-opacity duration-300"></div>
                        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 text-white">
                          <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                            {marketingServices[1].name}
                          </h3>
                          <p className="text-xs opacity-90 font-medium">
                            {marketingServices[1].category}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}
                </div>

                <div className="space-y-6">
                  {marketingServices[2] && (
                    <Link
                      href={
                        marketingServices[2].href ||
                        `/services/${marketingServices[2].id}`
                      }
                    >
                      <div className="relative h-48 md:h-60 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all mb-2 duration-300">
                        <Image
                          src={marketingServices[2].image || "/placeholder.jpg"}
                          alt={marketingServices[2].name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            console.error("Image load error:", e);
                            e.currentTarget.src = "/placeholder.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-opacity duration-300"></div>
                        <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 text-white">
                          <h3 className="font-bold text-base md:text-lg mb-1 leading-tight">
                            {marketingServices[2].name}
                          </h3>
                          <p className="text-xs opacity-90 font-medium">
                            {marketingServices[2].category}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {marketingServices[3] && (
                    <Link
                      href={
                        marketingServices[3].href ||
                        `/services/${marketingServices[3].id}`
                      }
                    >
                      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300">
                        <Image
                          src={marketingServices[3].image || "/placeholder.jpg"}
                          alt={marketingServices[3].name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            console.error("Image load error:", e);
                            e.currentTarget.src = "/placeholder.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-opacity duration-300"></div>
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 text-white">
                          <h3 className="font-bold text-lg md:text-xl mb-2 leading-tight">
                            {marketingServices[3].name}
                          </h3>
                          <p className="text-xs md:text-sm opacity-90 font-medium">
                            {marketingServices[3].category}
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

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 animate-pulse"
                >
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="w-full h-40 bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded mb-3 w-4/5"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* Service Categories */}

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">
            Why Choose Citixo Services? - #1 Citox Services Provider
          </h2>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
              Citixo Services - Your Trusted Home Service Partner
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-6">
                <strong>Citixo Services</strong> (also known as <strong>Citox Services</strong>) is India's leading home services platform, 
                providing professional cleaning, repairs, maintenance, and all domestic services right at your doorstep. 
                Our verified professionals ensure quality service delivery with 100% satisfaction guarantee.
              </p>
              
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
              Get started with professional Citox services today - Trusted by thousands of customers
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

      {/* Category Services Popup */}
      {showCategoryPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={closeCategoryPopup}
          ></div>

          {/* Popup Content */}
          <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] transform transition-all duration-300 ease-out animate-slide-up rounded-t-3xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selectedCategory?.color + "20" }}
                >
                  <span
                    className="text-2xl"
                    style={{ color: selectedCategory?.color }}
                  >
                    {selectedCategory?.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedCategory?.name}
                  </h3>
                  <p className="text-sm text-gray-500">Available services</p>
                </div>
              </div>
              <button
                onClick={closeCategoryPopup}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Services Grid */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingServices ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 rounded-xl p-4 animate-pulse"
                    >
                      <div className="w-full h-24 bg-gray-300 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryServices.length > 0 &&
                    categoryServices.map((service) => (
                      <Link
                        key={service.id}
                        href={service.href}
                        onClick={closeCategoryPopup}
                        className="group flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="relative w-full h-24 rounded-lg overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-200">
                          <Image
                            src={service.image || "/placeholder.jpg"}
                            alt={service.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 text-center group-hover:text-blue-600 transition-colors">
                          {service.name}
                        </h4>
                      </Link>
                    ))}
                  {categoryServices.length === 0 && (
                    <div className="text-center text-gray-500">
                      No services found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
