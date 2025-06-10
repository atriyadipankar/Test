"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadDataSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper function to format file size with appropriate units
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  if (bytes < 1024) {
    return `${bytes} Bytes`;
  }
  
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  // For very small files that round to 0.00, show at least 0.01
  const size = bytes / Math.pow(1024, i);
  const formattedSize = size < 0.01 ? '0.01' : size.toFixed(2);
  
  return `${formattedSize} ${units[i]}`;
};

// Define types for file data
interface UploadedFile {
  id: string;
  filename: string;
  fileSize: number;
  title: string;
  description: string;
  rowCount: number;
  columns: string[];
  status: string;
  filePath: string;
  uploadDate: string;
  fileType: string;
  originalFile?: File;
}

const UploadDataSheet = ({ open, onOpenChange }: UploadDataSheetProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [datasetTitle, setDatasetTitle] = useState('');
  const [datasetDescription, setDatasetDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).filter(file => {
        const fileName = file.name.toLowerCase();
        return fileName.endsWith('.csv') || fileName.endsWith('.json');
      });
      
      if (filesArray.length === 0) {
        alert('Please select only CSV or JSON files.');
        return;
      }
      setSelectedFiles(filesArray);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(file => {
        const fileName = file.name.toLowerCase();
        return fileName.endsWith('.csv') || fileName.endsWith('.json');
      });
      
      if (filesArray.length === 0) {
        alert('Please drop only CSV or JSON files.');
        return;
      }
      setSelectedFiles(filesArray);
    }
  };
  
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Function to parse file headers and get columns
  const parseFileHeaders = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          
          // Check if file is JSON
          if (file.name.toLowerCase().endsWith('.json')) {
            try {
              const data = JSON.parse(text);
              
              // Handle JSON array with objects
              if (Array.isArray(data) && data.length > 0) {
                resolve(Object.keys(data[0]));
              } 
              // Handle single JSON object
              else if (typeof data === 'object' && data !== null) {
                resolve(Object.keys(data));
              } 
              else {
                resolve(['data']); // Default key for other JSON structures
              }
            } catch (jsonError) {
              reject('Error parsing JSON file');
            }
          } 
          // Handle CSV file
          else {
            // Read just the first line to get headers
            const firstLine = text.split('\n')[0];
            // Split by common CSV delimiters (comma, semicolon, tab)
            let headers: string[] = [];
            if (firstLine.includes(',')) {
              headers = firstLine.split(',');
            } else if (firstLine.includes(';')) {
              headers = firstLine.split(';');
            } else if (firstLine.includes('\t')) {
              headers = firstLine.split('\t');
            } else {
              headers = [firstLine]; // Fallback if no common delimiter found
            }
            
            // Clean up headers
            headers = headers.map(h => h.trim().replace(/^"(.*)"$/, '$1'));
            resolve(headers);
          }
        } catch (error) {
          reject('Error parsing file headers');
        }
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsText(file);
    });
  };
  
  // Function to count rows in file
  const countFileRows = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          
          // Check if file is JSON
          if (file.name.toLowerCase().endsWith('.json')) {
            try {
              const data = JSON.parse(text);
              
              // Handle JSON array
              if (Array.isArray(data)) {
                resolve(data.length);
              } 
              // Handle single object (count as 1)
              else if (typeof data === 'object' && data !== null) {
                resolve(1);
              } 
              else {
                resolve(1); // Default row count for other JSON
              }
            } catch (jsonError) {
              reject('Error parsing JSON file');
            }
          } 
          // Handle CSV file
          else {
            const rows = text.split('\n').filter(row => row.trim().length > 0);
            resolve(rows.length);
          }
        } catch (error) {
          reject('Error counting rows');
        }
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsText(file);
    });
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }
    
    // Use filename as default title if not provided
    const title = datasetTitle.trim() || selectedFiles[0].name;
    
    setUploading(true);
    
    try {
      // Process each file
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add title and description
        formData.append('title', title);
        formData.append('description', datasetDescription);
        
        // Parse and add metadata
        const columns = await parseFileHeaders(file);
        const rowCount = await countFileRows(file);
        const metadata = {
          columns,
          rowCount
        };
        
        formData.append('metadata', JSON.stringify(metadata));
        
        // Send to ingestion API
        const response = await fetch('/api/ingestion', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Add the uploaded file to our state
          setUploadedFiles(prev => [...prev, {
            ...result.data,
            originalFile: file
          }]);
          
          // Reset form fields after successful upload
          setDatasetTitle('');
          setDatasetDescription('');
        } else {
          throw new Error(result.error || 'Failed to upload file');
        }
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert(`Error uploading ${selectedFiles[0].name}: ${(error as Error).message}`);
    } finally {
      setUploading(false);
    }
  };
  
  // Load uploaded files on component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  // Fetch uploaded files from API
  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch('/api/ingestion');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setUploadedFiles(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };
  
  // Handle file download
  const handleDownload = (file: UploadedFile) => {
    // Create a download link to the file in the public directory
    const element = document.createElement('a');
    element.href = file.filePath;
    element.download = file.filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // Handle use file (placeholder for future functionality)
  const handleUseFile = (file: UploadedFile) => {
    // This would be implemented based on your application needs
    // For example, redirecting to an analysis page with the file ID
    alert(`Using file: ${file.filename} (ID: ${file.id}) for analysis`);
    // Example: router.push(`/analysis?fileId=${file.id}`);
    window.open(`/api/view?fileId=${file.id}`, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[60vw] max-w-[800px] overflow-y-auto bg-white p-0">
        <div className="p-4 flex justify-between items-center border-b">
          <SheetTitle className="text-lg font-medium">Upload Data</SheetTitle>
          <SheetClose className="rounded-full p-1 hover:bg-gray-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </SheetClose>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex space-x-4 border-b">
              <button className="pb-2 px-1 border-b-2 border-blue-600 text-blue-600 font-medium">File</button>
              <button className="pb-2 px-1 text-gray-500">Link</button>
              <button className="pb-2 px-1 text-gray-500">Notebook output</button>
            </div>
          </div>

          <div className="h-full flex flex-col">
            {/* Show uploaded files section if any exist */}
            {uploadedFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-medium mb-3">Uploaded Files</h3>
                <div className="border border-gray-200 rounded mb-4 max-h-[200px] overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                      <div className="flex items-center">
                        <svg className="mr-3 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <div>
                          <div className="text-sm font-medium">{file.filename}</div>
                          <div className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleDownload(file)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs"
                        >
                          Download
                        </button>
                        <button 
                          onClick={() => handleUseFile(file)}
                          className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 text-xs"
                        >
                          Use
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* File selection area */}
            <div className="flex flex-col space-y-4">
              {/* Dataset Metadata Form */}
              <div className="border border-gray-200 rounded mb-4 p-4">
                <h3 className="text-base font-medium mb-3">Dataset Information</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="datasetTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Dataset Title
                    </label>
                    <input
                      type="text"
                      id="datasetTitle"
                      value={datasetTitle}
                      onChange={(e) => setDatasetTitle(e.target.value)}
                      placeholder={selectedFiles.length > 0 ? selectedFiles[0].name : "Enter dataset title"}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="datasetDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <textarea
                      id="datasetDescription"
                      value={datasetDescription}
                      onChange={(e) => setDatasetDescription(e.target.value)}
                      placeholder="Enter a brief description of this dataset"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* File drop area */}
              <div 
                ref={dropAreaRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border border-dashed border-blue-300 rounded-lg p-8 mb-4"
              >
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="mb-4">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <path d="M21 14V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6"></path>
                      <path d="M3 10h18"></path>
                      <path d="M12 22v-8"></path>
                      <path d="M9 18l3 3 3-3"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-1">Drag & drop CSV or JSON files to upload</h3>
                  <p className="text-gray-500 mb-6">Consider zipping large directories for faster uploads</p>
                  <p className="text-gray-500 mb-4">or</p>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    multiple 
                    accept=".csv,.json" 
                    onChange={handleFileSelect} 
                    className="hidden" 
                  />
                  <button 
                    onClick={handleBrowseClick}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
              
              {selectedFiles.length > 0 && (
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500 font-medium">FILES</div>
                      <button className="text-sm text-blue-600" onClick={() => setSelectedFiles([])}>Reset</button>
                    </div>
                    <div className="border border-gray-200 rounded mb-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                          <div className="flex items-center">
                            <svg className="mr-3 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            <div>
                              <div className="text-sm font-medium">{file.name}</div>
                              <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>


                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm">
            Reset
          </button>
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded text-sm"
          >
            {uploading ? "Creating..." : "Create"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UploadDataSheet;
