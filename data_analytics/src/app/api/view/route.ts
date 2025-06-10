import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';

/**
 * GET handler for file view endpoint
 * Returns the content of a specific file by its ID
 */
export async function GET(request: NextRequest) {
  try {
    // Get file ID from search parameters
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");
    
    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: "File ID is required"
      }, { status: 400 });
    }
    
    try {
      // First get the list of ingestion jobs
      const response = await fetch(`${request.nextUrl.origin}/api/ingestion`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch file information');
      }
      
      const result = await response.json();
      const job = result.data?.find((job: any) => job.id === fileId);
      
      if (!job || !job.filePath) {
        return NextResponse.json({
          success: false,
          error: "File not found"
        }, { status: 404 });
      }
      
      // Get the file path from public directory
      const filePath = path.join(process.cwd(), 'public', job.filePath);
      
      // Read file content
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Prepare response
      const headers = new Headers();
      
      // Set content type based on file extension
      if (job.fileType === 'csv') {
        headers.set('Content-Type', 'text/csv');
      } else if (job.fileType === 'json') {
        headers.set('Content-Type', 'application/json');
      } else {
        headers.set('Content-Type', 'text/plain');
      }
      
      // Return file content
      return new NextResponse(content, { 
        status: 200,
        headers
      });
      
    } catch (error) {
      console.error('Error reading file:', error);
      return NextResponse.json({
        success: false,
        error: "Error reading file"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in file view GET handler:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to process request"
    }, { status: 500 });
  }
}
