import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-[#4A0E67] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="text-white font-bold text-sm text-center leading-tight">
              Liz<br />Express
            </div>
          </div>
        </div>
        
        {/* Spinner */}
        <div className="mb-4">
          <LoadingSpinner size="large" color="primary" />
        </div>
        
        {/* Message */}
        <p className="text-[#4A0E67] font-semibold text-lg">{message}</p>
        
        {/* Animated dots */}
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-[#F7941D] rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-[#F7941D] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-[#F7941D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        {/* Tagline */}
        <p className="text-gray-500 text-sm mt-4">
          Preparing your swap experience...
        </p>
      </div>
    </div>
  );
};

export default PageLoader;