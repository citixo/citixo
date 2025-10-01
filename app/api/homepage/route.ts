import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { CitixoServices, CitixoServiceCategories } from "@/lib/models";

// GET - Fetch homepage data
export async function GET() {
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
      ...new Set(transformedServices.map((service: any) => service.category))
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

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return NextResponse.json(
      { 
        featuredServices: [],
        newServices: [],
        mostBookedServices: [],
        marketingServices: [],
        categories: [],
        uniqueCategories: []
      },
      { status: 500 }
    );
  }
}
