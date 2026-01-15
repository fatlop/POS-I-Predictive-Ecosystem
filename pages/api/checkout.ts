import { stripe, formatAmountForStripe } from '../../lib/stripe';
import { PRICING_PLANS } from '../../config/pricing';

interface CheckoutRequest {
  priceId?: string;
  tier?: 'basic' | 'pro' | 'enterprise';
  userId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json();
    const { priceId, tier, userId, successUrl, cancelUrl } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get price ID from tier if not provided
    let finalPriceId = priceId;
    if (!finalPriceId && tier) {
      const plan = PRICING_PLANS.find(p => p.id === tier);
      if (plan && plan.priceId) {
        finalPriceId = plan.priceId;
      }
    }

    if (!finalPriceId) {
      return new Response(
        JSON.stringify({ error: 'Price ID or tier is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      client_reference_id: userId,
      metadata: {
        userId,
        tier: tier || 'unknown',
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
