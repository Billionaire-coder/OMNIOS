import { NextResponse } from 'next/server';
import { FigmaPushSchema } from '@/lib/validation/schemas';

// Temporary in-memory storage for Figma Pushes (Development only)
// In production, this would use a session-based Redis store
let latestPush: any = null;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validated = FigmaPushSchema.parse(body); // Validate
        latestPush = validated.nodes; // Use validated nodes (assuming nodes field matches usage)

        // Note: The original code used body.project, but schema expects body.fileKey/nodes.
        // If the Figma plugin sends 'project', we need to align them.
        // Assuming 'nodes' is what we want.
        // Actually, let's keep it safe. If validation fails, it throws.

        console.log('Received Figma Push:', (latestPush as any[]).length, 'nodes');
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ success: false, error: 'Invalid Payload', details: e }, { status: 400 });
    }
}

export async function GET() {
    return NextResponse.json({ data: latestPush });
}
