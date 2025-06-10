import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Ensure the uploads directory exists
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

/**
 * POST handler for downloading files from EdgeStore
 * Takes an EdgeStore URL, downloads the file, and saves it in the project
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { url, filename } = body;
    
    if (!url) {
      return NextResponse.json({
        success: false,
        error: "URL is required"
      }, { status: 400 });
    }
    
    // Generate a unique filename if one isn't provided
    const actualFilename = filename || path.basename(url) || `file-${uuidv4()}`;
    const fileExtension = path.extname(actualFilename) || guessExtensionFromUrl(url);
    const safeFilename = `${uuidv4()}${fileExtension}`;
    
    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir();
    const filePath = path.join(uploadDir, safeFilename);
    
    // Fetch the file from EdgeStore
    const response = await fetch(url);
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to download file: ${response.status} ${response.statusText}`
      }, { status: 500 });
    }
    
    // Get file content as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write file to disk
    await fs.writeFile(filePath, buffer);
    
    // Get content type from response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Return success response with file info
    return NextResponse.json({
      success: true,
      data: {
        id: safeFilename.split('.')[0],
        originalUrl: url,
        originalFilename: filename || path.basename(url) || 'unknown',
        filename: safeFilename,
        filePath: `/uploads/${safeFilename}`,
        contentType,
        fileSize: buffer.length,
        downloadDate: new Date().toISOString(),
        fileType: fileExtension.replace('.', '') || 'unknown'
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in download POST handler:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to download file: " + (error instanceof Error ? error.message : String(error))
    }, { status: 500 });
  }
}

/**
 * GET handler to list downloaded files
 */
export async function GET(request: NextRequest) {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await fs.access(uploadDir);
    } catch (error) {
      // Directory doesn't exist yet, return empty array
      return NextResponse.json({
        success: true,
        data: []
      }, { status: 200 });
    }
    
    const files = await fs.readdir(uploadDir);
    const fileStats = await Promise.all(files.map(async (file) => {
      const filePath = path.join(uploadDir, file);
      const stats = await fs.stat(filePath);
      return {
        filename: file,
        filePath: `/uploads/${file}`,
        fileSize: stats.size,
        downloadDate: stats.mtime.toISOString(),
        fileType: path.extname(file).replace('.', '') || 'unknown',
      };
    }));
    
    return NextResponse.json({
      success: true,
      data: fileStats
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in download GET handler:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to list downloaded files"
    }, { status: 500 });
  }
}

/**
 * Guess the file extension from a URL or content type
 */
function guessExtensionFromUrl(url: string): string {
  // Try to extract extension from URL
  const urlMatch = url.match(/\.([a-zA-Z0-9]+)(?:[?#]|$)/);
  if (urlMatch && urlMatch[1]) {
    return `.${urlMatch[1].toLowerCase()}`;
  }
  
  // Default to .bin if no extension can be determined
  return '.bin';
}
