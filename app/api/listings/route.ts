import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    let data = [];
    
    if (type === 'business') {
      // Fetch from businesslistings collection
      const mongoose = await connectToDatabase();
      const collection = mongoose.connection.db.collection('businesslistings');
      data = await collection.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    } else if (type === 'startup') {
      // Fetch from startuplistings collection
      const mongoose = await connectToDatabase();
      const collection = mongoose.connection.db.collection('startuplistings');
      data = await collection.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    } else if (type === 'project') {
      // Fetch from projectlistings collection
      const mongoose = await connectToDatabase();
      const collection = mongoose.connection.db.collection('projectlistings');
      data = await collection.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    } else if (type === 'influencer') {
      // Fetch from influencerlistings collection
      const mongoose = await connectToDatabase();
      const collection = mongoose.connection.db.collection('influencerlistings');
      data = await collection.find({}).sort({ createdAt: -1 }).limit(50).toArray();
    } else {
      // Return all listings if no type specified
      const mongoose = await connectToDatabase();
      const [business, startup, project, influencer] = await Promise.all([
        mongoose.connection.db.collection('businesslistings').find({}).sort({ createdAt: -1 }).limit(20).toArray(),
        mongoose.connection.db.collection('startuplistings').find({}).sort({ createdAt: -1 }).limit(20).toArray(),
        mongoose.connection.db.collection('projectlistings').find({}).sort({ createdAt: -1 }).limit(20).toArray(),
        mongoose.connection.db.collection('influencerlistings').find({}).sort({ createdAt: -1 }).limit(20).toArray()
      ]);
      
      return NextResponse.json({
        success: true,
        business,
        startup,
        project,
        influencer
      });
    }
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching listings data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch listings data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mongoose = await connectToDatabase();
    
    let collection;
    
    if (body.type === 'business') {
      collection = mongoose.connection.db.collection('businesslistings');
    } else if (body.type === 'startup') {
      collection = mongoose.connection.db.collection('startuplistings');
    } else if (body.type === 'project') {
      collection = mongoose.connection.db.collection('projectlistings');
    } else if (body.type === 'influencer') {
      collection = mongoose.connection.db.collection('influencerlistings');
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid listing type specified' },
        { status: 400 }
      );
    }
    
    const result = await collection.insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({
      success: true,
      data: { id: result.insertedId, ...body }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create listing',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 