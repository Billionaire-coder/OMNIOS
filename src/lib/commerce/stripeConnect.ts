
export interface StripeConfig {
    publishableKey: string;
    connectedAccountId?: string;
}

export const stripeConfig: StripeConfig = {
    publishableKey: 'pk_test_SIMULATED_KEY_12345',
};

export async function initiateStripeCheckout(cart: any): Promise<{ success: boolean; sessionUrl?: string; error?: string }> {
    console.log("Stripe Connect: Initiating Checkout for", cart);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (cart.items.length === 0) {
        return { success: false, error: "Cart is empty" };
    }

    // Simulate different outcomes based on cart total for testing
    const total = cart.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    if (total > 5000) {
        return { success: false, error: "Simulated Decline: High Value Risk (Test)" };
    }

    return {
        success: true,
        sessionUrl: `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substr(2, 9)}`
    };
}
