"use client";

import React from 'react';

interface DatasetPreviewProps {
  datasetId: string;
  fileType: string;
  fileSize: number;
  rowCount: number;
  lastUpdated: string;
  columns?: string[];
}

const DatasetPreview: React.FC<DatasetPreviewProps> = ({
  datasetId,
  fileType,
  fileSize,
  rowCount,
  lastUpdated,
  columns = []
}) => {
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Dataset metadata header */}
      <div className="bg-gray-50 p-4 grid grid-cols-4 gap-4 border-b border-gray-200">
        <div>
          <div className="text-gray-500 text-sm">File Type</div>
          <div className="font-medium">{fileType}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">File Size</div>
          <div className="font-medium">{formatFileSize(fileSize)}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">Rows</div>
          <div className="font-medium">{rowCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">Last Updated</div>
          <div className="font-medium">{lastUpdated}</div>
        </div>
      </div>
      
      {/* Dataset description */}
      <div className="p-6">
        <h3 className="font-medium text-lg mb-3">Data Preview</h3>
        
        <div className="mb-6">
          <p className="text-gray-700">
            This dataset contains <strong>{rowCount.toLocaleString()}</strong> rows and{' '}
            <strong>{columns.length}</strong> columns. The data is stored as a <strong>{fileType}</strong> file
            with a size of <strong>{formatFileSize(fileSize)}</strong>.
          </p>
          
          {columns.length > 0 && (
            <div className="mt-3">
              <p className="text-gray-700">
                The dataset includes the following columns: {columns.slice(0, 5).join(', ')}
                {columns.length > 5 ? `, and ${columns.length - 5} more.` : '.'}
              </p>
              
              <p className="mt-3 text-gray-700">
                Use the table below to explore a sample of the data or download the complete dataset
                for more detailed analysis.
              </p>
            </div>
          )}
        </div>
        
        {/* Sample data table or placeholder */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {columns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.slice(0, 5).map((column, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                    {columns.length > 5 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ...
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td colSpan={Math.min(columns.length, 6)} className="px-6 py-16 text-center text-gray-500">
                      Sample data will be displayed here
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-gray-500">
              Data preview will be available soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetPreview;
