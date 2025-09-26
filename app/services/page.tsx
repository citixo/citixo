import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight } from "lucide-react";
import { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import { CitixoServices, CitixoServiceCategories } from "@/lib/models";
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

// Server-side data fetching
async function getServicesPageData() {
  try {
    await connectDB();

        // Fetch categories and services in parallel
    const [categories, services] = await Promise.all([
      CitixoServiceCategories.find({ status: "Active" })
        .sort({ displayOrder: 1, createdAt: -1 }),
      CitixoServices.find({ status: "Active" })
        .sort({ bookingCount: -1, 'rating.average': -1 })
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

          // Create a map of services by category
          const servicesByCategory: { [key: string]: Service[] } = {};
          
    transformedServices.forEach((service: Service) => {
            if (!servicesByCategory[service.category]) {
              servicesByCategory[service.category] = [];
            }
            servicesByCategory[service.category].push(service);
          });

          // Map categories with their services
    const serviceCategories: ServiceCategory[] = categories.map((category: any) => ({
      id: category.categoryId,
            name: category.name,
            description: category.description,
            icon: category.icon,
            color: category.color,
            services: servicesByCategory[category.name] || []
          }));

          // Filter out categories with no active services
    const categoriesWithServices = serviceCategories.filter(cat => cat.services.length > 0);

    return {
      serviceCategories: categoriesWithServices,
      allCategories: ["All", ...categoriesWithServices.map((cat) => cat.name)]
    };
  } catch (error) {
    console.error("Error fetching services page data:", error);
    return {
      serviceCategories: [],
      allCategories: ["All"]
    };
  }
}

// Metadata for SEO
export const metadata: Metadata = {
  title: "Our Services - Professional Home Services | Citixo Services",
  description: "Explore our comprehensive range of professional home services including cleaning, AC service, plumbing, electrical work, painting, and more. Book online with verified professionals.",
  keywords: [
    "home services",
    "cleaning services",
    "AC service",
    "plumbing services",
    "electrical work",
    "painting services",
    "carpentry",
    "appliance repair",
    "maintenance services",
    "professional cleaners",
    "home repairs",
    "domestic services",
    "citixo services",
    "citox services",
    "book online",
    "verified professionals"
  ],
  openGraph: {
    title: "Our Services - Professional Home Services | Citixo Services",
    description: "Explore our comprehensive range of professional home services including cleaning, AC service, plumbing, electrical work, painting, and more. Book online with verified professionals.",
    url: 'https://www.citixoservices.com/services',
    siteName: 'Citixo Services',
    images: [
      {
        url: 'https://www.citixoservices.com/images/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Citixo Services - Professional Home Services',
        type: 'image/jpeg',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Our Services - Professional Home Services | Citixo Services",
    description: "Explore our comprehensive range of professional home services including cleaning, AC service, plumbing, electrical work, painting, and more.",
    images: ['https://www.citixoservices.com/images/logo.jpeg'],
    creator: '@citixoservices',
    site: '@citixoservices',
  },
  alternates: {
    canonical: '/services',
  },
};

export default async function ServicesPage() {
  // Fetch data server-side
  const { serviceCategories, allCategories } = await getServicesPageData();

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
          serviceCategories={serviceCategories}
          allCategories={allCategories}
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
