import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      subject,
      message
    } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get client IP and user agent for security tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const contactData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      // Status and metadata
      status: 'new', // new, in-progress, resolved, closed
      priority: 'normal', // low, normal, high, urgent
      ipAddress,
      userAgent,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Use mongoose to get the collection
    const db = (await connectToDatabase()).connection.db;
    const result = await db.collection('contactInquiries').insertOne(contactData);

    // TODO: Send confirmation email to user
    // await sendConfirmationEmail(email, name);

    // TODO: Send notification email to admin/support team
    // await sendNotificationEmail(contactData);

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        inquiryId: result.insertedId,
        status: contactData.status
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
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
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    // Use mongoose to get the collection
    const db = (await connectToDatabase()).connection.db;

    // Get contact inquiries with pagination
    const inquiries = await db.collection('contactInquiries')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count
    const totalCount = await db.collection('contactInquiries').countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: {
        inquiries,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
} 