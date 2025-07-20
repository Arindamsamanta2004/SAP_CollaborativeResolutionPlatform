import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './styles.css';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // If user prefers reduced motion, skip animation
      if (prefersReducedMotion) {
        setDisplayLocation(location);
        return;
      }
      
      setIsLoading(true);
      setTransitionStage('fadeOut');
      
      // After the fade out animation completes, update the location and fade in
      const timeout = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
        
        // Set loading to false after fade in completes
        const loadingTimeout = setTimeout(() => {
          setIsLoading(false);
        }, 300);
        
        return () => clearTimeout(loadingTimeout);
      }, 300); // Match this with the CSS transition duration
      
      return () => clearTimeout(timeout);
    }
  }, [location, displayLocation, prefersReducedMotion]);
  
  // Announce page transitions to screen readers
  useEffect(() => {
    const liveRegion = document.getElementById('accessibility-live-region');
    if (liveRegion && location.pathname !== displayLocation.pathname) {
      // Get page name from path
      let pageName = 'new page';
      if (location.pathname === '/') {
        pageName = 'Lead Engineer Dashboard';
      } else if (location.pathname.includes('customer-portal')) {
        pageName = 'Customer Portal';
      } else if (location.pathname.includes('crp')) {
        pageName = 'Collaborative Resolution Platform';
      }
      
      liveRegion.textContent = `Navigating to ${pageName}`;
    }
  }, [displayLocation, location.pathname]);
  
  return (
    <div 
      className={`page-transition ${transitionStage}`}
      aria-busy={isLoading}
    >
      {isLoading && (
        <div className="page-loading" aria-live="polite">
          <div className="loading-spinner" aria-label="Loading content"></div>
          <p>Loading content...</p>
        </div>
      )}
      <div aria-hidden={isLoading}>
        {children}
      </div>
    </div>
  );
};

export default PageTransition;