// Simple in-memory store for Webhook Events (Dev/Designer usage)
// In production, this would be a database table "webhook_events"

interface WebhookEvent {
    id: string;
    hookId: string; // The webhook ID this event belongs to
    payload: any;
    timestamp: number;
    headers: any;
}

class WebhookStore {
    private events: WebhookEvent[] = [];

    addEvent(hookId: string, payload: any, headers: any) {
        const event = {
            id: Math.random().toString(36).substring(7),
            hookId,
            payload,
            timestamp: Date.now(),
            headers
        };
        // Keep only last 50 events total for dev
        this.events = [event, ...this.events].slice(0, 50);
        return event;
    }

    getEvents(hookId: string) {
        return this.events.filter(e => e.hookId === hookId);
    }

    clear(hookId: string) {
        this.events = this.events.filter(e => e.hookId !== hookId);
    }
}

// Global singleton for Next.js dev server hot-reloading preservation
const globalStore = (globalThis as any).webhookStore || new WebhookStore();
if (process.env.NODE_ENV !== 'production') (globalThis as any).webhookStore = globalStore;

export const webhookStore = globalStore as WebhookStore;
