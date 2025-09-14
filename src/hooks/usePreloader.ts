import { useState, useEffect } from 'react';

export const usePreloader = (minLoadTime: number = 3000) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Check if page is fully loaded
    const checkLoaded = () => {
      const elapsedTime = Date.now() - startTime;
      const isPageLoaded = document.readyState === 'complete';
      
      if (isPageLoaded && elapsedTime >= minLoadTime) {
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Small delay for smooth transition
      } else {
        setTimeout(checkLoaded, 100);
      }
    };

    // Start checking when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkLoaded);
    } else {
      checkLoaded();
    }

    return () => {
      clearInterval(progressInterval);
      document.removeEventListener('DOMContentLoaded', checkLoaded);
    };
  }, [minLoadTime]);

  return { isLoading, progress };
};