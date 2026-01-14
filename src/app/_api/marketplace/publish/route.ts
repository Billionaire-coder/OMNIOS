
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const PublishSchema = z.object({
    type: z.enum(['theme', 'plugin', 'component']),
    name: z.string().min(3),
    description: z.string().min(10),
    version: z.string().regex(/^\d+\.\d+\.\d+$/), // SemVer basic check
    price: z.number().int().min(0),
    content: z.string().min(1), // JSON or URL
    thumbnailUrl: z.string().optional()
});

export const POST = auth(async (req) => {
    if (!req.auth?.user?.email) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const json = await req.json();
        const payload = PublishSchema.parse(json);
        const userEmail = req.auth.user.email;
        const user = await prisma.user.findUnique({ where: { email: userEmail } });

        if (!user) return new NextResponse('User not found', { status: 404 });

        // Simple check to prevent duplicate names (Global namespace?)
        // For now, allow duplicates, but maybe scope them later
        const existing = await prisma.marketplaceItem.findFirst({
            where: { name: payload.name, authorId: user.id }
        });

        if (existing) {
            // Update version? Or require distinct name?
            // Let's assume this is a "New Version" publish or "Update" logic
            // For MVP, just upsert or fail if version exists
            if (existing.version === payload.version) {
                return new NextResponse('Version already exists', { status: 409 });
            }

            // Create new record? No, schema is single item.
            // We need a Version table properly, but for Batch 2.3 MVP we update the single record
            // OR create a new item if unique name.

            // Let's support "Update Item" logic:
            const updated = await prisma.marketplaceItem.update({
                where: { id: existing.id },
                data: {
                    version: payload.version,
                    content: payload.content,
                    price: payload.price,
                    description: payload.description,
                    thumbnailUrl: payload.thumbnailUrl
                }
            });
            return NextResponse.json({ success: true, id: updated.id, action: 'updated' });
        }

        const newItem = await prisma.marketplaceItem.create({
            data: {
                type: payload.type,
                name: payload.name,
                description: payload.description,
                version: payload.version,
                price: payload.price,
                content: payload.content,
                thumbnailUrl: payload.thumbnailUrl,
                authorId: user.id
            }
        });

        return NextResponse.json({ success: true, id: newItem.id, action: 'created' });

    } catch (error: any) {
        console.error("Marketplace Publish Error:", error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
});
