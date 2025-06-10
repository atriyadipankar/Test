'use client';

// Mock EdgeStore client for UI development
// This will be replaced with actual EdgeStore client implementation later
export const edgestore = {
  datasetFiles: {
    upload: async (file: File, options?: any) => {
      console.log('Mock upload file:', file.name, options);
      // Return a mock response
      return {
        url: URL.createObjectURL(file),
        size: file.size,
        uploadedAt: new Date().toISOString(),
        metadata: options?.input || {},
      };
    }
  }
};
