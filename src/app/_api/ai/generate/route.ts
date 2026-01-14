
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GenerativeCore } from '@/lib/intelligence/GenerativeCore';
import { z } from 'zod';

const GenerateSchema = z.object({
    prompt: z.string().min(2),
    context: z.any().optional() // Project state minimal
});

export const POST = auth(async (req) => {
    if (!req.auth?.user?.email) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const json = await req.json();
        const { prompt, context } = GenerateSchema.parse(json);

        // Usage limit check could go here (Batch 3.1.1)

        const elements = await GenerativeCore.generateLayout(prompt, context);

        return NextResponse.json({ success: true, elements });

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return new NextResponse(error.message || 'Internal Error', { status: 500 });
    }
});
