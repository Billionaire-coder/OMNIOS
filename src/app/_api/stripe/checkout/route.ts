
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db/prisma';
import { billingService } from '@/lib/billing/BillingService';

export const POST = auth(async (req) => {
    if (!req.auth?.user?.email) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const userEmail = req.auth.user.email;
        let user = await prisma.user.findUnique({ where: { email: userEmail } });

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }

        // 1. Ensure Stripe Customer
        if (!user.stripeCustomerId) {
            const customer = await billingService.createCustomer(user.email!, user.name || undefined);
            user = await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customer.id }
            });
        }

        // 2. Create Checkout Session
        // Use environment variable for Price ID, or default to a known test ID
        const PRICE_ID = process.env.STRIPE_PRICE_ID_PRO || 'price_1Q...Placeholder';
        const SUCCESS_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`;
        const CANCEL_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`;

        const session = await billingService.createCheckoutSession(
            user.stripeCustomerId!,
            PRICE_ID,
            SUCCESS_URL,
            CANCEL_URL
        );

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return new NextResponse(error.message, { status: 500 });
    }
});
