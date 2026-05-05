import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { z } from 'zod';

// Validation schema
const startupListingSchema = z.object({
  projectInfo: z.object({
    name: z.string().min(1).max(100),
    tagline: z.string().min(1).max(200),
    category: z.enum([
      'DeFi', 'Gaming', 'NFT/Metaverse', 'Social', 
      'Tools', 'Education', 'Entertainment', 'Productivity', 
      'FinTech', 'Healthcare', 'Supply Chain', 'Identity', 'IoT', 'Other'
    ]),
    stage: z.enum(['Idea Stage', 'Prototype', 'MVP', 'Beta Testing', 'Pre-Launch', 'Early Access']),
    description: z.string().min(1).max(2000),
    problemSolved: z.string().min(1).max(1000),
    solution: z.string().min(1).max(1000),
    targetAudience: z.string().min(1).max(500),
  }),
  teamInfo: z.object({
    founders: z.array(z.object({
      name: z.string().min(1).max(100),
      role: z.string().min(1).max(100),
      background: z.string().min(1).max(500),
      linkedIn: z.string().url().optional().or(z.literal('')),
    })).min(1),
    teamSize: z.number().min(1).max(1000),
    keySkills: z.array(z.string().max(50)).optional(),
  }),
  fundingInfo: z.object({
    stage: z.enum(['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Not Seeking', 'Self-Funded']),
    amountRaised: z.number().min(0).optional(),
    amountSeeking: z.number().min(0).optional(),
    currency: z.enum(['USD', 'EUR', 'Pi', 'BTC', 'ETH']).default('USD'),
    previousInvestors: z.string().max(500).optional(),
    useOfFunds: z.string().max(1000).optional(),
  }),
  piIntegration: z.object({
    type: z.enum(['payments', 'rewards', 'governance', 'staking', 'utility', 'other']),
    implementation: z.string().min(1).max(1000),
    benefits: z.string().min(1).max(1000),
    walletAddress: z.string().regex(/^G[A-Z0-9]{55}$/, 'Invalid Pi wallet address format').optional().or(z.literal('')),
  }),
  links: z.object({
    website: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    demo: z.string().url().optional().or(z.literal('')),
    pitchDeck: z.string().url().optional().or(z.literal('')),
    whitepaper: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
  }),
  milestones: z.array(z.object({
    title: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    targetDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
    status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  })).optional(),
  goals: z.object({
    sixMonths: z.string().min(1).max(500),
    oneYear: z.string().min(1).max(500),
    longTerm: z.string().min(1).max(500),
  }),
  contactInfo: z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
    role: z.string().min(1).max(100),
    phone: z.string().optional(),
  }),
});

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
    const stage = searchParams.get('stage');
    const fundingStage = searchParams.get('fundingStage');
    const search = searchParams.get('search');
    
    const mongoose = (await import('mongoose')).default;
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    const collection = mongoose.connection.db.collection('startuplistings');
    
    // Build query
    const query: any = {};
    if (category) query['projectInfo.category'] = category;
    if (stage) query['projectInfo.stage'] = stage;
    if (fundingStage) query['fundingInfo.stage'] = fundingStage;
    if (search) {
      query.$or = [
        { 'projectInfo.name': { $regex: search, $options: 'i' } },
        { 'projectInfo.description': { $regex: search, $options: 'i' } },
        { 'projectInfo.tagline': { $regex: search, $options: 'i' } }
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
    console.error('Error fetching startup listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch startup listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = startupListingSchema.parse(body);
    
    await connectToDatabase();
    
    const mongoose = (await import('mongoose')).default;
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    const collection = mongoose.connection.db.collection('startuplistings');
    
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
    console.error('Error creating startup listing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create startup listing' },
      { status: 500 }
    );
  }
}