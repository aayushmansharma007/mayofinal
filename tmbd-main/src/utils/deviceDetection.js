import { useState, useEffect } from 'react';

// Device detection utility
export const isMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check for mobile user agents
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Check screen width
  const screenWidth = window.innerWidth;
  
  // Return true if mobile user agent OR screen width is mobile-sized
  return mobileRegex.test(userAgent) || screenWidth <= 768;
};

export const getDeviceType = () => {
  if (isMobileDevice()) {
    return 'mobile';
  }
  return 'desktop';
};

// Hook for responsive design
export const useDeviceDetection = () => {
  const [deviceType, setDeviceType] = useState(getDeviceType());
  
  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    isMobile: deviceType === 'mobile',
    isDesktop: deviceType === 'desktop',
    deviceType
  };
};