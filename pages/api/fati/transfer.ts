import { transferFati } from '../../../lib/wallet';
import { isValidFatiAmount } from '../../../lib/fati-token';
import { getUserById } from '../../../lib/database/users';

interface TransferRequest {
  fromUserId: string;
  toUserId?: string;
  toEmail?: string;
  amount: number;
}

export async function POST(request: Request) {
  try {
    const body: TransferRequest = await request.json();
    const { fromUserId, toUserId, toEmail, amount } = body;

    // Validation
    if (!fromUserId) {
      return new Response(
        JSON.stringify({ error: 'From user ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!toUserId && !toEmail) {
      return new Response(
        JSON.stringify({ error: 'Recipient user ID or email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidFatiAmount(amount)) {
      return new Response(
        JSON.stringify({ error: 'Invalid FATI amount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (amount < 10) {
      return new Response(
        JSON.stringify({ error: 'Minimum transfer amount is 10 FATI' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get recipient user ID if email provided
    let recipientId = toUserId;
    if (!recipientId && toEmail) {
      const { getUserByEmail } = await import('../../../lib/database/users');
      const recipient = await getUserByEmail(toEmail);
      
      if (!recipient) {
        return new Response(
          JSON.stringify({ error: 'Recipient not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      recipientId = recipient.id;
    }

    if (!recipientId) {
      return new Response(
        JSON.stringify({ error: 'Could not determine recipient' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-transfer
    if (fromUserId === recipientId) {
      return new Response(
        JSON.stringify({ error: 'Cannot transfer to yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Execute transfer
    try {
      const result = await transferFati(fromUserId, recipientId, amount);
      
      return new Response(
        JSON.stringify({
          success: true,
          transfer: {
            from: fromUserId,
            to: recipientId,
            amount,
            fromBalance: result.fromTransaction.balance,
            toBalance: result.toTransaction.balance,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (transferError: any) {
      return new Response(
        JSON.stringify({ error: transferError.message || 'Transfer failed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('FATI transfer error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process transfer' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
