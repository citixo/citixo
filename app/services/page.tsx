"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import ServicesInteractive from "@/components/services-interactive";

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

// Client-side data fetching
async function fetchServicesPageData() {
  try {
    const response = await fetch('/api/services-page');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching services page data:", error);
    return {
      serviceCategories: [],
      allCategories: ["All"]
    };
  }
}


export default function ServicesPage() {
  const [serviceData, setServiceData] = useState({
    serviceCategories: [],
    allCategories: ["All"]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchServicesPageData();
        setServiceData(data);
      } catch (err) {
        setError('Failed to load services data');
        console.error('Error loading services data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
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

        {/* Interactive Services Section */}
        <ServicesInteractive 
          serviceCategories={serviceData.serviceCategories}
          allCategories={serviceData.allCategories}
        />



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
