import { NextRequest, NextResponse } from 'next/server';
import { getPiNetworkBackendService } from '../../../../../lib/pi-network';

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get Pi Network backend service
    const piService = getPiNetworkBackendService();

    // Cancel the payment on Pi Network
    await piService.cancelPayment(paymentId);

    console.log(`Payment ${paymentId} cancelled successfully`);

    return NextResponse.json({ 
      success: true, 
      message: 'Payment cancelled successfully',
      paymentId 
    });

  } catch (error) {
    console.error('Error cancelling payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to cancel payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
