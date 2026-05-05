import { NextRequest, NextResponse } from 'next/server';
import { getPiNetworkBackendService } from '../../../../../lib/pi-network';
import connectToDatabase from '../../../../../lib/mongodb';

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

    // Approve the payment on Pi Network
    await piService.approvePayment(paymentId);

    console.log(`Payment ${paymentId} approved successfully`);

    return NextResponse.json({ 
      success: true, 
      message: 'Payment approved successfully',
      paymentId 
    });

  } catch (error) {
    console.error('Error approving payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to approve payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
