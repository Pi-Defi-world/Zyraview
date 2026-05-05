import { NextRequest, NextResponse } from 'next/server';

const PI_API_KEY = process.env.PI_API_KEY;

export async function GET(request: NextRequest) {
  try {
    if (!PI_API_KEY) {
      console.error('Pi Network API key not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Get incomplete server payments from Pi Network API
    const response = await fetch(`https://api.minepi.com/v2/payments/incomplete_server_payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to get incomplete payments:', errorData);
      return NextResponse.json(
        { error: 'Failed to get incomplete payments', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Incomplete payments retrieved:', data);

    return NextResponse.json({
      success: true,
      incompletePayments: data.incomplete_server_payments || []
    });
  } catch (error) {
    console.error('Error getting incomplete payments:', error);
    return NextResponse.json(
      { error: 'Failed to get incomplete payments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, paymentId, txid } = body;

    if (!PI_API_KEY) {
      console.error('Pi Network API key not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    if (action === 'cancel' && paymentId) {
      // Cancel the incomplete payment
      const cancelResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json();
        console.error('Failed to cancel payment:', errorData);
        return NextResponse.json(
          { error: 'Failed to cancel payment', details: errorData },
          { status: cancelResponse.status }
        );
      }

      const cancelData = await cancelResponse.json();
      console.log('Payment cancelled successfully:', cancelData);

      return NextResponse.json({
        success: true,
        action: 'cancelled',
        paymentId: paymentId,
        message: 'Payment cancelled successfully',
        data: cancelData
      });
    }

    if (action === 'complete' && paymentId && txid) {
      // Complete the incomplete payment
      const completeResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txid })
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        console.error('Failed to complete payment:', errorData);
        return NextResponse.json(
          { error: 'Failed to complete payment', details: errorData },
          { status: completeResponse.status }
        );
      }

      const completeData = await completeResponse.json();
      console.log('Payment completed successfully:', completeData);

      return NextResponse.json({
        success: true,
        action: 'completed',
        paymentId: paymentId,
        txid: txid,
        message: 'Payment completed successfully',
        data: completeData
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling incomplete payment:', error);
    return NextResponse.json(
      { error: 'Failed to handle incomplete payment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 