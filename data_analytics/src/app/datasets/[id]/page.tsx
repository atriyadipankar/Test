"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DatasetImage from '../../components/DatasetImage';
import DatasetPreview from '../../components/DatasetPreview';
import DatasetKeywords from '../../components/DatasetKeywords';
import DatasetChatbot from '../../components/DatasetChatbot';

interface Dataset {
  id: string;
  title: string;
  description: string;
  filename: string;
  fileSize: number;
  rowCount?: number;
  columns?: string[];
  status?: string;
  uploadDate?: string;
  fileType?: string;
  aiGenerated?: boolean;
  insights?: string[];
  imagePrompt?: string;
  summary?: string;
  keywords?: string[];
}

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [datasetKeywords, setDatasetKeywords] = useState<string[]>([]);

  useEffect(() => {
    const fetchDatasetDetails = async () => {
      if (!params.id) {
        setError('Dataset ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/ingestion?id=${params.id}`);
        const result = await response.json();

        if (result.success && result.data) {
          setDataset(result.data);
          
          // Generate keywords based on dataset content if not already present
          if (!result.data.keywords) {
            const generatedKeywords = generateKeywords(result.data);
            setDatasetKeywords(generatedKeywords);
          } else {
            setDatasetKeywords(result.data.keywords);
          }
        } else {
          setError(result.error || 'Failed to load dataset details');
        }
      } catch (error) {
        console.error('Error fetching dataset details:', error);
        setError('An error occurred while fetching the dataset details');
      } finally {
        setLoading(false);
      }
    };

    fetchDatasetDetails();
  }, [params.id]);

  // Generate keywords based on dataset content
  const generateKeywords = (dataset: Dataset): string[] => {
    const keywords: string[] = [];
    
    // Add file type as a keyword
    if (dataset.fileType) {
      keywords.push(dataset.fileType.toLowerCase());
    }
    
    // Add size-related keyword
    if (dataset.fileSize > 10 * 1024 * 1024) {
      keywords.push('large-dataset');
    } else if (dataset.fileSize < 1024 * 1024) {
      keywords.push('small-dataset');
    }
    
    // Add domain-specific keywords based on title or description
    const domainKeywords = ['engineering', 'science', 'business', 'finance', 'healthcare', 
                          'education', 'marketing', 'sales', 'logistics', 'manufacturing', 
                          'retail', 'technology', 'ai', 'machine-learning', 'statistics'];
    
    const combinedText = (dataset.title + ' ' + (dataset.description || '')).toLowerCase();
    
    domainKeywords.forEach(keyword => {
      if (combinedText.includes(keyword.toLowerCase())) {
        keywords.push(keyword);
      }
    });
    
    // Add data structure keywords
    if (dataset.columns && dataset.columns.length > 0) {
      keywords.push('tabular-data');
      if (dataset.columns.length > 20) {
        keywords.push('high-dimensional');
      }
    }
    
    // Ensure we have at least some keywords
    if (keywords.length < 3) {
      keywords.push('data-analysis');
      if (!keywords.includes(dataset.fileType?.toLowerCase() ?? '')) {
        keywords.push('dataset');
      }
    }
    
    // Limit to 5 keywords max
    return keywords.slice(0, 5);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading dataset details...</p>
        </div>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'Dataset not found'}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/datasets')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Datasets
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <svg className="mx-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/datasets" className="hover:text-blue-600">Datasets</Link>
        <svg className="mx-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        <span className="truncate max-w-xs">{dataset.title || dataset.filename}</span>
      </div>

      {/* Dataset Header */}
      <div className="mb-8">
        <div className="rounded-lg overflow-hidden border border-gray-200 mb-6">
          <DatasetImage 
            imagePrompt={dataset.imagePrompt} 
            title={dataset.title || dataset.filename}
            fallbackColor="from-blue-100 via-indigo-100 to-purple-100"  
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h1 className="text-3xl font-bold mr-4">{dataset.title || dataset.filename}</h1>
          <div className="flex space-x-3">
            <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md text-sm">
              Download
            </button>
          </div>
        </div>
        
        {dataset.description && (
          <div>
            <p className="text-gray-600 mb-4">{dataset.description}</p>
            {dataset.aiGenerated && (
              <div className="text-xs text-gray-400 mb-4 italic">Description generated by AI</div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500 mb-1">File Type</p>
            <p className="font-medium">{dataset.fileType || 'Unknown'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500 mb-1">File Size</p>
            <p className="font-medium">{formatFileSize(dataset.fileSize)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Rows</p>
            <p className="font-medium">{dataset.rowCount || 'Unknown'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Last Updated</p>
            <p className="font-medium">{dataset.uploadDate ? formatDate(dataset.uploadDate) : 'Unknown'}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            className={`px-1 py-4 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-1 py-4 text-sm font-medium ${activeTab === 'data' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button
            className={`px-1 py-4 text-sm font-medium ${activeTab === 'analysis' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('analysis')}
          >
            AI Analysis
          </button>
          <button
            onClick={() => setActiveTab('models')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'models'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Models
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Dataset Overview</h2>
          
          {dataset.insights && dataset.insights.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Key Insights</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <ul className="list-disc pl-5 space-y-2">
                  {dataset.insights.map((insight, index) => (
                    <li key={index} className="text-gray-700">{insight}</li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 italic">
                  Insights generated by AI
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {dataset.description ? (
                <div>
                  <p>{dataset.description}</p>
                  {dataset.aiGenerated && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 italic">
                      Description generated by AI
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Columns</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {dataset.columns && dataset.columns.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Column Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dataset.columns.map((column, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {column}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {/* This would come from additional metadata in a real implementation */}
                            Unknown
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-gray-500 italic">
                  No column information available
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">File Details</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Filename</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dataset.filename}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dataset.fileType || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatFileSize(dataset.fileSize)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dataset.uploadDate ? formatDate(dataset.uploadDate) : 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Row Count</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dataset.rowCount || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900">{dataset.status || 'Unknown'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'data' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Data Preview</h2>
          <DatasetPreview 
            datasetId={dataset.id}
            fileType={dataset.fileType || 'csv'}
            fileSize={dataset.fileSize}
            rowCount={dataset.rowCount || 0}
            lastUpdated={dataset.uploadDate ? formatDate(dataset.uploadDate) : 'Unknown'}
            columns={dataset.columns || []}
          />
        </div>
      )}
      
      {activeTab === 'analysis' && (
        <div>
          <h2 className="text-xl font-bold mb-4">AI Dataset Analysis</h2>
          
          {/* Display dataset keywords/tags */}
          <DatasetKeywords keywords={datasetKeywords} />
          
          {/* AI Chatbot interface */}
          <DatasetChatbot 
            datasetId={dataset.id} 
            datasetTitle={dataset.title} 
          />
        </div>
      )}
      
      {activeTab === 'models' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Models Using This Dataset</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-gray-500 text-center py-12">
              No models are currently using this dataset.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
