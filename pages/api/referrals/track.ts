import { supabase } from '../../../lib/supabase';
import { getUserByReferralCode, linkReferredUser } from '../../../lib/database/users';
import { addFatiToWallet } from '../../../lib/wallet';

interface TrackReferralRequest {
  referralCode: string;
  newUserId: string;
}

const REFERRAL_BONUS_REFEREE = 100; // Bonus for new user
const REFERRAL_BONUS_REFERRER_PERCENT = 20; // 20% of first purchase

export async function POST(request: Request) {
  try {
    const body: TrackReferralRequest = await request.json();
    const { referralCode, newUserId } = body;

    if (!referralCode || !newUserId) {
      return new Response(
        JSON.stringify({ error: 'Referral code and new user ID are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find referrer by code
    const referrer = await getUserByReferralCode(referralCode);
    
    if (!referrer) {
      return new Response(
        JSON.stringify({ error: 'Invalid referral code' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-referral
    if (referrer.id === newUserId) {
      return new Response(
        JSON.stringify({ error: 'Cannot refer yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Link the referred user
    const linked = await linkReferredUser(newUserId, referrer.id);
    
    if (!linked) {
      return new Response(
        JSON.stringify({ error: 'Failed to link referral' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Award welcome bonus to new user
    await addFatiToWallet(newUserId, REFERRAL_BONUS_REFEREE, 'reward', {
      source: 'referral_signup',
      referredBy: referrer.id,
    });

    // Create referral record
    const { error: refError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: newUserId,
        reward_fati: 0, // Will be updated on first purchase
        status: 'pending',
      });

    if (refError) {
      console.error('Error creating referral record:', refError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        bonusAwarded: REFERRAL_BONUS_REFEREE,
        referrer: {
          id: referrer.id,
          email: referrer.email,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Track referral error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to track referral' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function to complete referral when referred user makes first purchase
export async function completeReferral(
  referredUserId: string,
  purchaseAmount: number
): Promise<void> {
  try {
    // Find pending referral
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', referredUserId)
      .eq('status', 'pending')
      .single();

    if (!referral) {
      return; // No pending referral found
    }

    // Calculate referrer bonus (20% of purchase)
    const referrerBonus = Math.floor(purchaseAmount * (REFERRAL_BONUS_REFERRER_PERCENT / 100));

    // Award bonus to referrer
    await addFatiToWallet(referral.referrer_id, referrerBonus, 'reward', {
      source: 'referral_completion',
      referredUser: referredUserId,
      purchaseAmount,
    });

    // Update referral status
    await supabase
      .from('referrals')
      .update({
        status: 'completed',
        reward_fati: referrerBonus,
        completed_at: new Date().toISOString(),
      })
      .eq('id', referral.id);

    console.log(`Referral completed: ${referrerBonus} FATI awarded to referrer ${referral.referrer_id}`);
  } catch (error) {
    console.error('Error completing referral:', error);
  }
}
