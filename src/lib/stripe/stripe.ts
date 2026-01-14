
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    // Warn but don't crash in dev, allows build to pass without env
    console.warn('STRIPE_SECRET_KEY is missing. Stripe calls will fail.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    // apiVersion: '2023-10-16', // Let Stripe usage default or specify later
    typescript: true,
});
