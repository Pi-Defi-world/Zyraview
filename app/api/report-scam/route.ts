import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      walletAddress,
      description,
      evidence,
      reporterContact,
      scamType
    } = body;

    // Validate required fields
    if (!description || !scamType) {
      return NextResponse.json(
        { error: 'Missing required fields: description and scamType are required' },
        { status: 400 }
      );
    }

    // Validate scam type
    const validScamTypes = [
      'fake_project',
      'phishing',
      'suspicious_wallet',
      'fake_giveaway',
      'impersonation',
      'other'
    ];

    if (!validScamTypes.includes(scamType)) {
      return NextResponse.json(
        { error: 'Invalid scam type' },
        { status: 400 }
      );
    }

    // Basic email validation if contact is provided
    if (reporterContact) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reporterContact)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    // Get client IP and user agent for security tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const reportData = {
      scamType: scamType.trim(),
      walletAddress: walletAddress ? walletAddress.trim() : '',
      description: description.trim(),
      evidence: evidence ? evidence.trim() : '',
      reporterContact: reporterContact ? reporterContact.toLowerCase().trim() : '',
      // Status and metadata
      status: 'new', // new, under_review, resolved, dismissed
      priority: 'normal', // low, normal, high, urgent
      ipAddress,
      userAgent,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use mongoose to get the collection
    const db = (await connectToDatabase()).connection.db;
    const result = await db.collection('scamReports').insertOne(reportData);

    // TODO: Send notification email to security team
    // await sendSecurityNotification(reportData);

    // TODO: Send confirmation email to reporter if contact provided
    // if (reporterContact) {
    //   await sendConfirmationEmail(reporterContact, reportData);
    // }

    return NextResponse.json({
      success: true,
      message: 'Scam report submitted successfully',
      data: {
        reportId: result.insertedId,
        status: reportData.status,
        priority: reportData.priority
      }
    });

  } catch (error) {
    console.error('Error submitting scam report:', error);
    return NextResponse.json(
      { error: 'Failed to submit scam report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Verify admin token (implement your admin authentication logic here)
    // const isValidToken = await verifyAdminToken(token);
    // if (!isValidToken) {
    //   return NextResponse.json(
    //     { error: 'Invalid token' },
    //     { status: 401 }
    //   );
    // }

    await connectToDatabase();

    // Get query parameters
    const status = searchParams.get('status');
    const scamType = searchParams.get('scamType');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (scamType && scamType !== 'all') {
      filter.scamType = scamType;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Use mongoose to get the collection
    const db = (await connectToDatabase()).connection.db;

    // Get scam reports with pagination
    const reports = await db.collection('scamReports')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const totalCount = await db.collection('scamReports').countDocuments(filter);

    // Get status counts for dashboard
    const statusCounts = await db.collection('scamReports').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();

    // Get scam type counts
    const scamTypeCounts = await db.collection('scamReports').aggregate([
      { $group: { _id: '$scamType', count: { $sum: 1 } } }
    ]).toArray();

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        },
        statusCounts,
        scamTypeCounts
      }
    });

  } catch (error) {
    console.error('Error fetching scam reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
} 