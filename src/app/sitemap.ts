import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://omnios.dev';

    // Static Routes
    const staticRoutes = [
        '',
        '/login',
        '/templates',
        '/pricing', // If exists
        '/blog',    // If exists
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
    }));

    // Dynamic Routes (e.g. from Database)
    // In a real app, fetch these from DB:
    // const projects = await prisma.project.findMany({ where: { isPublic: true } });
    const dynamicRoutes: MetadataRoute.Sitemap = [
        // { url: `${baseUrl}/p/demo-project`, lastModified: new Date(), ... }
    ];

    return [...staticRoutes, ...dynamicRoutes];
}
