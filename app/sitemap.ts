import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.citixoservices.com'
  const currentDate = new Date().toISOString()

  // Static pages with enhanced SEO
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/plans`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/settings`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/orders`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]

  // Try to fetch dynamic services (with error handling)
  let dynamicPages: MetadataRoute.Sitemap = []
  
  try {
    // Enhanced service categories with better SEO
    const serviceCategories = [
      'cleaning-services',
      'ac-service',
      'plumbing-services',
      'electrical-work',
      'painting-services',
      'carpentry',
      'appliance-repair',
      'home-maintenance',
      'deep-cleaning',
      'regular-cleaning',
      'office-cleaning',
      'carpet-cleaning',
      'window-cleaning',
      'kitchen-cleaning',
      'bathroom-cleaning',
      'move-in-cleaning',
      'move-out-cleaning',
      'post-construction-cleaning',
      'commercial-cleaning',
      'residential-cleaning',
      'interior-painting',
      'exterior-painting',
      'wall-painting',
      'ceiling-painting',
      'door-painting',
      'window-painting',
      'furniture-painting',
      'ac-installation',
      'ac-repair',
      'ac-maintenance',
      'ac-gas-filling',
      'ac-cleaning',
      'ac-uninstall',
      'plumbing-repair',
      'plumbing-installation',
      'pipe-repair',
      'tap-repair',
      'toilet-repair',
      'bathroom-plumbing',
      'kitchen-plumbing',
      'water-tank-cleaning',
      'electrical-repair',
      'electrical-installation',
      'switch-repair',
      'socket-repair',
      'fan-repair',
      'light-installation',
      'wiring',
      'carpentry-work',
      'furniture-repair',
      'door-repair',
      'window-repair',
      'shelf-installation',
      'cabinet-repair',
      'appliance-repair',
      'refrigerator-repair',
      'washing-machine-repair',
      'microwave-repair',
      'geyser-repair',
      'water-purifier-repair'
    ]

    dynamicPages = serviceCategories.map(category => ({
      url: `${baseUrl}/services/${category}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Add location-based service pages
    const locations = [
      'delhi',
      'mumbai',
      'bangalore',
      'chennai',
      'kolkata',
      'hyderabad',
      'pune',
      'ahmedabad',
      'jaipur',
      'lucknow',
      'kanpur',
      'nagpur',
      'indore',
      'thane',
      'bhopal',
      'visakhapatnam',
      'pimpri-chinchwad',
      'patna',
      'vadodara',
      'ghaziabad',
      'ludhiana',
      'agra',
      'nashik',
      'faridabad',
      'meerut',
      'rajkot',
      'kalyan-dombivali',
      'vasai-virar',
      'varanasi',
      'srinagar',
      'aurangabad',
      'noida',
      'solapur',
      'ranchi',
      'howrah',
      'coimbatore',
      'raipur',
      'jabalpur',
      'gwalior',
      'vijayawada',
      'jodhpur',
      'madurai',
      'raipur',
      'kota',
      'guwahati',
      'chandigarh',
      'tiruchirappalli',
      'mangalore',
      'mysore',
      'kozhikode',
      'thiruvananthapuram',
      'bhubaneswar',
      'amritsar',
      'jalandhar',
      'bathinda',
      'patiala',
      'mohali',
      'panchkula',
      'karnal',
      'hisar',
      'rohtak',
      'gurgaon',
      'faridabad',
      'noida',
      'ghaziabad',
      'meerut',
      'agra',
      'aligarh',
      'bareilly',
      'moradabad',
      'saharanpur',
      'gorakhpur',
      'varanasi',
      'lucknow',
      'kanpur',
      'allahabad',
      'bareilly',
      'moradabad',
      'saharanpur',
      'gorakhpur',
      'varanasi',
      'lucknow',
      'kanpur',
      'allahabad'
    ]

    // Add location-based service pages
    const locationPages = locations.map(location => ({
      url: `${baseUrl}/services/${location}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Add location + service combination pages
    const topServices = ['cleaning-services', 'ac-service', 'plumbing-services', 'electrical-work', 'painting-services']
    const topLocations = ['delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune']
    
    const locationServicePages = topLocations.flatMap(location =>
      topServices.map(service => ({
        url: `${baseUrl}/services/${service}/${location}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    )

    dynamicPages = [...dynamicPages, ...locationPages, ...locationServicePages]

  } catch (error) {
    console.error('Error fetching dynamic pages for sitemap:', error)
  }

  return [...staticPages, ...dynamicPages]
}
