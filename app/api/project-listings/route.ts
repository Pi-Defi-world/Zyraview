import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { z } from 'zod';

// Validation schema
const projectListingSchema = z.object({
  projectName: z.string().min(1).max(100),
  tagline: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  category: z.enum(['DeFi', 'Gaming', 'NFT/Metaverse', 'Social', 'Tools', 'Education', 'Entertainment', 'Productivity', 'Other']),
  piIntegration: z.enum(['payments', 'rewards', 'governance', 'staking', 'other']),
  links: z.object({
    website: z.string().url().optional().or(z.literal('')).optional(),
    github: z.string().url().optional().or(z.literal('')).optional(),
    twitter: z.string().url().optional().or(z.literal('')).optional(),
    discord: z.string().url().optional().or(z.literal('')).optional(),
    telegram: z.string().url().optional().or(z.literal('')).optional(),
    documentation: z.string().url().optional().or(z.literal('')).optional(),
  }),
  piWalletAddress: z.string().regex(/^G[A-Z0-9]{55}$/, 'Invalid Pi wallet address format'),
  contactInfo: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
    role: z.string().min(1).max(100),
    additionalInfo: z.string().optional(),
  }),
}).strict().passthrough();

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
    const piIntegration = searchParams.get('piIntegration');
    const search = searchParams.get('search');
    
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const collection = db.collection('projectlistings');
    
    // Build query
    const query: any = {};
    if (category) query.category = category;
    if (piIntegration) query.piIntegration = piIntegration;
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } }
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
    console.error('Error fetching project listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = projectListingSchema.parse(body);
    
    await connectToDatabase();
    
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const collection = db.collection('projectlistings');
    
    const result = await collection.insertOne({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: { id: result.insertedId, ...validatedData }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project listing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create project listing' },
      { status: 500 }
    );
  }
} 