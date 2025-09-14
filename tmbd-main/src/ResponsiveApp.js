import React, { useState, useEffect } from 'react';
import App from './App';
import MobileApp from './MobileApp';
import { isMobileDevice } from './utils/deviceDetection';

const ResponsiveApp = () => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show mobile app for mobile devices, desktop app for desktop
  return isMobile ? <MobileApp /> : <App />;
};

export default ResponsiveApp;