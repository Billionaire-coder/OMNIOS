
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { prisma } from '@/lib/db/prisma';
import Stripe from 'stripe';

export const POST = async (req: Request) => {
    const body = await req.text();
    const signature = req.headers.get('Stripe-Signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET");
        return new NextResponse('Server config error', { status: 500 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                if (!session.customer || !session.subscription) break;

                // Find user by Stripe Customer ID provided in session
                // We should have saved it during checkout creation
                await prisma.user.updateMany({
                    where: { stripeCustomerId: session.customer as string },
                    data: {
                        subscriptionId: session.subscription as string,
                        subscriptionStatus: 'active', // Assume active initially
                        // We'll get exact expiry from invoice or subscription object
                    }
                });
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                if (!invoice.customer || !invoice.subscription) break;

                await prisma.user.updateMany({
                    where: { stripeCustomerId: invoice.customer as string },
                    data: {
                        subscriptionStatus: 'active',
                        currentPeriodEnd: new Date((invoice.lines.data[0].period.end) * 1000)
                    }
                });
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object as Stripe.Subscription;
                await prisma.user.updateMany({
                    where: { stripeCustomerId: sub.customer as string },
                    data: {
                        subscriptionStatus: 'canceled',
                        subscriptionId: null
                    }
                });
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (e) {
        console.error("Webhook processing error:", e);
        return new NextResponse('Webhook processing failed', { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
};
