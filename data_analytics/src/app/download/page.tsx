import React from 'react';
import { EdgeStoreDownloader } from '../components/EdgeStoreDownloader';

export default function DownloadPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">EdgeStore File Downloader</h1>
      <p className="mb-6 text-gray-700">
        Use this tool to download files from EdgeStore URLs and save them to your project&apos;s public/uploads directory.
      </p>
      <EdgeStoreDownloader />
    </div>
  );
}
