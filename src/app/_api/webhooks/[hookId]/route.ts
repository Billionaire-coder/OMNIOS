import { NextResponse } from 'next/server';
import { webhookStore } from '@/lib/server/WebhookStore';

export async function POST(req: Request, { params }: { params: Promise<{ hookId: string }> }) {
    try {
        const { hookId } = await params;

        let payload = {};
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const body = await req.json();
            // Validate basic structure (though webhooks are dynamic, we ensure it's an object)
            // Ideally we validate per provider, but for now we ensure it's safe JSON
            if (typeof body !== 'object' || body === null) throw new Error("Invalid JSON payload");
            payload = body;
        } else {
            payload = { raw: await req.text() };
        }

        const headers = Object.fromEntries(req.headers.entries());

        webhookStore.addEvent(hookId, payload, headers);

        console.log(`[Webhook] Received event for ${hookId}`);

        return NextResponse.json({ success: true, received: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ hookId: string }> }) {
    // Simple echo or status check
    const { hookId } = await params;
    return NextResponse.json({ status: 'active', hookId });
}
