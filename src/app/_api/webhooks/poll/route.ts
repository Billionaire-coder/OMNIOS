import { NextResponse } from 'next/server';
import { webhookStore } from '@/lib/server/WebhookStore';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const hookId = searchParams.get('hookId');

    if (!hookId) {
        return NextResponse.json({ events: [] });
    }

    const events = webhookStore.getEvents(hookId);
    return NextResponse.json({ events });
}
