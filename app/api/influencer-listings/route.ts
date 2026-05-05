import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    // Get pagination parameters
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;
    
    // Get filter parameters
    const category = searchParams.get('category');
    const platform = searchParams.get('platform');
    const region = searchParams.get('region');
    const search = searchParams.get('search');
    
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const collection = db.collection('influencerlistings');
    
    // Build query
    const query: any = {};
    if (category) query.category = category;
    if (platform) query.platform = platform;
    if (region) query.region = region;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const data = await collection.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const total = await collection.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching influencer listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch influencer listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const collection = db.collection('influencerlistings');
    
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
    console.error('Error creating influencer listing:', error);
    return NextResponse.json(
      { error: 'Failed to create influencer listing' },
      { status: 500 }
    );
  }
}
