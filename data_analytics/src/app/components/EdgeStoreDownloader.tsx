"use client";

import React, { useState } from 'react';
import { Loader2, Download, ExternalLink } from "lucide-react";
import { formatFileSize } from '../../lib/utils';

// UI Components
const Button = ({ children, onClick, disabled, className, variant, size }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'outline' | 'default';
  size?: 'sm' | 'default';
}) => {
  const sizeClasses = size === 'sm' ? 'py-1 px-3 text-sm' : 'py-2 px-4';
  const variantClasses = variant === 'outline' 
    ? 'border border-gray-300 hover:bg-gray-100' 
    : 'bg-blue-600 text-white hover:bg-blue-700';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md ${sizeClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
    >
      {children}
    </button>
  );
};

const Input = ({ id, placeholder, value, onChange }: {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <input
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full p-2 border border-gray-300 rounded-md"
  />
);

const Label = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium mb-1">
    {children}
  </label>
);

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow ${className || ''}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-5 border-b">
    {children}
  </div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-500 mt-1">
    {children}
  </p>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-5">
    {children}
  </div>
);

const CardFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="p-5 border-t">
    {children}
  </div>
);

interface DownloadedFile {
  id: string;
  originalUrl: string;
  originalFilename: string;
  filename: string;
  filePath: string;
  contentType: string;
  fileSize: number;
  downloadDate: string;
  fileType: string;
}

export function EdgeStoreDownloader() {
  const [url, setUrl] = useState('');
  const [customFilename, setCustomFilename] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedFiles, setDownloadedFiles] = useState<DownloadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch already downloaded files when component mounts
  React.useEffect(() => {
    fetchDownloadedFiles();
  }, []);

  const fetchDownloadedFiles = async () => {
    try {
      const response = await fetch('/api/download');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setDownloadedFiles(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching downloaded files:', error);
    }
  };

  const handleDownload = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          filename: customFilename || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setDownloadedFiles(prev => [result.data, ...prev]);
        setUrl('');
        setCustomFilename('');
      } else {
        setError(result.error || 'Failed to download file');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const openFile = (filePath: string) => {
    window.open(filePath, '_blank');
  };

  return (
    <div className="w-full max-w-3xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>EdgeStore File Downloader</CardTitle>
          <CardDescription>
            Download files from EdgeStore URLs and save them to the project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">EdgeStore URL</Label>
              <Input
                id="url"
                placeholder="https://files.edgestore.dev/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filename">Custom Filename (Optional)</Label>
              <Input
                id="filename"
                placeholder="my-file.csv"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-sm font-medium text-red-500 dark:text-red-400">
                {error}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleDownload} 
            disabled={isDownloading || !url}
            className="w-full"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> Download
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {downloadedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium">Downloaded Files</h3>
          <div className="mt-4 space-y-4">
            {downloadedFiles.map((file) => (
              <div 
                key={file.id || file.filename} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-medium truncate">{file.originalFilename || file.filename}</h4>
                  <p className="text-sm text-gray-500 truncate">
                    {file.fileType.toUpperCase()} • {formatFileSize(file.fileSize)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openFile(file.filePath)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
