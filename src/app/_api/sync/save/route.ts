
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const SaveSchema = z.object({
    id: z.string().uuid().or(z.string().cuid()).optional(),
    name: z.string().min(1),
    machineState: z.record(z.string(), z.any()), // Full JSON dump
    thumbnailUrl: z.string().optional()
});

export const POST = auth(async (req) => {
    if (!req.auth?.user?.email) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const json = await req.json();
        const payload = SaveSchema.parse(json);
        const userEmail = req.auth.user.email;

        // 1. Get User ID from DB (Auto-create if missing - e.g. for mock/new users)
        let user = await prisma.user.findUnique({
            where: { email: userEmail }
        });

        if (!user) {
            console.log(`[Sync] User ${userEmail} not found, creating...`);
            user = await prisma.user.create({
                data: {
                    email: userEmail,
                    name: req.auth.user.name || 'OMNIOS User',
                    role: (req.auth.user as any).role || 'user'
                }
            });
        }

        // 2. Upsert Project
        // If ID matches, update; else create new
        const machineStateString = JSON.stringify(payload.machineState);

        // Simple strategy: Always update if ID exists and belongs to user
        let project;

        if (payload.id) {
            // Check ownership
            const existing = await prisma.project.findUnique({
                where: { id: payload.id }
            });

            if (existing) {
                if (existing.ownerId !== user.id) {
                    return new NextResponse('Forbidden', { status: 403 });
                }
                project = await prisma.project.update({
                    where: { id: payload.id },
                    data: {
                        name: payload.name,
                        machineState: machineStateString,
                        thumbnailUrl: payload.thumbnailUrl
                    }
                });
            } else {
                // If client sends an ID that doesn't exist, treat as new? 
                // Creating with specific ID is risky unless UUID.
                // Better to let DB generate ID if not found, but we want to respect offline ID if possible.
                // Prisma create allows setting ID.
                project = await prisma.project.create({
                    data: {
                        id: payload.id, // Trust client ID if valid CUID/UUID
                        name: payload.name,
                        machineState: machineStateString,
                        thumbnailUrl: payload.thumbnailUrl,
                        ownerId: user.id
                    }
                });
            }
        } else {
            // Create New
            project = await prisma.project.create({
                data: {
                    name: payload.name,
                    machineState: machineStateString,
                    thumbnailUrl: payload.thumbnailUrl,
                    ownerId: user.id
                }
            });
        }

        return NextResponse.json({ success: true, id: project.id });

    } catch (error: any) {
        console.error("Sync Save Error:", error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
});
