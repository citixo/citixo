"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
// import LoadingSpinner from "@/components/ui/LoadingSpinner";

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

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  services: Service[];
}

export default function ServicesPage() {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    // Check for category parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and services in parallel
        const [categoriesResponse, servicesResponse] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/services")
        ]);

        const [categoriesData, servicesData] = await Promise.all([
          categoriesResponse.json(),
          servicesResponse.json()
        ]);

        if (categoriesData.success && servicesData.success) {
          // Create a map of services by category
          const servicesByCategory: { [key: string]: Service[] } = {};
          
          servicesData.data.forEach((service: Service) => {
            if (!servicesByCategory[service.category]) {
              servicesByCategory[service.category] = [];
            }
            servicesByCategory[service.category].push(service);
          });

          // Map categories with their services
          const categories: ServiceCategory[] = categoriesData.data.map((category: any) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            services: servicesByCategory[category.name] || []
          }));

          // Filter out categories with no active services
          const categoriesWithServices = categories.filter(cat => cat.services.length > 0);
          
          setServiceCategories(categoriesWithServices);
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        setError("Error loading data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoized filtered categories for performance
  const filteredCategories = useMemo(() => {
    return selectedCategory === "All"
      ? serviceCategories
      : serviceCategories.filter(
          (category) => category.name === selectedCategory
        );
  }, [selectedCategory, serviceCategories]);

  const allCategories = useMemo(() => {
    return ["All", ...serviceCategories.map((cat) => cat.name)];
  }, [serviceCategories]);



  if (loading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          {/* <LoadingSpinner size="lg" text="Loading services..." className="py-12" /> */}
          <div className="w-12 h-12 border-4 border-[#0095FF]/30 border-t-[#0095FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 flex items-center justify-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-title">Our Services</h1>
          <p className="body-text text-gray-400 max-w-3xl mx-auto">
            Professional home services at your doorstep. From cleaning to
            repairs, we've got you covered with skilled professionals and
            guaranteed satisfaction.
          </p>
        </div>

        {/* Category Filter */}
        {!loading && allCategories.length > 1 && (
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-[#0095FF] text-white"
                      : "bg-[#1A2332] text-gray-300 hover:bg-[#374151]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Services by Category */}
        {filteredCategories.map((category, categoryIndex) => (
          <section key={category.id} className="mb-16">
            <div className="mb-8 flex items-center space-x-3">
              {category.icon && (
                <span className="text-2xl">{category.icon}</span>
              )}
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: category.color || '#ffffff' }}>
                  {category.name}
                </h2>
                <p className="text-gray-400">{category.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.services.map((service, serviceIndex) => (
                <div key={serviceIndex} className="service-card group">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <Image
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      width={300}
                      height={200}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{service.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-400">
                        {service.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-4 text-sm">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[#0095FF] font-semibold">
                      {service.price}
                    </span>
                    <div className="flex space-x-2 w-full ml-4">
                      <Link
                        href={`/services/${service.id}`}
                        className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1 flex-1 justify-center"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/book/${service.id}`}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors text-center flex-1"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}



        {/* CTA Section */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Service?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Contact us for custom service
            requests and we'll connect you with the right professional.
          </p>
          <Link
            href="/help"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
