"use client";

import React, { useEffect, useState, useRef } from 'react';

interface DatasetImageProps {
  imagePrompt?: string;
  title: string;
  fallbackColor?: string;
}

const DatasetImage: React.FC<DatasetImageProps> = ({ 
  imagePrompt, 
  title,
  fallbackColor = 'from-indigo-100 via-purple-100 to-pink-100'
}) => {
  // Use ref for the element
  const elementRef = useRef<HTMLDivElement>(null);

  // Define state hooks at the top level
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Start as false to avoid hydration mismatch
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // First useEffect - for client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Handle image generation only on the client side after mounting
  useEffect(() => {
    if (!isMounted) {
      return;
    }

    // Only start loading when we're ready to generate the image
    if (imagePrompt) {
      setLoading(true);
      
      const generateImage = async () => {
        try {
          // Instead of using an external service, use a data URL or local image
          // This avoids the need for external domain configuration
          // For now, we'll use a simpler placeholder URL since the image domain is configured in next.config.js
          const seed = encodeURIComponent(title);
          
          // For local development, consider using a local placeholder instead:
          // const placeholderUrl = `/api/placeholder?title=${seed}`;
          // Or use a relative path to a local image:
          // const placeholderUrl = `/placeholder.jpg`;
          
          // Using the external service now that it's configured in next.config.js
          const placeholderUrl = `/api/placeholder?title=${seed}`;
          
          setImageUrl(placeholderUrl);
        } catch (err) {
          console.error('Error generating image:', err);
          setError('Failed to generate image');
        } finally {
          setLoading(false);
        }
      };
      
      generateImage();
    } else {
      setLoading(false); // Not loading if no prompt
    }
  }, [imagePrompt, title, isMounted]);
  
  // Base placeholder/fallback component
  const Placeholder = ({ message, isAnimated = false }: { message: string, isAnimated?: boolean }) => (
    <div 
      className={`w-full h-48 bg-gradient-to-r ${fallbackColor} ${isAnimated ? 'animate-pulse' : ''} flex items-center justify-center`} 
      ref={elementRef}
    >
      <div className="text-center p-4">
        <div className="text-sm text-gray-500">{message}</div>
        <div className="mt-2 text-xs text-gray-400">{title}</div>
      </div>
    </div>
  );
  
  // For server-side rendering, always return the same static placeholder
  // This ensures hydration matches exactly between server and client
  if (typeof window === 'undefined') {
    return <Placeholder message="" />;  // Empty message for consistent layout
  }
  
  // After client-side hydration, we can show appropriate states
  if (!isMounted) {
    return <Placeholder message="Loading visualization..." />;  
  }
  
  // Return loading animation when generating
  if (loading) {
    return <Placeholder message="Generating visualization..." isAnimated={true} />;
  }
  
  // Return error state or fallback when there's no image
  if (error || !imageUrl) {
    return <Placeholder message={error || 'No visualization available'} />;
  }
  
  // Return a div element instead of using the next/image component for now
  // This avoids the domain configuration issue
  return (
    <div className="relative w-full h-48 overflow-hidden rounded-t-lg" ref={elementRef}>
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${imageUrl})`,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent">
        <div className="absolute bottom-3 left-3 text-xs text-white opacity-70">
          Visualization for {title}
        </div>
      </div>
    </div>
  );
};

export default DatasetImage;
