import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId for converting string ID to MongoDB ObjectId

// Define the RouteContext interface
interface RouteContext {
  params: Promise<{ id: string }>; // params is now expected to be a Promise
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext // Use the defined interface here
) { 
  try {
    // Await context.params to get the resolved object
    const resolvedParams = await context.params;
    const { id } = resolvedParams; // Destructure id from the resolved object
    
    // Ensure the ID is a valid ObjectId for MongoDB queries
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, priority, notes } = body;

    // Validate status if provided
    if (status) {
      const validStatuses = ['new', 'under_review', 'resolved', 'dismissed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: 'Invalid priority value' },
          { status: 400 }
        );
      }
    }

    const db = (await connectToDatabase()).connection.db; // Connect and get the database instance
    
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (notes) updateData.adminNotes = notes;

    const result = await db.collection('scamReports').updateOne(
      { _id: new ObjectId(id) }, // Convert id string to ObjectId for query
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Report updated successfully'
    });

  } catch (error) {
    console.error('Error updating scam report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: RouteContext // Use the defined interface here
) {
  try {
    // Await context.params to get the resolved object
    const resolvedParams = await context.params;
    const { id } = resolvedParams; // Destructure id from the resolved object

    // Ensure the ID is a valid ObjectId for MongoDB queries
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const db = (await connectToDatabase()).connection.db;
    
    const report = await db.collection('scamReports').findOne({ _id: new ObjectId(id) }); // Convert id string to ObjectId for query

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Error fetching scam report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}