import { NextRequest, NextResponse } from 'next/server';
import { getPiNetworkBackendService } from '../../../../../lib/pi-network';
import connectToDatabase from '../../../../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, txid, listingData, listingType } = await request.json();

    console.log('Payment completion request:', { paymentId, txid, listingType, hasListingData: !!listingData });

    if (!paymentId || !txid) {
      return NextResponse.json(
        { error: 'Payment ID and transaction ID are required' },
        { status: 400 }
      );
    }

    // Get Pi Network backend service
    const piService = getPiNetworkBackendService();

    // Complete the payment on Pi Network
    const paymentData = await piService.completePayment(paymentId, txid);

    console.log(`Payment ${paymentId} completed successfully with txid: ${txid}`);

    // If listing data is provided, save it to the database
    if (listingData && listingType) {
      console.log('Saving listing to database:', { listingType, listingData });
      
      try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        console.log('Database connected successfully');
        
        // Prepare listing document with payment information
        const listingDocument = {
          ...listingData,
          paymentId,
          txid,
          amount: paymentData.amount,
          status: 'paid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        console.log('Prepared listing document:', listingDocument);

        // Save to appropriate collection based on listing type
        let collection;
        switch (listingType) {
          case 'business':
            collection = db.collection('businesslistings');
            break;
          case 'startup':
            collection = db.collection('startuplistings');
            break;
          case 'community':
            collection = db.collection('communitylistings');
            break;
          case 'influencer':
            collection = db.collection('influencerlistings');
            break;
          case 'project':
            collection = db.collection('projectlistings');
            break;
          default:
            throw new Error(`Invalid listing type: ${listingType}`);
        }

        console.log(`Saving to collection: ${collection.collectionName}`);

        const result = await collection.insertOne(listingDocument);
        console.log(`Listing saved to database with ID: ${result.insertedId}`);

        return NextResponse.json({ 
          success: true, 
          message: 'Payment completed and listing saved successfully',
          paymentId,
          txid,
          listingId: result.insertedId
        });

      } catch (dbError) {
        console.error('Error saving listing to database:', dbError);
        // Payment was completed but listing save failed
        return NextResponse.json({ 
          success: true, 
          message: 'Payment completed but failed to save listing',
          paymentId,
          txid,
          error: 'Database save failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        });
      }
    } else {
      console.log('No listing data provided, skipping database save');
    }

    // Payment completed without listing data
    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully',
      paymentId,
      txid
    });

  } catch (error) {
    console.error('Error completing payment:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to complete payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
