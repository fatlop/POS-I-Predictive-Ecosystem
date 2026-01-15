import { supabase } from '../../../lib/supabase';
import { getUserById } from '../../../lib/database/users';

interface CreateReferralRequest {
  userId: string;
}

export async function POST(request: Request) {
  try {
    const body: CreateReferralRequest = await request.json();
    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get user to ensure they exist
    const user = await getUserById(userId);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // User should already have a referral code from database trigger
    // But if not, we can generate one
    if (!user.referralCode) {
      const code = `REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const { error } = await supabase
        .from('users')
        .update({ referral_code: code })
        .eq('id', userId);
        
      if (error) {
        console.error('Error generating referral code:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to generate referral code' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({
          referralCode: code,
          referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${code}`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        referralCode: user.referralCode,
        referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${user.referralCode}`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Create referral error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create referral' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET endpoint to retrieve referral info
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await getUserById(userId);
    
    if (!user || !user.referralCode) {
      return new Response(
        JSON.stringify({ error: 'Referral code not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get referral statistics
    const { getReferralStats } = await import('../../../lib/database/users');
    const stats = await getReferralStats(userId);

    return new Response(
      JSON.stringify({
        referralCode: user.referralCode,
        referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${user.referralCode}`,
        stats,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Get referral error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to get referral' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
