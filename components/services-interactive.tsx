"use client";

import { useState, useEffect, useMemo } from "react";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  services: any[];
}

interface ServicesInteractiveProps {
  serviceCategories: ServiceCategory[];
  allCategories: string[];
}

export default function ServicesInteractive({ serviceCategories, allCategories }: ServicesInteractiveProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    // Check for category parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  // Memoized filtered categories for performance
  const filteredCategories = useMemo(() => {
    return selectedCategory === "All"
      ? serviceCategories
      : serviceCategories.filter(
          (category) => category.name === selectedCategory
        );
  }, [selectedCategory, serviceCategories]);

  return (
    <>
      {/* Category Filter */}
      {allCategories.length > 1 && (
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
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.name}
                    width={300}
                    height={200}
                    loading="lazy"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
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
                    <a
                      href={`/services/${service.id}`}
                      className="bg-[#0095FF] hover:bg-[#0080E6] text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1 flex-1 justify-center"
                    >
                      <span>View Details</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                    <a
                      href={`/book/${service.id}`}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors text-center flex-1"
                    >
                      Book Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
