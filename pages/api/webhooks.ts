import { stripe } from '../../lib/stripe';
import { updateUserSubscription } from '../../lib/database/users';
import { addFatiToWallet } from '../../lib/wallet';
import { TIER_LIMITS } from '../../config/pricing';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  const tier = session.metadata?.tier as 'basic' | 'pro' | 'enterprise';

  if (!userId || !tier) {
    console.error('Missing userId or tier in checkout session');
    return;
  }

  // Update user subscription
  await updateUserSubscription(userId, tier, session.customer as string);

  // Award welcome bonus FATI
  const bonus = TIER_LIMITS[tier]?.fatiBonus || 0;
  if (bonus > 0) {
    await addFatiToWallet(userId, bonus, 'reward', {
      source: 'subscription_bonus',
      tier,
    });
  }

  console.log(`Subscription created for user ${userId} - Tier: ${tier}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Determine tier from subscription
  const tier = getTierFromSubscription(subscription);
  
  if (tier) {
    await updateUserSubscription(userId, tier);
    console.log(`Subscription updated for user ${userId} - Tier: ${tier}`);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  // Downgrade to free tier
  await updateUserSubscription(userId, 'free');
  console.log(`Subscription cancelled for user ${userId} - Downgraded to free`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded for invoice ${invoice.id}`);
  // Could send success email here
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Payment failed for invoice ${invoice.id}`);
  // Could send failed payment notification here
}

function getTierFromSubscription(subscription: Stripe.Subscription): 'basic' | 'pro' | 'enterprise' | null {
  const priceId = subscription.items.data[0]?.price.id;
  
  if (!priceId) return null;

  // Map price IDs to tiers
  if (priceId === process.env.STRIPE_PRICE_BASIC) return 'basic';
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_ENTERPRISE) return 'enterprise';

  return null;
}
