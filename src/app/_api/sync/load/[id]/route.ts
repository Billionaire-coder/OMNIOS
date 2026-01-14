
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';

export const GET = auth(async (req, { params }) => {
    if (!req.auth?.user?.email) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params as any;

    try {
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return new NextResponse('Project not found', { status: 404 });
        }

        // Verify Ownership (or add Sharing logic later)
        const user = await prisma.user.findUnique({ where: { email: req.auth.user.email } });

        if (!user || (project.ownerId !== user.id)) {
            // Allow admin? For now strict owner check.
            if (user?.role !== 'admin' && project.ownerId !== user?.id) {
                return new NextResponse('Forbidden', { status: 403 });
            }
        }

        return NextResponse.json({
            id: project.id,
            name: project.name,
            machineState: JSON.parse(project.machineState),
            createdAt: project.createdAt,
            updatedAt: project.updatedAt
        });

    } catch (error) {
        console.error("Sync Load Error:", error);
        return new NextResponse('Internal Error', { status: 500 });
    }
});
