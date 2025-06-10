import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { analyzeDatasetContent, getRelevantImagePrompt } from '@/lib/openai';

// Type for incoming data structure
interface IngestionData {
  id: string;
  filename: string;
  fileSize: number;
  title?: string;
  description?: string;
  rowCount?: number;
  columns?: string[];
  status?: string;
  filePath?: string;
  uploadDate?: string;
  fileType?: string;
  aiGenerated?: boolean;
  insights?: string[];
  imagePrompt?: string;
  summary?: string;
}

// Mock database for demonstration purposes
// Keep as private variable within this module (don't export)
const ingestionJobs: IngestionData[] = [
  {
    id: "mock-1",
    filename: "sample_data.csv",
    fileSize: 2048576, // size in bytes
    title: "Sample User Data",
    description: "A dataset containing user information for testing purposes",
    rowCount: 1500,
    columns: ["id", "name", "email", "age"],
    status: "completed",
    uploadDate: new Date().toISOString(),
    fileType: "csv"
  },
  {
    id: "mock-2",
    filename: "sales_q1.csv",
    fileSize: 4096000,
    title: "Q1 Sales Data",
    description: "First quarter sales data by product and date",
    rowCount: 3200,
    columns: ["date", "product_id", "quantity", "price"],
    status: "processing",
    uploadDate: new Date().toISOString(),
    fileType: "csv"
  }
];

// Ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

/**
 * GET handler for data ingestion endpoint
 * Retrieves information about data ingestion jobs
 */
export async function GET(request: NextRequest) {
  try {
    // Get search parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const filename = searchParams.get("filename");
    const fileId = searchParams.get("id");
    
    // If a specific file ID is requested, try to find its metadata file
    if (fileId) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      const metadataFilePath = path.join(uploadDir, `${fileId}.meta.json`);
      
      try {
        // Check if metadata file exists
        const metadataContent = await fs.readFile(metadataFilePath, 'utf-8');
        const fileMetadata = JSON.parse(metadataContent);
        
        return NextResponse.json({
          success: true,
          data: fileMetadata
        }, { status: 200 });
      } catch (error) {
        // If no metadata file found, check in-memory records as fallback
        const inMemoryFile = ingestionJobs.find(job => job.id === fileId);
        if (inMemoryFile) {
          return NextResponse.json({
            success: true, 
            data: inMemoryFile
          }, { status: 200 });
        }
        
        return NextResponse.json({
          success: false,
          error: "File not found"
        }, { status: 404 });
      }
    }
    
    // Read all metadata files from uploads directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    let metadataFiles: IngestionData[] = [];
    
    try {
      const files = await fs.readdir(uploadDir);
      const metaFiles = files.filter(file => file.endsWith('.meta.json'));
      
      // Read metadata from each file
      for (const metaFile of metaFiles) {
        try {
          const metadataContent = await fs.readFile(path.join(uploadDir, metaFile), 'utf-8');
          const fileMetadata = JSON.parse(metadataContent);
          metadataFiles.push(fileMetadata);
        } catch (e) {
          // Skip files with invalid metadata
          console.error(`Error reading metadata from ${metaFile}:`, e);
        }
      }
    } catch (e) {
      console.error("Error reading uploads directory:", e);
    }
    
    // Merge in-memory jobs with file-based metadata (file-based takes precedence)
    const allJobs = [...ingestionJobs];
    
    // Add file-based metadata if not already in memory
    for (const fileMetadata of metadataFiles) {
      const existingIndex = allJobs.findIndex(job => job.id === fileMetadata.id);
      if (existingIndex >= 0) {
        allJobs[existingIndex] = fileMetadata; // Update with file-based metadata
      } else {
        allJobs.push(fileMetadata); // Add new metadata
      }
    }
    
    // Filter results based on query parameters if provided
    let results = allJobs;
    
    if (status) {
      results = results.filter(job => job.status === status);
    }
    
    if (filename) {
      results = results.filter(job => job.filename.includes(filename));
    }
    
    // Return the filtered ingestion jobs
    return NextResponse.json({
      success: true,
      data: results
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error in ingestion GET handler:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to retrieve ingestion data"
    }, { status: 500 });
  }
}

/**
 * POST handler for data ingestion endpoint
 * Creates a new data ingestion job and saves the file content
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = formData.get('metadata');
    
    // Validate required fields
    if (!file) {
      return NextResponse.json({
        success: false,
        error: "File is required"
      }, { status: 400 });
    }
    
    let metadataObj;
    try {
      metadataObj = metadata ? JSON.parse(metadata as string) : {};
    } catch (e) {
      metadataObj = {};
    }
    
    // Get title and description from form data
    const userTitle = formData.get('title') as string;
    const userDescription = formData.get('description') as string;
    
    // Generate a unique ID and create safe filename
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const safeFilename = `${fileId}.${fileExtension}`;
    
    // Get file content as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir();
    const filePath = path.join(uploadDir, safeFilename);
    
    // Read file content for AI analysis if it's CSV or TXT
    let aiAnalysis: {
      description: string;
      summary: string;
      suggestedImageTerms: string[];
      columns: string[];
      insights: string[];
    } = {
      description: '',
      summary: '',
      suggestedImageTerms: ['data', 'analytics', 'visualization'],
      columns: [],
      insights: []
    };
    
    let fileContent = '';
    if (['csv', 'txt', 'json'].includes(fileExtension)) {
      // For text-based files, analyze content
      fileContent = buffer.toString('utf-8');
      try {
        aiAnalysis = await analyzeDatasetContent(fileContent, file.name, fileExtension);
      } catch (error) {
        console.error('Error analyzing file content:', error);
      }
    }
    
    // Generate an image prompt based on the analysis
    const imagePrompt = await getRelevantImagePrompt(aiAnalysis.suggestedImageTerms);
    
    // Use AI-generated description/title if user didn't provide them
    const title = userTitle || aiAnalysis.summary || file.name;
    const description = userDescription || aiAnalysis.description || '';
    
    // Extract columns from AI analysis or metadata
    const columns = metadataObj.columns || aiAnalysis.columns || [];
    
    // Estimate row count if not provided
    let rowCount = metadataObj.rowCount || 0;
    if (!rowCount && fileExtension === 'csv' && fileContent) {
      // Simple row count estimation for CSV
      rowCount = fileContent.split('\n').filter(line => line.trim()).length - 1; // Subtract header
      if (rowCount < 0) rowCount = 0;
    }
    
    // Create metadata object with file details
    const fileMetadata = {
      id: fileId,
      filename: file.name,
      originalFilename: file.name,
      fileSize: file.size,
      title: title,
      description: description,
      columns: columns,
      rowCount: rowCount,
      uploadDate: new Date().toISOString(),
      fileType: fileExtension,
      status: "completed",
      aiGenerated: !userDescription || !userTitle,
      insights: aiAnalysis.insights || [],
      imagePrompt: imagePrompt,
      summary: aiAnalysis.summary
    };
    
    // Create metadata file path (same name as the file but with .meta.json extension)
    const metadataFilePath = path.join(uploadDir, `${fileId}.meta.json`);
    
    // Write file to disk
    await fs.writeFile(filePath, buffer);
    
    // Write metadata to disk
    await fs.writeFile(metadataFilePath, JSON.stringify(fileMetadata, null, 2));
    
    // Create a new ingestion job
    const newJob: IngestionData = {
      id: fileId,
      filename: file.name,
      fileSize: file.size,
      title: title,
      description: description,
      status: "completed",
      columns: fileMetadata.columns,
      rowCount: fileMetadata.rowCount,
      filePath: `/uploads/${safeFilename}`,
      uploadDate: new Date().toISOString(),
      fileType: fileExtension,
      aiGenerated: fileMetadata.aiGenerated,
      insights: fileMetadata.insights,
      imagePrompt: fileMetadata.imagePrompt,
      summary: fileMetadata.summary
    };
    
    // Add to our array (in a real app, save to database)
    ingestionJobs.push(newJob);
    
    return NextResponse.json({
      success: true,
      data: newJob
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error in ingestion POST handler:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create ingestion job"
    }, { status: 500 });
  }
}
