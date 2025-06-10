"use client";

import React from 'react';

interface DatasetKeywordsProps {
  keywords: string[];
}

const DatasetKeywords: React.FC<DatasetKeywordsProps> = ({ keywords }) => {
  if (!keywords || keywords.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DatasetKeywords;
