
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    const sort = searchParams.get('sort') || 'popular'; // popular | newest

    try {
        const whereClause: any = {};

        if (q) {
            whereClause.OR = [
                { name: { contains: q } }, // Case sensitive in SQLite, insensitive in Postgres usually (mode: insensitive)
                { description: { contains: q } }
            ];
        }

        if (type && type !== 'all') {
            whereClause.type = type;
        }

        let orderBy = {};
        if (sort === 'newest') {
            orderBy = { createdAt: 'desc' };
        } else {
            orderBy = { downloads: 'desc' };
        }

        const items = await prisma.marketplaceItem.findMany({
            where: whereClause,
            orderBy,
            take: 50, // Limit results
            include: {
                author: {
                    select: { name: true, image: true }
                }
            }
        });

        // Map to frontend-friendly format if needed, or return raw
        const mapped = items.map(item => ({
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description,
            author: item.author.name || 'Unknown',
            version: item.version,
            thumbnailUrl: item.thumbnailUrl,
            price: item.price,
            downloads: item.downloads,
            rating: item.rating,
            data: item.content // Include payload for now? Or fetch separately? Fetch separately is better for bandwidth
            // But Editor expects data to install. For MVP, send it.
        }));

        return NextResponse.json(mapped);

    } catch (error: any) {
        console.error("Marketplace Search Error:", error);
        return new NextResponse('Search Failed', { status: 500 });
    }
}
