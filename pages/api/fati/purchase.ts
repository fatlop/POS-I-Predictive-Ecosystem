import { stripe, formatAmountForStripe } from '../../../lib/stripe';
import { addFatiToWallet } from '../../../lib/wallet';
import { FATI_PURCHASE_OPTIONS, calculateFatiWithBonus } from '../../../lib/fati-token';

interface FatiPurchaseRequest {
  userId: string;
  amount: number; // USD amount
  fatiAmount?: number; // FATI amount to purchase
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(request: Request) {
  try {
    const body: FatiPurchaseRequest = await request.json();
    const { userId, amount, fatiAmount, successUrl, cancelUrl } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!amount && !fatiAmount) {
      return new Response(
        JSON.stringify({ error: 'Amount or FATI amount is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find matching purchase option
    let purchaseOption;
    if (fatiAmount) {
      purchaseOption = FATI_PURCHASE_OPTIONS.find(opt => opt.amount === fatiAmount);
    } else if (amount) {
      purchaseOption = FATI_PURCHASE_OPTIONS.find(opt => opt.price === amount);
    }

    if (!purchaseOption) {
      return new Response(
        JSON.stringify({ error: 'Invalid purchase amount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${purchaseOption.totalFati} FATI Tokens`,
              description: `Purchase ${purchaseOption.amount} FATI + ${purchaseOption.bonus}% bonus`,
              images: ['https://via.placeholder.com/300/6366f1/ffffff?text=FATI'],
            },
            unit_amount: formatAmountForStripe(purchaseOption.price),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/wallet?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/wallet`,
      client_reference_id: userId,
      metadata: {
        userId,
        type: 'fati_purchase',
        fatiAmount: purchaseOption.totalFati.toString(),
        baseAmount: purchaseOption.amount.toString(),
        bonus: purchaseOption.bonus.toString(),
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        purchaseOption,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('FATI purchase error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create purchase session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle FATI purchase completion (called from webhook)
export async function completeFatiPurchase(
  userId: string,
  fatiAmount: number,
  metadata: Record<string, any>
): Promise<boolean> {
  try {
    await addFatiToWallet(userId, fatiAmount, 'purchase', {
      source: 'stripe_purchase',
      ...metadata,
    });
    return true;
  } catch (error) {
    console.error('Error completing FATI purchase:', error);
    return false;
  }
}
