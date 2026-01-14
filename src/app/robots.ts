import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://omnios.dev';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/editor/', '/api/', '/dashboard/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
