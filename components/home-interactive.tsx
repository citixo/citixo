"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useState } from "react";

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

interface CategoryService {
  id: string;
  name: string;
  icon: string;
  image: string;
  href: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface HomeInteractiveProps {
  categories: Category[];
  marketingServices: Service[];
}

export default function HomeInteractive({ categories, marketingServices }: HomeInteractiveProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryServices, setCategoryServices] = useState<CategoryService[]>([]);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  // Handle category click to show services popup
  const handleCategoryClick = async (category: Category) => {
    setSelectedCategory(category);
    setLoadingServices(true);
    setShowCategoryPopup(true);

    try {
      const response = await fetch(
        `/api/services?category=${encodeURIComponent(category.name)}`
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
    <>
      {/* Categories Grid */}
      <div className="flex gap-4">
        {categories.map((category: Category, index: number) => (
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
    </>
  );
}
