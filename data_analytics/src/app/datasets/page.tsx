"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DatasetImage from '../components/DatasetImage';

interface Dataset {
  id: string;
  title: string;
  description: string;
  filename: string;
  fileSize: number;
  uploadDate: string;
  fileType: string;
  columns?: string[];
  rowCount?: number;
  aiGenerated?: boolean;
  insights?: string[];
  imagePrompt?: string;
  summary?: string;
}

const DatasetsPage = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await fetch('/api/ingestion');
        const result = await response.json();
        
        if (result.success) {
          setDatasets(result.data);
        } else {
          console.error('Failed to fetch datasets:', result.error);
        }
      } catch (error) {
        console.error('Error fetching datasets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };
  
  const handleDatasetClick = (id: string) => {
    router.push(`/datasets/${id}`);
  };

  return (
    <div className="px-6 py-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Datasets</h1>
        <p className="text-gray-600">
          Explore, analyze, and share quality data. Learn more about data 
          types, creating, and collaborating.
        </p>
      </div>

      <div className="flex items-center mb-6 gap-4 flex-wrap">
        <button 
          onClick={() => router.push('/')}
          className="bg-black text-white px-4 py-2 rounded-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Dataset
        </button>
        <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md">
          Your Work
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="search"
            placeholder="Search datasets"
            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-full"
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button className="bg-gray-100 px-4 py-1 rounded-full text-sm">All datasets</button>
          <button className="bg-white border border-gray-200 px-4 py-1 rounded-full text-sm">Computer Science</button>
          <button className="bg-white border border-gray-200 px-4 py-1 rounded-full text-sm">Education</button>
          <button className="bg-white border border-gray-200 px-4 py-1 rounded-full text-sm">Classification</button>
          <button className="bg-white border border-gray-200 px-4 py-1 rounded-full text-sm">Data Visualization</button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Featured Datasets
        </h2>
        <p className="text-sm text-gray-600 mb-4">Explore a selection of featured datasets curated by the TestDev team.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading datasets...</p>
            </div>
          ) : datasets.length > 0 ? (
            datasets.map(dataset => (
              <div 
                key={dataset.id} 
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleDatasetClick(dataset.id)}
              >
                <DatasetImage 
                  imagePrompt={dataset.imagePrompt} 
                  title={dataset.title || dataset.filename} 
                  fallbackColor={dataset.id.endsWith('0') ? 'from-blue-100 via-sky-100 to-indigo-100' : 
                               dataset.id.endsWith('1') ? 'from-green-100 via-emerald-100 to-teal-100' : 
                               dataset.id.endsWith('2') ? 'from-orange-100 via-amber-100 to-yellow-100' : 
                               dataset.id.endsWith('3') ? 'from-red-100 via-rose-100 to-pink-100' : 
                               'from-indigo-100 via-purple-100 to-pink-100'}
                />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg mb-2">{dataset.title || dataset.filename}</h3>
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mb-3">
                    {dataset.description ? (
                      <p>{dataset.description.length > 120 ? `${dataset.description.substring(0, 120)}...` : dataset.description}</p>
                    ) : (
                      <p>No description provided</p>
                    )}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Updated {dataset.uploadDate ? formatDate(dataset.uploadDate) : 'recently'}</span>
                    <span>{dataset.fileSize ? formatFileSize(dataset.fileSize) : ''}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 border border-dashed border-gray-300 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-4">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              <p className="text-gray-600 mb-2">No datasets found</p>
              <p className="text-sm text-gray-500 mb-4">Upload your first dataset to get started</p>
              <button 
                onClick={() => router.push('/')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                Upload Dataset
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetsPage;
