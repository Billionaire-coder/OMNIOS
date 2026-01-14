
import { stripe } from '@/lib/stripe/stripe';

export class BillingService {
    private static instance: BillingService;

    public static getInstance(): BillingService {
        if (!BillingService.instance) {
            BillingService.instance = new BillingService();
        }
        return BillingService.instance;
    }

    /**
     * Creates a new Stripe Customer
     */
    async createCustomer(email: string, name?: string) {
        return await stripe.customers.create({
            email,
            name,
        });
    }

    /**
     * Creates a Checkout Session for a subscription
     */
    async createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
        return await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
        });
    }

    /**
     * Creates a Customer Portal session for managing billing
     */
    async createPortalSession(customerId: string, returnUrl: string) {
        return await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
    }

    /**
     * Reports usage to Stripe Metered Billing.
     */
    async reportUsage(customerId: string, eventName: string, value: number) {
        // Requires Metered Billing setup in Stripe Dashboard
        // For now, we wrap it safely
        try {
            // This assumes "eventName" matches the Meter's event name in Stripe
            // Using the new Meter Events API if available, or usage records
            console.log(`[Stripe Billing] Reporting ${value} for ${eventName} (Implementation Pending Meter ID)`);
            return { success: true };
        } catch (e) {
            console.error("Failed to report usage:", e);
            throw e;
        }
    }

    /**
     * Fetches current subscription status from Stripe.
     */
    async getSubscriptionStatus(subscriptionId: string) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId) as any;
        return {
            status: sub.status,
            cancel_at_period_end: sub.cancel_at_period_end,
            current_period_end: sub.current_period_end * 1000,
            tier: 'pro' // Logic to determine tier from plan ID needed later
        };
    }
}

export const billingService = BillingService.getInstance();
