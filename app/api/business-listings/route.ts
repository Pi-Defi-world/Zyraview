import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { z } from 'zod';

// Validation schema
const businessListingSchema = z.object({
  businessInfo: z.object({
    name: z.string().min(1).max(100),
    type: z.enum(['local_business', 'online_business', 'franchise', 'enterprise', 'startup']),
    category: z.enum([
      'Restaurant & Food', 'Retail & Shopping', 'Health & Wellness', 'Beauty & Personal Care',
      'Automotive', 'Home & Garden', 'Professional Services', 'Financial Services',
      'Real Estate', 'Travel & Tourism', 'Entertainment', 'Sports & Recreation',
      'Education & Training', 'Technology', 'Manufacturing', 'Construction',
      'Transportation', 'Agriculture', 'Non-Profit', 'Government', 'Other'
    ]),
    description: z.string().min(1).max(2000),
    tagline: z.string().max(150).optional(),
    founded: z.string().optional().transform(val => val ? new Date(val) : undefined),
    employees: z.enum(['1', '2-5', '6-10', '11-25', '26-50', '51-100', '101-500', '501-1000', '1000+']).optional(),
    revenue: z.enum(['<$10K', '$10K-$50K', '$50K-$100K', '$100K-$500K', '$500K-$1M', '$1M-$5M', '$5M-$10M', '$10M+', 'Prefer not to say']).optional(),
  }),
  locationInfo: z.object({
    address: z.string().max(200).optional(),
    city: z.string().min(1).max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().min(1).max(100).optional(),
    zipCode: z.string().max(20).optional(),
    timezone: z.string().optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).optional(),
  }).optional(),
  piIntegration: z.object({
    acceptsPiPayments: z.boolean(),
    piWalletAddress: z.string().regex(/^G[A-Z0-9]{55}$/, 'Invalid Pi wallet address format').optional().or(z.literal('')),
    integrationLevel: z.enum(['planning', 'testing', 'partial', 'full']),
    services: z.array(z.string().max(100)),
    benefits: z.string().max(1000).optional(),
    implementation: z.string().max(1000).optional(),
  }),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().max(20).optional(),
    website: z.string().url().optional().or(z.literal('')),
    name: z.string().min(1).max(100),
    role: z.string().min(1).max(100),
    preferredContact: z.enum(['email', 'phone', 'website']),
  }),
  businessDetails: z.object({
    operatingHours: z.object({
      monday: z.string().optional(),
      tuesday: z.string().optional(),
      wednesday: z.string().optional(),
      thursday: z.string().optional(),
      friday: z.string().optional(),
      saturday: z.string().optional(),
      sunday: z.string().optional(),
    }).optional(),
    languages: z.array(z.string()).optional(),
    paymentMethods: z.array(z.string()).optional(),
    specialOffers: z.string().max(500).optional(),
    certifications: z.array(z.string()).optional(),
  }).optional(),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    tiktok: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
  }).optional(),
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
    const type = searchParams.get('type');
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const collection = db.collection('businesslistings');
    
    // Build query
    const query: any = {};
    if (category) query['businessInfo.category'] = category;
    if (type) query['businessInfo.type'] = type;
    if (country) query['locationInfo.country'] = country;
    if (city) query['locationInfo.city'] = city;
    if (search) {
      query.$or = [
        { 'businessInfo.name': { $regex: search, $options: 'i' } },
        { 'businessInfo.description': { $regex: search, $options: 'i' } },
        { 'businessInfo.tagline': { $regex: search, $options: 'i' } }
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
    console.error('Error fetching business listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = businessListingSchema.parse(body);
    
    await connectToDatabase();
    
    const mongoose = (await import('mongoose')).default;
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    const collection = db.collection('businesslistings');
    
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
    console.error('Error creating business listing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create business listing' },
      { status: 500 }
    );
  }
} 