import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { sign, verify } from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
const PI_API_URL = 'https://api.minepi.com/v2/me';
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export async function POST(req: NextRequest) {
  try {
    const response = await fetch(`${process.env.SERVER_URL}/api/pi/auth`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Pi auth:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Pi auth' },
      { status: 500 }
    );
  }
} 