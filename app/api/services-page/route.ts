import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { CitixoServices, CitixoServiceCategories } from "@/lib/models";

// GET - Fetch services page data
export async function GET() {
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
    const servicesByCategory: { [key: string]: any[] } = {};
    
    transformedServices.forEach((service: any) => {
      if (!servicesByCategory[service.category]) {
        servicesByCategory[service.category] = [];
      }
      servicesByCategory[service.category].push(service);
    });

    // Map categories with their services
    const serviceCategories = categories.map((category: any) => ({
      id: category.categoryId,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      services: servicesByCategory[category.name] || []
    }));

    // Filter out categories with no active services
    const categoriesWithServices = serviceCategories.filter(cat => cat.services.length > 0);

    return NextResponse.json({
      serviceCategories: categoriesWithServices,
      allCategories: ["All", ...categoriesWithServices.map((cat) => cat.name)]
    });
  } catch (error) {
    console.error("Error fetching services page data:", error);
    return NextResponse.json(
      { 
        serviceCategories: [],
        allCategories: ["All"]
      },
      { status: 500 }
    );
  }
}
